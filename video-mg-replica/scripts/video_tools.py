#!/usr/bin/env python3
"""Local video evidence and comparison. No downloads or automatic visual approval."""
import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import shutil
import subprocess
import sys
from fractions import Fraction


def tool(name):
    value = os.environ.get(name.upper(), name)
    result = shutil.which(value)
    if not result:
        raise ValueError(f'{name} missing; install it or set {name.upper()} to its executable path')
    return result


def run(args):
    env = os.environ.copy()
    binary_dir = Path(str(args[0])).resolve().parent
    # Remotion's macOS binaries ship sibling dylibs rather than absolute rpaths.
    if sys.platform == 'darwin' and (binary_dir / 'libavcodec.dylib').exists():
        env['DYLD_LIBRARY_PATH'] = str(binary_dir)
    p = subprocess.run([str(x) for x in args], capture_output=True, text=True, env=env)
    if p.returncode:
        raise ValueError(f'{Path(str(args[0])).name} failed ({p.returncode}): {p.stderr[-2500:]}')
    return p.stdout


def ff(*args):
    return run([tool('ffmpeg'), '-hide_banner', '-loglevel', 'error', '-nostdin', '-n', *args])


def probe(path):
    path = Path(path).resolve(strict=True)
    data = json.loads(run([tool('ffprobe'), '-v', 'error', '-count_frames',
                          '-show_streams', '-show_format', '-of', 'json', path]))
    videos = [s for s in data['streams'] if s['codec_type'] == 'video'
              and not s.get('disposition', {}).get('attached_pic')]
    if not videos:
        raise ValueError(f'No video stream: {path}')
    v = videos[0]
    rate = Fraction(v.get('avg_frame_rate', '0/1'))
    if rate <= 0:
        rate = Fraction(v['r_frame_rate'])
    if rate <= 0:
        raise ValueError('Invalid video frame rate')
    try:
        count = int(v.get('nb_read_frames', 0))
    except ValueError:
        count = 0
    if count <= 0:
        # Some bundled ffprobe builds can read FFV1 metadata but lack its decoder.
        # Count actually decoded frames with the full FFmpeg build in that case.
        progress = run([tool('ffmpeg'), '-hide_banner', '-loglevel', 'error', '-nostdin',
                        '-i', path, '-map', f'0:{v["index"]}', '-an', '-fps_mode', 'passthrough',
                        '-progress', 'pipe:1', '-nostats', '-f', 'null', '-'])
        counts = [int(line.split('=',1)[1]) for line in progress.splitlines() if line.startswith('frame=')]
        count = counts[-1] if counts else 0
    duration = float(v.get('duration', data['format'].get('duration', count / float(rate))))
    if not math.isfinite(duration) or duration <= 0 or count <= 0:
        raise ValueError('Invalid duration or frame count')
    return {'path': str(path), 'width': v['width'], 'height': v['height'],
            'fps': str(rate), 'frames': count, 'duration': duration,
            'audio': any(s['codec_type'] == 'audio' for s in data['streams']),
            'videoStream': v['index'], 'raw': data}


def save(path, data):
    Path(path).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def new_dir(path):
    p = Path(path).resolve()
    p.mkdir(parents=True, exist_ok=False)
    return p


def sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def doctor(args):
    images()
    filters = run([tool('ffmpeg'), '-hide_banner', '-filters'])
    encoders = run([tool('ffmpeg'), '-hide_banner', '-encoders'])
    available_filters = {row.split()[1] for row in filters.splitlines() if len(row.split()) >= 2}
    available_encoders = {row.split()[1] for row in encoders.splitlines() if len(row.split()) >= 2}
    required_filters = {'trim', 'setpts', 'fps', 'tpad', 'scale', 'setsar', 'select',
                        'atrim', 'asetpts', 'aresample', 'apad', 'hstack', 'pad', 'overlay'}
    missing = sorted(required_filters - available_filters)
    missing_encoders = sorted({'ffv1', 'png', 'libx264', 'pcm_s16le', 'aac'} - available_encoders)
    run([tool('ffprobe'), '-version'])
    print(json.dumps({'ffmpeg': tool('ffmpeg'), 'ffprobe': tool('ffprobe'),
                      'missingFilters': missing, 'missingEncoders': missing_encoders}, indent=2))
    if missing or missing_encoders:
        raise ValueError('This FFmpeg build lacks evidence/compare capabilities; use a full build')


def inspect(args):
    src = probe(args.source)
    start = args.start
    end = src['duration'] if args.end is None else args.end
    if not (math.isfinite(start) and math.isfinite(end) and 0 <= start < end <= src['duration'] + .001):
        raise ValueError('Require 0 <= start < end <= source duration (seconds)')
    fps = Fraction(args.fps) if args.fps else Fraction(src['fps'])
    if not 0 < fps <= 240:
        raise ValueError('fps must lie in (0,240]')
    frames = int(math.floor((end - start) * float(fps) + .5))
    if frames < 1:
        raise ValueError('Requested range is shorter than one output frame')
    out = new_dir(args.out)
    source_dir = out / 'source'
    source_dir.mkdir()
    reference = source_dir / 'reference.mkv'
    # Decode then trim: do not use stream-copy seeking. tpad only covers frame rounding.
    vf = (f'trim=start={start}:end={end},setpts=PTS-STARTPTS,fps={fps},'
          f'tpad=stop_mode=clone:stop_duration={1/float(fps):.12f},trim=end_frame={frames},'
          'scale=round(iw*sar):ih,setsar=1')
    ff('-i', src['path'], '-map', f'0:{src["videoStream"]}', '-vf', vf,
       '-an', '-c:v', 'ffv1', reference)
    norm = probe(reference)
    if norm['frames'] != frames:
        raise ValueError(f'Normalized frame count mismatch: {norm["frames"]} != {frames}')
    audio_path = None
    if src['audio']:
        audio_path = source_dir / 'audio.wav'
        # first_pts aligns delayed audio with video instead of snapping it to zero.
        video_start = float(next(s for s in src['raw']['streams'] if s['index'] == src['videoStream']).get('start_time', 0))
        af = (f'asetpts=PTS-({video_start})/TB,aresample=async=1:first_pts=0,'
              f'atrim=start={start}:end={end},asetpts=PTS-STARTPTS,apad')
        ff('-copyts', '-i', src['path'], '-map', '0:a:0', '-af', af,
           '-t', f'{frames/float(fps):.12f}', '-ar', '48000', '-c:a', 'pcm_s16le', audio_path)
    save(out / 'case.json', {
        'schemaVersion': 1, 'status': 'evidence_ready',
        'source': {'path': src['path'], 'sha256': sha256(src['path']), 'metadata': src['raw']},
        'range': {'startSeconds': start, 'endSecondsExclusive': end},
        'timebase': {'width': norm['width'], 'height': norm['height'],
                     'fpsNumerator': fps.numerator, 'fpsDenominator': fps.denominator,
                     'frameCount': frames, 'durationSeconds': frames / float(fps)},
        'normalization': 'Decoded trim; PTS reset; CFR; square pixels; FFmpeg autorotation; nearest frame duration',
        'reference': 'source/reference.mkv', 'referenceSha256': sha256(reference),
        'audio': 'source/audio.wav' if audio_path else None,
        'analysis': 'pending', 'visualQA': 'pending'})
    print(out / 'case.json')


def images():
    try:
        from PIL import Image, ImageChops, ImageDraw, ImageStat
    except ImportError:
        raise ValueError('Pillow missing; use a Python environment with Pillow installed')
    return Image, ImageChops, ImageDraw, ImageStat


def extract(src, out, indices, width=0):
    out.mkdir()
    start, end = indices[0], indices[-1] + 1
    step = indices[1] - indices[0] if len(indices) > 1 else 1
    vf = f"select='gte(n,{start})*lt(n,{end})*not(mod(n-{start},{step}))'"
    if width:
        vf += f',scale={width}:-1'
    ff('-i', src, '-vf', vf, '-fps_mode', 'vfr', '-start_number', '0', out / 'sample-%06d.png')
    files = sorted(out.glob('sample-*.png'))
    if len(files) != len(indices):
        raise ValueError(f'Extracted {len(files)} frames; expected {len(indices)}')
    renamed = []
    for file, index in zip(files, indices):
        dest = out / f'frame-{index:06d}.png'
        file.rename(dest)
        renamed.append(dest)
    return renamed


def contact_sheets(files, indices, fps, out):
    Image, _, Draw, _ = images()
    for page in range(0, len(files), 20):
        rows = math.ceil(min(20, len(files)-page) / 4)
        sheet = Image.new('RGB', (4 * 256, rows * 180), '#20222a')
        d = Draw.Draw(sheet)
        for slot, (file, index) in enumerate(zip(files[page:page+20], indices[page:page+20])):
            with Image.open(file) as im:
                im = im.convert('RGB')
                im.thumbnail((248, 148))
                x, y = slot % 4 * 256, slot // 4 * 180
                sheet.paste(im, (x + (256-im.width)//2, y))
                d.text((x+5, y+152), f'f={index}  t={index/fps:.3f}s', fill='white')
        sheet.save(out / f'contact-{page//20+1:03d}.jpg', quality=92)


def frames_cmd(args):
    images()
    src = probe(args.source)
    end = src['frames'] if args.end_frame is None else args.end_frame
    if not 0 <= args.start_frame < end <= src['frames'] or args.step < 1 or args.width < 0:
        raise ValueError('Invalid frame range, step, or width')
    indices = list(range(args.start_frame, end, args.step))
    out = new_dir(args.out)
    files = extract(src['path'], out / 'frames', indices, args.width)
    save(out / 'index.json', {'source': src['path'], 'fps': src['fps'],
        'frames': [{'frame': i, 'seconds': i/float(Fraction(src['fps'])),
                    'path': str(f.relative_to(out))} for i, f in zip(indices, files)]})
    contact_sheets(files, indices, float(Fraction(src['fps'])), out)
    print(f'{len(files)} frames: {out}')


def compare(args):
    Image, Chops, Draw, Stat = images()
    a, b = probe(args.reference), probe(args.render)
    if args.step < 1:
        raise ValueError('step must be >= 1')
    differences = [k for k in ('width', 'height', 'frames') if a[k] != b[k]]
    if abs(float(Fraction(a['fps'])) - float(Fraction(b['fps']))) > .0001:
        differences.append('fps')
    if differences:
        raise ValueError('Inputs must have matching ' + ', '.join(differences) + '; no automatic resize/trim')
    for src in (a, b):
        stream = next(s for s in src['raw']['streams'] if s['index'] == src['videoStream'])
        if stream.get('sample_aspect_ratio', '1:1') not in ('1:1', '0:1', 'N/A'):
            raise ValueError('Normalize non-square pixel inputs before comparing')
        if any(abs(float(s.get('rotation', 0))) % 360 > .01 for s in stream.get('side_data_list', [])):
            raise ValueError('Normalize rotation metadata before comparing')
    out = new_dir(args.out)
    indices = list(range(0, a['frames'], args.step))
    af = extract(a['path'], out/'reference', indices)
    bf = extract(b['path'], out/'render', indices)
    triptychs = out / 'triptychs'
    triptychs.mkdir()
    metrics = []
    for i, pa, pb in zip(indices, af, bf):
        with Image.open(pa) as ia, Image.open(pb) as ib:
            ia, ib = ia.convert('RGB'), ib.convert('RGB')
            diff = Chops.difference(ia, ib)
            stat = Stat.Stat(diff)
            hist = diff.histogram()
            metrics.append({'frame': i, 'rgbMAE': sum(stat.mean)/3,
                'maxChannelError': max(v[1] for v in diff.getextrema()),
                'fractionChannelsAbove8': sum(sum(hist[c*256+9:(c+1)*256]) for c in range(3))/(ia.width*ia.height*3)})
            w, h = ia.size
            panel = Image.new('RGB', (w*3, h+28), '#20222a')
            panel.paste(ia, (0, 28)); panel.paste(ib, (w, 28))
            panel.paste(diff.point(lambda p: min(255, p*4)), (2*w, 28))
            d = Draw.Draw(panel)
            for x, label in [(0, 'REFERENCE'), (w, 'REPLICA'), (2*w, 'DIFF x4')]:
                d.text((x+6, 8), f'{label} | f={i}', fill='white')
            panel.save(triptychs / f'frame-{i:06d}.png')
    report = {'technical': 'passed', 'visual': 'pending', 'audioReview': 'pending',
        'reference': {k:v for k,v in a.items() if k != 'raw'},
        'render': {k:v for k,v in b.items() if k != 'raw'},
        'sampling': {'step': args.step, 'sampleCount': len(indices), 'totalFrames': a['frames'],
                     'allFrames': len(indices) == a['frames']},
        'sampleMeanRGBMAE': sum(m['rgbMAE'] for m in metrics)/len(metrics), 'frames': metrics,
        'note': 'RGB metrics are diagnostic only, not a similarity percentage or visual approval.'}
    save(out / 'metrics.json', report)
    if args.video:
        w, h = a['width'], a['height']
        labels = Image.new('RGB', (2*w, 32), '#20222a')
        draw = Draw.Draw(labels)
        draw.text((8, 10), 'REFERENCE', fill='white')
        draw.text((w+8, 10), 'REPLICA', fill='white')
        labels.save(out / 'labels.png')
        rate = str(Fraction(a['fps']))
        graph = (f'[0:v]settb=AVTB,setpts=N/({rate}*TB)[l];[1:v]settb=AVTB,setpts=N/({rate}*TB)[r];'
                 f'[l][r]hstack=shortest=1,pad=iw:ih+32:0:0[base];'
                 f'[base][2:v]overlay=0:{h}:eof_action=repeat,pad=ceil(iw/2)*2:ceil(ih/2)*2[v]')
        ff('-i', a['path'], '-i', b['path'], '-i', out / 'labels.png',
           '-filter_complex', graph, '-map', '[v]', '-map', '1:a:0?',
           '-r', rate, '-fps_mode', 'cfr', '-frames:v', a['frames'], '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p',
           '-c:a', 'aac', '-movflags', '+faststart', out / 'comparison.mp4')
    print(out / 'metrics.json')


def main():
    p = argparse.ArgumentParser(description=__doc__)
    sub = p.add_subparsers(dest='command', required=True)
    dp = sub.add_parser('doctor', help='Read-only check of binary paths, Pillow, required filters and encoders')
    dp.set_defaults(func=doctor)
    ip = sub.add_parser('inspect', help='Create a fresh case, normalized reference and optional audio')
    ip.add_argument('source'); ip.add_argument('--out', required=True)
    ip.add_argument('--start', type=float, default=0); ip.add_argument('--end', type=float)
    ip.add_argument('--fps'); ip.set_defaults(func=inspect)
    fp = sub.add_parser('frames', help='Extract numbered PNGs and paginated contact sheets')
    fp.add_argument('source'); fp.add_argument('--out', required=True)
    fp.add_argument('--start-frame', type=int, default=0); fp.add_argument('--end-frame', type=int)
    fp.add_argument('--step', type=int, default=15); fp.add_argument('--width', type=int, default=480)
    fp.set_defaults(func=frames_cmd)
    cp = sub.add_parser('compare', help='Require aligned inputs; produce sampled metrics and optional split video')
    cp.add_argument('reference'); cp.add_argument('render'); cp.add_argument('--out', required=True)
    cp.add_argument('--step', type=int, default=10); cp.add_argument('--video', action='store_true')
    cp.set_defaults(func=compare)
    args = p.parse_args()
    try:
        args.func(args)
    except (ValueError, OSError, KeyError, ZeroDivisionError) as e:
        p.exit(2, f'error: {e}\n')


if __name__ == '__main__':
    main()

"""Real FFmpeg integration tests. Uses temporary synthetic media, never user references."""
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
import wave
from array import array

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / 'video-mg-replica/scripts/video_tools.py'
spec = importlib.util.spec_from_file_location('video_tools', SCRIPT)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class EvidenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory(prefix='mg-evidence-test-')
        cls.root = Path(cls.temp.name)
        cls.source = cls.root / 'reference with spaces.mkv'
        module.ff('-f', 'lavfi', '-i', 'testsrc2=size=160x90:rate=30:duration=2',
                  '-f', 'lavfi', '-i', 'sine=frequency=660:duration=2',
                  '-c:v', 'ffv1', '-c:a', 'pcm_s16le', cls.source)

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def cli(self, *args, ok=True):
        p = subprocess.run([sys.executable, str(SCRIPT), *map(str, args)], capture_output=True, text=True)
        if ok:
            self.assertEqual(p.returncode, 0, p.stderr)
        else:
            self.assertNotEqual(p.returncode, 0, p.stdout)
        return p

    def test_roundtrip_frames_comparison_and_audio(self):
        case = self.root / 'case'
        self.cli('inspect', self.source, '--out', case, '--start', '.5', '--end', '1.5')
        c = json.loads((case/'case.json').read_text())
        self.assertEqual(c['timebase']['frameCount'], 30)
        self.assertEqual(c['timebase']['width'], 160)
        self.assertEqual(c['visualQA'], 'pending')
        self.assertTrue((case/c['audio']).is_file())
        normalized = case/c['reference']
        self.assertEqual(module.probe(normalized)['frames'], 30)
        self.cli('frames', normalized, '--out', self.root/'frames', '--start-frame', '2', '--end-frame', '10', '--step', '3', '--width', '0')
        index = json.loads((self.root/'frames/index.json').read_text())
        self.assertEqual([x['frame'] for x in index['frames']], [2,5,8])
        self.assertTrue((self.root/'frames/contact-001.jpg').is_file())
        review = self.root/'identical'
        self.cli('compare', normalized, normalized, '--out', review, '--step', '7', '--video')
        metrics = json.loads((review/'metrics.json').read_text())
        self.assertEqual(metrics['sampleMeanRGBMAE'], 0)
        self.assertEqual(metrics['visual'], 'pending')
        self.assertFalse(metrics['sampling']['allFrames'])
        self.assertEqual(module.probe(review/'comparison.mp4')['frames'], 30)
        self.cli('inspect', self.source, '--out', case, ok=False)

    def test_changed_pixels_detected_and_length_mismatch_rejected(self):
        changed = self.root/'changed.mkv'
        module.ff('-i', self.source, '-vf', 'negate', '-an', '-c:v', 'ffv1', changed)
        out = self.root/'changed-review'
        self.cli('compare', self.source, changed, '--out', out, '--step', '15')
        report = json.loads((out/'metrics.json').read_text())
        self.assertGreater(report['sampleMeanRGBMAE'], 20)
        short = self.root/'short.mkv'
        module.ff('-i', self.source, '-frames:v', '59', '-an', '-c:v', 'ffv1', short)
        p = self.cli('compare', self.source, short, '--out', self.root/'reject', ok=False)
        self.assertIn('frames', p.stderr)
        self.assertFalse((self.root/'reject').exists())

    def test_bad_ranges_and_step(self):
        self.cli('inspect', self.source, '--out', self.root/'bad-range', '--start', '3', ok=False)
        self.cli('inspect', self.source, '--out', self.root/'bad-fps', '--fps', '0', ok=False)
        self.cli('frames', self.source, '--out', self.root/'bad-step', '--step', '0', ok=False)
        self.cli('inspect', self.source, '--out', self.root/'nan', '--start', 'nan', ok=False)

    def test_fractional_fps_no_audio(self):
        case = self.root/'fractional'
        silent = self.root/'silent.mkv'
        module.ff('-i', self.source, '-an', '-c:v', 'copy', silent)
        self.cli('inspect', silent, '--out', case, '--fps', '30000/1001')
        c = json.loads((case/'case.json').read_text())
        self.assertEqual(c['timebase']['fpsDenominator'], 1001)
        self.assertEqual(c['timebase']['frameCount'], 60)
        self.assertIsNone(c['audio'])

    def test_delayed_audio_keeps_initial_silence(self):
        src = self.root/'delayed.mkv'
        module.ff('-f', 'lavfi', '-i', 'testsrc2=size=160x90:rate=30:duration=2',
                  '-itsoffset', '0.25', '-f', 'lavfi', '-i', 'sine=frequency=660:duration=1.5',
                  '-c:v', 'ffv1', '-c:a', 'pcm_s16le', src)
        case = self.root/'delayed-case'
        self.cli('inspect', src, '--out', case)
        with wave.open(str(case/'source/audio.wav'), 'rb') as w:
            samples = array('h', w.readframes(w.getnframes()))
            self.assertEqual(w.getnframes(), 96000)
        self.assertLess(max(abs(x) for x in samples[:9000]), 2)
        self.assertGreater(max(abs(x) for x in samples[15000:18000]), 1000)


if __name__ == '__main__':
    unittest.main()

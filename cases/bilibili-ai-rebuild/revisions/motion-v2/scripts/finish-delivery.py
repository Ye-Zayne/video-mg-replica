from pathlib import Path
import subprocess,os,json,hashlib
r=Path(__file__).resolve().parents[1];o=r/'output';ff=os.environ.get('FFMPEG','ffmpeg')
base=o/'动效优化版.mp4';patch=o/'handoff-fixed.mp4';temp=o/'delivery-patched.mp4'
filters='[0:v]trim=end_frame=4004,setpts=PTS-STARTPTS[a];[1:v]trim=end_frame=36,setpts=PTS-STARTPTS[b];[0:v]trim=start_frame=4040,setpts=PTS-STARTPTS[c];[a][b][c]concat=n=3:v=1:a=0[v]'
subprocess.run([ff,'-hide_banner','-loglevel','warning','-y','-i',str(base),'-i',str(patch),'-i',str(r/'project/public/narration.m4a'),'-filter_complex_threads','3','-filter_complex',filters,'-map','[v]','-map','2:a:0','-map_metadata','-1','-metadata','title=Editable MG reconstruction - motion revision 2','-r','28640000/954711','-frames:v','10740','-c:v','libx264','-preset','veryfast','-crf','18','-threads','4','-pix_fmt','yuv420p','-c:a','copy','-movflags','+faststart',str(temp)],check=True)
base.rename(o/'full-before-patch.mp4');temp.rename(base)
changes={str(p.relative_to(r)):hashlib.sha256(p.read_bytes()).hexdigest() for p in (r/'project/src').rglob('*') if p.is_file()};(r/'qa/delivery-source-snapshot.json').write_text(json.dumps(changes,indent=2)+'\n')
(r/'qa/assembly.json').write_text(json.dumps({'segments':[{'source':'full-before-patch.mp4','start':0,'endExclusive':4004},{'source':'handoff-fixed.mp4','start':0,'endExclusive':36,'globalStart':4004},{'source':'full-before-patch.mp4','start':4040,'endExclusive':10740}],'referenceFramesUsed':0,'audio':'Original AAC copy','reason':'Fixed records-to-brand handoff without title clock reset.'},indent=2)+'\n')
print('Final delivery assembled:',base,flush=True)

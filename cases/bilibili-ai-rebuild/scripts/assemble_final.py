from pathlib import Path
import os,subprocess
r=Path(__file__).resolve().parents[1];o=r/'output'
ff=os.environ.get('FFMPEG','ffmpeg')
graph=';'.join([
 '[0:v]trim=end_frame=1010,setpts=PTS-STARTPTS[v0]',
 '[1:v]trim=end_frame=290,setpts=PTS-STARTPTS[v1]',
 '[0:v]trim=start_frame=1300:end_frame=8962,setpts=PTS-STARTPTS[v2]',
 '[2:v]trim=end_frame=177,setpts=PTS-STARTPTS[v3]',
 '[0:v]trim=start_frame=9139,setpts=PTS-STARTPTS[v4]',
 '[v0][v1][v2][v3][v4]concat=n=5:v=1:a=0[v]'])
subprocess.run([ff,'-n','-hide_banner','-loglevel','warning','-i',str(o/'rebuild-picture.mp4'),'-i',str(o/'models-fixed.mp4'),'-i',str(o/'chart-fixed.mp4'),'-i',str(r/'project/public/narration.m4a'),'-filter_complex',graph,'-map','[v]','-map','3:a:0','-r','28640000/954711','-fps_mode','cfr','-frames:v','10740','-c:v','libx264','-crf','18','-preset','veryfast','-threads','4','-pix_fmt','yuv420p','-c:a','copy','-movflags','+faststart',str(o/'去人物复刻版.mp4')],check=True)
print(o/'去人物复刻版.mp4')

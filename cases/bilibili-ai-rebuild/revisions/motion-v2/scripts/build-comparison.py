"""Render synchronized excerpts: original, first version, motion revision."""
from pathlib import Path
import json,subprocess,os
from PIL import Image,ImageDraw,ImageFont
root=Path(__file__).resolve().parents[1];case=root.parents[1];out=root/'output';work=root/'qa/comparison';work.mkdir(parents=True,exist_ok=True)
ff=os.environ.get('FFMPEG','ffmpeg');fps=28640000/954711
ref=case/'source/reference.mkv';old=case/'output/去人物复刻版.mp4';new=out/'动效优化版.mp4';audio=root/'project/public/narration.m4a'
segments=[(0,174,'片头降落与逐字展开'),(899,1299,'卡片接力与标题更替'),(1984,2232,'资料页推镜与高亮'),(2804,3243,'标题移位与彩卡展开'),(4000,4060,'记录与标题连续接力'),(5599,5942,'隔离标签的连续动作'),(6882,7093,'文字汇聚与替换'),(9744,9894,'磁带叠放与前景旋转')]
fontpath=Path('/System/Library/Fonts/Supplemental/Songti.ttc');font=ImageFont.truetype(str(fontpath),26) if fontpath.exists() else ImageFont.load_default()
labels=['原片','上一版','动效优化版'];clips=[]
for i,(start,end,title) in enumerate(segments):
 header=Image.new('RGB',(1920,66),'#171b1e');draw=ImageDraw.Draw(header)
 for j,label in enumerate(labels):draw.text((j*640+18,17),f'{label} · {start/fps:.1f}–{end/fps:.1f}s',font=font,fill=['#c7ccc9','#c9b99e','#b7e4c6'][j])
 hp=work/f'header-{i}.png';header.save(hp);clip=work/f'clip-{i}.mp4';duration=(end-start)/fps
 cmd=[ff,'-hide_banner','-loglevel','error','-y']
 for f in [ref,old,new]:cmd+=['-ss',str(start/fps),'-i',str(f)]
 cmd+=['-framerate','28640000/954711','-loop','1','-i',str(hp),'-ss',str(start/fps),'-i',str(audio),'-filter_complex_threads','3','-filter_complex','[0:v]scale=640:360,setsar=1,setpts=PTS-STARTPTS[a];[1:v]scale=640:360,setsar=1,setpts=PTS-STARTPTS[b];[2:v]scale=640:360,setsar=1,setpts=PTS-STARTPTS[c];[a][b][c]hstack=inputs=3[row];[3:v][row]vstack=inputs=2,format=yuv420p[v]','-map','[v]','-map','4:a:0','-t',str(duration),'-r','28640000/954711','-c:v','libx264','-preset','veryfast','-crf','20','-threads','4','-c:a','aac','-b:a','160k','-movflags','+faststart',str(clip)]
 subprocess.run(cmd,check=True);clips.append(clip);print('comparison segment',i,title,flush=True)
listing=work/'concat.txt';listing.write_text(''.join("file '"+str(c)+"'\n" for c in clips))
subprocess.run([ff,'-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(listing),'-c','copy','-movflags','+faststart',str(out/'动效优化对照.mp4')],check=True)
(work/'segments.json').write_text(json.dumps([{'startFrame':a,'endFrameExclusive':b,'title':c} for a,b,c in segments],ensure_ascii=False,indent=2)+'\n')
print('comparison complete',flush=True)

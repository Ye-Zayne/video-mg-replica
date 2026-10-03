from pathlib import Path
import subprocess
from PIL import Image,ImageDraw
ff='/Users/zhangye/Desktop/视频复刻skill/.runtime/python/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1'
src='/Users/zhangye/Downloads/41630436033-1-192.mp4'
out=Path(__file__).parent
for name,start,span in [('cassette',324.78,5.1),('second',333.3,1.5),('chart',298.746,1)]:
 d=out/name;d.mkdir(exist_ok=True)
 subprocess.run([ff,'-hide_banner','-loglevel','error','-ss',str(start),'-i',src,'-t',str(span),'-vf','fps=10,scale=640:360','-y',str(d/'%03d.png')],check=True)
 files=sorted(d.glob('*.png'))
 for page in range((len(files)+19)//20):
  canvas=Image.new('RGB',(1280,4*202),(32,34,38));draw=ImageDraw.Draw(canvas)
  for i,p in enumerate(files[page*20:page*20+20]):
   col=i%4;row=i//4;im=Image.open(p);im.thumbnail((320,180));canvas.paste(im,(col*320,row*202));draw.text((col*320+4,row*202+183),f'{start+(page*20+i)/10:.2f}s',(255,255,255))
  canvas.save(out/f'{name}-{page}.jpg')

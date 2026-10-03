from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import cv2,numpy as np
root=Path(__file__).resolve().parents[1]
im=np.array(Image.open(root/'evidence/all/frames/frame-000490.png'))
t=(im[326:410,732:907,:3].mean(2)<100).astype('uint8')*255
x,y,w,h=cv2.boundingRect(t);target=t[y:y+h,x:x+w]
fonts=list(Path('/System/Library/Fonts').rglob('*'))
fonts=[p for p in fonts if p.suffix in ['.ttf','.ttc'] and any(s in p.name for s in ['Times','Baskerville','Bodoni','Didot','Hoefler','Georgia']) and not any(s in p.name for s in ['Bold','Italic'])]
results=[]; sheet=Image.new('RGB',(650,(len(fonts)+1)*100),'white');d=ImageDraw.Draw(sheet); sheet.paste(Image.fromarray(255-target).convert('RGB'),(350,0));d.text((5,5),'SOURCE plain',fill='black')
for j,p in enumerate(fonts):
 try:
  font=ImageFont.truetype(str(p),100)
  a=Image.new('L',(400,160));ImageDraw.Draw(a).text((10,0),'plain',font=font,fill=255)
  ar=np.array(a);xx,yy,ww,hh=cv2.boundingRect((ar>100).astype('uint8'))
  crop=ar[yy:yy+hh,xx:xx+ww];pred=cv2.resize(crop,(w,h))
  score=np.abs(pred.astype(float)-target).mean()
  results.append((round(score,2),str(p),font.getname(),hh,ww))
  sheet.paste(Image.fromarray(255-pred).convert('RGB'),(350,(j+1)*100));d.text((5,(j+1)*100+10),p.name+' '+str(round(score,2)),fill='black')
 except Exception as e:print(e)
sheet.save(root/'evidence/font-candidates.jpg')
print(sorted(results))

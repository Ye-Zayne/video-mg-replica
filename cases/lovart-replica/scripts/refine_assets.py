from pathlib import Path
import cv2,numpy as np,json
from PIL import Image
R=Path(__file__).resolve().parents[1];P=R/'project/public';D=R/'project/src'
def image(n):return np.array(Image.open(R/f'evidence/all/frames/frame-{n:06d}.png').convert('RGB'))
assets=json.loads((D/'assets.json').read_text())
# Keep the complete light shirt. A dark-only matte lost low-contrast cloth.
for n in range(190,213):
 a=image(min(n,208));sub=a[180:560,460:605];mask=(sub.mean(2)<246).astype('uint8')
 mask=cv2.morphologyEx(mask,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
 pts=cv2.findNonZero(mask)
 hull=np.zeros_like(mask);cv2.fillConvexPoly(hull,cv2.convexHull(pts),255)
 rgba=np.dstack((sub,hull));Image.fromarray(rgba).save(P/f'assets/walker-{n}.png')
 assets[str(n)]=[{'src':f'assets/walker-{n}.png','x':460,'y':180,'w':145,'h':380}]
# The ant is an independent photographic object, separate from all live captions.
for n in range(250,272):
 a=image(n);x,y,w,h=(511,326,44,41)
 # Source ant stays near x530 while its text labels slide left and right.
 sub=a[y:y+h,x:x+w]
 Image.fromarray(sub).save(P/f'assets/ant-{n}.png')
 assets[f'ant-{n}']={'src':f'assets/ant-{n}.png','x':x,'y':y,'w':w,'h':h}
# Isolated brand symbol: editable SVG shape, with native wordmark text.
a=image(579);m=(a.mean(2)>180).astype('uint8');m[:,:539]=0;m[:,594:]=0
cs,_=cv2.findContours(m,cv2.RETR_TREE,cv2.CHAIN_APPROX_SIMPLE)
d=[]
for c in cs:
 if cv2.contourArea(c)<.8:continue
 q=cv2.approxPolyDP(c,.25,True)[:,0,:]
 d.append('M'+' L'.join(f'{x},{y}' for x,y in q)+' Z')
geo=json.loads((D/'geometry.json').read_text());geo['brand-icon']={'fill':'#fff','d':' '.join(d)}
(D/'geometry.json').write_text(json.dumps(geo,separators=(',',':')))
(D/'assets.json').write_text(json.dumps(assets,separators=(',',':')))
print('Repaired person matte, isolated ant and brand symbol')

from pathlib import Path
import cv2, numpy as np, json, math
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
FRAMES=ROOT/'evidence/all/frames';PUB=ROOT/'project/public/assets';SPEC=ROOT/'project/src'
PUB.mkdir(exist_ok=True)
def frame(n):return cv2.cvtColor(cv2.imread(str(FRAMES/f'frame-{n:06d}.png')),cv2.COLOR_BGR2RGB)
def paths(mask,eps=.65,minarea=2):
 cs,hs=cv2.findContours(mask.astype('uint8'),cv2.RETR_TREE,cv2.CHAIN_APPROX_SIMPLE)
 result=[]
 for c in cs:
  if abs(cv2.contourArea(c))<minarea:continue
  q=cv2.approxPolyDP(c,eps,True)[:,0,:]
  if len(q)<3:continue
  result.append('M'+' L'.join(f'{x},{y}' for x,y in q)+' Z')
 return ' '.join(result)
def save_png(im,mask,name):
 y,x=np.where(mask>0)
 if not len(x):return None
 x0,y0,x1,y1=max(0,x.min()-2),max(0,y.min()-2),min(1280,x.max()+3),min(720,y.max()+3)
 rgba=np.dstack((im[y0:y1,x0:x1],mask[y0:y1,x0:x1]))
 Image.fromarray(rgba.astype('uint8')).save(PUB/f'{name}.png')
 return {'src':f'assets/{name}.png','x':int(x0),'y':int(y0),'w':int(x1-x0),'h':int(y1-y0)}
def hull_mask(binary):
 pts=cv2.findNonZero(binary.astype('uint8'))
 mask=np.zeros((720,1280),np.uint8)
 if pts is not None:cv2.fillConvexPoly(mask,cv2.convexHull(pts),255)
 return mask
def roi_mask(im,rect,light=False):
 x,y,w,h=rect;mask=np.zeros((720,1280),np.uint8)
 sub=im[y:y+h,x:x+w];g=sub.mean(2)
 # Matte from the object silhouette; source photo pixels remain unchanged.
 binary=((g<190) if light else (g>60)).astype('uint8')*255
 # Suppress thin construction guides before deriving a matte.
 binary=cv2.morphologyEx(binary,cv2.MORPH_OPEN,np.ones((2,2),np.uint8))
 cs,_=cv2.findContours(binary,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
 for c in cs:
  if cv2.contourArea(c)>20:
   cv2.drawContours(mask[y:y+h,x:x+w],[cv2.convexHull(c)],-1,255,-1)
 mask=cv2.dilate(mask,np.ones((3,3),np.uint8))
 return mask
assets={};vectors={};captions={};guides={}
# All production media layers are isolated objects, never complete reference scenes.
for n in range(41,76):
 im=frame(n)
 if n==41:rect=(0,0,1280,720)
 elif n==42:rect=(485,0,620,720)
 elif n==43:rect=(555,80,450,575)
 elif n==44:rect=(570,110,410,510)
 elif n==45:rect=(582,140,360,465)
 elif n==46:rect=(586,165,330,425)
 elif n==47:rect=(589,185,305,385)
 else:rect=(587,190,305,385)
 # Later scale decreases; mask finds the actual bounds inside the generous ROI.
 assets[str(n)]=[save_png(im,roi_mask(im,rect,True),f'chair-{n}')]
for n in range(96,110):
 im=frame(n); assets[str(n)]=[save_png(im,roi_mask(im,(460,150,290,355)),f'glass-{n}')]
# Portrait collage separated from the moving type background using a clean frame.
base=frame(128).astype(float)
for n in range(129,143):
 im=frame(n);diff=np.max(abs(im.astype(float)-base),2)
 mask=((diff>25)&(np.indices((720,1280))[0]>70)&(np.indices((720,1280))[0]<630)).astype('uint8')*255
 mask=cv2.morphologyEx(mask,cv2.MORPH_CLOSE,np.ones((7,7),np.uint8))
 cs,_=cv2.findContours(mask,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE);mask[:]=0
 for c in cs:
  if cv2.contourArea(c)>500:cv2.drawContours(mask,[c],-1,255,-1)
 assets[str(n)]=[save_png(im,mask,f'portraits-{n}')]
# Seven separate spinning product cutouts, above/below the editable caption baseline.
for n in range(158,174):
 im=frame(n);items=[]
 for k,rect in enumerate([(0,0,390,322),(520,0,400,322),(960,0,320,322),(0,394,260,326),(250,394,280,326),(610,394,295,326),(920,394,300,326)]):
  sprite=save_png(im,roi_mask(im,rect),f'product-{k}-{n}')
  if sprite:items.append(sprite)
 assets[str(n)]=items
for n in range(190,213):
 im=frame(min(n,208)); mask=roi_mask(im,(455,145,160,445),True)
 assets[str(n)]=[save_png(im,mask,f'walker-{n}')]
# Editorial product thumbnails. Preserve source photos as replaceable image assets.
for n in [340,356,372,384,392]:
 im=frame(n);r=(486,261,198,198);x,y,w,h=r
 # Product card changes include black margins; retain their measured rectangle.
 mask=np.zeros((720,1280),np.uint8);mask[y:y+h,x:x+w]=255
 assets[f'card-{n}']=save_png(im,mask,f'card-{n}')
# Colorful spinning balls, split into three independently positionable circular media layers.
ball_keys={
 'pink':[(270,662,783,84),(278,430,709,82),(286,395,674,81),(295,367,640,81),(301,354,618,83),(305,350,615,84)],
 'poster':[(270,1350,192,111),(272,1243,197,111),(278,1200,578,111),(286,1121,633,114),(295,1040,675,115),(299,1020,689,115),(301,1080,746,131),(305,1200,880,175)],
 'gorilla':[(270,720,-225,132),(272,725,-100,132),(278,838,45,141),(286,887,125,130),(295,919,178,122),(299,927,197,120),(301,974,158,147),(305,1280,-120,240)]}
def interp(keys,n):
 for a,b in zip(keys,keys[1:]):
  if a[0]<=n<=b[0]:
   q=(n-a[0])/(b[0]-a[0]);return [a[i]+q*(b[i]-a[i]) for i in range(1,4)]
 return keys[-1][1:]
Y,X=np.indices((720,1280))
for n in range(270,306):
 im=frame(n);items=[]
 for name,keys in ball_keys.items():
  cx,cy,r=interp(keys,n)
  # Refine center/radius from colored pixels in the expected neighborhood.
  hsv=cv2.cvtColor(im,cv2.COLOR_RGB2HSV)
  region=(X-cx)**2+(Y-cy)**2<(r+25)**2
  sat=region&(hsv[:,:,1]>65)&(hsv[:,:,2]>50)
  pts=cv2.findNonZero(sat.astype('uint8'))
  if pts is not None and len(pts)>80 and name!='gorilla':
   (px,py),pr=cv2.minEnclosingCircle(pts)
   if .75*r<pr<1.15*r and 0<px-pr and px+pr<1280 and 0<py-pr and py+pr<720:cx,cy,r=px,py,pr+1
  mask=np.clip((r-np.sqrt((X-cx)**2+(Y-cy)**2))*255,0,255).astype('uint8')
  sprite=save_png(im,mask,f'ball-{name}-{n}')
  if sprite:items.append(sprite)
 assets[str(n)]=items
# Bold letterforms become SVG outline geometry, split by visible development frame.
for n in range(433,468):
 im=frame(n);mask=((im[:,:,0]>100)&(im[:,:,1]>120)&(im[:,:,2]<150)).astype('uint8')*255
 vectors[f'bold-{n}']=[{'id':'paint-outline','fill':'accent','d':paths(mask,.6,1)}]
# Reconstruct each distinct illustrated pose as editable colored vector paths.
for n in range(468,537):
 im=frame(n); roi=np.zeros((720,1280),np.uint8);roi[165:560,458:724]=1
 hsv=cv2.cvtColor(im,cv2.COLOR_RGB2HSV)
 fg=roi&((hsv[:,:,1]>50)|(hsv[:,:,2]<120))
 cs,_=cv2.findContours(fg.astype('uint8'),cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE);body=np.zeros((720,1280),np.uint8)
 for c in cs:
  if cv2.contourArea(c)>30:cv2.drawContours(body,[c],-1,1,-1)
 pixels=im[body>0]
 if len(pixels)<100:continue
 cv2.setRNGSeed(41)
 _,labels,colors=cv2.kmeans(pixels.astype('float32'),5,None,(cv2.TERM_CRITERIA_EPS+cv2.TERM_CRITERIA_MAX_ITER,30,.3),1,cv2.KMEANS_PP_CENTERS)
 arr=[]
 for idx,color in enumerate(colors):
  mask=np.zeros((720,1280),np.uint8);mask[body>0]=(labels[:,0]==idx).astype('uint8')*255
  arr.append({'id':f'illustration-color-{idx}','fill':'#'+''.join(f'{round(float(c)):02x}' for c in color),'d':paths(mask,.65,2)})
 vectors[f'plain-{n}']=arr
# Heavy is reconstructed as vector glyph geometry, not a background image.
im=frame(127);mask=(im.mean(2)<80).astype('uint8')*255
vectors['heavy']=[{'id':'heavy-outline','fill':'#000','d':paths(mask,.8,5)}]
# Sparse White-panel curves are traced separately from live numeric labels and border text.
im=frame(425); gray=im.mean(2);mask=((gray<195)&(X>275)&(X<1035)&(Y>92)&(Y<637)).astype('uint8')*255
# Separate tiny connected components (numeric labels) from elongated curve fragments.
cs,_=cv2.findContours(mask,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE);curvepaths=[];nums=[]
for c in cs:
 x,y,w,h=cv2.boundingRect(c)
 if w>24 or h>16:
  q=cv2.approxPolyDP(c,.6,False)[:,0,:]
  if len(q)>2:curvepaths.append('M'+' L'.join(f'{a},{b}' for a,b in q))
# Hand-reviewed labels are encoded as live strings at measured centers.
for x,y,txt in [(299,201,'START'),(367,201,'255'),(453,233,'255'),(447,185,'17'),(487,188,'12'),(527,187,'17'),(540,227,'165'),(601,199,'253'),(601,226,'251'),(663,259,'165'),(710,199,'256'),(721,236,'253'),(804,227,'255'),(850,227,'256'),(906,236,'254'),(962,248,'258'),(1002,239,'265'),(814,273,'263'),(852,282,'203'),(351,268,'251'),(323,297,'295'),(423,268,'255'),(432,311,'267'),(496,342,'233'),(508,368,'255'),(553,283,'255'),(560,268,'405'),(689,319,'255'),(750,300,'266'),(748,315,'('),(906,296,'259'),(1000,356,'233'),(597,385,'255'),(565,419,'255'),(722,416,'253'),(840,405,'233'),(379,432,'255'),(871,453,'153'),(710,485,'152'),(981,486,'157'),(640,575,'265'),(672,563,'153'),(378,527,'255')]:nums.append({'x':x,'y':y,'text':txt})
vectors['white-curves']={'paths':curvepaths,'labels':nums}
# Photo backdrop extraction: omit the two typography rectangles from the reusable media.
# Fill only those missing pixels from nearby clean vertical texture; disclose approximation.
for n in range(307,340):
 im=frame(n)
 for x0,y0,x1,y1 in [(372,319,456,406),(722,314,907,413)]:
  # Vertical background texture continues through small editorial overlay regions.
  above=im[y0-35:y0,x0:x1].mean(axis=0);below=im[y1:y1+35,x0:x1].mean(axis=0)
  q=np.linspace(0,1,y1-y0)[:,None,None]
  im[y0:y1,x0:x1]=((1-q)*above[None]+q*below[None]).astype('uint8')
 Image.fromarray(im).save(PUB/f'birch-{n}.jpg',quality=97)
# Main caption bounding boxes are measured, the actual letters remain live text.
regions=[(40,76,'classic',True),(76,110,'light',False),(143,174,'expensive',False),(174,213,'effortless',True),(250,272,'small',True),(307,340,'quiet',False),(340,407,'black',False),(468,537,'plain',True)]
for start,end,word,light in regions:
 for n in range(start,end):
  im=frame(n);g=im.mean(2)
  if word=='classic':roi=(260,310,595,410)
  elif word=='small':roi=(440,330,844,362)
  elif word=='quiet':continue
  else:roi=(360,320,1010,417)
  x0,y0,x1,y1=roi
  mask=((g<100) if light else (g>210)).astype('uint8')*255
  keep=np.zeros_like(mask);keep[y0:y1,x0:x1]=255;mask&=keep
  if word=='classic':mask[:,585:]=0
  if word=='light' and n>=96:mask[:,460:750]=0
  if word=='expensive' and n>=158: pass
  if word=='effortless' and n>=190:mask[:,455:607]=0
  if word=='black':mask[:,480:705]=0
  if word=='plain':mask[:,459:728]=0
  count,lab,stats,cent=cv2.connectedComponentsWithStats(mask)
  comps=[]
  for x,y,w,h,area in stats[1:]:
   if area>9 and h>8 and w<220 and h<120:comps.append([int(x),int(y),int(x+w),int(y+h)])
  comps.sort()
  groups=[]
  for b in comps:
   if groups and b[0]-groups[-1][2]<3:
    a=groups[-1];groups[-1]=[min(a[0],b[0]),min(a[1],b[1]),max(a[2],b[2]),max(a[3],b[3])]
   else:groups.append(b)
  if len(groups)>=2:
   def bounds(gs):return [min(a[0] for a in gs),min(a[1] for a in gs),max(a[2] for a in gs),max(a[3] for a in gs)]
   captions[str(n)]={'word':word,'or':bounds(groups[:2]),'rest':bounds(groups[2:]) if len(groups)>2 else None}
# A compact construction-line layout is measured from guide-only rows/columns.
for n in list(range(40,110))+list(range(143,210))+list(range(250,272))+list(range(340,433))+list(range(468,537)):
 im=frame(n).mean(2);light=im[0,0]>120
 # Reference guides have many faint gray pixels in long otherwise empty outer margins.
 signal=(253-im) if light else im
 sx=np.mean(signal[:140],axis=0)+np.mean(signal[570:],axis=0)
 sy=np.mean(signal[:,:240],axis=1)+np.mean(signal[:,1050:],axis=1)
 def peaks(s,threshold):
  inds=np.where(s>threshold)[0];groups=[]
  for v in inds:
   if groups and v-groups[-1][-1]<=3:groups[-1].append(int(v))
   else:groups.append([int(v)])
  return [int(round(sum(g)/len(g))) for g in groups if len(g)<8]
 guides[str(n)]={'x':peaks(sx,10 if light else 16),'y':peaks(sy,10 if light else 16)}
assets={k:[v for v in vs if v] if isinstance(vs,list) else vs for k,vs in assets.items()}
for name,data in [('assets',assets),('vectors',vectors),('captions',captions),('guides',guides)]:
 (SPEC/f'{name}.json').write_text(json.dumps(data,separators=(',',':')))
print('Assets',len(assets),'vector states',len(vectors),'captions',len(captions))

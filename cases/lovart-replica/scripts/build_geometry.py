"""Original, reference-measured glyph and effect reconstruction. No upstream skill code."""
from pathlib import Path
import cv2,numpy as np,json
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from PIL import Image
R=Path(__file__).resolve().parents[1];D=R/'project/src';P=R/'project/public'
def im(n):return cv2.cvtColor(cv2.imread(str(R/f'evidence/all/frames/frame-{n:06d}.png')),cv2.COLOR_BGR2RGB)
def contours(mask,epsilon=.45,area=.5):
 cs,_=cv2.findContours(mask.astype('uint8'),cv2.RETR_TREE,cv2.CHAIN_APPROX_SIMPLE)
 return [cv2.approxPolyDP(c,epsilon,True)[:,0,:] for c in cs if abs(cv2.contourArea(c))>=area]
def path(mask,epsilon=.45,area=.5):
 return ' '.join('M'+' L'.join(f'{x},{y}' for x,y in c)+' Z' for c in contours(mask,epsilon,area) if len(c)>2)
# Build a small font from measured serif glyph shapes, so ordinary captions remain real editable text.
specs=[(98,'o',378,415,392),(98,'r',422,445,392),(98,'l',764,776,392),
 (98,'i',784,794,392),(98,'g',799,834,392),(98,'h',838,874,392),(98,'t',879,901,392),
 (170,'e',583,618,391),(170,'x',619,655,391),(170,'p',659,698,391),
 (170,'n',743,780,391),(170,'s',785,811,391),(170,'v',832,870,391),
 (197,'f',655,677,394),(490,'a',800,836,390),
 (350,'b',719,760,391),(350,'c',820,855,391),(350,'k',858,898,391)]
fb=FontBuilder(1000,isTTF=True);glyphs={};metrics={};cmap={}
for n,ch,x0,x1,base in specs:
 g=im(n).mean(2);m=(g<100 if n in [197,490] else g>210)
 mask=m[319:414,x0:x1].astype('uint8')
 pen=TTGlyphPen(None)
 for c in contours(mask,.25,.4):
  if len(c)<3:continue
  pts=[(round(float(x)*1000/96),round((base-(int(y)+319))*1000/96)) for x,y in c]
  pen.moveTo(pts[0])
  for pt in pts[1:]:pen.lineTo(pt)
  pen.closePath()
 glyphs[ch]=pen.glyph();metrics[ch]=(round((x1-x0+6)*1000/96),0);cmap[ord(ch)]=ch
# q uses the measured p bowl with a reflected stem as a documented approximation.
glyphs['q']=glyphs['p'];metrics['q']=metrics['p'];cmap[ord('q')]='q'
for name,w in [('.notdef',400),('space',240)]:
 glyphs[name]=TTGlyphPen(None).glyph();metrics[name]=(w,0)
cmap[32]='space'
order=['.notdef','space']+list(cmap.values())[:-1]
order=list(dict.fromkeys(order+list(glyphs)))
fb.setupGlyphOrder(order);fb.setupCharacterMap(cmap);fb.setupGlyf(glyphs);fb.setupHorizontalMetrics(metrics)
fb.setupHorizontalHeader(ascent=850,descent=-300);fb.setupNameTable({'familyName':'Replica Serif','styleName':'Regular','uniqueFontIdentifier':'ReplicaSerif-measured-1','fullName':'Replica Serif','psName':'ReplicaSerif'})
fb.setupOS2(sTypoAscender=850,sTypoDescender=-300,usWinAscent=850,usWinDescent=300)
fb.setupPost();fb.setupMaxp();fb.save(P/'replica-serif.ttf')
# Editable SVG glyph outlines for rotating geometric type and very large type.
geo={}
for n in list(range(7,40))+list(range(110,129))+list(range(209,250))+list(range(272,307)):
 a=im(n);g=a.mean(2)
 if 110<=n<129:
  mask=g<100
 elif 209<=n<250:
  mask=g>215;mask[:65]=False;mask[650:]=False
  if n<213:
   # Only the entering black panel contains white title strokes.
   bg=(g[:60].mean(0)<60);mask[:,~bg]=False
 elif 272<=n<307:
  mask=(a.min(2)>218)&((a.max(2).astype(float)-a.min(2))<22)
  # Remove the interiors of source photograph objects; preserve only white MG.
  assets=json.loads((D/'assets.json').read_text()).get(str(n),[])
  for v in assets:
   if v and 'ball-' in v['src']:
    alpha=np.array(Image.open(P/v['src']).convert('RGBA'))[:,:,3]
    y,x=v['y'],v['x'];mask[y:y+v['h'],x:x+v['w']][alpha>0]=False
 else:mask=g>180
 geo[str(n)]={'d':path(mask,.45,.6),'fill':'#000' if 110<=n<129 else '#fff'}
# Main measured bounds: filter guide specks before grouping whole glyphs (including i dots).
caps=json.loads((D/'captions.json').read_text())
for key,entry in caps.items():
 n=int(key);a=im(n);g=a.mean(2);word=entry['word'];light=word in ['classic','effortless','small','plain']
 mask=(g<110 if light else g>220).astype('uint8')
 if word=='small':continue
 roi=np.zeros_like(mask);roi[319:416,360:1010]=1
 if word=='classic':roi[:]=0;roi[310:410,260:585]=1
 if word=='light' and n>=96:roi[:,460:750]=0
 if word=='effortless' and n>=190:roi[:,455:607]=0
 if word=='black':roi[:,480:705]=0
 if word=='plain':roi[:,459:728]=0
 mask*=roi
 count,lab,stats,c=cv2.connectedComponentsWithStats(mask);clean=np.zeros_like(mask)
 for idx,(x,y,w,h,area) in enumerate(stats[1:],1):
  if area>8 and h>5 and w<220 and h<110:clean[lab==idx]=1
 cols=np.where(clean.sum(0)>0)[0];spans=[]
 for x in cols:
  if spans and x<=spans[-1][-1]+1:spans[-1].append(int(x))
  else:spans.append([int(x)])
 if len(spans)>=3:
  split=(spans[1][-1]+spans[2][0])/2
  def bound(l,r):
   ys,xs=np.where(clean[:,int(l):int(r)])
   return [int(xs.min()+l),int(ys.min()),int(xs.max()+l+1),int(ys.max()+1)] if len(xs) else None
  entry['or']=bound(0,split);entry['rest']=bound(int(split),1280)
# Font specimen renders will validate both glyph shape and replacement flow.
(D/'captions.json').write_text(json.dumps(caps,separators=(',',':')))
(D/'geometry.json').write_text(json.dumps(geo,separators=(',',':')))
print('Geometry states',len(geo),'custom font glyphs',len(glyphs))

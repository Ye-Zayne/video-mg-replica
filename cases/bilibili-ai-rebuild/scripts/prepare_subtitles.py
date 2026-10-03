from pathlib import Path
import json,re,difflib
r=Path(__file__).resolve().parents[1]
rows=[]
for line in (r/'evidence/subtitle-ocr.jsonl').read_text().splitlines():
 d=json.loads(line);n=int(d['file'][4:8]);c=[]
 for a in d['lines']:
  chinese=len(re.findall('[\u4e00-\u9fff]',a['text']))
  if chinese>=2 and a['h']>.18 and a['w']>.1 and a['y']<.65:c.append(a)
 c.sort(key=lambda a:a['h']*2-abs(a['x']+a['w']/2-.5),reverse=True)
 text=c[0]['text'] if c else ''
 text=re.sub(r'(?<=[\u4e00-\u9fff])\s+(?=[\u4e00-\u9fff])','',text)
 replacements={'OpenAl':'OpenAI','OpenAl':'OpenAI','Hugging Faice':'Hugging Face','HUoging Face':'Hugging Face','HUgging Face':'Hugging Face','CLM-5.2':'GLM-5.2','CLM-52':'GLM-5.2','A！':'AI','Al':'AI','AI！':'AI','攻入':'攻入','政入':'攻入','九百个':'九百个','一合':'一台','多合机器':'多台机器','一万七干':'一万七千','软件漏同':'软件漏洞','订论':'讨论','剂车':'刹车','己经':'已经','平台吗停':'平台叫停','AI果说':'AI来说','输人的':'输入的','关注它的笼子':'关住它的笼子','安全故事里边':'安全故事里边','不期视频':'下期视频'}
 for a,b in replacements.items():text=text.replace(a,b)
 text=text.strip(' ，。')
 rows.append({'time':n*.5,'text':text})
# Resolve isolated OCR spelling variants to the adjacent high-agreement sentence.
for i in range(1,len(rows)-1):
 a,b,c=rows[i-1]['text'],rows[i]['text'],rows[i+1]['text']
 if a==c and a and difflib.SequenceMatcher(None,a,b).ratio()>.72:rows[i]['text']=a
cues=[]
for d in rows:
 start=max(0,d['time']-.25)
 if cues and d['text']==cues[-1]['text']:cues[-1]['end']=min(358.016625,d['time']+.25)
 else:cues.append({'start':start,'end':min(358.016625,d['time']+.25),'text':d['text']})
(r/'project/src/subtitles.json').write_text(json.dumps([c for c in cues if c['text']],ensure_ascii=False,indent=2))
(r/'specs/subtitles-review.txt').write_text('\n'.join(f"{c['start']:6.2f}–{c['end']:6.2f} {c['text']}" for c in cues if c['text']))
print(len(cues),'subtitle cues')

from pathlib import Path
import zipfile,hashlib,json
r=Path(__file__).resolve().parents[1];project=r/'project';out=r/'output/可编辑动效工程-v2.zip'
files=[p for p in project.rglob('*') if p.is_file() and not any(x in p.parts for x in ('node_modules','.cache','.DS_Store'))]
extras=['qa.md','source-provenance.json','qa/early-motion.md','qa/middle-motion.md','qa/late-motion.md','qa/ending-motion.md','qa/integration-audit.md','qa/audio-check.json','qa/assembly.json','qa/delivery-compare/metrics.json','qa/delivery-source-snapshot.json','qa/editability/check.json','qa/editability/changed-960.png','qa/editability/changed-model.png','qa/editability/frozen-5000.png','evidence/ending/chart-motion.json','evidence/ending/chart-scale-fit.json','evidence/ending/chart-heldout.json']
files += [r/x for x in extras]
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
 for p in files:z.write(p,'可编辑动效工程-v2/'+p.relative_to(r).as_posix())
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 assert not any('/node_modules/' in n for n in z.namelist())
 print('Verified archive:',len(z.namelist()),'files;',out.stat().st_size,'bytes')
manifest=[]
for name in ['动效优化版.mp4','动效优化对照.mp4','可编辑动效工程-v2.zip']:
 p=r/'output'/name;manifest.append({'file':name,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(r/'output/delivery-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(manifest,ensure_ascii=False,indent=2))

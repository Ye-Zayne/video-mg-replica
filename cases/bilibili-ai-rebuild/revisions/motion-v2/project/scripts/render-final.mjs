import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {resolve,dirname} from 'node:path';
import {existsSync,unlinkSync} from 'node:fs';
const req=createRequire(import.meta.url);const ffmpeg=process.env.FFMPEG||'ffmpeg';
const args=process.argv.slice(2);const target=resolve(args[0]||'rebuild.mp4');
if(existsSync(target))throw new Error('Output already exists: '+target);
if(args.slice(1).some(a=>a==='--frames'||a.startsWith('--frames=')))throw new Error('Partial ranges: use npm run render -- clip.mp4 --frames=START-END; render:final is for full-length exports.');
const picture=target+'.picture.mp4';
function run(cmd,argv){const r=spawnSync(cmd,argv,{stdio:'inherit'});if(r.error)throw r.error;if(r.status!==0)throw new Error(cmd+' failed with '+r.status);}
run(process.execPath,[resolve(dirname(req.resolve('@remotion/cli/package.json')),'remotion-cli.js'),'render','src/index.tsx','Replica',picture,'--codec=h264','--crf=18',...args.slice(1)]);
// Audio is muxed from the original isolated AAC track. The React composition
// previews the original narration; final delivery copies the original AAC directly.
run(ffmpeg,['-hide_banner','-loglevel','error','-i',picture,'-i',resolve('public/narration.m4a'),'-map','0:v:0','-map','1:a:0','-map_metadata','-1','-metadata','title=Editable MG reconstruction - motion revision 2','-c','copy','-t','358.016625','-movflags','+faststart',target]);
unlinkSync(picture);console.log('Rendered: '+target);

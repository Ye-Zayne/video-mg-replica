import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {dirname,resolve} from 'node:path';
import {existsSync,unlinkSync} from 'node:fs';
const require=createRequire(import.meta.url);
const ffmpeg=process.env.FFMPEG||'ffmpeg';
const args=process.argv.slice(2);
const muxOnly=args[0]==='--mux-only';
const target=resolve(muxOnly?(args[2]||'replica.mp4'):(args[0]||'replica.mp4'));
const picture=muxOnly?resolve(args[1]):target+'.picture.mp4';
if(existsSync(target))throw new Error('Output already exists: '+target);
function run(bin,argv){const r=spawnSync(bin,argv,{stdio:'inherit'});if(r.error)throw r.error;if(r.status!==0)throw new Error(bin+' failed: '+r.status);}
if(!muxOnly){
 const cli=resolve(dirname(require.resolve('@remotion/cli/package.json')),'remotion-cli.js');
 run(process.execPath,[cli,'render','src/index.tsx','Replica',picture,'--codec=h264','--crf=16',...args.slice(1)]);
}
// Preserve picture bitstream and align original PCM directly at t=0. This avoids
// the 2048-sample audio delay measured in the initial Remotion render on this host.
run(ffmpeg,['-hide_banner','-loglevel','error','-i',picture,'-i',resolve('public/audio.wav'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-t','24.833333333','-movflags','+faststart',target]);
if(!muxOnly)unlinkSync(picture);
console.log('Final video: '+target);

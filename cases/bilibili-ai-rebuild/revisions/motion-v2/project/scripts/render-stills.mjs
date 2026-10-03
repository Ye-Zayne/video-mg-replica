import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderStill} from '@remotion/renderer';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const browserExecutable=process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const scenes=JSON.parse(readFileSync('src/timeline.json','utf8'));
const serveUrl=await bundle({entryPoint:resolve('src/index.tsx')});
const browser=await openBrowser('chrome',{browserExecutable});
const composition=await selectComposition({serveUrl,id:'Replica',browserExecutable,puppeteerInstance:browser});
mkdirSync('../qa/stills',{recursive:true});
let next=0;const records=[];
async function worker(){while(next<scenes.length){const index=next++;const scene=scenes[index];const time=Math.min(scene.end-.15,scene.start+Math.min(2.2,(scene.end-scene.start)*.60));const frame=Math.round(time*composition.fps);const output=resolve('../qa/stills/'+String(index).padStart(2,'0')+'-'+scene.type+'.png');await renderStill({serveUrl,composition,frame,output,imageFormat:'png',puppeteerInstance:browser});records.push({index,frame,time,scene,output});console.log(index,scene.type,frame);}}
await Promise.all([worker(),worker()]);
await browser.close({silent:true});writeFileSync('../qa/stills/index.json',JSON.stringify(records.sort((a,b)=>a.index-b.index),null,2));

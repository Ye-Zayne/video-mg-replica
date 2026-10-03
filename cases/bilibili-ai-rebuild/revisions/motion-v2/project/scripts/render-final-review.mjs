import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderStill} from '@remotion/renderer';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const times=[1.55,19.4,31.1,33.5,39.2,67.7,71.5,106,122.7,131.3,137,163,193,255,266,328.7,352];
const browserExecutable=process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const serveUrl=await bundle({entryPoint:resolve('src/index.tsx')});
const browser=await openBrowser('chrome',{browserExecutable});
const composition=await selectComposition({serveUrl,id:'Replica',browserExecutable,puppeteerInstance:browser});
mkdirSync('../qa/final-stills',{recursive:true});let next=0;const records=[];
async function worker(){while(next<times.length){const i=next++,time=times[i],frame=Math.round(time*composition.fps);const output=resolve('../qa/final-stills/'+String(frame).padStart(6,'0')+'.png');await renderStill({serveUrl,composition,frame,output,imageFormat:'png',puppeteerInstance:browser});records.push({frame,time,file:output});console.log(i,time);}}
await Promise.all([worker(),worker(),worker(),worker()]);await browser.close({silent:true});writeFileSync('../qa/final-stills/index.json',JSON.stringify(records.sort((a,b)=>a.frame-b.frame),null,2));

import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderStill} from '@remotion/renderer';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const times=[.5,1,1.55,5.45,6.1,8.25,10.05,13.5,15.5,16.5,19.4,30.25,31.1,33.25,33.5,33.7,38.7,39.2,41.3,43.29,47,50.5,52.1,57,60.5,67.7,71.5,74,75.4,80,96.5,99,106,119.7,122.7,131.3,137,148.3,300.1,303.2,312.2,318,324.93,325.3,326.1,327.2,327.65,328.7,333.8,337,342,352,356.4];
const browserExecutable=process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const serveUrl=await bundle({entryPoint:resolve('src/index.tsx')});
const browser=await openBrowser('chrome',{browserExecutable});
const composition=await selectComposition({serveUrl,id:'Replica',browserExecutable,puppeteerInstance:browser});
mkdirSync('../qa/motion-stills',{recursive:true});let next=0;const records=[];
async function worker(){while(next<times.length){const i=next++,time=times[i],frame=Math.round(time*composition.fps);const output=resolve('../qa/motion-stills/'+String(frame).padStart(6,'0')+'.png');await renderStill({serveUrl,composition,frame,output,imageFormat:'png',puppeteerInstance:browser});records.push({frame,time,file:output});console.log(i,time);}}
await Promise.all([worker(),worker(),worker(),worker()]);await browser.close({silent:true});writeFileSync('../qa/motion-stills/index.json',JSON.stringify(records.sort((a,b)=>a.frame-b.frame),null,2));

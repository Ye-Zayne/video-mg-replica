import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderStill} from '@remotion/renderer';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const browserExecutable=process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const serveUrl=await bundle({entryPoint:resolve('src/index.tsx')});const browser=await openBrowser('chrome',{browserExecutable});
const composition=await selectComposition({serveUrl,id:'Replica',browserExecutable,puppeteerInstance:browser});
const changes=JSON.parse(readFileSync('editability.props.json','utf8'));const jobs=[{name:'changed-960',frame:960,props:changes},{name:'frozen-5000',frame:5000,props:{...changes,motionEnabled:false,stillFrame:960}},{name:'default-960',frame:960,props:{}},{name:'changed-model',frame:1100,props:changes}];
mkdirSync('../qa/editability',{recursive:true});
for(const j of jobs){await renderStill({serveUrl,composition:{...composition,props:{...composition.props,...j.props}},inputProps:j.props,frame:j.frame,output:resolve('../qa/editability/'+j.name+'.png'),imageFormat:'png',puppeteerInstance:browser});console.log(j.name)}
await browser.close({silent:true});

import React from 'react';
import type {SceneProps} from './Scenes';
import {Group,GradientTitle,SERIF,SANS,CONDENSED} from '../components/Stage';
import {OpenAILogo,Bug} from '../components/Objects';
import {ease} from '../motion';

/* Source observations and contact sheets live outside the production project in
 * evidence/early. All motion here uses a common source clock, including the
 * 33.17 s hand-off between the bug cards and the model cards. */
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const mix=(a:number,b:number,q:number)=>a+(b-a)*q;
const move=(t:number,a:number,b:number)=>ease((t-a)/(b-a),[.23,.73,.23,1]);
const linear=(t:number,a:number,b:number)=>clamp((t-a)/(b-a));
const pop=(t:number,a:number,b:number)=>ease((t-a)/(b-a),[.19,.92,.28,1.10]);
// A continuous route through a small number of observed poses, not frame states.
const route=(t:number,keys:readonly (readonly [number,number])[])=>{
 if(t<=keys[0][0])return keys[0][1];
 for(let i=1;i<keys.length;i++)if(t<keys[i][0]){
  const a=keys[i-1],b=keys[i],before=keys[Math.max(0,i-2)],after=keys[Math.min(keys.length-1,i+1)];
  const dt=b[0]-a[0],q=(t-a[0])/dt;
  const slopeA=i===1?0:(b[1]-before[1])/(b[0]-before[0]);
  const slopeB=i===keys.length-1?0:(after[1]-a[1])/(after[0]-a[0]);
  // Hermite tangents preserve velocity through interior poses: no easing reset.
  return (2*q*q*q-3*q*q+1)*a[1]+(q*q*q-2*q*q+q)*dt*slopeA+(-2*q*q*q+3*q*q)*b[1]+(q*q*q-q*q)*dt*slopeB;
 }
 return keys[keys.length-1][1];
};
const Noise=({opacity=.09}:{opacity?:number})=><svg width="1280" height="720" style={{position:'absolute',inset:0,opacity,pointerEvents:'none',mixBlendMode:'multiply'}}><filter id="early-paper-grain"><feTurbulence type="fractalNoise" baseFrequency=".83" numOctaves="2" seed="23" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#early-paper-grain)"/></svg>;
const Paper=()=> <><div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 47% 46%,#eee 5%,#c9c9c9 55%,#474747 100%)'}}/><Noise opacity={.13}/></>;
const Shield=({width=100}:{width?:number})=><svg width={width} height={width*1.3} viewBox="0 0 100 130"><path d="M50 3L66 20 92 25V76Q82 105 50 126Q16 109 8 76V25L31 20Z" fill="#17191b" stroke="#666" strokeWidth="5"/><path d="M50 15L65 31 81 34V73Q73 94 50 112Q25 95 19 73V34L36 31Z" fill="#844d52"/><path d="M46 20L74 40 61 49 63 67 48 65 40 85 25 75 32 55 26 44Z" fill="#a3a3a3"/><path d="M47 52l13 10M43 58l13 10M39 64l13 10" stroke="#777" strokeWidth="3"/></svg>;
const RetroComputer=()=> <svg width="330" height="290" viewBox="0 0 330 290" style={{filter:'drop-shadow(5px 8px 4px #0007)'}}><g transform="rotate(19 160 140)"><path d="M88 25L261 25 279 166 80 166Z" fill="#b1b1a5" stroke="#62635c" strokeWidth="9"/><path d="M111 44H237V131H108Z" fill="#62655d" stroke="#deded2" strokeWidth="7"/><path d="M126 60H224V113H125Z" fill="#a2a59b"/><path d="M139 72h32v29h-32ZM183 76h29v4h-29Zm0 12h24v4h-24Z" fill="#deded6"/><path d="M90 167H275L314 240H26Z" fill="#c5c5b9" stroke="#777970" strokeWidth="7"/><path d="M98 180H254L279 218H66Z" fill="#77796f"/>{Array.from({length:7},(_,i)=><path key={i} d={`M${89+i*24} 184l-9 30`} stroke="#babcae" strokeWidth="5"/>)}<path d="M25 242h292v17H25Z" fill="#888a7d"/><ellipse cx="281" cy="267" rx="25" ry="16" fill="#676a60"/></g></svg>;
const Gripper=({mirror=false}:{mirror?:boolean})=><svg width="215" height="310" viewBox="0 0 215 310" style={{filter:'drop-shadow(7px 13px 6px #0007)',transform:mirror?'scaleX(-1)':'none'}}><path d="M125 10L170 4 203 39 189 81 208 112 194 158 205 202 173 282 112 299 89 281 69 255 58 204 39 180 38 150 16 148 5 126 17 103 54 90 61 55 87 47Z" fill="#474741"/><path d="M116 44L153 20 179 47 151 66 173 93 162 119 131 117 112 96 80 107 69 149 48 132 51 113 69 92 80 63Z" fill="#292b27"/><path d="M76 133L120 123 156 148 147 165 109 160 90 169 67 157Z" fill="#76776d"/><path d="M67 174L101 161 154 176 173 204 147 227 108 220 89 198 66 193Z" fill="#262723"/><path d="M92 227L118 244 164 237 148 268 116 271Z" fill="#63665b"/></svg>;
const Emboss=({text,size=160,color='#654631',reveal=1,maxWidth}:{text:string;size?:number;color?:string;reveal?:number;maxWidth?:number})=>{
 const units=Array.from(text).reduce((n,c)=>n+(/[\u4e00-\u9fff]/.test(c)?1:.48),0);
 const fit=maxWidth?Math.min(size,maxWidth/Math.max(1,units)):size;
 return <div style={{fontFamily:SERIF,fontWeight:900,fontSize:fit,lineHeight:1,letterSpacing:-Math.min(7,fit*.045),whiteSpace:'nowrap',transform:'scaleY(1.27)',transformOrigin:'50% 50%',color,textShadow:'1px 0 #2f271e,2px 1px #392f24,4px 2px #443a2d,6px 3px #413629,9px 6px #30291f,12px 10px 9px #0008'}}>{Array.from(text).map((c,i)=>{const q=clamp(reveal*(text.length+1)-i);return <span key={i} style={{display:'inline-block',opacity:q,transform:`perspective(600px) translateX(${(1-q)*38}px) rotateY(${(1-q)*65}deg)`,filter:`blur(${(1-q)*7}px)`}}>{c}</span>;})}</div>;
};
const Banner=({t,title='AI网络攻击',background=false}:{t:number;title?:string;background?:boolean})=>{
 const fall=move(t,.37,1.29),reveal=linear(t,1.30,1.79);
 return <Group x={78} y={mix(-490,214,fall)} rotate={mix(-12,0,fall)} scale={1} style={{width:1130,height:280,transformOrigin:'50% 50%',filter:background?'blur(12px)':undefined}}>
  <div style={{position:'absolute',inset:0,border:'7px ridge #7a6b59',background:'linear-gradient(110deg,#dedbd1,#eee9d9 66%,#b8b29f)',boxShadow:'4px 11px 8px #0009,inset 0 0 0 5px #b1a797'}}/>
  <Group x={104} y={2}><RetroComputer/></Group>
  <Group x={274} y={67}><Emboss text={title} size={151} maxWidth={770} reveal={reveal}/></Group>
  <Group x={-10} y={-19}><Gripper mirror/></Group><Group x={956} y={-22}><Gripper/></Group>
 </Group>;
};
const Label=({text,english,icon='shield',width=385}:{text:string;english:string;icon?:'shield'|'computer'|'paper';width?:number})=><div style={{position:'relative',width,height:126,borderRadius:14,background:'linear-gradient(180deg,#fff 0%,#e9e9e7 45%,#a9a9a7 100%)',boxShadow:'15px 25px 17px #0008',overflow:'hidden'}}>
 <div style={{position:'absolute',left:0,top:-8,opacity:.5,transform:icon==='computer'?'scale(.47)':'rotate(17deg)',transformOrigin:'left top'}}>{icon==='shield'?<Shield width={125}/>:icon==='computer'?<RetroComputer/>:<svg width="170" height="150" viewBox="0 0 170 150"><path d="M23 15H148V136H23Z" fill="#c8c5b9" stroke="#777" strokeWidth="3"/>{[0,1,2,3,4].map(i=><path key={i} d={`M44 ${45+i*16}h85`} stroke="#777" strokeWidth="5"/>)}</svg>}</div>
 <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:SERIF,fontSize:54,fontWeight:700,color:'#141414',whiteSpace:'nowrap',paddingBottom:13}}>{text}</div>
 <div style={{position:'absolute',top:67,left:45,right:10,textAlign:'center',fontFamily:'Times New Roman, serif',fontSize:35,color:'#31312e',opacity:.65,whiteSpace:'nowrap'}}>{english}</div>
</div>;
const OpeningAndEscape=({t,p}:{t:number;p:SceneProps})=>{
 const escape=move(t,5.28,5.60),groupY=route(t,[[5.35,720],[5.9,534],[6.25,548],[7.12,406],[7.55,352],[8.02,338],[8.52,438],[9.28,372],[9.97,350],[10.6,394],[11.067,347]]);
 return <><Paper/><Banner t={t} title={p.scene.type==='opening'?p.scene.title:'AI网络攻击'} background={escape>.5}/>
 {t>5.20&&<><Group x={438} y={mix(-185,68,move(t,5.20,5.78))} rotate={-9} style={{zIndex:4}}><Label text="隔离环境" english="OpenAI Isolated"/></Group>
 <Group x={448} y={groupY-186} opacity={move(t,5.35,5.75)}><div style={{width:384,height:384,borderRadius:'50%',background:'radial-gradient(circle at 46% 28%,#151515,#050505 85%)',boxShadow:'8px 10px 12px #0009'}}/><div style={{position:'absolute',left:-55,top:379,width:493,height:400,borderRadius:'50% 50% 0 0',background:'#080808',filter:'blur(2px)'}}/></Group>
 <Group x={mix(70,79,move(t,7.9,8.6))} y={mix(-205,312,move(t,7.88,8.62))} rotate={mix(-6,8,move(t,7.88,8.62))} opacity={move(t,7.88,8.02)} style={{zIndex:5}}><Label text="生产系统" english="Hugging Face" icon="computer" width={366}/></Group>
 <Group x={mix(808,826,move(t,9.52,10.21))} y={mix(-215,276,move(t,9.50,10.20))} rotate={mix(-1,8,move(t,9.50,10.20))} opacity={move(t,9.50,9.70)} style={{zIndex:5}}><Label text="偷走答案" english="Steal the answers" icon="paper" width={366}/></Group></>}
 </>;
};
const Refusal=({t}:{t:number})=>{
 const shift=move(t,12.9,13.90),entry=pop(t,13.35,13.88);
 return <><Paper/>
 <Group x={mix(455,433,shift)} y={mix(11,68,shift)} rotate={mix(-8,0,shift)}><Label text="隔离环境" english="OpenAI Isolated" width={405}/></Group>
 <Group x={mix(98,70,shift)} y={mix(249,317,shift)} rotate={mix(11,8,shift)}><Label text="生产系统" english="Hugging Face" icon="computer" width={365}/></Group>
 <Group x={mix(792,858,shift)} y={mix(229,295,shift)} rotate={mix(6,-13,shift)}><Label text="偷走答案" english="Steal the answers" icon="paper" width={385}/></Group>
 <Group x={500} y={mix(640,269,entry)} scale={mix(.86,1,entry)} opacity={move(t,13.32,13.80)}><div style={{width:290,height:290,borderRadius:'50%',background:'#050505',boxShadow:'12px 19px 19px #0009',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:SERIF,fontSize:84,color:'#bbb',whiteSpace:'nowrap',letterSpacing:-6}}>拒绝工作</div></Group>
 </>;
};
const News=({t}:{t:number})=>{
 const cam=move(t,15.02,16.77),scale=mix(1.48,1,cam),title=linear(t,15.10,15.84),date=linear(t,16.10,16.39);
 const text=[
 '· 计划近期发布的模型均未卷入此次针对 Hugging Face 的漏洞利用事件。我们博文',
 '中提到的预发布模型仅为内部研究原型，从未计划公众发布。事件发生后，我们已',
 '将其停用、加密，并限制了研究访问权限。',
 '· ExploitGym 评估环境并未向模型提供直接的互联网访问权限。为了连接互联网，模',
 '型发现并利用了 Artifactory（在新窗口中打开）（软件包注册中心缓存代理）中一个',
 '此前未知的零日漏洞（zero-day vulnerability）。我们已将该漏洞，以及我们在审查过程',
 '中发现的其他 Artifactory 漏洞，一并报告给了供应商。'];
 return <><div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 55% 45%,#081725,#020c15 90%)'}}/>
 <Group x={mix(416,182,cam)} y={mix(68,106,cam)} scale={scale} style={{width:1040,transformOrigin:'left top'}}>
  <div style={{display:'flex',whiteSpace:'nowrap',height:95,alignItems:'center',fontFamily:SERIF,fontWeight:900,fontSize:62,letterSpacing:-2,transform:'scaleX(.95)',transformOrigin:'left top'}}><div style={{clipPath:`inset(0 ${100*(1-title)}% 0 0)`,background:'#e9dca6',color:'#081321',padding:'3px 8px'}}>OpenAI 与 Hugging Face</div><div style={{color:'#eee',marginLeft:7,opacity:move(t,15.38,15.79),filter:`blur(${5*(1-move(t,15.38,15.79))}px)`}}>携手应对事件</div></div>
  <div style={{fontFamily:'Snell Roundhand, Times New Roman, serif',fontStyle:'italic',color:'#92988b',fontSize:27,opacity:.65,marginTop:5}}>OpenAI teams up with Hugging Face</div>
  <div style={{marginTop:15,borderLeft:'5px solid #d7d4a8',paddingLeft:21,position:'relative',width:980}}>
   <div style={{fontFamily:SERIF,fontSize:32,color:'#101920',height:44,whiteSpace:'nowrap'}}><span style={{display:'inline-block',clipPath:`inset(0 ${100*(1-date)}% 0 0)`,background:'#e8daa8',padding:'1px 5px'}}>2026 年 7 月 28 日更新:</span></div>
   {text.map((line,i)=><div key={line} style={{fontFamily:SERIF,fontWeight:600,fontSize:28,lineHeight:'41px',whiteSpace:'nowrap',color:'#e4e5e4',opacity:1-Math.max(0,i-2)*.16,filter:i>2?`blur(${(i-2)*.48}px)`:undefined}}>{line}</div>)}
  </div>
 </Group></>;
};
const BrowserPanel=({kind}:{kind:'openai'|'hugging'})=><div style={{position:'relative',width:490,height:340,background:'#08121f',border:'7px solid #b1b1a6',boxShadow:'10px 13px 12px #0007',overflow:'hidden'}}>{kind==='openai'?<><div style={{fontFamily:'monospace',fontSize:9,lineHeight:'17px',color:'#9daba5',transform:'rotate(-3deg) scale(1.1)',opacity:.73}}>{Array.from({length:20},(_,i)=><div key={i}>research collaboration — the model was able to autonomously discover the evaluation environment. Model safety and capabilities.</div>)}</div><div style={{position:'absolute',left:0,right:0,top:115,textAlign:'center',color:'#dedfd9',fontSize:49,fontFamily:SANS}}><OpenAILogo size={70} color="#dedfd9"/><div>OpenAI</div></div></>:<><div style={{position:'absolute',top:38,left:0,width:'100%',textAlign:'center',fontSize:47}}>🤗</div><div style={{position:'absolute',top:109,left:20,right:20,fontFamily:SANS,fontSize:31,fontWeight:700,textAlign:'center',color:'#eee'}}>The AI community<br/>building the future.</div><div style={{position:'absolute',top:213,left:38,right:38,fontFamily:SANS,fontSize:13,textAlign:'center',color:'#7a8391'}}>The place where the machine learning community collaborates on models, datasets, and applications.</div></>}</div>;
const Collaboration=({t,p}:{t:number;p:SceneProps})=>{
 const entrance=move(t,18.82,19.40),scale=route(t,[[18.82,1.18],[19.38,1.03],[19.84,.965],[20.40,1.01],[21.10,.985],[22.1,1.015],[23.168,1]]),year=move(t,18.9,19.18);
 return <Group x={0} y={mix(-100,0,entrance)} scale={scale} opacity={entrance} style={{width:1280,height:720,transformOrigin:'50% 54%',filter:`blur(${4*(1-entrance)}px)`}}>
 <svg width="1280" height="720" style={{position:'absolute',inset:0}}><ellipse cx="640" cy="563" rx="543" ry="97" stroke="#9a3530" strokeWidth="3" fill="none" opacity=".62"/></svg>
 <Group x={318} y={218} rotate={-1}><BrowserPanel kind="openai"/></Group><Group x={724} y={213}><BrowserPanel kind="hugging"/></Group>
 <Group x={230} y={67}><Emboss text={p.scene.title} size={125} maxWidth={830} color="#e00e00"/><div style={{position:'absolute',top:64,left:-15,width:815,textAlign:'center',background:'#f4e7dcc9',fontFamily:SANS,fontSize:28,color:'#361912',whiteSpace:'nowrap'}}>Internal test model jailbreak on its own</div><div style={{height:2,width:992,background:'linear-gradient(90deg,transparent,#d22217,transparent)',marginTop:19}}/></Group>
 <Group x={113} y={489} rotate={0}><div style={{background:'linear-gradient(#dededb,#b8b8b1)',padding:'0 18px',fontFamily:SERIF,fontSize:59,boxShadow:'15px 21px 16px #0007',whiteSpace:'nowrap'}}>◎Open AI</div></Group>
 <Group x={805} y={489}><div style={{background:'linear-gradient(#dededb,#b8b8b1)',padding:'0 18px',fontFamily:SERIF,fontSize:55,boxShadow:'15px 21px 16px #0007',whiteSpace:'nowrap'}}>●Hugging Face</div></Group>
 <Group x={621} y={mix(380,405,year)} scale={mix(.3,1,year)}><div style={{width:186,height:186,borderRadius:'50%',background:'radial-gradient(circle at 38% 30%,#e02918,#ac0000)',boxShadow:'0 30px 28px #0004'}}/></Group>
 <Group x={443} y={mix(421,418,year)} opacity={year} style={{fontFamily:SANS,fontWeight:900,fontSize:140,letterSpacing:-7,lineHeight:1,color:'#fff',textShadow:'3px 5px #080808,9px 14px 13px #0006'}}>2026</Group>
 </Group>;
};
const ModelCard=({title,color='#b54939',kind='model'}:{title:string;color?:string;kind?:'model'|'bug-front'|'bug-back'})=>{
 const bug=kind!=='model';const units=Array.from(title).reduce((n,c)=>n+(/[\u4e00-\u9fff]/.test(c)?1:.46),0);
 return <div style={{position:'relative',width:315,height:391,border:'3px solid #ddd',borderRadius:12,background:'linear-gradient(150deg,#606161 0%,#3c3d3d 44%,#282929 100%)',boxShadow:'9px 19px 12px #0008',overflow:'hidden'}}>
  {bug?<><Group x={22} y={19} opacity={.56}><Bug size={58}/></Group>{kind==='bug-front'?<Group x={169} y={229} rotate={-11} opacity={.78}><Shield width={126}/></Group>:<><Group x={189} y={40} opacity={.75}><Bug size={92}/></Group><Group x={140} y={152} rotate={-15} opacity={.45}><RetroComputer/></Group></>}</>:<><div style={{position:'absolute',left:20,top:18,width:26,height:26,borderRadius:'50%',background:color,opacity:.8}}/><Group x={113} y={41}><OpenAILogo size={82} color="#050606"/></Group></>}
  <div style={{position:'absolute',left:10,right:10,top:bug?133:156,textAlign:'center',fontFamily:SERIF,fontSize:Math.min(63,291/units),whiteSpace:'nowrap',fontWeight:500,color,textShadow:'2px 3px 2px #0004'}}>{title}</div>
  <div style={{position:'absolute',left:10,right:10,top:bug?223:232,textAlign:'center',fontFamily:SANS,fontSize:30,color,opacity:kind==='bug-front'?.2:.43}}>{bug?'Real bug':title==='新模型'?'New model':title}</div>
  {!bug&&<svg width="85" height="65" viewBox="0 0 85 65" style={{position:'absolute',right:17,bottom:25,opacity:.8}}><g fill={color}><circle cx="45" cy="37" r="16"/><circle cx="17" cy="48" r="7"/><circle cx="72" cy="38" r="7"/><circle cx="45" cy="12" r="3"/></g></svg>}
 </div>;
};
const SmallStrip=({text,english,dark=false}:{text:string;english?:string;dark?:boolean})=><div style={{fontFamily:SERIF,fontSize:68,fontStyle:'italic',lineHeight:1.1,whiteSpace:'nowrap',color:dark?'#eee':'#141414'}}><div style={{display:'inline-block',padding:'1px 10px 4px',background:dark?'linear-gradient(#555,#333)':'linear-gradient(#ededed,#c8c8c8)',boxShadow:'13px 18px 13px #0009'}}>{text}</div>{english&&<div style={{display:'block',width:'max-content',fontSize:40,marginTop:11,background:dark?'#444':'#ddd',boxShadow:'8px 12px 8px #0008'}}>{english}</div>}</div>;
const CardsSequence=({t,p}:{t:number;p:SceneProps})=>{
 const entry=move(t,29.97,30.58),turn=move(t,30.15,30.87),handoff=move(t,33.14,33.67);
 const camera=route(t,[[29.968,.93],[30.60,1],[31.45,1.035],[32.3,1.005],[33.10,1.02],[33.7,1],[35,1],[36,1.015],[37,1],[38.25,1.015],[38.75,1],[40.7,1],[43.302,1]]);
 const integer= Math.round((p.bugCount*move(t,29.98,30.32))/50)*50;
 const count=t>=30.32?p.bugCount:Math.min(p.bugCount,integer);
 const testExit=move(t,38.46,38.84),limit=move(t,38.86,39.30),off=move(t,41.08,41.49);
 return <><div style={{position:'absolute',inset:0,background:'#d4d0c4',opacity:move(t,38.56,38.84)}}/>
  <Group x={0} y={0} scale={camera} style={{width:1280,height:720,transformOrigin:'50% 52%'}}>
   {handoff<1&&<Group x={0} y={mix(0,-810,handoff)} opacity={entry} style={{width:1280,height:720}}>
    <Group x={120} y={mix(179,153,entry)} style={{width:500,height:400}}>
     <Group x={mix(2,178,turn)} y={mix(5,-2,turn)} rotate={mix(4,34,turn)} style={{transformOrigin:'50% 55%',filter:`blur(${1.2*(1-turn)}px)`}}><ModelCard title="软件漏洞" kind="bug-back" color="#c2ae58"/></Group>
     <Group x={0} y={0} rotate={mix(-6,5,entry)}><ModelCard title="软件漏洞" kind="bug-front"/></Group>
    </Group>
    <Group x={736} y={mix(207,119,entry)} scale={mix(.61,1,entry)} style={{transformOrigin:'left top',opacity:entry}}><GradientTitle text={`${count}${t>=30.34?'+':''}`} size={Math.min(270,1090/(String(p.bugCount).length+1))} width={541} style={{fontWeight:600,fontFamily:CONDENSED,letterSpacing:-4,transform:'scaleX(.96)',transformOrigin:'left center'}}/><div style={{marginTop:15}}><SmallStrip text="●真实漏洞" english="Real BUG"/></div></Group>
   </Group>}
   {t>=33.13&&<Group x={0} y={mix(724,0,handoff)} opacity={move(t,33.14,33.48)} style={{width:1280,height:720}}>
    {/* These cards persist unchanged through the chapter at 38.7 s. */}
    <Group x={8} y={mix(-335,-4,limit)} rotate={-13} opacity={limit} style={{filter:`blur(${2.3+3*(1-limit)}px)`}}><Emboss text="真实上限" size={153} color="#151515"/></Group>
    <Group x={839} y={mix(-310,37,off)} rotate={12} opacity={off} style={{filter:`blur(${2+4*(1-off)}px)`}}><Emboss text="关闭限制" size={130} color="#ba382c"/></Group>
    <Group x={626} y={174} rotate={10}><ModelCard title="新模型" color="#bcaa58"/></Group>
    <Group x={314} y={160} rotate={-12}><ModelCard title={p.modelName}/></Group>
    <Group x={489} y={mix(73,-20,testExit)} opacity={1-testExit} style={{filter:`blur(${3*testExit}px)`}}><SmallStrip text="测试模型" english="Test the model" dark/></Group>
   </Group>}
  </Group>
 </>;
};

export const EarlyMotion=(p:SceneProps):React.ReactNode|null=>{
 // A scene-independent clock is essential for the overlapping card transition.
 const origin=['bugs','models','limits'].includes(p.scene.type)?29.968:p.scene.type==='escape'?0:p.scene.start;
 const t=origin+(p.t-origin)*p.motionSpeed;
 if(p.scene.type==='opening'||p.scene.type==='escape')return <OpeningAndEscape t={t} p={p}/>;
 if(p.scene.type==='refuse')return <Refusal t={t}/>;
 if(p.scene.type==='news')return <News t={t}/>;
 if(p.scene.type==='collaboration')return <Collaboration t={t} p={p}/>;
 if(['bugs','models','limits'].includes(p.scene.type))return <CardsSequence t={t} p={p}/>;
 return null;
};

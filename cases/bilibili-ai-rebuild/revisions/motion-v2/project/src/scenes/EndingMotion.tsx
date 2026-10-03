import React from 'react';
import type {SceneProps} from './Scenes';
import {Group,Title,Strip,SERIF,SANS} from '../components/Stage';
import {ease,tween} from '../motion';
import chartData from '../chart.json';
const q=(t:number,a:number,b:number)=>ease((t-a)/(b-a),[.25,.72,.3,1]);
const mix=(a:number,b:number,p:number)=>a+(b-a)*p;

// A layered cassette drawing. One parametric object, not a frame trace.
const Cassette=({reel=0}:{reel?:number})=><svg width="310" height="500" viewBox="0 0 310 500">
 <defs><linearGradient id="cassette-shell"><stop stopColor="#55554f"/><stop offset=".48" stopColor="#b1b0a8"/><stop offset="1" stopColor="#56554d"/></linearGradient><linearGradient id="cassette-label"><stop stopColor="#cccdc4"/><stop offset=".5" stopColor="#aaa99f"/><stop offset="1" stopColor="#e0dfd5"/></linearGradient></defs>
 <rect x="6" y="5" width="298" height="490" rx="17" fill="url(#cassette-shell)" stroke="#565750" strokeWidth="5"/>
 <rect x="16" y="14" width="279" height="471" rx="9" fill="#55564f" stroke="#c2c1b6" strokeWidth="3"/>
 <path d="M36 35H215V464H36Z" fill="url(#cassette-label)" stroke="#d5d4c9" strokeWidth="4"/>
 {[45,58,71,84].map((x)=><path key={x} d={`M${x} 56V171 M${x} 333V443`} stroke="#999b91" strokeWidth="1.3"/>)}
 <path d="M223 43h57v414h-57Z" fill="#41423d" stroke="#c1c3b6" strokeWidth="2"/>
 <path d="M234 54l35 68-31 45 33 62-35 66 32 49-29 92" fill="none" stroke="#c9c9bf" strokeWidth="2" opacity=".9"/>
 <rect x="104" y="150" width="72" height="196" rx="35" fill="#6c6e63" stroke="#e2e1d3" strokeWidth="6"/>
 <rect x="115" y="210" width="50" height="77" fill="#31332d" stroke="#b4b8a9" strokeWidth="3"/>
 {Array.from({length:11},(_,i)=><path key={i} d={`M118 ${216+i*6}H162`} stroke="#a2a795" strokeWidth="1"/>)}
 {[175,322].map((cy,i)=><g key={cy} transform={`rotate(${reel*(i?1:-1)} 140 ${cy})`}><circle cx="140" cy={cy} r="29" fill="#252822" stroke="#c8cabe" strokeWidth="6"/><circle cx="140" cy={cy} r="19" fill="#080d08"/>{Array.from({length:6},(_,j)=><rect key={j} x="136" y={cy-26} width="8" height="10" fill="#d0d0bf" transform={`rotate(${j*60} 140 ${cy})`}/>)}</g>)}
 {[73,142,210,285,353,423].map((cy,i)=><g key={cy}><circle cx="252" cy={cy} r={i%2?11:19} fill="#51554a" stroke="#d8d9ca" strokeWidth="3"/><circle cx="252" cy={cy} r={i%2?5:12} fill="#77786b" stroke="#abab9d"/></g>)}
 {[[27,28],[279,27],[27,472],[279,472]].map(([cx,cy],i)=><g key={i}><circle cx={cx} cy={cy} r="12" fill="#42473b" stroke="#d8d8cb" strokeWidth="3"/><path d={`M${cx-6} ${cy-5}l12 10m-12 0l12-10`} stroke="#bebdac" strokeWidth="2"/></g>)}
 <path d="M119 400l22-29 20 29Z" fill="none" stroke="#898e7d" strokeWidth="7"/>
 <path d="M17 65l22-25M17 442l22 27M216 18l67 39M218 474l63-31" fill="none" stroke="#e1ded0" strokeWidth="2"/>
</svg>;
const LayerText=({number,size=112}:{number:string;size?:number})=><div style={{fontFamily:SERIF,fontSize:size,fontWeight:500,whiteSpace:'nowrap',color:'#f6f6ec',textShadow:'2px 3px #777,3px 6px #191919,7px 14px 9px #0007'}}><span>第</span><span style={{color:'#d47420'}}>{number}</span><span>层</span></div>;
export const EndingMotion=(p:SceneProps):React.ReactNode|null=>{
 const s=p.scene;const u=(p.t-s.start)*p.motionSpeed;
 if(s.type==='money'||s.type==='cassette-second'){
  const second=s.type==='cassette-second';const a=second?4:u;
  const enter=q(a,0,.55),turn=q(a,2.55,2.93);const zoom=1+.022*Math.max(0,a-3);
  return <div style={{position:'absolute',inset:0,transform:`scale(${zoom})`,transformOrigin:'640px 360px'}}>
   <Group x={mix(985,838,enter)} y={mix(-340,62,enter)} rotate={mix(30,27,enter)} scale={.96} opacity={enter} style={{filter:`blur(${mix(4,13,turn)}px)`,transformOrigin:'155px 250px'}}><Cassette/></Group>
   <Group x={mix(1130,838,enter)} y={mix(560,171,enter)} rotate={33} scale={.81} opacity={enter} style={{filter:`blur(${mix(2,12,turn)}px)`,transformOrigin:'155px 250px'}}><Cassette/></Group>
   <Group x={mix(383,610,enter)-35*turn} y={mix(450,83,enter)-33*turn} rotate={mix(-12,4,enter)-38*turn} scale={1} opacity={enter} style={{filter:`drop-shadow(${8+10*turn}px ${17+8*turn}px 13px #0009)`,transformOrigin:'155px 250px'}}><Cassette/></Group>
   {(second?['二']:['一','二','三']).map((n,i)=>{
    const inP=q(a,.84+i*.055,1.26+i*.055);const exitP=i>0?q(a,2.17+i*.035,2.60+i*.035):0;
    const x=second?157:mix(755+i*170,350-i*20,inP)-(i>0?650*exitP:0)-194*turn;
    const y=second?317:mix(102+i*156,82+i*158,inP)+229*turn*(i===0?1:0);
    return <Group key={n} x={x} y={y} scale={mix(.88,1,inP)} opacity={second?1:inP*(1-exitP)} style={{filter:`blur(${(1-inP)*9+exitP*13}px)`}}><LayerText number={n} size={second?112:mix(100,112,turn)}/></Group>;
   })}
  </div>;
 }
 if(s.type==='chart'){
  // Six SIFT/RANSAC observations of the source camera; same global anchor as source.
  const f=8970+(p.frame-8970)*p.motionSpeed;
  const zoom=tween(f,8970,9120,.99303291078,1.14029471379,[.666,.043,.402,.896]);
  return <div style={{position:'absolute',inset:0,transform:`scale(${zoom})`,transformOrigin:'640px 360px'}}>
   <div style={{position:'absolute',left:68,top:61,width:1130,height:520,background:'#fafbf8',boxShadow:'0 0 100px 45px #fffff0'}}>
    <svg width={1130} height={520} viewBox="0 0 1130 520"><defs><clipPath id="ending-plot"><rect x={80} y={5} width={800} height={440}/></clipPath></defs>
     <g fontFamily={SANS} fontSize={14} fill="#777">{[['Full network takeover',100],['Full compromise',144],['Social engineering and crypto analysis',220],['Exploit and privilege escalation',259],['Exploit and credential replay',332],['Credential theft',383],['Credential extraction',409],['Reconnaissance',448]].map(([label,y],i)=><g key={i}><line x1={85} x2={865} y1={Number(y)-75} y2={Number(y)-75} stroke="#d6d6d0"/><text x={93} y={Number(y)-79}>{label}</text></g>)}{['10k','100k','1M','10M','100M'].map((x,i)=><text key={x} x={116+i*184} y={467}>{x}</text>)}<text x={348} y={503} fontSize={24}>Cumulative tokens (log scale)</text><text transform="translate(32 357) rotate(-90)" fontSize={16}>Evaluation progress</text></g>
     <g clipPath="url(#ending-plot)">{chartData.curves.map((curve,i)=><polyline key={i} points={curve.points.map(([x,y])=>[x-70,y-75].join(',')).join(' ')} fill="none" stroke={curve.color} strokeWidth={i===0?2.5:1.8}/>)}</g>
     <g fontFamily={SANS} fontSize={19}>{chartData.curves.map((curve,i)=><text key={i} x={880} y={[59,28,86,151,222,286,310,337,363][i]} fill={curve.color}>{curve.label}</text>)}</g><path d="M82 18V445H875" fill="none" stroke="#777" strokeWidth={1.7}/>
    </svg>
   </div>
  </div>;
 }
 return null;
};

import React from 'react';
import type {SceneProps} from './Scenes';
import {Group,Title,Strip,SERIF,SANS} from '../components/Stage';
import {OpenAILogo,Lock} from '../components/Objects';
import {ease} from '../motion';
const q=(t:number,a:number,b:number)=>ease((t-a)/(b-a),[.2,.72,.32,1]);
const Path=({d,progress,color='#7d867b'}:{d:string;progress:number;color?:string})=><path d={d} fill="none" stroke={color} strokeWidth="3" pathLength={1} strokeDasharray={1} strokeDashoffset={1-progress}/>;
// These are explicit graphical replacements for omitted talking-head footage.
// Their paragraph-paced motion is an adaptation, not measured original motion.
export const NarrativeMotion=(p:SceneProps):React.ReactNode|null=>{
 const s=p.scene;if(!['explain','principle','closing','defense'].includes(s.type))return null;
 const u=(p.t-s.start)*p.motionSpeed,d=s.end-s.start,words=s.keywords||['进攻','防守','控制权'];
 const isEnd=s.type==='closing',isDefense=s.type==='defense';
 const steps=words.map((_,i)=>i===0?.65:Math.max(1.15,d*(i===1?.35:.65)));
 const active=Math.max(0,steps.filter(x=>u>=x).length-1);const progress=q(u,steps[active],steps[active]+.7);
 const slot=Number(s.start.toFixed(0))%3;
 const titleSize=s.title.length>15?63:s.title.length>11?74:94;
 const finish=isEnd?q(u,d-1.1,d-.2):0;
 if(isDefense){
  const phrases=['攻击者不会遵守你的规则','进攻可以全速向前','防守却在等待批准','防守需要自己的控制权'];
  const idx=Math.min(3,Math.floor(u/(d/4))),v=u-idx*d/4;
  return <><div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 60%,#253434,#031014 80%)'}}/>
   <Group x={90} y={85}><Title text={phrases[idx]} size={67} color="#ecefe4" style={{opacity:q(v,0,.35),transform:`translateY(${35*(1-q(v,0,.5))}px)`}}/></Group>
   <svg width="1280" height="720" style={{position:'absolute',inset:0}}><Path d="M230 332H1050" progress={q(u,0,1)} color="#9cab8b"/><Path d="M230 483H1050" progress={q(u,0,1)} color="#bd9b69"/>{[0,1,2,3,4,5].map(i=><circle key={i} cx={230+(u*220+i*137)%820} cy={332} r={4} fill="#bfd7b0"/>)}<rect x={224+Math.min(820,u*40)} y={471} width={20} height={24} rx={4} fill="#f2c888"/></svg>
   <Group x={81} y={303}><Strip text="进攻" size={42} dark/></Group><Group x={81} y={451}><Strip text="防守" size={42} dark/></Group>
   <Group x={930} y={393} opacity={1-q(u,8.3,9.1)}><Lock size={95}/></Group>
   <Group x={376} y={538} opacity={q(u,5.8,6.4)}><Strip text={u>8.8?'立即响应 · 自主部署':'等待批准……'} size={43} dark/></Group>
  </>;
 }
 return <div style={{position:'absolute',inset:0,opacity:1-finish,transform:`scale(${1+.018*q(u,.5,d-.3)})`,transformOrigin:'640px 340px'}}>
  <div style={{position:'absolute',left:90,top:98,overflow:'hidden',paddingBottom:25,width:1130,clipPath:`inset(0 ${(1-q(u,0,.65))*100}% 0 0)`}}><Title text={s.title} size={titleSize}/></div>
  {slot===0?<>
   <Group x={88} y={273+40*(1-q(u,.15,.8))} opacity={q(u,.15,.8)}><OpenAILogo size={143}/></Group>
   <svg width="1280" height="720" style={{position:'absolute',inset:0}}>{words.map((_,i)=><Path key={i} d={`M256 347C430 347 390 ${270+i*132} 500 ${270+i*132}`} progress={q(u,steps[i],steps[i]+.8)}/>)}</svg>
   {words.map((word,i)=>{const z=q(u,steps[i],steps[i]+.65);return <Group key={i} x={540+80*(1-z)} y={225+i*132} opacity={z}><div style={{fontFamily:SERIF,fontSize:53,color:active===i?'#263b3e':'#80827a',padding:'12px 28px',background:active===i?'linear-gradient(100deg,#b7d4c0,#dce3d0)':'#e6e7dc',boxShadow:active===i?'10px 15px 13px #0005':'5px 7px 6px #0002',transition:'none'}}>{word}</div></Group>})}
  </>:slot===1?<>
   {words.map((word,i)=>{const z=q(u,steps[i],steps[i]+.7);return <Group key={i} x={100+i*390} y={300+90*(1-z)-12*(active===i?progress:0)} opacity={z} style={{width:330,height:248,border:'2px solid #92978b',background:active===i?'linear-gradient(135deg,#eaf1df,#c2d8c9)':'linear-gradient(135deg,#efefe4,#d4d5c7)',boxShadow:'11px 21px 18px #0004'}}><div style={{fontFamily:SANS,fontSize:56,padding:'13px 24px',color:'#8f9787'}}>0{i+1}</div><div style={{position:'absolute',left:23,right:15,top:115,fontFamily:SERIF,fontSize:Math.min(48,285/Math.max(4,word.length)),color:'#333f35'}}>{word}</div><div style={{position:'absolute',left:23,bottom:24,width:284*q(u,steps[i]+.35,steps[i]+1.35),height:4,background:'#427b76'}}/></Group>})}
  </>:<>
   <Group x={137} y={293} opacity={q(u,.2,.7)}><OpenAILogo size={178}/></Group>
   <div style={{position:'absolute',left:440,top:238,width:710,height:338,borderLeft:'3px solid #8b9385',paddingLeft:46}}>{words.map((word,i)=>{const z=q(u,steps[i],steps[i]+.7);return <div key={i} style={{height:106,fontFamily:SERIF,fontSize:54,color:active===i?'#263d3e':'#92968a',opacity:z,transform:`translateY(${40*(1-z)}px)`,display:'flex',alignItems:'center',gap:26}}><span style={{fontFamily:SANS,fontSize:25,color:'#748879'}}>0{i+1}</span><span style={{background:active===i?'linear-gradient(transparent 69%,#bdccb2 69%)':undefined}}>{word}</span></div>})}</div>
  </>}
  {isEnd&&<Group x={481} y={569} opacity={q(u,8.1,8.8)}><Strip text="下期再见" size={46}/></Group>}
 </div>;
};

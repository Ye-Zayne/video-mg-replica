import React from 'react';
import type {SceneProps} from './Scenes';
import {GradientTitle, Group, SERIF, SANS, CONDENSED, Strip} from '../components/Stage';
import {OpenAILogo, Lock} from '../components/Objects';
import {ease} from '../motion';

// Timings below are local seconds, observed in the source quarter-second evidence.
// All geometry and glyphs are generated at render time. No source frames are loaded.
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const out=(u:number,a=0,d=.55)=>ease((u-a)/d,[.16,.72,.2,1]);
const smooth=(u:number,a=0,d=.55)=>ease((u-a)/d,[.55,0,.25,1]);
const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
const bg='radial-gradient(ellipse at 51% 86%,#fffff7 0%,#eeeee2 27%,#ccc9bd 69%,#706f65 115%)';
const paperFont={fontFamily:SERIF,fontWeight:600} as const;
const Highlight=({children,p=1,color='#e5ca60'}:{children:React.ReactNode;p?:number;color?:string})=><span style={{backgroundImage:`linear-gradient(${color},${color})`,backgroundPosition:'left 55%',backgroundRepeat:'no-repeat',backgroundSize:`${clamp(p)*100}% 100%`,padding:'1px 3px',boxDecorationBreak:'clone'}}>{children}</span>;

// The reference uses softly curved, receding text bands. These are editable SVG
// textPaths, rather than a scrolling screen capture or an image texture.
const TerminalField=({u=0,opacity=1}:{u?:number;opacity?:number})=>{
 const lines=['We are at the beginning of a new era of intelligence and discovery.','Our systems are learning to reason, explore and work with the tools around them.','Artificial intelligence will become a part of science, technology and everyday life.','We believe that powerful models should help people solve difficult problems.'];
 return <div style={{position:'absolute',inset:0,background:'#050607',opacity,overflow:'hidden'}}>
  <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position:'absolute',inset:0,opacity:.54}}>
   <defs>{Array.from({length:30},(_,i)=>{const y=i*28-65;const bow=(y-355)*.23;return <path key={i} id={`middle-terminal-${i}`} d={`M-350 ${y+bow} Q640 ${y-bow*.8} 1650 ${y+bow}`}/>;})}</defs>
   {Array.from({length:30},(_,i)=><text key={i} fill={i%5===0?'#a7aba6':'#60635e'} fontFamily={SANS} fontSize={16+(i%3)} letterSpacing={.1} opacity={.46+(i%4)*.12}><textPath href={`#middle-terminal-${i}`} startOffset={`${-4-(i%4)*3-Math.min(u,10)*.18}%`}>{lines[i%4]} {lines[(i+1)%4]} {lines[i%4]}</textPath></text>)}
  </svg>
  <div style={{position:'absolute',left:511,top:250,width:258,textAlign:'center',color:'#979a91',fontFamily:SANS,fontSize:65,fontWeight:400,opacity:.63}}><OpenAILogo size={138} color="#a4a69e"/><div style={{marginTop:-5}}>OpenAI</div></div>
  <div style={{position:'absolute',inset:0,boxShadow:'inset 0 0 150px 50px #0009'}}/>
 </div>;
};

const Computer=({u,width=555}:{u:number;width?:number})=><div style={{width,height:width*.79,position:'relative',transform:`perspective(1500px) rotateY(${mix(13,7,out(u,0,4))}deg) rotateX(-8deg)`,transformStyle:'preserve-3d'}}>
 <div style={{position:'absolute',left:width*.42,top:width*.59,width:width*.20,height:width*.17,background:'linear-gradient(90deg,#575960,#e9e9e7 45%,#9d9d9d)',transform:'skewX(-12deg)',boxShadow:'5px 7px 7px #0004'}}/>
 <div style={{position:'absolute',left:width*.28,top:width*.74,width:width*.46,height:width*.045,background:'linear-gradient(#e9e9e7,#777b82)',transform:'skewX(-34deg)',borderRadius:'50% 20% 12% 35%',boxShadow:'8px 7px 10px #0003'}}/>
 <div style={{width,height:width*.65,position:'relative',overflow:'hidden',borderRadius:8,border:'5px solid #383b3e',borderBottomWidth:width*.075,background:'#0a0c0d',boxShadow:'5px 4px 2px #8b8e91, 11px 17px 12px #0005',boxSizing:'border-box'}}>
  <svg width={width} height={width*.57} viewBox="0 0 555 316"><g fontSize={12} fontFamily={SANS} fill="#a7aaa5" opacity={.48}>{Array.from({length:24},(_,i)=><text key={i} x={-28+(i%4)*13} y={i*15+4}>We are developing artificial intelligence. Research models and systems help us understand the world.</text>)}</g></svg>
  <div style={{position:'absolute',left:0,right:0,top:'22%',textAlign:'center',fontFamily:SANS,fontSize:width*.095,color:'#d4d5cc',textShadow:'2px 3px 2px #000'}}><OpenAILogo size={width*.13} color="#dedfd7"/><div style={{marginTop:-4}}>OpenAI</div></div>
 </div>
</div>;

const Orbit=({p=1}:{p?:number})=><svg width={1280} height={720} style={{position:'absolute',inset:0}}><path d="M101 565 C-38 638 116 685 617 684 C1001 684 1228 659 1185 612" fill="none" stroke="#b65d58" strokeWidth={6} opacity={.45} pathLength={1} strokeDasharray={1} strokeDashoffset={1-clamp(p)}/><path d="M1183 612l-2 24 21-10" fill="none" stroke="#b65d58" strokeWidth={4} opacity={.4*clamp(p)}/></svg>;
const Online=({u}:{u:number})=>{
 const a=out(u,0,.32);return <div style={{position:'absolute',inset:0,background:bg,opacity:a}}>
  <Orbit p={out(u,.15,.7)}/>
  <Group x={148} y={18+mix(-80,0,a)} opacity={a} style={{width:1000,textAlign:'center'}}>
   <div style={{fontFamily:SERIF,fontSize:117,fontWeight:900,color:'#c22719',textShadow:'1px 2px #82180e',letterSpacing:-4,whiteSpace:'nowrap'}}>{Array.from('正常上网机器').map((c,i)=><span key={i} style={{display:'inline-block',opacity:out(u,.03*i,.22),transform:`translateY(${16*(1-out(u,.03*i,.25))}px)`}}>{c}</span>)}</div>
   <div style={{position:'absolute',top:88,left:287,fontFamily:SANS,fontSize:23,color:'#65594e',background:'#e3dfd0bb'}}>Normal Internet machine</div>
   <div style={{height:2,margin:'-1px auto 0',width:850*clamp(out(u,.18,.4)),background:'#cc5e50',boxShadow:'0 11px #c3605255'}}/>
  </Group>
  <Group x={340+mix(-35,25,out(u,0,4.4))} y={185+40*(1-a)} rotate={mix(-38,-29,out(u,0,.65))+mix(0,3,out(u,.8,3.5))} scale={mix(1.17,1,out(u,0,.65))} opacity={a} style={{transformOrigin:'280px 220px'}}><Computer u={u} width={572}/></Group>
 </div>;
};

const ActivityPage=({u}:{u:number})=>{
 const hp=(delay:number,d=.65)=>out(u,delay,d);
 return <div style={{width:1040,color:'#252923',...paperFont}}>
  <GradientTitle text="OpenAI 内部异常活动" size={118} width={1130} style={{fontFamily:SERIF,fontWeight:900,letterSpacing:-4,transform:'scaleX(.76)',transformOrigin:'left top'}}/>
  <div style={{fontFamily:SANS,fontSize:35,fontWeight:400,color:'#75736a',margin:'13px 0 16px'}}>Unusual internal activity at OpenAI</div>
  <div style={{fontSize:32,lineHeight:'47px',whiteSpace:'nowrap',width:1275,transform:'scaleX(.79)',transformOrigin:'left top',borderLeft:'5px solid #ddc65e77',paddingLeft:25}}>
   <div><Highlight p={hp(.95)}><strong>事件经过：</strong></Highlight></div>
   <div>• 在成功连接互联网后，模型推断出 Hugging Face 可能托管了用于 ExploitGym 的模</div>
   <div>型、数据集和解决方案。基于这一判断，模型开始搜索并成功找到了获取这些信息</div>
   <div>的途径，以在评估中作弊。<Highlight p={hp(1.15)}>在一个示例中，模型串联了多个攻击向量，</Highlight>包括被盗凭</div>
   <div>证的使用和零日漏洞，在 Hugging Face 服务器上找到了一条远程代码执行（RCE）路</div>
   <div>径。OpenAI 的安全团队在内部发现了这一异常活动。</div>
   <div>• Hugging Face 的安全团队及智能体检测到并阻止了其基础设施上的此类活动。在</div>
   <div>我们的团队与他们取得联系时，他们已经开始利用自己的开源模型进行事件审计与</div>
   <div>溯源调查。我们正与他们积极合作，继续调查该事件。我们非常感谢 Hugging Face</div>
   <div>安全与事故工作中的快速响应与密切配合。</div>
   <div style={{height:22}}/>
   <div>• 在隔离的沙盒测试环境中运行时，模型耗费了大量推理算力寻找连接外部互联网</div>
   <div>的途径，以破解评估题目。<Highlight p={hp(4.96,.92)}>为了获取访问权限，模型发现并利用了该包注册中心</Highlight></div>
   <div><Highlight p={hp(5.91,.57)}>缓存代理中的一个零日漏洞</Highlight>（我们现已负责任地将其披露给了供应商）。漏洞被利用</div>
   <div>后，模型在研究测试环境中执行了一系列提权（privilege escalation）和横向</div>
   <div>（lateral movement）操作，直到连接到一个具备互联网访问权限的节点。</div>
  </div>
 </div>;
};
const AttackerPage=({u,modelName,models=false}:{u:number;modelName:string;models?:boolean})=>{
 const p=out(u,models?.04:1.58,.68);
 return <div style={{width:1040,color:'#252923',...paperFont}}>
  <GradientTitle text={models?'OpenAI 模型共同驱动':'“攻击者”是OpenAI！'} size={118} width={1140} style={{fontFamily:SERIF,fontWeight:900,letterSpacing:-5,transform:'scaleX(.76)',transformOrigin:'left top'}}/>
  <div style={{fontFamily:SANS,fontSize:35,fontWeight:400,color:'#77736a',margin:'13px 0 20px'}}>{models?'Powered by OpenAI models':'The “attacker” is OpenAI!'}</div>
  {models?<div style={{fontSize:32,lineHeight:'47px',whiteSpace:'nowrap',width:1275,transform:'scaleX(.79)',transformOrigin:'left top',borderLeft:'5px solid #eee35b',paddingLeft:24}}>
   <div>• 这是他们的模型（{modelName}和更强大的预发布模型）结合运行于内部评估中，</div>
   <div>以衡量网络能力。为了衡量最大能力，<Highlight p={p} color="#f5dd20">他们故意关闭了通常阻止模型执行高风险</Highlight></div>
   <div><Highlight p={out(u,.48,.42)} color="#f5dd20">工作的生产分类器。</Highlight>这是一个有道理的研究选择，我想公平地说：你无法理解</div>
   <div>受限模型的能力。评估运行在一个隔离环境中，唯一的出站路径是用于拉取软件</div>
   <div>的源。</div><div style={{height:22}}/>
   <div>• 按 OpenAI 自己的话说，这些模型高度专注于解决基准测试。<Highlight p={p} color="#f5dd20">于是他们选择了</Highlight></div>
   <div><Highlight p={out(u,.3,.65)} color="#f5dd20">一种避开问题的手段。他们发现并利用了该包注册代理中的零日漏洞，拿到了</Highlight></div>
   <div><Highlight p={out(u,.75,.3)} color="#f5dd20">访问权限，</Highlight>然后移动直到到达有互联网接入的节点。由此，模型推断 Hugging</div>
   <div>Face 可能拥有所需的数据集和答案。因此，它将被盗凭证和额外的零日漏洞</div>
   <div>组合进了一条远程代码执行路径中，并直接从服务器获取测试数据。</div>
  </div>:<div style={{fontSize:32,lineHeight:'47px',whiteSpace:'nowrap',width:1275,transform:'scaleX(.79)',transformOrigin:'left top',borderLeft:'5px solid #ecdb69',paddingLeft:24}}>
   <div><Highlight p={out(u,1.62,.56)} color="#f5dd20">本文作者：CSA首席分析师Rich Mogull：</Highlight></div>
   <div>• 上周一个人工智能“失控”了，就像科幻电影里走出来的一样。不是因为它反对我</div>
   <div>们，而是为了实现它明确的目标。</div>
   <div>• 正当我们计划与CISO讨论拥抱面袭击时，OpenAI发布了一篇令人瞠目结舌的帖子，</div>
   <div>彻底改变了整个局面。</div>
   <div><Highlight p={p} color="#f5dd20">• 7月21日，OpenAI和Hugging Face联合披露了Hugging Face上周首次报道的一起事件</Highlight></div>
   <div><Highlight p={out(u,2.24,.38)} color="#f5dd20">的细节。</Highlight>那里面探测到一个自主人工智能代理在他们的基础设施中移动并获取数据。</div>
   <div>它最初被归类为神秘攻击者，随后的许多讨论演变成关于人工智能安全性与自主性</div>
   <div>的问题。现在，我们已经有了更多关于这次事件和研究背景的细节。</div>
  </div>}
 </div>;
};
const Paper=({p}:{p:SceneProps})=>{
 const u=(p.t-p.scene.start)*p.motionSpeed;const attacker=p.scene.variant==='attacker';
 // Observed intro: oversized crop -> pullback -> small overshoot -> settled page.
 const introScale=u<.63?mix(1.54,.77,smooth(u,0,.63)):mix(.77,1,out(u,.63,.58));
 const introY=u<.63?mix(-195,133,smooth(u,0,.63)):mix(133,65,out(u,.63,.58));
 const pan=attacker?0:mix(0,282,smooth(u,4.48,.4))+Math.max(0,u-4.88)*9;
 const showModels=out(u,3.98,.38);
 const content=<>
  {attacker?<>
   <div style={{opacity:1-showModels,filter:`blur(${showModels*6}px)`}}><AttackerPage u={u} modelName={p.modelName}/></div>
   {showModels>0&&<div style={{position:'absolute',left:0,top:0,opacity:showModels,transform:`translateX(${120*(1-showModels)}px)`}}><AttackerPage u={u-3.98} modelName={p.modelName} models/></div>}
  </>:<ActivityPage u={u}/>}
 </>;
 const terminalReveal=attacker?0:smooth(u,7.30,1.0);
 return <>
  <Group x={130+mix(-130,0,out(u,0,.7))} y={introY-pan} scale={introScale} opacity={1-terminalReveal*.75} style={{width:1040,transformOrigin:'50% 15%',filter:`blur(${Math.max(0,1.1-u)*1.5}px)`}}>{content}</Group>
  <div style={{position:'absolute',left:0,right:0,bottom:0,height:100,background:'linear-gradient(transparent,#f8f8eedd)',pointerEvents:'none'}}/>{!attacker&&u>6.9&&<>
   <div style={{position:'absolute',inset:0,background:'#080909',opacity:.14*out(u,6.9,.6)}}/>
   <Group x={120} y={142} scale={mix(.82,1,out(u,6.92,.55))} opacity={out(u,6.92,.3)*(1-terminalReveal)}><GradientTitle text="漏洞" size={262} width={530} style={{fontFamily:SERIF,fontWeight:900}}/></Group>
   <TerminalField u={Math.max(0,u-7.48)} opacity={terminalReveal}/>
  </>}
 </>;
};

const Tag=({text,u,start,end=Infinity,x,y,rotate=0,fromX=0,fromY=0}:{text:string;u:number;start:number;end?:number;x:number;y:number;rotate?:number;fromX?:number;fromY?:number})=>{
 const a=out(u,start,.72),leave=smooth(u,end,.42);return <Group x={x+fromX*(1-a)+fromX*leave*1.5} y={y+fromY*(1-a)+fromY*leave*1.5} rotate={rotate+mix(rotate*.3,0,a)} opacity={a*(1-leave)} scale={mix(1.07,1,a)} style={{filter:`blur(${(1-a)*5+leave*5}px)`}}><div style={{background:'linear-gradient(105deg,#282a28,#484946)',color:'#dddcd4',fontFamily:SERIF,fontSize:43,whiteSpace:'nowrap',padding:'7px 18px',boxShadow:'7px 12px 7px #0006'}}>{text}</div></Group>;
};
const LibraryCard=({kind,index,u}:{kind:string;index:number;u:number})=>{
 const a=out(u,11.58+index*.29,.47);const colors=[['#bfdde9','#173f84'],['#e4a589','#b55541'],['#c7edb2','#618c56']];
 return <Group x={143+index*342} y={354+64*(1-a)} scale={mix(.89,1,a)} opacity={a} style={{width:268,height:268,borderRadius:11,overflow:'hidden',background:`linear-gradient(135deg,${colors[index][0]},${colors[index][1]})`,boxShadow:'13px 16px 12px #0006',filter:`blur(${(1-a)*4}px)`}}>
  <svg width={268} height={268} viewBox="0 0 268 268" style={{position:'absolute',inset:0}}>
   {index===0?<><path d="M0 0h192v72H0zM0 194h268v74H0z" fill="#093c7b" opacity={.8}/>{Array.from({length:19},(_,i)=><path key={i} d={`M${i*16} 0Q${(i*47)%268} 118 ${268-i*13} 268`} fill="none" stroke="#81d9fa" strokeWidth={1.3} opacity={.45}/>)}{Array.from({length:19},(_,i)=><circle key={i} cx={(i*73)%268} cy={(i*39)%268} r={3} fill="#d4f2fa" opacity={.6}/>)}</>:index===1?<><g transform="translate(-11 -19) rotate(-18 55 55)"><rect x={0} y={0} width={110} height={118} rx={6} fill="#755248"/><path d="M41 51V33Q55 9 68 33V51M34 48H76V83H34Z" stroke="#efddba" strokeWidth={6} fill="none"/><text x={25} y={104} fontFamily={SANS} fontSize={13} fill="#dac7b3">SECURITY</text></g><g transform="translate(191 217) rotate(31)"><rect x={-45} y={-39} width={102} height={95} rx={6} fill="#71544e" opacity={.65}/><path d="M-16-8V-18Q-1-40 14-18V-8M-25-9H24V25H-25Z" stroke="#cfae9b" strokeWidth={7} fill="none"/></g></>:<>{Array.from({length:15},(_,i)=><g key={i} transform={`translate(${12+(i*31)%109} ${(i*47)%96})`} opacity={.25+(i%4)*.15}><rect width={20+(i%3)*10} height={20+(i%3)*10} fill="#347b95"/><path d="M0 0L16-6 40 10 24 20Z" fill="#7ba9bd"/></g>)}<g stroke="#357b7e" fill="none" opacity={.4}><circle cx={238} cy={229} r={62} strokeWidth={17}/><circle cx={231} cy={232} r={37} strokeWidth={4}/>{Array.from({length:8},(_,i)=><path key={i} transform={`rotate(${i*45} 227 231)`} d="M227 231H143" strokeWidth={3}/>)}</g></>}
  </svg>
  <div style={{position:'absolute',top:83,left:0,right:0,textAlign:'center',fontFamily:SERIF,fontSize:57,fontWeight:600,color:'#f4f0df',textShadow:'1px 2px 2px #ffffff44'}}>{kind}</div>
  <div style={{position:'absolute',top:150,left:0,right:0,textAlign:'center',fontFamily:SANS,fontSize:24,color:'#efefda',opacity:.5}}>{['Model','Data','Application'][index]}</div>
 </Group>;
};
// One handoff clock is shared by the outgoing records and incoming brand scene.
const ResponseTitle=({p}:{p:SceneProps})=>{
 const t=130.473+(p.t-130.473)*p.motionSpeed;const a=out(t,133.62,.59);
 const size=Math.min(164,1300/Math.max(1,Array.from(p.brandName).reduce((n,c)=>n+(c===' '?.33:/[\u4e00-\u9fff]/.test(c)?1:.51),0)));
 return <Group x={150} y={720-480*a} opacity={a} scale={mix(1.65,1,a)} style={{filter:`blur(${(1-a)*13}px)`,transformOrigin:'500px 65px'}}><GradientTitle text={p.brandName} size={size} width={1030} style={{fontWeight:600,letterSpacing:-1}}/></Group>;
};
const Brand=({p}:{p:SceneProps})=>{
 const u=(p.t-p.scene.start)*p.motionSpeed;const response=p.scene.variant==='response';
 const intro=out(u,response?0:2.56,.55);const cardsUp=response?0:smooth(u,11.37,.48);
 const titleY=response?mix(600,240,intro):mix(240,148,cardsUp);
 const kickerStart=response?6.55:8.72;const kickerText=response?'相关访问权限全部作废并更新……':'AI 行业最大的公共仓库之一……';
 const kickerProgress=out(u,kickerStart,.85);const size=Math.min(164,1300/Math.max(1,Array.from(p.brandName).reduce((n,c)=>n+(c===' '?.33:/[\u4e00-\u9fff]/.test(c)?1:.51),0)));
 return <>
  {response?<ResponseTitle p={p}/>:(<Group x={150} y={titleY} opacity={intro} scale={mix(1.65,1,intro)} style={{filter:`blur(${(1-intro)*13}px)`,transformOrigin:'500px 65px'}}><GradientTitle text={p.brandName} size={size} width={1030} style={{fontWeight:600,letterSpacing:-1}}/></Group>)}
  {!response?<>
   <Tag text="测试需要数据…" u={u} start={.1} end={5.05} x={70} y={108} rotate={-12} fromX={-150} fromY={-200}/>
   <Tag text="测试需要答案…" u={u} start={.2} end={5.05} x={835} y={454} rotate={8} fromX={240} fromY={220}/>
   {['模型','数据','应用'].map((k,i)=><LibraryCard key={k} kind={k} index={i} u={u}/>)}
  </>:<>
   <Tag text="访问内部账号…" u={u} start={2.05} end={7.85} x={83} y={113} rotate={-12} fromX={-145} fromY={-195}/>
   <Tag text="访问内部数据…" u={u} start={2.2} end={7.85} x={837} y={465} rotate={8} fromX={230} fromY={210}/>
  </>}
  <div style={{position:'absolute',left:285,top:(response?220:224)-cardsUp*93,width:740,textAlign:'center',fontFamily:SANS,fontSize:29,color:'#77786e',opacity:out(u,kickerStart,.2)}}>{kickerText.slice(0,Math.round(kickerText.length*kickerProgress))}</div>
 </>;
};
const Records=({p}:{p:SceneProps})=>{
 const u=(p.t-p.scene.start)*p.motionSpeed;const a=out(u,0,.4);const first=p.scene.variant!=='investigate';const exit=first?smooth(u,p.scene.end-p.scene.start-.34,.34):0;
 const number=Math.min(p.recordCount,Math.round(p.recordCount*out(u,-.08,.4)/10)*10);const numberSize=Math.min(212,530/(String(p.recordCount).length*.48+.44));
 return <>
  <div style={{position:'absolute',inset:0,transform:`translateY(${-700*exit}px) scale(${1-.12*exit})`,opacity:1-exit*.4}}>
   <Group x={115+18*out(u,0,3.4)} y={180+42*(1-a)} rotate={mix(-36,-29,out(u,0,.55))+mix(0,3,out(u,.55,2.8))} scale={mix(1.17,1,a)} opacity={a} style={{transformOrigin:'240px 180px'}}><Computer u={u} width={487}/></Group>
   <Group x={673} y={156+48*(1-a)} opacity={a} scale={mix(.93,1,a)} style={{transformOrigin:'left top'}}><GradientTitle text={`${number}${u>.29?'+':''}`} size={numberSize} width={620} style={{fontWeight:500,letterSpacing:-5}}/><div style={{marginTop:3,marginLeft:18,opacity:out(u,.07,.38),transform:`translateY(${24*(1-out(u,.07,.38))}px)`}}><Strip text="●攻击记录" english="Attack Records" size={63}/></div></Group>
  </div>
  {exit>0&&<ResponseTitle p={p}/>}
 </>;
};

const CubeIcon=()=> <svg width={59} height={59} viewBox="0 0 60 60"><g fill="none" stroke="#555851" strokeWidth={2.7}><path d="M30 3L56 18V43L30 58 4 43V18ZM4 18L30 32 56 18M30 32V58M30 3V30M4 43L30 30 56 43"/></g></svg>;
const BrushLabel=({text,red,english,u,start,x}:{text:string;red:string;english:string;u:number;start:number;x:number})=>{
 const a=out(u,start,.44);return <Group x={x-80*(1-a)} y={305} opacity={a} style={{width:357,height:123,clipPath:`inset(0 ${(1-a)*100}% 0 0)`}}>
  <svg width={357} height={85} style={{position:'absolute',inset:0}}><path d="M0 11L337 0 324 8 354 13 335 18 350 23 327 28 353 34 333 39 351 47 322 52 346 60 328 65 351 71 8 83 24 75 0 70 23 66 0 59 23 53 0 47 18 40 0 33 18 26 0 20Z" fill="#252827"/>{Array.from({length:15},(_,i)=><path key={i} d={`M${i%2?0:12} ${i*5+4}H${339-i%3*9}`} stroke="#777967" strokeWidth={.6} opacity={.7}/>)}</svg>
  <div style={{position:'absolute',left:25,top:9,fontFamily:SERIF,fontSize:51,color:'#f0eee2',whiteSpace:'nowrap'}}>“<span style={{color:'#a02337'}}>{red}</span>{text}”</div>
  <div style={{position:'absolute',top:90,left:15,fontFamily:SERIF,fontSize:21,fontStyle:'italic',color:'#73756c'}}>{english}</div>
 </Group>;
};
export const MiddleMotion=(p:SceneProps):React.ReactNode|null=>{
 const u=(p.t-p.scene.start)*p.motionSpeed;
 if(p.scene.type==='article')return <Paper p={p}/>;
 if(p.scene.type==='darkwords'){
  const local=u;const online=out(local,4.64,.5);const leave=smooth(local,4.0,.35);
  const words=local<.86?'钻过漏洞':local<2.8?'逃出测试':'获得权限';const start=local<.86?0:local<2.8?.86:2.8;
  const enter=out(local,start,.18);return <><TerminalField u={local+1}/><Group x={190} y={240} scale={mix(1.075,1,enter)+leave*.4} opacity={1-leave} style={{filter:`blur(${leave*12}px)`,transformOrigin:'450px 100px',width:900,textAlign:'center'}}><div style={{fontFamily:SERIF,fontSize:177,fontWeight:900,fontStyle:'italic',color:'#ddd',background:'linear-gradient(110deg,#fff 20%,#efefef 45%,#8e8e8a 84%)',backgroundClip:'text',WebkitTextFillColor:'transparent',filter:'drop-shadow(5px 5px 0 #333) drop-shadow(8px 10px 5px #000)'}}>{words}</div></Group>{online>0&&<Online u={Math.max(0,local-4.64)}/>}</>;
 }
 if(p.scene.type==='online')return <Online u={(p.t-74.4)*p.motionSpeed-4.64}/>;
 if(p.scene.type==='hugging')return <Brand p={p}/>;
 if(p.scene.type==='records')return <Records p={p}/>;
 if(p.scene.type==='sandbox')return <>
  <Group x={553} y={275} opacity={.33}><OpenAILogo size={174} color="#555a53"/></Group>
  <Group x={804+65*(1-out(u,2.64,.5))} y={286} opacity={out(u,2.64,.5)} scale={mix(.92,1,out(u,2.64,.5))}><Group x={-77} y={7}><CubeIcon/></Group><Strip text="●密闭空间" english="Enclosed space" size={48}/></Group>
  <Group x={115-100*(1-out(u,5.45,.45))} y={286} opacity={out(u,5.45,.45)}><Group x={-63} y={-3} rotate={18}><Lock size={46}/></Group><Strip text="●限制输出" english="Limit output" size={48}/></Group>
 </>;
 if(p.scene.type==='misread')return <>
  <Group x={553} y={275} opacity={.33}><OpenAILogo size={174} color="#555a53"/></Group>
  <BrushLabel text="失控了" red="AI" english="AI has gone out of control" u={u} start={1.77} x={94}/>
  <BrushLabel text="人类" red="背叛" english="Betray humanity" u={u} start={3.61} x={825}/>
 </>;
 return null;
};

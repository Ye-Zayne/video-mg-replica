import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, Audio, staticFile, useCurrentFrame, delayRender, continueRender} from 'remotion';
import mediaJSON from './assets.json';
import vectorsJSON from './vectors.json';
import geometryJSON from './geometry.json';
import captionsJSON from './captions.json';
import guidesJSON from './guides.json';
import transitionJSON from './transitions.json';
type Sprite={src:string;x:number;y:number;w:number;h:number};
type Shape={id?:string;fill:string;d:string};
type Bounds=[number,number,number,number];
const media=mediaJSON as unknown as Record<string,Sprite[]|Sprite>;
const vectors=vectorsJSON as unknown as Record<string,Shape[]>;
const geometry=geometryJSON as Record<string,Shape>;
const captions=captionsJSON as unknown as Record<string,{word:string;or:Bounds;rest:Bounds|null}>;
const guides=guidesJSON as Record<string,{x:number[];y:number[]}>;
export type ReplicaProps={motionEnabled:boolean;stillFrame:number;title:string;accent:string;words:Record<string,string>;assetOverrides:Record<string,string>;audioEnabled:boolean};
const WHITE='#fdfdfd';
const Svg=({children}:React.PropsWithChildren)=> <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position:'absolute',inset:0}}>{children}</svg>;
const Shapes=({items,accent}:{items?:Shape[];accent:string})=><Svg>{items?.map((s,i)=><path key={s.id??i} d={s.d} fill={s.fill==='accent'?accent:s.fill} fillRule="evenodd"/>)}</Svg>;
const Sprites=({items,overrides}:{items?:Sprite[]|Sprite;overrides:Record<string,string>})=><>{(Array.isArray(items)?items:items?[items]:[]).map((s,i)=><Img key={i} src={staticFile(overrides[s.src]??s.src)} style={{position:'absolute',left:s.x,top:s.y,width:s.w,height:s.h,objectFit:'contain'}}/>)}</>;
const Guides=({frame,light}:{frame:number;light:boolean})=>{
 const g=guides[String(frame)];return <Svg><g stroke={light?'#d7d7d7':'#656565'} strokeWidth={.65} strokeDasharray="1.2 2.4" opacity={.66}>
 {g?.x.map(x=><line key={'x'+x} x1={x} x2={x} y1={0} y2={720}/>)}
 {g?.y.map(y=><line key={'y'+y} x1={0} x2={1280} y1={y} y2={y}/>)}
 </g></Svg>;
};
const MeasuredText=({text,box,size=96,fill='#000',family='Replica Serif'}:{text:string;box:Bounds;size?:number;fill?:string;family?:string})=>{
 const desc=/[gpqy]/.test(text);const baseline=box[3]-(desc?14*size/96:0);
 return <text x={box[0]} y={baseline} fontFamily={family} fontSize={size} textLength={Math.max(1,box[2]-box[0]+6*size/96)} lengthAdjust="spacingAndGlyphs" fill={fill}>{text}</text>;
};
const Logo=({x=565,y=360,r=26}:{x?:number;y?:number;r?:number})=>{
 const pts=Array.from({length:20},(_,i)=>[x+Math.cos(i*Math.PI/10)*r,y+Math.sin(i*Math.PI/10)*r]);
 return <g stroke="white" fill="none"><polygon points={pts.map(p=>p.join(',')).join(' ')} strokeWidth={1.2}/><path d={`M${x-r*.44},${y-r*.1} v${r*.5} h${r*.43} M${x+r*.18},${y-r*.38} l${r*.44},${r*.22} v${r*.4} l-${r*.44},${r*.23} l-${r*.32},-${r*.2} v-${r*.4} Z`} strokeWidth={1.2}/>{pts.map(([a,b],i)=><circle key={i} cx={a} cy={b} r={1.25} fill="white"/>)}</g>;
};
const WhitePanel=()=>{
 const data=(vectorsJSON as any)['white-curves'] as {paths:string[];labels:{x:number;y:number;text:string}[]};
 return <Svg><rect x={274} y={90} width={762} height={548} fill="#ededed"/>
 <g stroke="#858585" strokeWidth={.5} fill="none">{data.paths.map((d,i)=><path key={i} d={d}/>)}</g>
 <g fontFamily="monospace" fontSize={6.1} fill="#888">{data.labels.map((v,i)=><text key={i} x={v.x} y={v.y}>{v.text}</text>)}</g>
 <g fontFamily="Courier New,monospace" fontSize={21} fill="#121212">
 {Array.from({length:14},(_,i)=><React.Fragment key={i}><text x={110+i*81.1} y={51}>White</text><text x={110+i*81.1} y={688}>White</text></React.Fragment>)}
 {Array.from({length:14},(_,i)=><React.Fragment key={i}><text x={110} y={93+i*41.7}>White</text><text x={1153} y={93+i*41.7}>White</text></React.Fragment>)}
 <text x={28} y={359}>Or</text></g></Svg>;
};
export const Replica=(props:ReplicaProps)=>{
 const current=useCurrentFrame();const f=props.motionEnabled?current:props.stillFrame;
 const [handle]=useState(()=>delayRender('Loading reconstructed serif font'));
 useEffect(()=>{const font=new FontFace('Replica Serif',`url(${staticFile('replica-serif.ttf')})`);font.load().then(loaded=>{(document.fonts as FontFaceSet & {add:(font:FontFace)=>void}).add(loaded);continueRender(handle)}).catch(()=>continueRender(handle));},[handle]);
 const words=props.words??{};const overrides=props.assetOverrides??{};
 const light=(f>=40&&f<76)||(f>=110&&f<143)||(f>=174&&f<213)||(f>=250&&f<272)||(f>=306&&f<340)||(f>=407&&f<433)||(f>=468&&f<537);
 let caption=captions[String(f)];
 const simpleScene=caption&&!(f>=250&&f<272);
 let captionWord=caption?.word??'';
 if(captionWord==='effortless'&&f<186)captionWord=f<176?'e':f<178?'ef':f===178?'eff':f===179?'effor':f<182?'effort':f===182?'effortl':f<185?'effortle':'effortles';
 const clipLeft=f<213&&f>=209?(transitionJSON as Record<string,number>)[String(f)]:1280;
 return <AbsoluteFill style={{background:light?WHITE:'#000',overflow:'hidden'}}>
 {props.audioEnabled&&<Audio src={staticFile('audio.wav')}/>}
 {(f>=307&&f<340)&&<Img src={staticFile(overrides['birch']??`assets/birch-${f}.jpg`)} style={{position:'absolute',width:1280,height:720}}/>}
 {(f>=40&&f<110||f>=143&&f<209||f>=250&&f<272||f>=340&&f<407||f>=468&&f<537)&&<Guides frame={f} light={light}/>}
 {geometry[String(f)]&&!(f>=209&&f<250)&&<Shapes items={[geometry[String(f)]]} accent={props.accent}/>}
 {(f>=129&&f<143)&&<Shapes items={vectors.heavy} accent={props.accent}/>}
 {simpleScene&&<Svg>
 <MeasuredText text={words.or??'or'} box={caption.or} size={caption.word==='classic'?48:caption.word==='effortless'?104:96} fill={light?'#000':'#fff'}/>
 {caption.rest&&<MeasuredText text={words[caption.word]??captionWord} box={caption.rest} size={caption.word==='classic'?48:96} fill={light?'#000':'#fff'}/>}
 </Svg>}
 {(f>=307&&f<340)&&<Svg><MeasuredText text={words.or??'or'} box={[381,346,452,391]} fill="#fff"/><MeasuredText text={words.quiet??'quiet'} box={[734,324,902,407]} fill="#fff" family="Times" /></Svg>}
 <Sprites items={media[String(f)]} overrides={overrides}/>
 {(f>=340&&f<407)&&<Sprites items={media[`card-${f<356?340:f<372?356:f<384?372:f<392?384:392}`]} overrides={overrides}/>}
 {(f>=209&&f<250)&&<><Svg><rect x={f<213?clipLeft:0} y={0} width={1280} height={720} fill="#000"/><g stroke="#555" strokeWidth={.6} strokeDasharray="1 2"><line x1={f<213?clipLeft:0} x2={1280} y1={81} y2={81}/><line x1={f<213?clipLeft:0} x2={1280} y1={640} y2={640}/></g></Svg><Shapes items={[geometry[String(f)]]} accent={props.accent}/></>}
 {(f>=250&&f<272)&&<Svg>
 <text x={f===250?566:f===251?515:f===252?472:f===253?468:f===254?464:460} y={351} fontSize={23} fontFamily="Times">{words.or??'or'}</text>
 <text x={f===250?696:f===251?771:f<254?783:785} y={351} fontSize={23} fontFamily="Times">{words.small??'small'}</text>
 <g transform={`translate(${f===250?599:f===251?550:f===252?508:f===253?504:497},0)`} fontFamily="Courier New,monospace" fill="#444"><text y={317} fontSize={10}>fig.23</text><text y={379} fontSize={11}>GPT Image 2 · Medium · 1:1 · 1 img</text></g>

 </Svg>}
 {(f>=250&&f<272)&&<Sprites items={media[`ant-${f}`]} overrides={overrides}/>}
 {f>=407&&f<433&&<WhitePanel/>}
 {f>=433&&f<468&&<><Svg><MeasuredText text={words.or??'or'} box={[97,347,169,391]} fill="white"/></Svg><Shapes items={vectors[`bold-${f}`]} accent={props.accent}/></>}
 {f>=468&&f<537&&<Shapes items={vectors[`plain-${f}`]} accent={props.accent}/>}
 {f>=537&&f<579&&<Svg><text x={518} y={382} textLength={244} lengthAdjust="spacingAndGlyphs" fontFamily="Avenir Next,Arial,sans-serif" fontSize={40} fontWeight={600} fill="white">{props.title||'Just design.'}</text></Svg>}
 {f>=579&&<Svg><path d={geometry['brand-icon'].d} fill="white" fillRule="evenodd"/><text x={602} y={376} textLength={139} lengthAdjust="spacingAndGlyphs" fontFamily="Avenir Next,Arial,sans-serif" fontSize={45} fontWeight={650} letterSpacing={-1.6} fill="white">{words.brand??'Lovart'}</text></Svg>}
 </AbsoluteFill>;
};

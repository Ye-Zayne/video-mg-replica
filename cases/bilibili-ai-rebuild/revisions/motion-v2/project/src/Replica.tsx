import {AbsoluteFill,Audio,staticFile,useCurrentFrame} from 'remotion';
import {Stage,SERIF,SANS} from './components/Stage';
import {Scenes,Scene} from './scenes/Scenes';
import timeline from './timeline.json';
import captions from './subtitles.json';
import {config} from './config';
export type ReplicaProps={motionEnabled:boolean;stillFrame:number;bugCount:number;recordCount:number;modelName:string;brandName:string;accentFrom:string;accentTo:string;motionSpeed:number;showSubtitles:boolean;showSourceCredit:boolean;sceneTitleOverrides:Record<string,string>};
export const Replica=(props:ReplicaProps)=>{
 const live=useCurrentFrame();const f=props.motionEnabled?live:props.stillFrame;const t=f/config.fps;
 const item=(timeline as Scene[]).find(s=>t>=s.start&&t<s.end)||(timeline[timeline.length-1] as Scene);
 const scene={...item,title:props.sceneTitleOverrides?.[String(item.start)]??item.title};
 const subtitle=captions.find(c=>t>=c.start&&t<c.end);
 const dark=['news','darkwords','obedience','control','defense'].includes(scene.type);
 const fontSize=subtitle?Math.min(43,1120/(Array.from(subtitle.text).reduce((sum,ch)=>sum+(/[\u4e00-\u9fff]/.test(ch)?1:.52),0))):43;
 return <AbsoluteFill style={{'--accent-from':props.accentFrom,'--accent-to':props.accentTo} as React.CSSProperties}><Stage dark={dark} steel={['opening','escape','refuse'].includes(scene.type)}>
 {props.motionEnabled&&<Audio src={staticFile('narration.m4a')}/>}
 <Scenes scene={scene} frame={f} t={t} bugCount={props.bugCount} recordCount={props.recordCount} modelName={props.modelName} brandName={props.brandName} motionSpeed={props.motionSpeed}/>
 {props.showSourceCredit&&<div style={{position:'absolute',top:27,left:24,fontFamily:SANS,fontSize:25,fontWeight:700,color:'#fff',opacity:.7}}>参考：胡泊Hubo · bilibili</div>}
 {props.showSubtitles&&subtitle&&<div style={{position:'absolute',left:50,right:50,bottom:44,height:54,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:SERIF,fontSize,color:'#fff',whiteSpace:'nowrap',textShadow:'1px 2px 2px #666,0 0 3px #444',letterSpacing:-.5}}>{subtitle.text}</div>}
 </Stage></AbsoluteFill>;
};

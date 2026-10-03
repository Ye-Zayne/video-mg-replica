import type React from 'react';
import {EarlyMotion} from './EarlyMotion';
import {MiddleMotion} from './MiddleMotion';
import {LateMotion} from './LateMotion';
import {EndingMotion} from './EndingMotion';
import {NarrativeMotion} from './NarrativeMotion';

export type Scene={start:number;end:number;type:string;title:string;variant?:string;keywords?:string[];number?:string};
export type SceneProps={scene:Scene;t:number;frame:number;bugCount:number;recordCount:number;modelName:string;brandName:string;motionSpeed:number};

// One canonical source clock drives every component and cross-scene handoff.
// Source motion and graphical replacements live in distinct modules.
export const Scenes=(p:SceneProps):React.ReactNode=>{
 for(const component of [EarlyMotion,MiddleMotion,LateMotion,EndingMotion,NarrativeMotion]){
  const result=component(p);
  if(result!==null)return result;
 }
 throw new Error(`Missing motion scene: ${p.scene.type} at ${p.t}`);
};

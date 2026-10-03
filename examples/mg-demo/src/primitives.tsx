import type {CSSProperties, ReactNode} from 'react';
import {tween, type Bezier} from './motion';

type Timing = {frame: number; start: number; end: number; curve?: Bezier};
const progress = (p: Timing) => tween(p.frame, p.start, p.end, 0, 1, p.curve);

// Every primitive is explicitly frame-driven; no hook or hidden playback clock.
export const Wipe = (p: Timing & {children: ReactNode; direction?: 'left'|'right'|'up'|'down'; style?: CSSProperties}) => {
  const q = Math.max(0, Math.min(1, progress(p)));
  const hidden = (1-q)*100;
  const inset = {right: `0 ${hidden}% 0 0`, left: `0 0 0 ${hidden}%`,
    down: `0 0 ${hidden}% 0`, up: `${hidden}% 0 0 0`}[p.direction ?? 'right'];
  return <div style={{...p.style, clipPath: `inset(${inset})`}}>{p.children}</div>;
};

export const DrawPath = (p: Timing & {d: string; stroke: string; strokeWidth: number}) =>
  <path d={p.d} fill="none" stroke={p.stroke} strokeWidth={p.strokeWidth} strokeLinecap="round"
    pathLength={1} strokeDasharray={1} strokeDashoffset={1-Math.max(0,Math.min(1,progress(p)))} />;

export const StaggerText = (p: Timing & {text: string; stagger: number; rise?: number; style?: CSSProperties}) => {
  const letters = Array.from(new Intl.Segmenter(undefined, {granularity:'grapheme'}).segment(p.text), x => x.segment);
  return <div aria-label={p.text} style={{...p.style, whiteSpace:'pre-wrap'}}>
    {letters.map((letter,i) => {
      if (letter === '\n') return <br key={i} />;
      const q = tween(p.frame,p.start+i*p.stagger,p.end+i*p.stagger,0,1,p.curve);
      return <span key={i} aria-hidden style={{display:'inline-block', opacity:Math.max(0,Math.min(1,q)),
        transform:`translateY(${(1-q)*(p.rise ?? 20)}px)`}}>{letter === ' ' ? '\u00a0' : letter}</span>;
    })}
  </div>;
};

export const MotionGroup = (p: Timing & {children: ReactNode; from: {x:number;y:number;scale:number;rotate:number};
  to: {x:number;y:number;scale:number;rotate:number}; origin?: string; style?: CSSProperties}) => {
  const q = progress(p);
  const value = (key: keyof typeof p.from) => p.from[key]+(p.to[key]-p.from[key])*q;
  return <div style={{...p.style,transformOrigin:p.origin ?? '50% 50%',
    transform:`translate(${value('x')}px, ${value('y')}px) rotate(${value('rotate')}deg) scale(${value('scale')})`}}>{p.children}</div>;
};

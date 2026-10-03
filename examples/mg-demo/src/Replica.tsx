import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {tween} from './motion';
import {DrawPath} from './primitives';

type Props = {motionEnabled: boolean; stillFrame: number; title: string; accent: string};
const curve = [0.22, 1, 0.36, 1] as const;

export const Replica = (props: Props) => {
  const live = useCurrentFrame();
  const f = props.motionEnabled ? live : props.stillFrame;
  const reveal = tween(f, 5, 34, 0, 1, curve);
  const values = [0.34, 0.57, 0.45, 0.83, 0.68];
  return <AbsoluteFill style={{background: '#101820', color: '#f7f5ed', fontFamily: 'PingFang SC, sans-serif'}}>
    <div style={{position: 'absolute', inset: 28, border: '1px solid #34404a', borderRadius: 20}} />
    <div style={{position: 'absolute', left: 64, top: 58, color: props.accent, fontSize: 15, letterSpacing: 3}}>MOTION STUDY / 001</div>
    <div style={{position: 'absolute', left: 64, top: 107, width: 430, overflow: 'hidden'}}>
      <div style={{fontWeight: 600, fontSize: 51, lineHeight: 1.25, whiteSpace: 'pre-line', transform: `translateY(${(1-reveal)*145}px)`}}>{props.title}</div>
    </div>
    <div style={{position: 'absolute', left: 65, top: 268, fontSize: 18, color: '#93a4af', opacity: reveal}}>文字 · 路径 · 遮罩 · 连续曲线</div>
    <svg style={{position: 'absolute', left: 64, top: 326}} width="410" height="90" viewBox="0 0 410 90">
      <DrawPath frame={f} start={22} end={70} curve={curve} d="M 0 70 C 65 70 60 12 120 18 S 210 86 265 40 S 335 10 396 10" stroke={props.accent} strokeWidth={4}/>
    </svg>
    <div style={{position: 'absolute', right: 62, top: 95, width: 324, height: 323, borderRadius: 22, background: '#1b2833', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 27, top: 24, fontSize: 13, color: '#93a4af', letterSpacing: 2}}>FRAME-DRIVEN / LIVE LAYERS</div>
      <svg width="324" height="260" style={{position: 'absolute', top: 50}}>
        {[70,130,190,250].map(y => <line key={y} x1="26" x2="298" y1={y} y2={y} stroke="#34404a" strokeDasharray="2 5" />)}
        {values.map((v,i) => {
          const progress = tween(f, 18+i*5, 52+i*5, 0, 1, curve);
          const height = v*200*progress;
          return <rect key={i} x={30+i*53} y={250-height} width="34" height={height} rx="6" fill={i===3 ? props.accent : '#698391'} />;
        })}
      </svg>
    </div>
    <div style={{position: 'absolute', left: 64, bottom: 61, fontSize: 14, color: '#93a4af'}}>自制测试样例 · 非视频号原片复刻</div>
    <div style={{position: 'absolute', right: 63, bottom: 61, fontSize: 14, fontVariantNumeric: 'tabular-nums', color: props.accent}}>{String(Math.min(119, f)).padStart(3,'0')} / 120</div>
  </AbsoluteFill>;
};

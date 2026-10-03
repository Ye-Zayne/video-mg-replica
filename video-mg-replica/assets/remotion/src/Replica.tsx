import {AbsoluteFill, useCurrentFrame} from 'remotion';

export type ReplicaProps = {
  motionEnabled: boolean;
  stillFrame: number;
  title: string;
  accent: string;
};

export const Replica = (props: ReplicaProps) => {
  const liveFrame = useCurrentFrame();
  const frame = props.motionEnabled ? liveFrame : props.stillFrame;
  // Build measured scene components here. Pass `frame` to every motion layer.
  // This blank composition is an entry point, not a generated replica.
  return <AbsoluteFill data-frame={frame} style={{background: '#fff'}} />;
};

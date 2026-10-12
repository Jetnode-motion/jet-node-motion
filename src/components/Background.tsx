import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../style/tokens';

/** Shell background with two slow-drifting colour blobs (periwinkle + mint from the logo glow). */
export const ShellBackground: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: C.shell}}>
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${880 + 60 * Math.sin(t * 0.7)}px 260px, rgba(97,115,244,0.20) 0px, rgba(97,115,244,0) 760px)`,
      }}
    />
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 160px ${1650 + 50 * Math.cos(t * 0.6)}px, rgba(134,232,168,0.22) 0px, rgba(134,232,168,0) 700px)`,
      }}
    />
  </AbsoluteFill>
);

/** Dot grid that lives in world space, so it moves with the camera (parallax cue). */
export const DotGrid: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: -600,
      top: -400,
      width: 2300,
      height: 3000,
      backgroundImage: `radial-gradient(rgba(59,46,64,0.07) 2px, transparent 2.5px)`,
      backgroundSize: '64px 64px',
    }}
  />
);

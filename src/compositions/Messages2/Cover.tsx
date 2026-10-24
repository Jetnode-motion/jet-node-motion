import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {H, W} from '../../style/tokens';
import {PhoneOnBed, project} from '../Messages1/Scenes';
import {FONT, MONO, RED, Vignette} from '../Polar7/Overlays';

/* Shorts cover for part 2: the sleeping «me» on the bed, his own message, a big hook line. */

const K = 0.7;
const head = project('bedroom', K, [-0.1, 0.75, -0.68]);

export const Messages2Cover: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <ThreeCanvas
      width={W}
      height={H}
      shadows
      gl={{antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.35}}
      camera={{fov: 50, near: 0.02, far: 100}}
    >
      <PhoneOnBed t={K * 8} d={8} id="bedroom" prints eyes={0.7} />
    </ThreeCanvas>
    <Vignette />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.9) 100%)'}} />
    <div style={{position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center', fontFamily: FONT}}>
      <div style={{display: 'inline-block', background: RED, color: '#fff', fontWeight: 800, fontSize: 44, letterSpacing: 4, padding: '10px 28px', borderRadius: 12}}>ЧАСТЬ 2</div>
      <div style={{color: '#fff', fontWeight: 900, fontSize: 132, lineHeight: 1.0, marginTop: 34, textShadow: '0 8px 40px rgba(0,0,0,0.9)'}}>
        НА КРОВАТИ
        <br />
        <span style={{color: '#FFD60A'}}>СПАЛ Я</span>
      </div>
    </div>
    <div style={{position: 'absolute', left: head.x, top: head.y - 150, transform: 'translateX(-50%)', textAlign: 'center'}}>
      <div style={{background: RED, color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 52, padding: '10px 30px', borderRadius: 40}}>это я?!</div>
      <div style={{width: 6, height: 70, background: RED, margin: '0 auto'}} />
    </div>
    <div style={{position: 'absolute', bottom: 230, right: 90, maxWidth: 760, background: '#2B5278', color: '#fff', fontFamily: FONT, fontSize: 54, lineHeight: 1.2, padding: '24px 34px 20px', borderRadius: '38px 38px 10px 38px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)'}}>
      Не открывай дверь.
      <br />
      Это не я.
      <span style={{fontFamily: MONO, fontSize: 28, color: '#9DC3E6', marginLeft: 16}}>01:04 ✓✓</span>
    </div>
    <div style={{position: 'absolute', bottom: 150, left: 0, right: 0, textAlign: 'center', fontFamily: MONO, fontSize: 34, color: '#9FB0C2', letterSpacing: 6}}>ПЕРЕПИСКА</div>
  </AbsoluteFill>
);

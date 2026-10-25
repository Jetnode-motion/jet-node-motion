import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {H, W} from '../../style/tokens';
import {LiftLast} from './Scenes';
import {FONT, MONO, RED, Vignette} from '../Polar7/Overlays';

/* Shorts cover for «Лифт» part 1: the mirror shot with the second figure, the residents chat line. */

export const Lift1Cover: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <ThreeCanvas
      width={W}
      height={H}
      shadows
      gl={{antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.3}}
      camera={{fov: 50, near: 0.02, far: 100}}
    >
      <LiftLast t={4.2} d={4.7} />
    </ThreeCanvas>
    <Vignette />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0) 36%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.9) 100%)'}} />
    <div style={{position: 'absolute', top: 90, left: 0, right: 0, textAlign: 'center', fontFamily: FONT}}>
      <div style={{display: 'inline-block', background: RED, color: '#fff', fontWeight: 800, fontSize: 44, letterSpacing: 4, padding: '10px 28px', borderRadius: 12}}>ЧАСТЬ 1</div>
      <div style={{color: '#fff', fontWeight: 900, fontSize: 92, lineHeight: 1.05, marginTop: 22, textShadow: '0 8px 40px rgba(0,0,0,0.9)'}}>
        НА КАМЕРЕ ДВОЕ.
        <br />
        <span style={{color: '#FFD60A', fontSize: 112}}>А Я ОДИН</span>
      </div>
    </div>
    <div style={{position: 'absolute', bottom: 230, left: 90, maxWidth: 800, background: '#182533', color: '#fff', fontFamily: FONT, fontSize: 50, lineHeight: 1.2, padding: '22px 34px 20px', borderRadius: '38px 38px 38px 10px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)'}}>
      <div style={{color: '#E3A35B', fontWeight: 700, fontSize: 32, marginBottom: 4}}>Ольга, кв. 47</div>
      Пусть не оборачивается
      <span style={{fontFamily: MONO, fontSize: 28, color: '#6D7F8F', marginLeft: 16}}>01:05</span>
    </div>
    <div style={{position: 'absolute', bottom: 150, left: 0, right: 0, textAlign: 'center', fontFamily: MONO, fontSize: 34, color: '#9FB0C2', letterSpacing: 6}}>ЛИФТ</div>
  </AbsoluteFill>
);

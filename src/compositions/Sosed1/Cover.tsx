import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {H, W} from '../../style/tokens';
import {FONT, RED, Vignette} from '../Polar7/Overlays';
import {WindowShot} from './Scenes';

/* Shorts cover for «Сосед сверху» part 1: the hands on the 9th-floor window, «Над нами только крыша». */

export const Sosed1Cover: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <AbsoluteFill>
      <ThreeCanvas width={W} height={H} shadows gl={{antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.25}} camera={{fov: 30, near: 0.05, far: 100}}>
        <WindowShot t={3} d={3.7} />
      </ThreeCanvas>
    </AbsoluteFill>
    <Vignette />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0) 34%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.9) 100%)'}} />
    <div style={{position: 'absolute', top: 90, left: 0, right: 0, textAlign: 'center', fontFamily: FONT}}>
      <div style={{display: 'inline-block', background: RED, color: '#fff', fontWeight: 800, fontSize: 44, letterSpacing: 4, padding: '10px 28px', borderRadius: 12}}>ЧАСТЬ 1</div>
      <div style={{color: '#fff', fontWeight: 900, fontSize: 96, lineHeight: 1.05, marginTop: 22, textShadow: '0 8px 40px rgba(0,0,0,0.9)'}}>
        СТУЧАТ СВЕРХУ
        <br />
        <span style={{color: RED}}>А ТАМ КРЫША</span>
      </div>
    </div>
    <div style={{position: 'absolute', bottom: 170, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, color: '#fff', fontWeight: 800, fontSize: 64, textShadow: '0 6px 30px #000'}}>
      СОСЕД СВЕРХУ
    </div>
  </AbsoluteFill>
);

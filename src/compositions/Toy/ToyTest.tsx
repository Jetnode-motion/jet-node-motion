import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {FPS, H, W} from '../../style/tokens';
import {Env, SovietRoom} from './SovietRoom';
import {Toy} from './Toy';

/* Look test for the new art direction: vinyl-toy characters in a Soviet-flat diorama. */

const Cam: React.FC<{t: number; dist: number; az: number; el: number; look: [number, number, number]; fov: number}> = ({t, dist, az, el, look, fov}) => {
  const {camera} = useThree();
  const a = az + t * 0.01;
  camera.position.set(look[0] + dist * Math.cos(el) * Math.sin(a), look[1] + dist * Math.sin(el), look[2] + dist * Math.cos(el) * Math.cos(a));
  (camera as THREE.PerspectiveCamera).fov = fov;
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  camera.lookAt(...look);
  return null;
};

export const ToyTest: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const close = frame >= 30;
  return (
    <AbsoluteFill style={{background: '#0C0C0E'}}>
      <ThreeCanvas
        width={W}
        height={H}
        shadows
        gl={{antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1}}
        camera={{fov: 30, near: 0.1, far: 100}}
      >
        <color attach="background" args={['#0C0C0E']} />
        <Env intensity={0.15} />
        {close ? <Cam t={t} dist={4.2} az={0.55} el={0.18} look={[0.1, 1.0, 0.2]} fov={30} /> : <Cam t={t} dist={15} az={Math.PI / 4} el={0.55} look={[0, 1.0, 0]} fov={30} />}
        <SovietRoom t={t} />
        <Toy p={[0.05, 0, 0.3]} ry={0.75} look={{shirt: '#3D7BD9', pants: '#2C3550', hair: 'side', hairColor: '#6B4226', belt: true, sleeves: 'short'}} pose={{armR: 0.5, elbowR: 0.9, yaw: 0.25, breath: t / 3}} />
        <Toy p={[-0.9, 0, -0.55]} ry={0.9} look={{shirt: '#E2604A', pants: '#7FB6E0', skirt: true, hair: 'bun', hairColor: '#D8D4CC', glasses: 'round', shoes: '#F2F2F2'}} pose={{armL: 0.3, elbowL: 1.3, outR: 0.2, breath: t / 3.4}} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

import React from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {eio, lerp} from '../../style/ease';
import {Box, Figure, Lamp, Mug, P, Room, Snow, hash} from '../Polar7/World';

/*
 * «Переписка», part 1: a one-room flat on the 9th floor at night, the landing behind the
 * door, the panel block outside. Same toy world as Polar7, lit by phone screens.
 */

type V3 = [number, number, number];
export type SceneProps = {t: number; d: number};
export type CamSpec = {from: V3; to: V3; look: V3; lookTo?: V3; fov?: number};

export const CAMS: Record<string, CamSpec> = {
  phone: {from: [0.35, 3.3, 1.5], to: [0.3, 2.6, 1.05], look: [0.1, 0.55, 0.05]},
  block: {from: [-5, 1.4, 16], to: [-4, 2.2, 13], look: [0, 6, 0], lookTo: [0, 9, 0]},
  bed: {from: [2.6, 1.5, 3.0], to: [2.0, 1.4, 2.3], look: [0, 0.85, 0]},
  door: {from: [0, 1.5, 3.2], to: [0, 1.45, 2.0], look: [0, 1.2, -1.5]},
  peep: {from: [0, 1.6, 1.6], to: [0, 1.6, 1.3], look: [0, 1.25, -1], fov: 95},
  bed2: {from: [0.7, 2.0, 1.2], to: [0.5, 1.6, 0.85], look: [0.18, 0.58, 0.12]},
  memory: {from: [0, 1.3, 1.4], to: [0, 1.15, 0.95], look: [0, 0.95, 0]},
  door2: {from: [0.6, 1.4, 2.2], to: [0.3, 1.3, 1.3], look: [0, 1.0, -1.5]},
  window: {from: [-1.4, 1.6, 2.4], to: [-1.0, 1.5, 1.7], look: [0.2, 1.3, -1.6]},
  voice: {from: [0, 0.9, 2.4], to: [0, 0.6, 1.4], look: [0, 0.3, -1.5]},
  last: {from: [1.5, 1.6, 2.4], to: [1.1, 1.5, 1.7], look: [0, 1.15, 0]},
};

const camAt = (c: CamSpec, k: number) => {
  const e = eio(Math.max(0, Math.min(1, k)));
  const lt = c.lookTo ?? c.look;
  const L3 = (a: V3, b: V3) => new THREE.Vector3(lerp(a[0], b[0], e), lerp(a[1], b[1], e), lerp(a[2], b[2], e));
  return {pos: L3(c.from, c.to), look: L3(c.look, lt), fov: c.fov ?? 50};
};

const Cam: React.FC<{id: string; k: number; shake?: number}> = ({id, k, shake = 0}) => {
  const {camera} = useThree();
  const c = camAt(CAMS[id], k);
  camera.position.copy(c.pos).add(new THREE.Vector3(Math.sin(k * 97) * shake, Math.cos(k * 83) * shake, 0));
  (camera as THREE.PerspectiveCamera).fov = c.fov;
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  camera.lookAt(c.look);
  return null;
};

/** Where a 3D point lands on the frame, for labels that stick to objects. */
export const project = (id: string, k: number, p: V3, w = 1080, h = 1920) => {
  const c = camAt(CAMS[id], k);
  const cam = new THREE.PerspectiveCamera(c.fov, w / h, 0.05, 100);
  cam.position.copy(c.pos);
  cam.lookAt(c.look);
  cam.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(cam);
  return {x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h};
};

const Base: React.FC<{amb?: number; fog?: string; near?: number; far?: number; children: React.ReactNode}> = ({amb = 0.1, fog = '#05060A', near = 4, far = 14, children}) => (
  <>
    <color attach="background" args={[fog]} />
    <fog attach="fog" args={[fog, near, far]} />
    <ambientLight intensity={amb} color="#8FA6C8" />
    {children}
  </>
);

const HOODIE = '#55585F';
const COLYA = '#7A5A3E'; // the neighbour's cardigan

/** Phone: dark slab with a lit screen that throws cold light around it. */
const Phone: React.FC<{p: V3; rot?: V3; lit?: number}> = ({p, rot = [-Math.PI / 2, 0, 0], lit = 1}) => (
  <group position={p} rotation={rot}>
    <mesh castShadow>
      <boxGeometry args={[0.08, 0.16, 0.01]} />
      <meshStandardMaterial color="#0B0B0D" roughness={0.3} />
    </mesh>
    <mesh position={[0, 0, 0.0055]}>
      <planeGeometry args={[0.072, 0.15]} />
      <meshStandardMaterial color="#9CC2FF" emissive="#8AB8FF" emissiveIntensity={2.2 * lit} />
    </mesh>
    <pointLight position={[0, 0, 0.12]} intensity={1.6 * lit} distance={1.6} color="#9CC2FF" />
  </group>
);

const Bed: React.FC<{p?: V3}> = ({p = [0, 0, 0]}) => (
  <group position={p}>
    <Box p={[0, 0.2, 0]} s={[1.0, 0.4, 2.0]} c={P.woodDark} />
    <Box p={[0, 0.45, 0]} s={[0.95, 0.12, 1.95]} c="#B8B2A6" r={1} />
    <Box p={[0, 0.53, 0.25]} s={[0.97, 0.06, 1.4]} c="#3E4A6B" r={1} />
    <Box p={[0, 0.56, -0.75]} s={[0.6, 0.12, 0.35]} c="#D8D2C6" r={1} />
  </group>
);

/** Front door with a peephole and the strip of landing light under it. */
const Door: React.FC<{z?: number; gap?: number; feet?: number}> = ({z = -1.95, gap = 1, feet = 0}) => (
  <group position={[0, 0, z]}>
    <Box p={[0, 1.05, 0]} s={[0.95, 2.1, 0.08]} c="#4A3A30" r={0.6} />
    <Box p={[0, 1.05, -0.01]} s={[1.1, 2.2, 0.06]} c="#2A2420" />
    <mesh position={[0.33, 1.0, 0.06]}>
      <sphereGeometry args={[0.035, 12, 10]} />
      <meshStandardMaterial color="#C9B27A" metalness={0.8} roughness={0.3} />
    </mesh>
    <mesh position={[0, 1.55, 0.045]}>
      <cylinderGeometry args={[0.012, 0.012, 0.02, 12]} />
      <meshStandardMaterial color="#FFE7B0" emissive="#FFD27A" emissiveIntensity={1.2 * gap} />
    </mesh>
    {/* light under the door, two shadows of feet when someone stands there */}
    <mesh position={[0, 0.006, 0.06]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.9, 0.06]} />
      <meshStandardMaterial color="#FFE2A0" emissive="#FFD27A" emissiveIntensity={2.5 * gap} />
    </mesh>
    {feet > 0 &&
      [-0.12, 0.12].map((x, i) => (
        <mesh key={i} position={[x, 0.008, 0.061]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.13 * feet, 0.062]} />
          <meshBasicMaterial color="#000" />
        </mesh>
      ))}
    <pointLight position={[0, 0.05, 0.4]} intensity={0.8 * gap} distance={1.6} color="#FFD27A" />
  </group>
);

/** 1. Bedroom from above: he lies in the dark, the phone lights up on the blanket. */
export const PhoneOnBed: React.FC<SceneProps & {id?: string; buzz?: number}> = ({t, d, id = 'phone', buzz = 0}) => {
  const jitter = buzz > 0 && Math.floor(t * 18) % 2 ? 0.004 : 0;
  return (
    <Base amb={0.06}>
      <Cam id={id} k={t / d} />
      <Room wall="#1E2430" floor="#1A1A1E" />
      <Bed />
      {/* him under the blanket: a long lump and a head on the pillow, breathing */}
      <mesh position={[-0.1, 0.62, 0.1]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.75 + 0.03 * Math.sin(t * 1.6)]} castShadow receiveShadow>
        <capsuleGeometry args={[0.22, 1.0, 6, 16]} />
        <meshStandardMaterial color="#3E4A6B" roughness={1} />
      </mesh>
      <mesh position={[-0.1, 0.72, -0.68]} castShadow>
        <sphereGeometry args={[0.16, 20, 16]} />
        <meshStandardMaterial color={P.skin} roughness={0.85} />
      </mesh>
      <Phone p={[0.18 + jitter, 0.575, 0.12]} rot={[-Math.PI / 2, 0, 0.35]} />
      <pointLight position={[2, 2.5, 1]} intensity={0.6} distance={6} color="#5B78B8" />
    </Base>
  );
};

/** 2. The panel block at night, one lit window on the 9th floor. */
export const Block: React.FC<SceneProps> = ({t, d}) => (
  <Base amb={0.3} fog="#0A1222" near={8} far={40}>
    <Cam id="block" k={t / d} />
    <directionalLight position={[-8, 12, 6]} intensity={0.3} color="#9DB4E0" />
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial color={P.snow} roughness={1} />
    </mesh>
    <Box p={[0, 7.5, 0]} s={[12, 15, 3]} c="#6E7480" />
    {Array.from({length: 10}, (_, floor) =>
      Array.from({length: 8}, (_, col) => {
        const mine = floor === 8 && col === 5;
        const on = mine || hash(floor * 13 + col, 3) > 0.86;
        return (
          <Box
            key={`${floor}-${col}`}
            p={[-5.25 + col * 1.5, 0.9 + floor * 1.45, 1.51]}
            s={[0.8, 0.85, 0.02]}
            c={on ? '#FFC774' : '#141821'}
            e={on ? (mine ? '#9CC2FF' : '#FFB04A') : undefined}
            ei={on ? (mine ? 2.2 : 1.1) : 0}
          />
        );
      })
    )}
    <group position={[-4, 0, 12]}>
      <Snow t={t} n={360} area={14} top={7} speed={1.1} />
    </group>
  </Base>
);

/** 3. Sitting on the bed, the phone lights his face from below. */
export const SitBed: React.FC<SceneProps & {id?: string; dark?: boolean}> = ({t, d, id = 'bed', dark = false}) => (
  <Base amb={dark ? 0.03 : 0.06}>
    <Cam id={id} k={t / d} />
    <Room wall="#1E2430" floor="#1A1A1E" />
    <Bed p={[0, 0, -0.4]} />
    <Figure p={[0, 0.2, 0.15]} coat={HOODIE} hood={false} eyes pose={{sit: true, armL: 1.15, armR: 1.15, tilt: 0.35, breath: t / 3.5}} />
    <Phone p={[0, 0.98, 0.62]} rot={[-0.5, 0, 0]} lit={1.2} />
  </Base>
);

/** 4/door2/voice. The hallway and the front door. */
export const Hall: React.FC<SceneProps & {id: string; flicker?: boolean; feet?: number; lampOff?: boolean}> = ({t, d, id, flicker, feet = 0, lampOff}) => {
  const fl = flicker ? (Math.floor(t * 11) % 9 === 0 ? 0.15 : 1) : 1;
  return (
    <Base amb={lampOff ? 0.015 : 0.06}>
      <Cam id={id} k={t / d} shake={id === 'voice' ? 0.004 : 0} />
      <Room wall="#4A4038" floor="#2A251F" w={2.4} d={4} h={2.6} />
      {!lampOff && <Lamp p={[0, 2.5, 0.2]} i={6} c="#FFE2B0" />}
      <Door gap={fl} feet={feet} />
      {/* coat hook and a shoe rack by the door */}
      <Box p={[-0.9, 0.15, -1.6]} s={[0.5, 0.3, 0.3]} c={P.woodDark} />
      <Box p={[0.95, 1.6, -1.7]} s={[0.04, 0.04, 0.3]} c="#222" />
    </Base>
  );
};

/** 5. The landing through the peephole: uncle Kolya in slippers with an empty mug. */
export const Landing: React.FC<SceneProps> = ({t}) => {
  const fl = Math.floor(t * 7) % 13 === 0 ? 0.25 : 1;
  return (
    <Base amb={0.05} fog="#0A0907" near={3} far={9}>
      <Cam id="peep" k={0} />
      <Room wall="#4B5B4A" floor="#3A3530" w={4} d={4} h={2.8} />
      <Lamp p={[0.4, 2.6, -0.4]} i={4 * fl} c="#E8F0C8" />
      {/* stairs going down on the right */}
      {Array.from({length: 5}, (_, i) => (
        <Box key={i} p={[1.4, 0.1 - i * 0.18, -0.6 + i * 0.3]} s={[1.0, 0.18, 0.3]} c="#5A554D" />
      ))}
      <Figure p={[-0.05, 0, -0.35]} coat={COLYA} hood={false} eyes pose={{armR: 0.9, armL: 0.1, tilt: 0.12 + Math.sin(t * 0.5) * 0.04, head: 0.08, breath: t / 3}} />
      <Mug p={[0.33, 0.95, 0.05]} c="#E6E0D4" />
    </Base>
  );
};

/** Memory: the portrait corner with a candle. */
export const Memory: React.FC<SceneProps> = ({t, d}) => {
  const fl = 0.85 + 0.15 * Math.sin(t * 17) * Math.sin(t * 5.3);
  return (
    <Base amb={0.03}>
      <Cam id="memory" k={t / d} />
      <Room wall="#2A2420" floor="#141210" />
      <Box p={[0, 0.4, 0]} s={[1.4, 0.8, 0.8]} c="#2A1E16" />
      <Box p={[0, 1.15, -0.25]} s={[0.5, 0.65, 0.04]} c="#1A1310" rot={[-0.15, 0, 0]} />
      <mesh position={[0.32, 0.88, 0.1]}>
        <cylinderGeometry args={[0.03, 0.03, 0.16, 12]} />
        <meshStandardMaterial color="#EDE6D6" />
      </mesh>
      <mesh position={[0.32, 0.99, 0.1]} scale={[1, 1.8 * fl, 1]}>
        <sphereGeometry args={[0.014, 8, 8]} />
        <meshStandardMaterial color="#FFD27A" emissive="#FFB04A" emissiveIntensity={4} />
      </mesh>
      <pointLight position={[0.32, 1.05, 0.2]} intensity={2.2 * fl} distance={3} color="#FFB04A" castShadow />
    </Base>
  );
};

/** At the window: lights off, the city far below. */
export const AtWindow: React.FC<SceneProps> = ({t, d}) => (
  <Base amb={0.03} fog="#04050A" near={6} far={30}>
    <Cam id="window" k={t / d} />
    <Room wall="#161A24" floor="#101014" w={4} d={4} h={2.7} />
    {/* window opening: a frame and a glowing night outside */}
    <Box p={[0.2, 1.4, -1.98]} s={[1.5, 1.6, 0.02]} c="#0E1A33" e="#1C3366" ei={0.9} />
    {Array.from({length: 40}, (_, i) => (
      <Box key={i} p={[-0.45 + hash(i, 1) * 1.3, 0.75 + hash(i, 2) * 0.7, -1.96]} s={[0.025, 0.02, 0.005]} c="#FFC774" e="#FFB04A" ei={1.5 + Math.sin(t * 2 + i) * 0.3} />
    ))}
    <Box p={[0.2, 1.4, -1.95]} s={[0.04, 1.6, 0.04]} c="#22262E" />
    <Box p={[0.2, 0.58, -1.9]} s={[1.6, 0.06, 0.2]} c="#2A2E36" />
    <directionalLight position={[0.2, 1.6, -3]} intensity={0.5} color="#6E8FD8" />
    <Figure p={[0.2, 0, -1.4]} ry={Math.PI} coat={HOODIE} hood={false} pose={{armL: 0.15, armR: 0.9, breath: t / 3}} />
    <Phone p={[0.42, 1.12, -1.55]} rot={[-0.3, Math.PI, 0]} lit={0.7} />
  </Base>
);

/** Last: close on him with the phone in the dark. */
export const LastMsg: React.FC<SceneProps> = ({t, d}) => (
  <Base amb={0.02}>
    <Cam id="last" k={t / d} />
    <Room wall="#161A24" floor="#101014" w={4} d={4} h={2.7} />
    <Figure p={[0, 0, 0]} coat={HOODIE} hood={false} eyes pose={{armL: 1.1, armR: 1.1, tilt: 0.3, breath: t / 2.5}} />
    <Phone p={[0, 1.15, 0.5]} rot={[-0.6, 0, 0]} lit={1.4} />
  </Base>
);

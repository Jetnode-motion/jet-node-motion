import React from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {eio, lerp, prog} from '../../style/ease';
import {Box, Bunk, Chair, Figure, HangingCoat, Lamp, Mug, P, Radio, Room, Snow, Steam, Stove, Table, hash} from './World';

type V3 = [number, number, number];

export type CamSpec = {from: V3; to: V3; look: V3; lookTo?: V3; fov?: number};

/** Framing of each scene: the camera eases from `from` to `to` over the scene, the slow push of the reference. */
export const CAMS: Record<string, CamSpec> = {
  mugs: {from: [0.15, 2.9, 1.9], to: [0.08, 2.4, 1.35], look: [0, 0.8, 0.3]},
  outside: {from: [-6.5, 1.5, 11], to: [-5, 1.3, 9], look: [0, 1.6, 0]},
  radio: {from: [1.0, 2.0, 3.4], to: [0.7, 1.8, 2.6], look: [0, 1.0, -0.7]},
  gena: {from: [0.5, 1.4, 4.6], to: [0.3, 1.35, 3.6], look: [0, 1.05, 0]},
  mug: {from: [0.15, 1.25, 0.45], to: [0.2, 1.12, 0.2], look: [0.3, 0.9, -0.38], fov: 44},
  journal: {from: [0, 2.5, 1.1], to: [0, 2.1, 0.75], look: [0, 0.8, -0.05]},
  note: {from: [0, 2.3, 0.9], to: [0, 2.0, 0.6], look: [0, 0.8, -0.05]},
  bunks: {from: [1.4, 2.7, 3.9], to: [1.1, 2.4, 3.2], look: [-0.4, 0.5, -0.6]},
  coats: {from: [0.2, 1.5, 3.8], to: [0.5, 1.35, 2.9], look: [0.1, 1.1, -1.8], lookTo: [0.4, 1.0, -1.8]},
  radio2: {from: [-1.2, 1.9, 2.9], to: [-0.7, 1.7, 2.0], look: [0, 1.0, -0.7]},
  behind: {from: [0.3, 1.8, 4.4], to: [0.1, 1.6, 3.4], look: [-0.2, 1.1, -0.2]},
};

const camAt = (c: CamSpec, k: number) => {
  const e = eio(Math.max(0, Math.min(1, k)));
  const lt = c.lookTo ?? c.look;
  const L3 = (a: V3, b: V3) => new THREE.Vector3(lerp(a[0], b[0], e), lerp(a[1], b[1], e), lerp(a[2], b[2], e));
  return {pos: L3(c.from, c.to), look: L3(c.look, lt), fov: c.fov ?? 50};
};

/** Applies the scene's framing at progress k (0..1). */
export const Cam: React.FC<{id: string; k: number}> = ({id, k}) => {
  const {camera} = useThree();
  const c = camAt(CAMS[id], k);
  camera.position.copy(c.pos);
  (camera as THREE.PerspectiveCamera).fov = c.fov;
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  camera.lookAt(c.look);
  return null;
};

/** Where a 3D point lands on the 1080×1920 frame, so 2D labels can stick to objects. */
export const project = (id: string, k: number, p: V3, w = 1080, h = 1920) => {
  const c = camAt(CAMS[id], k);
  const cam = new THREE.PerspectiveCamera(c.fov, w / h, 0.05, 100);
  cam.position.copy(c.pos);
  cam.lookAt(c.look);
  cam.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(cam);
  return {x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h};
};

const Base: React.FC<{amb?: number; fog?: string; near?: number; far?: number; children: React.ReactNode}> = ({amb = 0.12, fog = '#07080B', near = 5, far = 16, children}) => (
  <>
    <color attach="background" args={[fog]} />
    <fog attach="fog" args={[fog, near, far]} />
    <ambientLight intensity={amb} color="#8FA6C8" />
    {children}
  </>
);

export type SceneProps = {t: number; d: number};

/** 1. Table with four mugs under the lamp. */
export const Mugs: React.FC<SceneProps> = ({t, d}) => (
  <Base>
    <Cam id="mugs" k={t / d} />
    <Room wall={P.wallWarm} />
    <Lamp p={[0, 2.3, -0.1]} i={7} />
    <Table />
    <Mug p={[-0.28, 0.8, 0.32]} ry={0.4} />
    <Mug p={[0.26, 0.8, 0.12]} c="#B9C7D6" ry={2} />
    <Mug p={[-0.22, 0.8, -0.16]} c="#C9A27A" ry={-0.6} />
    <Mug p={[0.3, 0.8, -0.38]} c="#8E2E2A" ry={1.2} />
    <Steam p={[0.3, 0.95, -0.38]} t={t} />
    <Chair p={[-0.7, 0, 0.9]} ry={Math.PI} />
    <Chair p={[0.7, 0, -0.95]} />
  </Base>
);

/** 2. The station from outside: snow, wind, one lit window. */
export const Outside: React.FC<SceneProps> = ({t, d}) => (
  <Base amb={0.35} fog="#0B1424" near={4} far={22}>
    <Cam id="outside" k={t / d} />
    <directionalLight position={[-6, 8, 4]} intensity={0.35} color="#9DB4E0" castShadow />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial color={P.snow} roughness={1} />
    </mesh>
    {/* the hut */}
    <Box p={[0, 1.2, 0]} s={[4, 2.4, 3]} c="#7B2A24" />
    <Box p={[0, 2.55, 0]} s={[4.3, 0.3, 3.3]} c="#DDE6F2" />
    <Box p={[-0.6, 1.4, 1.51]} s={[0.8, 0.6, 0.02]} c="#FFC774" e="#FFB04A" ei={1.6} />
    <Box p={[1.1, 0.95, 1.51]} s={[0.8, 1.7, 0.03]} c="#3A1612" />
    <pointLight position={[-0.6, 1.4, 2.3]} intensity={5} distance={5} color="#FFB04A" />
    {/* antenna mast */}
    <mesh position={[2.6, 3, -0.8]}>
      <cylinderGeometry args={[0.03, 0.05, 6, 6]} />
      <meshStandardMaterial color="#333" />
    </mesh>
    <mesh position={[2.6, 6, -0.8]}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshStandardMaterial color="#f33" emissive="#f22" emissiveIntensity={Math.floor(t * 1.2) % 2 ? 3 : 0.3} />
    </mesh>
    {/* drifts */}
    {Array.from({length: 7}, (_, i) => (
      <mesh key={i} position={[-6 + i * 2.2, -0.15, 3 + hash(i) * 3]} scale={[1.4, 0.45, 1]} receiveShadow>
        <sphereGeometry args={[1, 16, 10]} />
        <meshStandardMaterial color={P.snow} roughness={1} />
      </mesh>
    ))}
    <group position={[-3.5, 0, 5]}>
      <Snow t={t} n={420} area={12} top={5} speed={1.4} />
    </group>
  </Base>
);

/** Radio corner. The narrator sits with his back to us. `on` drives the lamps, `reach` his arm. */
export const RadioCorner: React.FC<SceneProps & {cam?: string; on?: number; reach?: number; flicker?: number; guest?: number}> = ({
  t,
  d,
  cam = 'radio',
  on = 0,
  reach = 0,
  flicker = 1,
  guest = 0,
}) => {
  return (
    <Base amb={0.1}>
      <Cam id={cam} k={t / d} />
      <Room wall="#34453A" />
      <Lamp p={[0.6, 2.6, 0.6]} i={9 * flicker} c="#FFE2B0" />
      <pointLight position={[0, 1.0, -0.3]} intensity={1.6 + 2 * on} distance={3} color="#7CFFB0" />
      <Box p={[0, 0.74, -1.0]} s={[2.2, 0.08, 1.0]} c={P.woodDark} />
      <Box p={[-0.95, 0.36, -1.0]} s={[0.08, 0.72, 0.9]} c={P.woodDark} />
      <Box p={[0.95, 0.36, -1.0]} s={[0.08, 0.72, 0.9]} c={P.woodDark} />
      <Radio p={[0, 0.78, -1.2]} t={t} on={on} />
      <Chair p={[0, 0, 0.15]} ry={Math.PI} back={false} />
      <Figure p={[0, 0, 0.05]} ry={Math.PI} coat={P.blue} hood={false} headset pose={{sit: true, armL: 1.25, armR: 1.25 + reach * 0.35, head: Math.sin(t * 0.4) * 0.05, breath: t / 3.5}} />
      {guest > 0 && (
        <group position={[-0.7, 0, lerp(2.6, 0.95, guest)]}>
          <Figure ry={Math.PI + 0.35} coat="#1A1B20" dark pose={{armR: 0.9 * guest, spreadR: 0.1, tilt: 0.25, breath: t / 4}} />
        </group>
      )}
    </Base>
  );
};

/** 4. Gena, the mechanic, by the stove. */
export const Gena: React.FC<SceneProps> = ({t, d}) => (
  <Base amb={0.1}>
    <Cam id="gena" k={t / d} />
    <Room wall={P.wallWarm} />
    <Lamp p={[-1.2, 2.6, 0.5]} i={5} />
    <Stove p={[0.95, 0, -0.6]} t={t} />
    <Figure
      p={[-0.15, 0, 0]}
      ry={0.25}
      coat={P.orange}
      eyes
      pose={{armL: 0.5, armR: 0.45, spreadL: 0.35, spreadR: 0.35, head: lerp(0.3, -0.15, prog(t, d * 0.5, d * 0.6)), breath: t / 3}}
    />
  </Base>
);

/** 5. The fourth mug, close, still steaming. */
export const OneMug: React.FC<SceneProps> = ({t, d}) => (
  <Base amb={0.08}>
    <Cam id="mug" k={t / d} />
    <Room wall={P.wallWarm} />
    <Lamp p={[0.4, 2.1, -0.2]} i={9} />
    <Table />
    <Mug p={[0.3, 0.8, -0.38]} c="#8E2E2A" ry={1.2} />
    <Steam p={[0.3, 0.95, -0.38]} t={t} n={14} />
  </Base>
);

/** Desk with the open log book, seen from above. */
export const Journal: React.FC<SceneProps & {cam?: string}> = ({t, d, cam = 'journal'}) => (
  <Base amb={0.1}>
    <Cam id={cam} k={t / d} />
    <Room wall={P.wallWarm} />
    <Lamp p={[0.5, 2.0, -0.4]} i={5} />
    <Table />
    <Box p={[-0.26, 0.815, 0]} s={[0.5, 0.02, 0.7]} c="#B9B1A0" r={1} rot={[0, 0, 0.03]} />
    <Box p={[0.26, 0.815, 0]} s={[0.5, 0.02, 0.7]} c="#B9B1A0" r={1} rot={[0, 0, -0.03]} />
    <Box p={[0, 0.8, 0]} s={[1.06, 0.015, 0.74]} c="#3A2A20" />
    <mesh position={[0.5, 0.83, 0.25]} rotation={[0, 0.5, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.012, 0.012, 0.3, 8]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
  </Base>
);

/** Bunks: three bags. */
export const Bunks: React.FC<SceneProps> = ({t, d}) => (
  <Base amb={0.08}>
    <Cam id="bunks" k={t / d} />
    <Room wall="#2E3A48" />
    <Lamp p={[0.5, 2.7, 0.6]} i={5} c="#C8D8FF" />
    <Bunk p={[-0.4, 0, -1.6]} bag="#5B6B3A" />
    <Bunk p={[-0.4, 0, -0.4]} bag="#7A3A3A" />
    <Bunk p={[-0.4, 0, 0.8]} bag="#3A4F7A" />
  </Base>
);

/** Coat rack: four parkas, the last one dripping. */
export const Coats: React.FC<SceneProps> = ({t, d}) => {
  const drops = Array.from({length: 8}, (_, i) => {
    const per = 0.9;
    const k = ((t + i * (per / 8) * 3.1) % per) / per;
    return {y: lerp(0.35, 0.02, k * k), x: 1.15 + (hash(i) - 0.5) * 0.2, o: k < 0.95 ? 1 : 0};
  });
  return (
    <Base amb={0.08}>
      <Cam id="coats" k={t / d} />
      <Room wall="#3A3F48" />
      <Lamp p={[0.3, 2.7, 0.3]} i={7} />
      <Box p={[0.2, 2.0, -1.85]} s={[3.2, 0.08, 0.1]} c={P.woodDark} />
      <HangingCoat p={[-1.1, 1.95, -1.85]} c={P.red} />
      <HangingCoat p={[-0.25, 1.95, -1.85]} c={P.blue} />
      <HangingCoat p={[0.55, 1.95, -1.85]} c={P.orange} />
      <HangingCoat p={[1.3, 1.95, -1.85]} c={P.wet} sway={Math.sin(t * 1.3) * 0.02} />
      {drops.map((dr, i) => (
        <mesh key={i} position={[dr.x, dr.y, -1.6]} visible={dr.o > 0}>
          <sphereGeometry args={[0.018, 8, 6]} />
          <meshStandardMaterial color="#9FC4FF" roughness={0.1} metalness={0.2} />
        </mesh>
      ))}
      <mesh position={[1.25, 0.005, -1.55]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.6, 1]}>
        <circleGeometry args={[lerp(0.28, 0.36, t / d), 32]} />
        <meshStandardMaterial color="#0E1116" roughness={0.05} metalness={0.6} />
      </mesh>
    </Base>
  );
};

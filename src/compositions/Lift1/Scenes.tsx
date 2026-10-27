import React from 'react';
import {eio, eo3, prog} from '../../style/ease';
import {Box, Figure, Lamp} from '../Polar7/World';
import {Base, CAMS, Cam, HOODIE, Phone, SceneProps} from '../Messages1/Scenes';

/*
 * «Лифт», part 1: a lift cabin in a panel block at night. The back wall is a mirror: the cabin is
 * drawn a second time, flipped behind it, so the reflection can show what the real cabin does not.
 */

type V3 = [number, number, number];

// Cabin: x and z in [-CW, CW], the mirror at z = -CW, the doors at z = +CW. Scenes that need distance
// leave the doors (or the ceiling) out and film through the gap.
const CW = 0.9;
const CH = 2.3;
const STEEL = '#B4A68C'; // warm laminate panels, like the old lifts
const JACKET = '#2F56B0';
const BEANIE = '#C8352B';
const ME: V3 = [0.08, 0, -0.1];

Object.assign(CAMS, {
  l_lift: {from: [-1.4, 2.0, 4.4], to: [-1.1, 1.9, 3.8], look: [0.2, 1.1, 0], fov: 42},
  l_chat: {from: [1.6, 2.0, 4.6], to: [1.3, 1.9, 4.0], look: [0, 1.3, -0.2], fov: 40},
  l_wide: {from: [-1.2, 1.8, 5.0], to: [-0.9, 1.7, 4.4], look: [0, 1.3, -0.3], fov: 40},
  l_close: {from: [0.9, 1.6, 2.9], to: [0.7, 1.55, 2.5], look: [0.06, 1.25, -0.1], fov: 40},
  l_mirror: {from: [-0.4, 1.62, 0.62], to: [-0.3, 1.58, 0.5], look: [0.05, 1.3, -1.3], fov: 62},
  l_panel: {from: [0.3, 1.4, 0.3], to: [0.48, 1.32, 0.45], look: [0.9, 1.3, 0.6], fov: 55},
  l_doors: {from: [-0.05, 1.55, -0.45], to: [0, 1.5, -0.05], look: [0, 1.2, 4], fov: 62},
  l_shadow: {from: [-0.85, 2.05, 1.7], to: [-0.75, 1.9, 1.45], look: [-0.2, 0, -0.15], fov: 60},
  l_cctv: {from: [0.85, 2.25, 3.3], to: [0.8, 2.22, 3.1], look: [-0.1, 0.95, -0.2], fov: 52},
  l_last: {from: [-0.45, 1.55, 0.62], to: [-0.38, 1.5, 0.55], look: [0.0, 1.35, -1.4], fov: 55},
});

/** Control panel on the right wall by the doors: a column of round buttons and the floor display. */
const Panel: React.FC<{lit: number}> = ({lit}) => (
  <group position={[CW - 0.01, 0, 0.6]}>
    <Box p={[0, 1.25, 0]} s={[0.02, 0.62, 0.2]} c="#B4BAC2" r={0.4} />
    <Box p={[-0.006, 1.66, 0]} s={[0.02, 0.1, 0.17]} c="#0A0B0D" e="#FF3B30" ei={0.5 * lit} />
    {Array.from({length: 12}, (_, i) => (
      <mesh key={i} position={[-0.012, 1.0 + Math.floor(i / 2) * 0.085, (i % 2 ? 0.045 : -0.045)]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.022, 0.022, 0.01, 18]} />
        <meshStandardMaterial color="#D8DCE0" emissive="#FFB04A" emissiveIntensity={i === 8 ? 1.4 * lit : 0} />
      </mesh>
    ))}
  </group>
);

/** One copy of the cabin. `open` slides the doors apart, `ghost` puts someone behind him (mirror only). */
const Cabin: React.FC<{t: number; open?: number; lit?: number; ghost?: number; front?: boolean; ceil?: boolean; light?: V3; floor?: string; cast?: boolean; gp?: V3; gry?: number}> = ({t, open = 0, lit = 1, ghost, front = true, ceil = true, light = [0, CH - 0.15, 0], floor = '#26272B', cast = true, gp = [-0.34, 0, 0.45], gry = Math.PI}) => {
  const fl = lit * (Math.floor(t * 9) % 23 === 0 ? 0.4 : 1);
  return (
    <group>
      <Box p={[0, -0.01, 0]} s={[CW * 2, 0.02, CW * 2]} c={floor} r={1} />
      {ceil && (
        <>
          <Box p={[0, CH, 0]} s={[CW * 2, 0.02, CW * 2]} c="#5E636A" />
          <Box p={[0, CH - 0.02, 0]} s={[0.6, 0.02, 0.6]} c="#F4F1E8" e="#FFE2B0" ei={1.8 * fl} />
        </>
      )}
      <Box p={[-CW, CH / 2, 0]} s={[0.02, CH, CW * 2]} c={STEEL} r={0.6} />
      <Box p={[CW, CH / 2, 0]} s={[0.02, CH, CW * 2]} c={STEEL} r={0.6} />
      {/* darker wood band along the lower walls */}
      <Box p={[-CW + 0.012, 0.45, 0]} s={[0.02, 0.9, CW * 2]} c="#6E4A32" r={0.7} />
      <Box p={[CW - 0.012, 0.45, 0]} s={[0.02, 0.9, CW * 2]} c="#6E4A32" r={0.7} />
      {/* handrail and the mirror frame */}
      <Box p={[-CW + 0.05, 0.9, 0]} s={[0.03, 0.03, CW * 1.5]} c="#C9CDD2" r={0.3} />
      <Box p={[0, CH / 2, -CW]} s={[CW * 2, 0.06, 0.02]} c="#3A3D42" rot={[0, 0, 0]} />
      {/* doors */}
      {front && (
        <>
          {[-1, 1].map((sd) => (
            <Box key={sd} p={[sd * (CW / 2 + (CW - 0.02) * open), 1.05, CW]} s={[CW, 2.1, 0.03]} c="#A7ADB4" r={0.35} />
          ))}
          <Box p={[0, 2.2, CW]} s={[CW * 2, 0.2, 0.04]} c="#6B7078" />
        </>
      )}
      <Panel lit={lit} />
      <pointLight position={light} intensity={(ceil ? 3.2 : 4.5) * fl} distance={4.5} color="#FFDDA8" castShadow={cast} />
      <hemisphereLight args={['#9DB4D8', '#3A2A20', 0.35 * lit]} />
      {ghost !== undefined && (
        <Figure p={gp} ry={gry} coat="#08090B" hood dark pose={{armR: 0.1 + 2.5 * ghost, armL: 0.05, head: 0.15, breath: t / 4}} />
      )}
    </group>
  );
};

/** Him, standing facing the doors (or the mirror), optionally with the phone up. */
const Me: React.FC<{t: number; ry?: number; phone?: boolean; press?: number}> = ({t, ry = 0, phone, press = 0}) => (
  <group position={ME} rotation={[0, ry, 0]}>
    <Figure p={[0, 0, 0]} coat={JACKET} beanie={BEANIE} hood={false} eyes pose={phone ? {armL: 1.1, armR: 1.1, tilt: 0.3, breath: t / 2.5} : {armR: 1.4 * press, spreadR: 0.12 + 0.5 * press, armL: 0.1, breath: t / 3}} />
    {phone && <Phone p={[0, 1.15, 0.5]} rot={[-0.6, 0, 0]} lit={0.7} />}
  </group>
);

/** The real cabin plus its reflection behind the mirror wall. */
const World: React.FC<{t: number; open?: number; me?: React.ReactNode; ghost?: number; front?: boolean; lit?: number; real?: V3}> = ({t, open, me, ghost, front, lit = 1, real}) => (
  <>
    <Cabin t={t} open={open} front={front} lit={lit} ghost={real ? ghost : undefined} gp={real} gry={0.3} />
    {me}
    <group position={[0, 0, -CW * 2]} scale={[1, 1, -1]}>
      <Cabin t={t} open={0} ghost={ghost} lit={lit} />
      {me}
    </group>
    {/* a faint cold tint on the glass */}
    <mesh position={[0, CH / 2, -CW + 0.002]}>
      <planeGeometry args={[CW * 2, CH]} />
      <meshBasicMaterial color="#A9C4D8" transparent opacity={0.06} />
    </mesh>
  </>
);

/** Opening: he gets in and presses the 9th. */
export const LiftIn: React.FC<SceneProps> = ({t, d}) => (
  <Base amb={0.3} fog="#05060A" near={6} far={14}>
    <Cam id="l_lift" k={t / d} />
    <World t={t} front={false} me={<Me t={t} ry={0.5} press={eo3(prog(t, 0.6, 1.4)) * (1 - eo3(prog(t, 2.6, 3.4)))} />} />
  </Base>
);

/** Close on him with the phone. */
export const LiftPhone: React.FC<SceneProps & {lit?: number; ghost?: number}> = ({t, d, lit = 1, ghost}) => (
  <Base amb={0.2 * lit} fog="#05060A" near={6} far={14}>
    <Cam id="l_chat" k={t / d} />
    <World t={t} front={false} lit={lit} ghost={ghost} me={<Me t={t} phone />} />
  </Base>
);

/** Over his shoulder into the mirror: only him. */
export const LiftMirror: React.FC<SceneProps> = ({t, d}) => (
  <Base amb={0.1} fog="#05060A" near={6} far={14}>
    <Cam id="l_mirror" k={t / d} />
    <World t={t} me={<Me t={t} ry={Math.PI} />} />
  </Base>
);

/** The panel and the floor display; buttons stop answering. */
export const LiftPanel: React.FC<SceneProps> = ({t, d}) => (
  <Base amb={0.1} fog="#05060A" near={6} far={14}>
    <Cam id="l_panel" k={t / d} shake={0.0015} />
    <World t={t} me={<Me t={t} ry={0.9} press={0.8} />} />
  </Base>
);

/** Doors open on the 13th floor: a dark corridor and, at its end, his own front door. */
export const LiftDoors: React.FC<SceneProps & {opened?: boolean; ajar?: number}> = ({t, d, opened, ajar = 0}) => {
  const open = opened ? 1 : eio(prog(t, 0.2, 1.6));
  return (
    <Base amb={0.06} fog="#030305" near={ajar ? 4 : 2} far={ajar ? 12 : 7}>
      <Cam id="l_doors" k={t / d} />
      <World t={t} open={open} />
      <group position={[0, 0, CW]}>
        <Box p={[0, -0.01, 2.6]} s={[1.6, 0.02, 5.2]} c="#3A3530" />
        <Box p={[-0.8, 1.3, 2.6]} s={[0.02, 2.6, 5.2]} c="#3F4A3E" />
        <Box p={[0.8, 1.3, 2.6]} s={[0.02, 2.6, 5.2]} c="#3F4A3E" />
        <Box p={[0, 2.6, 2.6]} s={[1.6, 0.02, 5.2]} c="#2A2A28" />
        {/* his front door, hinged on the left; when ajar, warm light spills out */}
        <group position={[-0.45, 0, 5.15]} rotation={[0, -1.1 * ajar, 0]}>
          <Box p={[0.45, 1.05, 0]} s={[0.9, 2.1, 0.06]} c="#4A3A30" r={0.6} />
        </group>
        {ajar > 0 && (
          <>
            <Box p={[0, 1.05, 5.2]} s={[0.88, 2.08, 0.02]} c="#FFD9A0" e="#FFC774" ei={1.6 * ajar} />
            <pointLight position={[0, 1.2, 4.9]} intensity={2.5 * ajar} distance={3} color="#FFC774" />
          </>
        )}
        <Box p={[0, 0.01, 4.85]} s={[0.8, 0.02, 0.45]} c="#5A2F2A" r={1} />
        <Lamp p={[0, 2.55, 4.3]} i={5} c="#E8F0C8" />
      </group>
    </Base>
  );
};

/** A flat shadow on the floor, feet at `at`, falling along the angle `rot` (see LiftShadow). */
const FlatShadow: React.FC<{at: [number, number]; rot: number; op: number; arm?: number}> = ({at, rot, op, arm = 0}) => (
  <group position={[at[0], 0.003, at[1]]} rotation={[-Math.PI / 2, 0, rot]}>
    {(
      [
        [0, 0.48, 0.17, 0.46],
        [0, 1.02, 0.11, 0.11],
        [0.2, 0.62 + 0.25 * arm, 0.05, 0.22 + 0.2 * arm],
      ] as const
    ).map(([x, y, sx, sy], i) => (
      <mesh key={i} position={[x, y, 0]} scale={[sx, sy, 1]}>
        <circleGeometry args={[1, 24]} />
        <meshBasicMaterial color="#000" transparent opacity={op} />
      </mesh>
    ))}
  </group>
);

/** The floor by his feet: his shadow, and another one next to it that nobody casts. */
export const LiftShadow: React.FC<SceneProps & {shown?: boolean}> = ({t, d, shown}) => {
  const k = shown ? 1 : eo3(prog(t, 1.4, 2.6));
  return (
    <Base amb={0.3} fog="#05060A" near={6} far={14}>
      <Cam id="l_shadow" k={t / d} />
      <Cabin t={t} front={false} floor="#808188" cast={false} />
      <Me t={t} />
      <FlatShadow at={[ME[0], ME[2]]} rot={2.447} op={0.6} />
      <FlatShadow at={[ME[0] - 0.33, ME[2] - 0.27]} rot={2.447} op={0.6 * k} />
    </Base>
  );
};

/** Last: in the mirror someone stands behind him and raises a hand. He does not. */
export const LiftLast: React.FC<SceneProps & {arm?: number}> = ({t, d, arm}) => (
  <Base amb={0.08} fog="#05060A" near={6} far={14}>
    <Cam id="l_last" k={t / d} />
    <World t={t} me={<Me t={t} ry={Math.PI} />} ghost={arm ?? eio(prog(t, 1.0, d - 0.8))} />
  </Base>
);

/** The lift's own camera, high in the corner: here the second one is in the cabin, not just the mirror. */
export const LiftCCTV: React.FC<SceneProps> = ({t, d}) => (
  <Base amb={0.25} fog="#05060A" near={6} far={14}>
    <Cam id="l_cctv" k={t / d} />
    <pointLight position={[0.5, 1.9, 1.6]} intensity={1.6} distance={4} color="#FFFFFF" />
    <World t={t} front={false} real={[-0.32, 0, -0.62]} ghost={0.75} me={<Me t={t} ry={0.35} />} />
  </Base>
);

/** Wide front shot through the missing front wall: the whole figure, the mirror behind him. */
export const LiftWide: React.FC<SceneProps & {cam?: string; lit?: number; ghost?: number; real?: V3; phone?: boolean}> = ({t, d, cam = 'l_wide', lit = 1, ghost, real, phone = true}) => (
  <Base amb={0.3 * lit} fog="#05060A" near={7} far={16}>
    <Cam id={cam} k={t / d} />
    <World t={t} front={false} lit={lit} ghost={ghost} real={real} me={<Me t={t} phone={phone} />} />
  </Base>
);

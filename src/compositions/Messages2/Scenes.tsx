import React from 'react';
import {eio, eo3, prog} from '../../style/ease';
import {Box, Figure, Lamp, Mug, P, Room} from '../Polar7/World';
import {Base, Cam, COLYA, Door, HOODIE, Phone, Prints, SceneProps} from '../Messages1/Scenes';

/*
 * «Переписка», part 2: the same flat a minute after part 1. The hallway now has a doorway to
 * the bedroom on the right wall, wet prints run from the front door into it.
 */

const HALL = {wall: '#4A4038', floor: '#4A4034', w: 2.4, d: 4, h: 2.6};
const PRINTS = {from: [0, -1.65] as [number, number], to: [1.05, 0.45] as [number, number], n: 9};
export const SLIPPERS: [number, number, number] = [0, 0.03, -1.7];

/** Bedroom doorway in the right wall, dark with the cold glow of a phone somewhere inside. */
const Doorway: React.FC<{glow: number}> = ({glow}) => (
  <group position={[HALL.w / 2 - 0.005, 0, 0.6]}>
    <Box p={[0, 1.0, 0]} s={[0.02, 2.0, 0.8]} c="#06080D" e="#2C4C88" ei={0.18 * glow} />
    <Box p={[-0.01, 2.04, 0]} s={[0.04, 0.08, 0.9]} c="#3A3029" />
    <pointLight position={[-0.3, 0.8, 0]} intensity={0.9 * glow} distance={2.2} color="#7FA6FF" />
  </group>
);

/** Kolya's slippers, neatly side by side at the threshold. */
const Slippers: React.FC = () => (
  <group position={SLIPPERS}>
    {[-0.08, 0.08].map((x, i) => (
      <group key={i} position={[x, 0, 0]} rotation={[0, i ? -0.08 : 0.06, 0]}>
        <Box p={[0, 0, 0]} s={[0.1, 0.04, 0.27]} c="#5A3B26" r={1} />
        <Box p={[0, 0.035, 0.06]} s={[0.1, 0.035, 0.11]} c="#7A5236" r={1} />
      </group>
    ))}
  </group>
);

/** The hallway scenes of part 2: silence, the prints, the vibration from the bedroom. */
export const Hallway: React.FC<SceneProps & {id: string; feet?: number; prints?: number; buzz?: boolean}> = ({t, d, id, feet = 0, prints = 0, buzz}) => {
  const pulse = buzz ? 0.5 + 0.5 * Math.max(0, Math.sin(t * 7)) * (Math.floor(t / 0.9) % 2 ? 0.3 : 1) : 0.5;
  return (
    <Base amb={0.06}>
      <Cam id={id} k={t / d} shake={buzz ? 0.002 : 0} />
      <Room {...HALL} />
      <Lamp p={[0, 2.5, -0.3]} i={5.5} c="#FFE2B0" />
      <Door feet={feet} gap={0.9} />
      <Doorway glow={pulse} />
      <Slippers />
      {prints > 0 && <Prints {...PRINTS} shown={prints} />}
      <Box p={[-0.9, 0.15, -1.6]} s={[0.5, 0.3, 0.3]} c={P.woodDark} />
    </Base>
  );
};

/** Over his shoulder in the dark hallway, the phone lit in front of him. */
export const HallPhone: React.FC<SceneProps> = ({t, d}) => (
  <Base amb={0.05}>
    <Cam id="chat" k={t / d} />
    <Room {...HALL} />
    <Lamp p={[0, 2.5, -0.6]} i={4} c="#FFE2B0" />
    <Door gap={0.6} />
    <Figure p={[0, 0, 0.6]} ry={Math.PI} coat={HOODIE} hood={false} pose={{armL: 1.1, armR: 1.1, tilt: 0.3, breath: t / 2.5}} />
    <Phone p={[0, 1.15, 0.12]} rot={[-0.6, Math.PI, 0]} lit={1.3} />
  </Base>
);

/** Him in front, lit by the phone; behind him in the hall someone steps out of the dark. */
export const Behind: React.FC<SceneProps> = ({t, d}) => {
  const k = eio(prog(t, 0.6, d - 0.6));
  const lit = eo3(prog(t, 0.4, 2.0));
  return (
    <Base amb={0.015}>
      <Cam id="behind" k={t / d} />
      <Room {...HALL} />
      <Figure p={[-0.2, 0, 0]} coat={HOODIE} hood={false} eyes pose={{armL: 1.1, armR: 1.1, tilt: 0.3, breath: t / 2}} />
      <Phone p={[-0.2, 1.15, 0.5]} rot={[-0.6, 0, 0]} lit={1.4} />
      <group position={[0.55, 0, -1.3 + 0.4 * k]}>
        <Figure p={[0, 0, 0]} coat={COLYA} hood={false} eyes pose={{armR: 0.9, armL: 0.1, tilt: 0.15, head: -0.12, breath: t / 3}} />
        <Mug p={[0.33, 0.95, 0.05]} c="#E6E0D4" />
      </group>
      <pointLight position={[0.4, 2.2, -0.4]} intensity={2.2 * lit} distance={2.4} color="#E8F0C8" />
    </Base>
  );
};

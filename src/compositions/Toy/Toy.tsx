import React, {useMemo} from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/*
 * Vinyl-toy characters (the designer-toy look Nazar sent): long rounded heads with a big nose,
 * dot eyes, colour-blocked clothes, glossy plastic. Built from smooth primitives, faces +z,
 * feet on y = 0, about 1.7 tall.
 */

type V3 = [number, number, number];

export type Look = {
  skin?: string;
  shirt: string;
  sleeves?: 'short' | 'long';
  pants: string;
  shoes?: string;
  hair?: 'side' | 'bald' | 'bun' | 'cap' | 'beanie' | 'long';
  hairColor?: string;
  mustache?: boolean;
  glasses?: 'none' | 'sun' | 'round';
  belt?: boolean;
  skirt?: boolean;
};

export type ToyPose = {
  /** forward raise of each arm at the shoulder, radians */
  armL?: number;
  armR?: number;
  /** outward spread */
  outL?: number;
  outR?: number;
  /** elbow bend */
  elbowL?: number;
  elbowR?: number;
  /** head yaw and pitch */
  yaw?: number;
  pitch?: number;
  /** walk phase in cycles; 0 stands still */
  walk?: number;
  /** breathing phase */
  breath?: number;
  /** eyes open 0..1 (blink) */
  eyes?: number;
};

const plastic = (c: string, rough = 0.42) => new THREE.MeshPhysicalMaterial({color: c, roughness: rough, clearcoat: 0.35, clearcoatRoughness: 0.35});

const useMat = (c: string, rough?: number) => useMemo(() => plastic(c, rough), [c, rough]);

const RBox: React.FC<{s: V3; r?: number; p?: V3; rot?: V3; c: string; rough?: number}> = ({s, r = 0.05, p, rot, c, rough}) => {
  const geo = useMemo(() => new RoundedBoxGeometry(s[0], s[1], s[2], 4, Math.min(r, Math.min(...s) / 2 - 0.001)), [s[0], s[1], s[2], r]);
  const mat = useMat(c, rough);
  return <mesh geometry={geo} material={mat} position={p} rotation={rot} castShadow receiveShadow />;
};

const Caps: React.FC<{r: number; l: number; p?: V3; rot?: V3; c: string; s?: V3}> = ({r, l, p, rot, c, s}) => {
  const mat = useMat(c);
  return (
    <mesh position={p} rotation={rot} scale={s} material={mat} castShadow receiveShadow>
      <capsuleGeometry args={[r, l, 8, 20]} />
    </mesh>
  );
};

const Sph: React.FC<{r: number; p?: V3; s?: V3; c: string; rough?: number; basic?: boolean}> = ({r, p, s, c, rough, basic}) => {
  const mat = useMat(c, rough);
  return (
    <mesh position={p} scale={s} material={basic ? undefined : mat} castShadow={!basic}>
      <sphereGeometry args={[r, 28, 20]} />
      {basic && <meshBasicMaterial color={c} />}
    </mesh>
  );
};

/** Arm hinged at the shoulder: upper arm (sleeve), forearm, mitten hand with a thumb. */
const Arm: React.FC<{side: 1 | -1; raise: number; out: number; elbow: number; sleeve: string; skin: string; long: boolean}> = ({side, raise, out, elbow, sleeve, skin, long}) => (
  <group position={[0.235 * side, 1.31, 0]} rotation={[-raise, 0, out * side + 0.08 * side]}>
    <Caps r={0.058} l={0.2} p={[0, -0.15, 0]} c={sleeve} />
    <group position={[0, -0.29, 0]} rotation={[-elbow, 0, 0]}>
      <Caps r={0.05} l={0.18} p={[0, -0.11, 0]} c={long ? sleeve : skin} />
      <group position={[0, -0.26, 0.005]}>
        <Sph r={0.062} s={[0.85, 1, 0.62]} c={skin} />
        <Caps r={0.022} l={0.045} p={[-0.045 * side, 0.02, 0.025]} rot={[0.3, 0, 0.6 * side]} c={skin} />
      </group>
    </group>
  </group>
);

const Leg: React.FC<{side: 1 | -1; swing: number; pants: string; shoes: string; skin: string; skirt: boolean}> = ({side, swing, pants, shoes, skin, skirt}) => (
  <group position={[0.1 * side, 0.78, 0]} rotation={[swing, 0, 0]}>
    <mesh position={[0, -0.35, 0]} castShadow receiveShadow material={plastic(skirt ? skin : pants)}>
      <cylinderGeometry args={[0.088, 0.074, 0.66, 22]} />
    </mesh>
    <RBox s={[0.13, 0.09, 0.27]} r={0.04} p={[0, -0.735, 0.035]} c={shoes} rough={0.35} />
  </group>
);

const Hair: React.FC<{kind: Look['hair']; c: string}> = ({kind, c}) => {
  switch (kind) {
    case 'bald':
      return null;
    case 'side':
      return (
        <>
          <mesh position={[0, 0.07, -0.01]} castShadow material={plastic(c, 0.6)}>
            <sphereGeometry args={[0.172, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
          </mesh>
          <RBox s={[0.2, 0.06, 0.08]} r={0.03} p={[0.04, 0.17, 0.11]} rot={[0.5, 0, -0.25]} c={c} rough={0.6} />
          <RBox s={[0.05, 0.16, 0.2]} r={0.025} p={[-0.155, 0.04, -0.03]} c={c} rough={0.6} />
          <RBox s={[0.05, 0.16, 0.2]} r={0.025} p={[0.155, 0.04, -0.03]} c={c} rough={0.6} />
        </>
      );
    case 'bun':
      return (
        <>
          <mesh position={[0, 0.06, -0.01]} castShadow material={plastic(c, 0.6)}>
            <sphereGeometry args={[0.175, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
          </mesh>
          <Sph r={0.08} p={[0, 0.24, -0.06]} c={c} rough={0.6} />
        </>
      );
    case 'long':
      return (
        <>
          <mesh position={[0, 0.06, -0.01]} castShadow material={plastic(c, 0.6)}>
            <sphereGeometry args={[0.178, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          </mesh>
          <RBox s={[0.38, 0.5, 0.16]} r={0.07} p={[0, -0.13, -0.08]} c={c} rough={0.6} />
        </>
      );
    case 'cap':
      return (
        <>
          <mesh position={[0, 0.12, 0]} castShadow material={plastic(c)}>
            <cylinderGeometry args={[0.19, 0.172, 0.12, 28]} />
          </mesh>
          <RBox s={[0.26, 0.02, 0.12]} r={0.009} p={[0, 0.07, 0.17]} rot={[0.25, 0, 0]} c="#111" rough={0.2} />
        </>
      );
    case 'beanie':
    default:
      return (
        <>
          <mesh position={[0, 0.06, -0.005]} castShadow material={plastic(c, 0.85)}>
            <sphereGeometry args={[0.18, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          </mesh>
          <mesh position={[0, 0.07, -0.005]} rotation={[Math.PI / 2, 0, 0]} castShadow material={plastic(c, 0.85)}>
            <torusGeometry args={[0.172, 0.03, 12, 32]} />
          </mesh>
        </>
      );
  }
};

/** Long rounded head: nose, dot eyes with a catchlight, brows, small mouth. */
const Head: React.FC<{look: Look; eyes: number}> = ({look, eyes}) => {
  const skin = look.skin ?? '#F2C7A5';
  const hairC = look.hairColor ?? '#5A3A22';
  return (
    <group>
      <Caps r={0.16} l={0.13} c={skin} s={[1, 1, 0.92]} />
      {/* nose: a long rounded bump, the toys' signature */}
      <Caps r={0.04} l={0.06} p={[0, -0.01, 0.16]} rot={[1.25, 0, 0]} c={skin} />
      {[-1, 1].map((sd) => (
        <group key={sd} position={[0.058 * sd, 0.065, 0.135]} scale={[1, Math.max(0.08, eyes), 1]}>
          <Sph r={0.024} c="#141414" rough={0.15} />
          <Sph r={0.007} p={[0.008, 0.01, 0.02]} c="#FFFFFF" basic />
        </group>
      ))}
      {[-1, 1].map((sd) => (
        <RBox key={sd} s={[0.06, 0.016, 0.02]} r={0.007} p={[0.06 * sd, 0.115, 0.14]} rot={[0, 0, -0.12 * sd]} c={hairC} />
      ))}
      <mesh position={[0, -0.1, 0.142]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.028, 0.006, 6, 16, Math.PI]} />
        <meshStandardMaterial color="#5A2A22" />
      </mesh>
      {look.mustache && <Caps r={0.022} l={0.09} p={[0, -0.06, 0.16]} rot={[0, 0, Math.PI / 2]} c={hairC} />}
      {look.glasses === 'sun' &&
        [-1, 1].map((sd) => <RBox key={sd} s={[0.085, 0.045, 0.02]} r={0.012} p={[0.058 * sd, 0.065, 0.16]} c="#0D0D0D" rough={0.1} />)}
      {look.glasses === 'round' &&
        [-1, 1].map((sd) => (
          <mesh key={sd} position={[0.058 * sd, 0.065, 0.16]}>
            <torusGeometry args={[0.035, 0.006, 8, 24]} />
            <meshStandardMaterial color="#C9C2B5" metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
      <Hair kind={look.hair} c={hairC} />
    </group>
  );
};

export const Toy: React.FC<{look: Look; pose?: ToyPose; p?: V3; ry?: number; scale?: number}> = ({look, pose = {}, p = [0, 0, 0], ry = 0, scale = 1}) => {
  const {armL = 0.05, armR = 0.05, outL = 0, outR = 0, elbowL = 0.15, elbowR = 0.15, yaw = 0, pitch = 0, walk = 0, breath = 0, eyes = 1} = pose;
  const skin = look.skin ?? '#F2C7A5';
  const shoes = look.shoes ?? '#2B2B2E';
  const long = look.sleeves === 'long';
  const sw = walk ? Math.sin(walk * Math.PI * 2) * 0.45 : 0;
  const bob = walk ? Math.abs(Math.cos(walk * Math.PI * 2)) * 0.025 : 0;
  const b = 1 + 0.012 * Math.sin(breath * Math.PI * 2);
  return (
    <group position={p} rotation={[0, ry, 0]} scale={scale}>
      <group position={[0, bob, 0]}>
        <Leg side={-1} swing={sw} pants={look.pants} shoes={shoes} skin={skin} skirt={!!look.skirt} />
        <Leg side={1} swing={-sw} pants={look.pants} shoes={shoes} skin={skin} skirt={!!look.skirt} />
        {look.skirt ? (
          <mesh position={[0, 0.7, 0]} castShadow material={plastic(look.pants)}>
            <cylinderGeometry args={[0.2, 0.27, 0.36, 28]} />
          </mesh>
        ) : (
          <RBox s={[0.36, 0.16, 0.22]} r={0.06} p={[0, 0.8, 0]} c={look.pants} />
        )}
        {look.belt && <RBox s={[0.35, 0.045, 0.22]} r={0.015} p={[0, 0.88, 0]} c="#5A3A22" rough={0.3} />}
        <group scale={[b, b, b]} position={[0, 0, 0]}>
          <RBox s={[0.44, 0.5, 0.26]} r={0.1} p={[0, 1.12, 0]} c={look.shirt} />
        </group>
        <Arm side={-1} raise={armL + (walk ? -sw * 0.6 : 0)} out={outL} elbow={elbowL} sleeve={look.shirt} skin={skin} long={long} />
        <Arm side={1} raise={armR + (walk ? sw * 0.6 : 0)} out={outR} elbow={elbowR} sleeve={look.shirt} skin={skin} long={long} />
        <mesh position={[0, 1.4, 0]} castShadow material={plastic(skin)}>
          <cylinderGeometry args={[0.05, 0.055, 0.08, 16]} />
        </mesh>
        <group position={[0, 1.66, 0]} rotation={[pitch, yaw, 0]}>
          <Head look={look} eyes={eyes} />
        </group>
      </group>
    </group>
  );
};

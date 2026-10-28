import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {eio, eo3, prog} from '../../style/ease';
import {SceneProps} from '../Messages1/Scenes';
import {Env, S, SovietRoom} from '../Toy/SovietRoom';
import {Look, Toy, ToyPose} from '../Toy/Toy';

/*
 * «Сосед сверху», part 1, in the new look: a vinyl-toy hero in the Soviet-flat diorama
 * (Toy/SovietRoom) on the top floor, and a snowy roof above it. Every shot is a slow
 * push-in on an orbit camera so the frame never stands still.
 */

type V3 = [number, number, number];

export const HERO: Look = {shirt: '#3D7BD9', sleeves: 'long', pants: '#2C3550', hair: 'side', hairColor: '#6B4226', belt: true};
const SEAT: V3 = [-0.15, 0.02, -1.22];
const AT_RADIATOR: V3 = [0.95, 0, -1.12];

/** Orbit camera: distance, azimuth and elevation ease from a to b over the shot, plus optional shake. */
type Orbit = {look: V3; dist: [number, number]; az: [number, number]; el: [number, number]; fov?: number};
const Cam: React.FC<{o: Orbit; k: number; t: number; shake?: number}> = ({o, k, t, shake = 0}) => {
  const {camera} = useThree();
  const e = eio(Math.min(1, Math.max(0, k)));
  const dist = o.dist[0] + (o.dist[1] - o.dist[0]) * e;
  const az = o.az[0] + (o.az[1] - o.az[0]) * e;
  const el = o.el[0] + (o.el[1] - o.el[0]) * e;
  const j = shake ? [Math.sin(t * 41) * shake, Math.sin(t * 37 + 1) * shake, 0] : [0, 0, 0];
  camera.position.set(o.look[0] + dist * Math.cos(el) * Math.sin(az) + j[0], o.look[1] + dist * Math.sin(el) + j[1], o.look[2] + dist * Math.cos(el) * Math.cos(az));
  (camera as THREE.PerspectiveCamera).fov = o.fov ?? 30;
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  camera.lookAt(...o.look);
  return null;
};

export const ORBITS: Record<string, Orbit> = {
  knock: {look: [0.95, 0.5, -1.55], dist: [2.3, 1.7], az: [0.35, 0.2], el: [0.22, 0.16]},
  roof: {look: [0, 0.3, 0], dist: [11, 9], az: [0.7, 0.85], el: [0.5, 0.45]},
  sofa: {look: [0, 0.9, -0.4], dist: [12.5, 10.5], az: [0.8, 0.7], el: [0.55, 0.5]},
  chat: {look: [-0.15, 1.3, -1.0], dist: [5.0, 4.2], az: [0.45, 0.3], el: [0.22, 0.18]},
  chat2: {look: [-0.15, 1.45, -1.1], dist: [3.0, 2.5], az: [0.2, 0.05], el: [0.12, 0.1]},
  answer: {look: [0.9, 0.95, -1.35], dist: [4.8, 4.0], az: [0.9, 1.05], el: [0.18, 0.15]},
  silence: {look: [0.2, 0.9, -0.6], dist: [10, 12], az: [0.75, 0.75], el: [0.5, 0.55]},
  window: {look: [0.95, 1.55, -S], dist: [3.2, 2.2], az: [-0.25, -0.1], el: [0.04, 0.0], fov: 32},
  end: {look: [0.95, 1.55, -S], dist: [2.2, 2.0], az: [-0.1, -0.08], el: [0, 0], fov: 32},
};

const Stage: React.FC<{children: React.ReactNode; env?: number}> = ({children, env = 0.15}) => (
  <>
    <color attach="background" args={['#0A0B10']} />
    <Env intensity={env} />
    {children}
  </>
);

/** Seated on the sofa; `up` turns the head to the ceiling, `phone` raises both hands to hold it. */
const Seated: React.FC<{t: number; up?: number; phone?: boolean; eyes?: number}> = ({t, up = 0, phone, eyes = 1}) => {
  const pose: ToyPose = phone
    ? {sit: 1, armL: 0.75, armR: 0.75, elbowL: 1.15, elbowR: 1.15, outL: -0.32, outR: -0.32, pitch: 0.35 - up, breath: t / 2.2, eyes}
    : {sit: 1, armL: 0.25, armR: 0.25, elbowL: 0.6, elbowR: 0.6, pitch: -0.55 * up, breath: t / 2.2, eyes};
  return (
    <group>
      <Toy p={SEAT} look={HERO} pose={pose} />
      {phone && <HeldPhone p={[SEAT[0], 0.98, SEAT[2] + 0.42]} />}
    </group>
  );
};

/** A phone held at chest height, screen glowing on his face. */
const HeldPhone: React.FC<{p: V3; lit?: number}> = ({p, lit = 1}) => (
  <group position={p} rotation={[-0.9, 0, 0]}>
    <mesh castShadow>
      <boxGeometry args={[0.09, 0.17, 0.012]} />
      <meshStandardMaterial color="#0B0B0D" roughness={0.3} />
    </mesh>
    <mesh position={[0, 0, 0.0065]} rotation={[0, Math.PI, 0]}>
      <planeGeometry args={[0.08, 0.15]} />
      <meshStandardMaterial color="#CFE0FF" emissive="#CFE0FF" emissiveIntensity={1.5 * lit} side={THREE.DoubleSide} />
    </mesh>
    <pointLight position={[0, 0.12, 0.08]} intensity={0.7 * lit} distance={1.1} color="#B8CCFF" />
  </group>
);

/** Cold open: close on the radiator under the window, the room dark, the lamp low. */
export const Knock: React.FC<SceneProps> = ({t, d}) => {
  const hit = Math.max(0, Math.sin(t * 9)) ** 8;
  return (
    <Stage env={0.1}>
      <Cam o={ORBITS.knock} k={t / d} t={t} shake={0.004 * hit} />
      <SovietRoom t={t} lamp={0.25} moon={1.3} />
      <pointLight position={[0.95, 0.6, -1.3]} intensity={0.35} distance={1.4} color="#8FA8E8" />
    </Stage>
  );
};

const RRB: React.FC<{s: V3; p: V3; c: string; r?: number; rough?: number; e?: string; ei?: number}> = ({s, p, c, r = 0.03, rough = 0.85, e, ei = 0}) => {
  const geo = useMemo(() => new RoundedBoxGeometry(s[0], s[1], s[2], 3, Math.min(r, Math.min(...s) / 2 - 0.001)), [s[0], s[1], s[2], r]);
  return (
    <mesh geometry={geo} position={p} castShadow receiveShadow>
      <meshStandardMaterial color={c} roughness={rough} emissive={e ?? '#000'} emissiveIntensity={ei} />
    </mesh>
  );
};

/** The roof above the 9th floor: snow, vent shafts, antennas, a locked hatch and the moon. Empty. */
export const Roof: React.FC<SceneProps> = ({t, d}) => (
  <Stage env={0.08}>
    <color attach="background" args={['#070A14']} />
    <Cam o={ORBITS.roof} k={t / d} t={t} />
    <RRB s={[4.6, 0.5, 4.6]} p={[0, -0.25, 0]} c="#15161A" r={0.02} />
    <RRB s={[4.5, 0.06, 4.5]} p={[0, 0.03, 0]} c="#E6ECF5" r={0.03} rough={1} />
    {/* parapet */}
    {[
      [0, -2.2, 4.5, 0.18],
      [-2.2, 0, 0.18, 4.5],
    ].map(([x, z, w, dd], i) => (
      <RRB key={i} s={[w, 0.35, dd]} p={[x, 0.2, z]} c="#7A7268" />
    ))}
    {/* lift machine room, vents, hatch */}
    <RRB s={[1.2, 1.0, 1.0]} p={[-1.2, 0.5, -1.2]} c="#8A8278" />
    <RRB s={[1.24, 0.06, 1.04]} p={[-1.2, 1.03, -1.2]} c="#EEF2F8" rough={1} />
    <RRB s={[0.3, 0.6, 0.06]} p={[-0.9, 0.35, -0.68]} c="#4A3A2E" />
    {[
      [1.0, -1.3],
      [1.4, 0.4],
      [-0.2, 1.3],
    ].map(([x, z], i) => (
      <group key={i} position={[x, 0, z]}>
        <RRB s={[0.32, 0.5, 0.32]} p={[0, 0.25, 0]} c="#9A9288" />
        <RRB s={[0.42, 0.05, 0.42]} p={[0, 0.53, 0]} c="#E6ECF5" />
      </group>
    ))}
    <RRB s={[0.6, 0.06, 0.6]} p={[0.2, 0.08, -0.3]} c="#3A3A40" rough={0.4} />
    {/* antennas */}
    {[
      [0.6, -1.8],
      [-1.8, 0.8],
    ].map(([x, z], i) => (
      <group key={i} position={[x, 0, z]}>
        <RRB s={[0.03, 1.6, 0.03]} p={[0, 0.8, 0]} c="#B8B8C0" r={0.01} />
        {[1.2, 1.4, 1.55].map((y) => (
          <RRB key={y} s={[0.6 - y * 0.2, 0.02, 0.02]} p={[0, y, 0]} c="#B8B8C0" r={0.008} />
        ))}
      </group>
    ))}
    {/* moon and its cold light */}
    <mesh position={[-3, 4.5, -6]}>
      <sphereGeometry args={[0.5, 24, 16]} />
      <meshBasicMaterial color="#F2F0E6" />
    </mesh>
    <directionalLight position={[-3, 5, -4]} intensity={1.6} color="#9FB4F0" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} />
    <hemisphereLight args={['#3A4A7A', '#101018', 0.35]} />
    {/* snow falling */}
    {Array.from({length: 40}, (_, i) => {
      const x = ((i * 0.618) % 1) * 4.4 - 2.2;
      const z = ((i * 0.377) % 1) * 4.4 - 2.2;
      const y = 3 - ((t * 0.5 + i * 0.13) % 3);
      return (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.015, 6, 4]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      );
    })}
  </Stage>
);

/** Wide diorama: him on the sofa at night, looking up at the ceiling. */
export const Sofa: React.FC<SceneProps> = ({t, d}) => (
  <Stage>
    <Cam o={ORBITS.sofa} k={t / d} t={t} />
    <SovietRoom t={t} lamp={0.8} />
    <Seated t={t} up={eo3(prog(t, 0.2, 1.0))} />
  </Stage>
);

/** Medium (chat) or close (chat2) on him reading the phone. */
export const Reading: React.FC<SceneProps & {id: 'chat' | 'chat2'}> = ({t, d, id}) => (
  <Stage>
    <Cam o={ORBITS[id]} k={t / d} t={t} />
    <SovietRoom t={t} lamp={id === 'chat2' ? 0.5 : 0.8} />
    <Seated t={t} phone eyes={id === 'chat2' && t > 1.2 ? 1.25 : 1} />
  </Stage>
);

/** He stands at the radiator and knocks back three times. */
export const Answer: React.FC<SceneProps> = ({t, d}) => {
  const knocks = [0.9, 1.22, 1.54].map((a) => Math.max(0, 1 - Math.abs(t - a) / 0.12));
  const hit = Math.max(...knocks);
  return (
    <Stage>
      <Cam o={ORBITS.answer} k={t / d} t={t} shake={0.006 * hit} />
      <SovietRoom t={t} lamp={0.6} />
      <Toy p={AT_RADIATOR} ry={Math.PI} look={HERO} pose={{armR: 0.9 - 0.45 * hit, elbowR: 1.2, outR: -0.15, armL: 0.1, pitch: 0.45, breath: t / 2}} />
    </Stage>
  );
};

/** The knocking stops: the lamp dies, only moonlight; he stands frozen. */
export const Silence: React.FC<SceneProps> = ({t, d}) => {
  const lamp = t < 0.35 ? 0.6 : t < 0.45 ? 0.2 : t < 0.55 ? 0.5 : 0;
  return (
    <Stage env={0.06}>
      <Cam o={ORBITS.silence} k={t / d} t={t} />
      <SovietRoom t={t} lamp={lamp} moon={1.2} />
      <Toy p={AT_RADIATOR} ry={Math.PI} look={HERO} pose={{armR: 0.3, elbowR: 0.8, pitch: 0.2, breath: t / 1.6}} />
    </Stage>
  );
};

/** A pale hand flat on the glass from outside, palm and four fingers, and the thumb. */
const Hand: React.FC<{p: V3; s?: number; rz?: number}> = ({p, s = 1, rz = 0}) => (
  <group position={p} rotation={[0, 0, rz]} scale={s}>
    <RRB s={[0.12, 0.13, 0.02]} p={[0, 0, 0]} c="#C8D2D0" r={0.009} rough={0.6} e="#9FB0B0" ei={0.15} />
    {[-0.042, -0.014, 0.014, 0.042].map((x, i) => (
      <RRB key={x} s={[0.024, 0.09 + (i === 1 || i === 2 ? 0.02 : 0), 0.018]} p={[x, 0.11 + (i === 1 || i === 2 ? 0.01 : 0), 0]} c="#C8D2D0" r={0.009} rough={0.6} e="#9FB0B0" ei={0.15} />
    ))}
    <RRB s={[0.024, 0.07, 0.018]} p={[0.078, 0.01, 0]} c="#C8D2D0" r={0.009} rough={0.6} e="#9FB0B0" ei={0.15} />
  </group>
);

/** Toward the window: a knock on the glass from outside, then the hands appear on it. */
export const WindowShot: React.FC<SceneProps & {end?: boolean}> = ({t, d, end}) => {
  const k = end ? 1 : eo3(prog(t, 1.0, 1.4));
  const hit = end ? 0 : Math.max(...[1.25, 1.53, 1.81].map((a) => Math.max(0, 1 - Math.abs(t - a) / 0.1)));
  const z = -S + 0.012;
  return (
    <Stage env={0.06}>
      <Cam o={end ? ORBITS.end : ORBITS.window} k={t / d} t={t} shake={0.006 * hit} />
      <SovietRoom t={t} lamp={0} moon={1.1} />
      <group visible={k > 0}>
        <Hand p={[0.72, 1.55 - 0.05 * (1 - k), z]} rz={0.12} />
        {(end || t > 1.6) && <Hand p={[1.22, 1.68, z]} rz={-0.1} s={0.95} />}
        {/* the face, barely: two dark eye pits in a pale oval behind the glass */}
        {(end || t > 2.2) && (
          <group position={[0.98, 1.72, z - 0.001]}>
            <mesh scale={[0.7, 1, 1]}>
              <circleGeometry args={[0.15, 32]} />
              <meshStandardMaterial color="#8A9696" emissive="#6E7E80" emissiveIntensity={0.25} transparent opacity={0.55} />
            </mesh>
            {[-0.04, 0.04].map((x) => (
              <mesh key={x} position={[x, 0.02, 0.001]}>
                <circleGeometry args={[0.018, 12]} />
                <meshBasicMaterial color="#000" />
              </mesh>
            ))}
          </group>
        )}
        <pointLight position={[0.95, 1.6, -S + 0.35]} intensity={0.5 * k} distance={1.2} color="#A8C0E0" />
      </group>
      {!end && <Toy p={[-0.35, 0, -0.55]} ry={Math.PI - 0.6} look={HERO} pose={{armR: 0.15, armL: 0.15, pitch: 0.05, breath: t / 1.4}} />}
    </Stage>
  );
};

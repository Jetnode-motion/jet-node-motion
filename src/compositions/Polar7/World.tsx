import React from 'react';
import * as THREE from 'three';

/*
 * Low-poly "toy" world for Polar7: matte figurines without faces, boxes for furniture,
 * one warm lamp per room. Everything is a pure function of the props it gets, so any
 * frame renders the same in any order.
 */

export const P = {
  skin: '#E9C9A6',
  fur: '#F2EEE6',
  red: '#C8352B',
  blue: '#2C4A9A',
  orange: '#D9792B',
  grey: '#6C7078',
  wet: '#3B4048',
  pants: '#2A2C33',
  wood: '#5E3F2A',
  woodDark: '#4E3423',
  wall: '#3A4A5C',
  wallWarm: '#6B5440',
  floor: '#2B2A2E',
  radio: '#2F5A3E',
  snow: '#C9D6E8',
};

/** Seeded hash in [0, 1): replaces Math.random(). */
export const hash = (i: number, s = 1) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const Mat: React.FC<{c: string; r?: number; e?: string; ei?: number; m?: number; o?: number}> = ({c, r = 0.85, e, ei = 0, m = 0, o}) => (
  <meshStandardMaterial
    color={c}
    roughness={r}
    metalness={m}
    emissive={e ?? '#000000'}
    emissiveIntensity={ei}
    transparent={o !== undefined}
    opacity={o ?? 1}
  />
);

type V3 = [number, number, number];

export const Box: React.FC<{p: V3; s: V3; c: string; r?: number; rot?: V3; e?: string; ei?: number}> = ({p, s, c, r, rot, e, ei}) => (
  <mesh position={p} rotation={rot} castShadow receiveShadow>
    <boxGeometry args={s} />
    <Mat c={c} r={r} e={e} ei={ei} />
  </mesh>
);

const Cap: React.FC<{p?: V3; rot?: V3; r: number; l: number; c: string}> = ({p, rot, r, l, c}) => (
  <mesh position={p} rotation={rot} castShadow receiveShadow>
    <capsuleGeometry args={[r, l, 6, 16]} />
    <Mat c={c} />
  </mesh>
);

const Ball: React.FC<{p?: V3; r: number; c: string; s?: V3; e?: string; ei?: number}> = ({p, r, c, s, e, ei}) => (
  <mesh position={p} scale={s} castShadow receiveShadow>
    <sphereGeometry args={[r, 24, 18]} />
    <Mat c={c} e={e} ei={ei} />
  </mesh>
);

export type Pose = {
  /** Arm swing forward (rad), left and right. */
  armL?: number;
  armR?: number;
  /** Arm spread sideways (rad). */
  spreadL?: number;
  spreadR?: number;
  head?: number; // head turn (rad)
  tilt?: number; // head tilt down (rad)
  sit?: boolean;
  breath?: number; // 0..1 phase of the idle breath
};

/**
 * A figurine: rounded parka, mittens, a head with or without a fur-lined hood.
 * Origin is at the feet. Height about 1.7.
 */
export const Figure: React.FC<{
  p?: V3;
  ry?: number;
  coat: string;
  hood?: boolean;
  headset?: boolean;
  eyes?: boolean;
  pose?: Pose;
  dark?: boolean;
  beanie?: string;
}> = ({p = [0, 0, 0], ry = 0, coat, hood = true, headset = false, eyes = false, pose = {}, dark = false, beanie}) => {
  const {armL = 0, armR = 0, spreadL = 0.12, spreadR = 0.12, head = 0, tilt = 0, sit = false, breath = 0} = pose;
  const b = 1 + 0.015 * Math.sin(breath * Math.PI * 2);
  const hip = sit ? 0.55 : 0.78;
  const skin = dark ? '#15161A' : P.skin;
  return (
    <group position={p} rotation={[0, ry, 0]}>
      {/* legs */}
      {sit ? (
        <>
          <Cap p={[-0.13, hip - 0.02, 0.22]} rot={[Math.PI / 2, 0, 0]} r={0.11} l={0.36} c={P.pants} />
          <Cap p={[0.13, hip - 0.02, 0.22]} rot={[Math.PI / 2, 0, 0]} r={0.11} l={0.36} c={P.pants} />
          <Cap p={[-0.13, 0.28, 0.44]} r={0.1} l={0.36} c={P.pants} />
          <Cap p={[0.13, 0.28, 0.44]} r={0.1} l={0.36} c={P.pants} />
        </>
      ) : (
        <>
          <Cap p={[-0.13, 0.38, 0]} r={0.11} l={0.5} c={P.pants} />
          <Cap p={[0.13, 0.38, 0]} r={0.11} l={0.5} c={P.pants} />
        </>
      )}
      {/* parka */}
      <group position={[0, hip + 0.33, 0]} scale={[b, b, b]}>
        <Cap r={0.3} l={0.42} c={coat} />
        {/* hem */}
        <mesh position={[0, -0.36, 0]} castShadow>
          <cylinderGeometry args={[0.31, 0.33, 0.1, 20]} />
          <Mat c={coat} />
        </mesh>
        {/* arms: hinged at the shoulders */}
        {[
          {x: -0.33, f: armL, s: -spreadL},
          {x: 0.33, f: armR, s: spreadR},
        ].map((a, i) => (
          <group key={i} position={[a.x, 0.22, 0]} rotation={[-a.f, 0, a.s]}>
            <Cap p={[0, -0.24, 0]} r={0.1} l={0.34} c={coat} />
            <Ball p={[0, -0.5, 0]} r={0.1} c={P.pants} />
          </group>
        ))}
        {/* head */}
        <group position={[0, 0.58, 0]} rotation={[tilt, head, 0]}>
          <Ball r={0.23} c={skin} />
          {eyes && !dark && (
            <>
              <Ball p={[-0.075, 0.03, 0.215]} r={0.022} c="#111" />
              <Ball p={[0.075, 0.03, 0.215]} r={0.022} c="#111" />
            </>
          )}
          {hood && (
            <>
              {/* hood shell, open at the front (+z) so the face shows */}
              <mesh position={[0, 0.01, -0.04]} castShadow>
                <sphereGeometry args={[0.29, 24, 18, Math.PI * 0.82, Math.PI * 1.36, 0, Math.PI * 0.8]} />
                <meshStandardMaterial color={coat} roughness={0.85} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0, 0.0, 0.12]} castShadow>
                <torusGeometry args={[0.215, 0.075, 12, 28]} />
                <Mat c={P.fur} r={1} />
              </mesh>
            </>
          )}
          {beanie && (
            <>
              {/* knit hat: a dome over the crown and a folded rim */}
              <mesh position={[0, 0.06, -0.01]} castShadow>
                <sphereGeometry args={[0.24, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
                <Mat c={beanie} r={1} />
              </mesh>
              <mesh position={[0, 0.1, -0.01]} rotation={[Math.PI / 2 + 0.12, 0, 0]} castShadow>
                <torusGeometry args={[0.215, 0.045, 10, 28]} />
                <Mat c={beanie} r={1} />
              </mesh>
            </>
          )}
          {headset && (
            <>
              <mesh rotation={[0, 0, 0]} castShadow>
                <torusGeometry args={[0.245, 0.022, 8, 24, Math.PI]} />
                <Mat c="#111" r={0.5} />
              </mesh>
              <Ball p={[-0.24, -0.02, 0]} r={0.075} c="#151515" s={[0.6, 1, 1]} />
              <Ball p={[0.24, -0.02, 0]} r={0.075} c="#151515" s={[0.6, 1, 1]} />
            </>
          )}
        </group>
      </group>
    </group>
  );
};

/** Two walls and a floor: a room corner seen from inside. */
export const Room: React.FC<{wall?: string; floor?: string; w?: number; d?: number; h?: number}> = ({
  wall = P.wall,
  floor = P.floor,
  w = 8,
  d = 8,
  h = 4,
}) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[w, d]} />
      <Mat c={floor} r={0.95} />
    </mesh>
    <mesh position={[0, h / 2, -d / 2]} receiveShadow>
      <planeGeometry args={[w, h]} />
      <Mat c={wall} />
    </mesh>
    <mesh position={[-w / 2, h / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
      <planeGeometry args={[d, h]} />
      <Mat c={wall} />
    </mesh>
    <mesh position={[w / 2, h / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
      <planeGeometry args={[d, h]} />
      <Mat c={wall} />
    </mesh>
  </group>
);

/** Ceiling lamp: a bulb you can see plus the light it throws. */
export const Lamp: React.FC<{p: V3; i?: number; c?: string; flicker?: number; d?: number}> = ({p, i = 30, c = '#FFD9A0', flicker = 1, d = 9}) => (
  <group position={p}>
    <mesh position={[0, 0.25, 0]}>
      <cylinderGeometry args={[0.01, 0.01, 0.5, 6]} />
      <Mat c="#111" />
    </mesh>
    <mesh>
      <coneGeometry args={[0.28, 0.2, 20, 1, true]} />
      <meshStandardMaterial color="#222" side={THREE.DoubleSide} roughness={0.6} />
    </mesh>
    <Ball p={[0, -0.08, 0]} r={0.08} c="#fff" e={c} ei={3 * flicker} />
    <pointLight
      position={[0, -0.2, 0]}
      intensity={i * flicker}
      distance={d}
      decay={2}
      color={c}
      castShadow
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
      shadow-bias={-0.002}
      shadow-radius={6}
    />
  </group>
);

export const Table: React.FC<{p?: V3; w?: number; d?: number}> = ({p = [0, 0, 0], w = 2.2, d = 1.2}) => (
  <group position={p}>
    <Box p={[0, 0.76, 0]} s={[w, 0.08, d]} c={P.wood} />
    {[
      [-w / 2 + 0.1, -d / 2 + 0.1],
      [w / 2 - 0.1, -d / 2 + 0.1],
      [-w / 2 + 0.1, d / 2 - 0.1],
      [w / 2 - 0.1, d / 2 - 0.1],
    ].map(([x, z], i) => (
      <Box key={i} p={[x, 0.36, z]} s={[0.07, 0.72, 0.07]} c={P.woodDark} />
    ))}
  </group>
);

export const Mug: React.FC<{p: V3; c?: string; ry?: number}> = ({p, c = '#D8D2C4', ry = 0}) => (
  <group position={p} rotation={[0, ry, 0]}>
    <mesh position={[0, 0.07, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.065, 0.06, 0.14, 20]} />
      <Mat c={c} r={0.5} />
    </mesh>
    <mesh position={[0, 0.142, 0]}>
      <cylinderGeometry args={[0.056, 0.056, 0.004, 20]} />
      <Mat c="#3A2416" r={0.3} />
    </mesh>
    <mesh position={[0.075, 0.075, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <torusGeometry args={[0.035, 0.012, 8, 16]} />
      <Mat c={c} r={0.5} />
    </mesh>
  </group>
);

/** Steam: soft puffs that rise and fade, positions from time only. */
export const Steam: React.FC<{p: V3; t: number; n?: number}> = ({p, t, n = 10}) => (
  <group position={p}>
    {Array.from({length: n}, (_, i) => {
      const life = 2.4;
      const k = ((t + i * (life / n)) % life) / life;
      const x = Math.sin(k * 5 + i) * 0.03 * (1 + k * 2);
      return (
        <mesh key={i} position={[x, 0.05 + k * 0.45, Math.cos(k * 4 + i) * 0.02]} scale={0.03 + k * 0.07}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.22 * Math.sin(k * Math.PI)} roughness={1} depthWrite={false} />
        </mesh>
      );
    })}
  </group>
);

/** Radio set with indicator lamps; `on` makes them blink. */
export const Radio: React.FC<{p: V3; t: number; on?: number}> = ({p, t, on = 0}) => (
  <group position={p}>
    <Box p={[0, 0.45, 0]} s={[1.3, 0.9, 0.5]} c={P.radio} r={0.7} />
    <Box p={[0, 0.62, 0.26]} s={[0.9, 0.32, 0.02]} c="#1F3A29" e="#7CFFB0" ei={0.08 + 0.25 * on} />
    {Array.from({length: 5}, (_, i) => {
      const lit = on > 0 ? (Math.floor(t * 4 + i * 1.7) % 3 === 0 ? 1 : 0.25) : 0.35;
      const col = i === 4 ? '#FF6B4A' : '#C8FF8A';
      return <Ball key={i} p={[-0.36 + i * 0.18, 0.28, 0.27]} r={0.035} c={col} e={col} ei={2.5 * lit} />;
    })}
    {[-0.4, 0.4].map((x, i) => (
      <mesh key={i} position={[x, 0.28, 0.27]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.05, 16]} />
        <Mat c="#111" r={0.4} />
      </mesh>
    ))}
    {/* microphone */}
    <Box p={[0.75, 0.06, 0.15]} s={[0.12, 0.12, 0.22]} c="#151515" />
  </group>
);

export const Chair: React.FC<{p: V3; ry?: number; back?: boolean}> = ({p, ry = 0, back = true}) => (
  <group position={p} rotation={[0, ry, 0]}>
    <Box p={[0, 0.48, 0]} s={[0.55, 0.07, 0.55]} c={P.woodDark} />
    {back && <Box p={[0, 0.85, -0.25]} s={[0.55, 0.7, 0.06]} c={P.woodDark} />}
    {[
      [-0.23, -0.23],
      [0.23, -0.23],
      [-0.23, 0.23],
      [0.23, 0.23],
    ].map(([x, z], i) => (
      <Box key={i} p={[x, 0.22, z]} s={[0.05, 0.45, 0.05]} c={P.woodDark} />
    ))}
  </group>
);

/** Snow flakes in a box around the camera, falling and drifting. */
export const Snow: React.FC<{t: number; n?: number; area?: number; top?: number; speed?: number}> = ({t, n = 260, area = 10, top = 6, speed = 0.9}) => {
  const geo = React.useMemo(() => new THREE.BufferGeometry(), []);
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const fall = (hash(i, 2) * top + t * speed * (0.6 + 0.6 * hash(i, 3))) % top;
    pos[i * 3] = (hash(i, 1) - 0.5) * area + Math.sin(t * 0.7 + i) * 0.25 + t * 0.35;
    pos[i * 3 + 1] = top - fall;
    pos[i * 3 + 2] = (hash(i, 4) - 0.5) * area;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return (
    <points geometry={geo}>
      <pointsMaterial color="#ffffff" size={0.05} sizeAttenuation transparent opacity={0.85} />
    </points>
  );
};

/** Sleeping bag on a bunk. */
export const Bunk: React.FC<{p: V3; bag: string; empty?: boolean}> = ({p, bag, empty}) => (
  <group position={p}>
    <Box p={[0, 0.45, 0]} s={[2.0, 0.12, 0.85]} c={P.woodDark} />
    <Box p={[0, 0.54, 0]} s={[1.9, 0.08, 0.78]} c="#8C8577" r={1} />
    {!empty && (
      <mesh position={[0.05, 0.68, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <capsuleGeometry args={[0.2, 1.3, 6, 16]} />
        <Mat c={bag} />
      </mesh>
    )}
    <Box p={[-0.85, 0.66, 0]} s={[0.35, 0.12, 0.55]} c="#E4DED2" r={1} />
  </group>
);

/** A parka hanging on a hook: body, sleeves and hood, no head. */
export const HangingCoat: React.FC<{p: V3; c: string; sway?: number}> = ({p, c, sway = 0}) => (
  <group position={p} rotation={[0, 0, sway]}>
    <Box p={[0, 0.06, 0]} s={[0.04, 0.12, 0.04]} c="#222" />
    <group position={[0, -0.55, 0.12]}>
      <Cap r={0.24} l={0.55} c={c} />
      <Cap p={[-0.27, -0.05, 0]} rot={[0, 0, 0.08]} r={0.08} l={0.55} c={c} />
      <Cap p={[0.27, -0.05, 0]} rot={[0, 0, -0.08]} r={0.08} l={0.55} c={c} />
      <mesh position={[0, 0.48, -0.02]} castShadow>
        <sphereGeometry args={[0.2, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
        <Mat c={c} />
      </mesh>
      <mesh position={[0, 0.42, 0.1]} rotation={[0.5, 0, 0]}>
        <torusGeometry args={[0.15, 0.05, 10, 24]} />
        <Mat c={P.fur} r={1} />
      </mesh>
    </group>
  </group>
);

export const Stove: React.FC<{p: V3; t: number}> = ({p, t}) => {
  const fl = 0.8 + 0.2 * Math.sin(t * 13) * Math.sin(t * 7.3);
  return (
    <group position={p}>
      <Box p={[0, 0.45, 0]} s={[0.8, 0.9, 0.7]} c="#1E1E22" r={0.5} />
      <Box p={[0, 0.4, 0.36]} s={[0.4, 0.28, 0.02]} c="#FF7A2A" e="#FF6A1A" ei={2.2 * fl} />
      <mesh position={[0, 1.6, -0.1]}>
        <cylinderGeometry args={[0.09, 0.09, 1.5, 12]} />
        <Mat c="#1E1E22" r={0.5} />
      </mesh>
      <pointLight position={[0, 0.5, 0.8]} intensity={6 * fl} distance={5} color="#FF8A3A" />
    </group>
  );
};

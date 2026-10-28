import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {books, boards, carpet, curtain, rug, wallpaper} from './textures';

/*
 * A Soviet-flat room as a cut-away diorama (the isometric room Nazar sent): two walls with
 * striped wallpaper, a carpet on the wall, a sofa under it, a desk with a lamp, shelves,
 * a window with flowered curtains, a radiator, a rug, an old TV. Thick dark slab edges.
 * The room is 3.4 x 3.4 m, floor at y = 0, back wall at z = -S, left wall at x = -S.
 */

type V3 = [number, number, number];
export const S = 1.7;
const H = 2.6;
const T = 0.12; // wall thickness

const RB: React.FC<{s: V3; p: V3; c?: string; r?: number; map?: THREE.Texture; rough?: number; rot?: V3; e?: string; ei?: number}> = ({s, p, c = '#fff', r = 0.02, map, rough = 0.8, rot, e, ei = 0}) => {
  const geo = useMemo(() => new RoundedBoxGeometry(s[0], s[1], s[2], 3, Math.min(r, Math.min(...s) / 2 - 0.001)), [s[0], s[1], s[2], r]);
  return (
    <mesh geometry={geo} position={p} rotation={rot} castShadow receiveShadow>
      <meshStandardMaterial color={c} map={map} roughness={rough} emissive={e ?? '#000'} emissiveIntensity={ei} />
    </mesh>
  );
};

const Plane: React.FC<{w: number; h: number; p: V3; rot?: V3; map?: THREE.Texture; c?: string; rough?: number}> = ({w, h, p, rot, map, c = '#fff', rough = 0.9}) => (
  <mesh position={p} rotation={rot} receiveShadow>
    <planeGeometry args={[w, h]} />
    <meshStandardMaterial color={c} map={map} roughness={rough} />
  </mesh>
);

/** Soft image-based fill from a neutral studio room, very low so the lamps still rule. */
export const Env: React.FC<{intensity?: number}> = ({intensity = 0.12}) => {
  const {gl, scene} = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();
  }, [gl, scene]);
  (scene as unknown as {environmentIntensity: number}).environmentIntensity = intensity;
  return null;
};

const Shell: React.FC = () => {
  const wp = wallpaper();
  return (
    <group>
      {/* floor slab with dark edges */}
      <RB s={[2 * S + T, 0.16, 2 * S + T]} p={[-T / 2, -0.08, -T / 2]} c="#141416" r={0.01} />
      <Plane w={2 * S} h={2 * S} p={[0, 0.001, 0]} rot={[-Math.PI / 2, 0, 0]} map={boards()} rough={0.6} />
      {/* back wall and left wall, wallpaper inside, dark caps */}
      <RB s={[2 * S + T, H, T]} p={[-T / 2, H / 2, -S - T / 2]} c="#141416" r={0.01} />
      <RB s={[T, H, 2 * S]} p={[-S - T / 2, H / 2, 0]} c="#141416" r={0.01} />
      <Plane w={2 * S} h={H} p={[0, H / 2, -S + 0.001]} map={wp} />
      <Plane w={2 * S} h={H} p={[-S + 0.001, H / 2, 0]} rot={[0, Math.PI / 2, 0]} map={wp} />
      {/* skirting boards */}
      <RB s={[2 * S, 0.08, 0.02]} p={[0, 0.04, -S + 0.01]} c="#6B4A30" />
      <RB s={[0.02, 0.08, 2 * S]} p={[-S + 0.01, 0.04, 0]} c="#6B4A30" />
    </group>
  );
};

const Sofa: React.FC = () => (
  <group position={[-0.25, 0, -S + 0.42]}>
    <RB s={[1.9, 0.4, 0.78]} p={[0, 0.2, 0]} c="#6E6A66" r={0.05} />
    <RB s={[1.86, 0.14, 0.7]} p={[0, 0.47, 0.03]} map={rug()} c="#C9A27A" r={0.05} rough={1} />
    <RB s={[1.9, 0.55, 0.18]} p={[0, 0.65, -0.3]} map={rug()} c="#B58A62" r={0.06} rough={1} />
    <RB s={[0.16, 0.55, 0.78]} p={[0.95, 0.42, 0]} c="#5E5A56" r={0.05} />
    <RB s={[0.36, 0.3, 0.12]} p={[0.62, 0.68, -0.12]} rot={[-0.2, 0, 0.1]} c="#E0C068" r={0.06} rough={1} />
  </group>
);

const Desk: React.FC<{lamp: number}> = ({lamp}) => (
  <group position={[-S + 0.4, 0, 0.2]}>
    <RB s={[0.7, 0.05, 1.2]} p={[0, 0.74, 0]} c="#8A5A34" rough={0.5} />
    {[
      [-0.3, -0.55],
      [0.3, -0.55],
      [-0.3, 0.55],
      [0.3, 0.55],
    ].map(([x, z], i) => (
      <RB key={i} s={[0.05, 0.72, 0.05]} p={[x, 0.36, z]} c="#6E4528" />
    ))}
    {/* lamp: base, arm, shade, and the warm light it throws */}
    <RB s={[0.16, 0.03, 0.16]} p={[-0.15, 0.78, -0.4]} c="#D9D2C2" r={0.012} />
    <RB s={[0.025, 0.38, 0.025]} p={[-0.15, 0.97, -0.4]} c="#D9D2C2" />
    <mesh position={[-0.08, 1.15, -0.35]} rotation={[0.3, 0, -0.7]} castShadow>
      <coneGeometry args={[0.1, 0.16, 24, 1, true]} />
      <meshStandardMaterial color="#D9D2C2" side={THREE.DoubleSide} emissive="#FFC774" emissiveIntensity={0.3 * lamp} />
    </mesh>
    <pointLight position={[0.0, 1.08, -0.3]} intensity={3.2 * lamp} distance={4.5} decay={2} color="#FFC37A" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.002} />
    {/* papers and a radio */}
    <RB s={[0.2, 0.01, 0.28]} p={[0.1, 0.77, 0.1]} rot={[0, 0.3, 0]} c="#EDE6D6" />
    <RB s={[0.18, 0.14, 0.32]} p={[-0.1, 0.84, 0.35]} c="#B83A2E" r={0.03} rough={0.4} />
    {/* chair */}
    <group position={[0.42, 0, 0.05]} rotation={[0, -Math.PI / 2, 0]}>
      <RB s={[0.42, 0.04, 0.42]} p={[0, 0.46, 0]} c="#C9822E" />
      <RB s={[0.42, 0.5, 0.04]} p={[0, 0.72, -0.2]} c="#C9822E" />
      {[
        [-0.18, -0.18],
        [0.18, -0.18],
        [-0.18, 0.18],
        [0.18, 0.18],
      ].map(([x, z], i) => (
        <RB key={i} s={[0.035, 0.46, 0.035]} p={[x, 0.23, z]} c="#9A6224" />
      ))}
    </group>
  </group>
);

const Shelves: React.FC = () => (
  <group position={[-S + 0.14, 0, 0.25]}>
    {[1.45, 1.8].map((y) => (
      <group key={y}>
        <RB s={[0.26, 0.03, 1.0]} p={[0, y, 0]} c="#3A2618" />
        <mesh position={[0.04, y + 0.13, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.95, 0.24]} />
          <meshStandardMaterial map={books()} roughness={0.8} transparent alphaTest={0.1} />
        </mesh>
      </group>
    ))}
  </group>
);

const Window: React.FC<{moon: number}> = ({moon}) => (
  <group position={[0.95, 0, -S + 0.005]}>
    {/* night outside and the frame */}
    <Plane w={1.0} h={1.25} p={[0, 1.55, 0.002]} c="#0B1426" rough={1} />
    <RB s={[1.08, 0.05, 0.06]} p={[0, 0.92, 0.03]} c="#E8E2D6" />
    <RB s={[1.08, 0.05, 0.06]} p={[0, 2.18, 0.03]} c="#E8E2D6" />
    <RB s={[0.05, 1.3, 0.06]} p={[-0.52, 1.55, 0.03]} c="#E8E2D6" />
    <RB s={[0.05, 1.3, 0.06]} p={[0.52, 1.55, 0.03]} c="#E8E2D6" />
    <RB s={[0.04, 1.25, 0.05]} p={[0, 1.55, 0.03]} c="#E8E2D6" />
    {/* sill with two pots */}
    <RB s={[1.15, 0.04, 0.22]} p={[0, 0.9, 0.1]} c="#E8E2D6" />
    {[-0.25, 0.22].map((x) => (
      <group key={x} position={[x, 0.92, 0.1]}>
        <mesh position={[0, 0.06, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.045, 0.12, 16]} />
          <meshStandardMaterial color="#B5652F" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.16, 0]} castShadow>
          <sphereGeometry args={[0.07, 12, 10]} />
          <meshStandardMaterial color="#3E6B34" roughness={0.9} />
        </mesh>
      </group>
    ))}
    {/* curtains */}
    {[-0.72, 0.72].map((x) => (
      <mesh key={x} position={[x, 1.32, 0.08]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 1.9, 0.05, 1, 1, 1]} />
        <meshStandardMaterial map={curtain()} roughness={1} />
      </mesh>
    ))}
    <RB s={[1.9, 0.03, 0.03]} p={[0, 2.3, 0.1]} c="#B8B0A0" />
    {/* radiator */}
    <group position={[0, 0, 0.12]}>
      {Array.from({length: 8}, (_, i) => (
        <RB key={i} s={[0.07, 0.55, 0.1]} p={[-0.28 + i * 0.08, 0.45, 0]} c="#ECE8E0" r={0.03} rough={0.4} />
      ))}
    </group>
    {/* cold moonlight through the glass */}
    <spotLight position={[0.2, 2.2, -1.2]} target-position={[0.2, 0, 1.5]} angle={0.7} penumbra={0.8} intensity={6 * moon} distance={7} color="#8FA8E8" castShadow />
  </group>
);

/** The old CRT TV in the near corner, screen glowing. */
export const TV: React.FC<{p?: V3; ry?: number; glow?: number; t?: number}> = ({p = [1.25, 0, 0.55], ry = -1.75, glow = 1, t = 0}) => {
  const fl = glow * (0.85 + 0.15 * Math.sin(t * 23) * Math.sin(t * 7.3));
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <RB s={[0.6, 0.45, 0.45]} p={[0, 0.23, 0]} c="#3A2A1E" />
      <RB s={[0.62, 0.48, 0.5]} p={[0, 0.7, 0]} c="#24201C" r={0.04} />
      <mesh position={[-0.05, 0.71, 0.252]}>
        <planeGeometry args={[0.42, 0.34]} />
        <meshStandardMaterial color="#9CB8D8" emissive="#AFC8FF" emissiveIntensity={1.4 * fl} />
      </mesh>
      <pointLight position={[0, 0.72, 0.6]} intensity={1.6 * fl} distance={3} color="#A9C2FF" />
    </group>
  );
};

export const SovietRoom: React.FC<{t: number; lamp?: number; moon?: number}> = ({t, lamp = 1, moon = 1}) => (
  <group>
    <Shell />
    {/* the wall carpet over the sofa */}
    <Plane w={1.9} h={1.3} p={[-0.25, 1.55, -S + 0.012]} map={carpet()} rough={1} />
    <Sofa />
    <Desk lamp={lamp} />
    <Shelves />
    <Window moon={moon} />
    <Plane w={2.2} h={1.6} p={[0.1, 0.006, 0.25]} rot={[-Math.PI / 2, 0, 0]} map={rug()} rough={1} />
    {/* a football by the sofa, slippers */}
    <mesh position={[0.95, 0.12, -0.75]} castShadow>
      <sphereGeometry args={[0.12, 24, 18]} />
      <meshStandardMaterial color="#F2F2F2" roughness={0.5} />
    </mesh>
    <TV t={t} />
    <hemisphereLight args={['#5A6E9A', '#2A1A12', 0.18]} />
  </group>
);

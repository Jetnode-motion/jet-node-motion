import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {FPS, H, W} from '../../style/tokens';
import {eo3, prog} from '../../style/ease';
import data from './timeline.json';
import {SceneProps, project} from '../Messages1/Scenes';
import {LiftCCTV, LiftDoors, LiftLast, LiftPanel, LiftPhone, LiftShadow} from '../Lift1/Scenes';
import {Chat, ChatMsg} from '../Messages1/Chat';
import {Push} from '../Messages1/Push';
import {BannerCard, Captions, FONT, Glitch, Line, MONO, Pill, RED, TopTag, Vignette, buildChunks} from '../Polar7/Overlays';

/*
 * «Лифт», part 2 «Вторая тень»: stuck on the 13th floor; the neighbour who writes in the residents
 * chat turns out not to exist. Same world as part 1 (Lift1/Scenes). Push ~12 s in, banner at the end.
 * Timings come from legacy/python/lift2.py, which writes timeline.json from the voiceover.
 */

export const DURATION: number = data.duration;
const SERIES = 'ЛИФТ';
const LINES = data.lines as Line[];
const MSGS = data.chat as ChatMsg[];
const SC = Object.fromEntries(data.scenes.map((s) => [s.id, s])) as Record<string, {id: string; frm: number; to: number}>;
const L = (n: number) => LINES[n - 1].at;
const END_TITLE = 3.4;
const PUSH = data.push as {at: number; dur: number};
const TAG_UNTIL = 2.6;

const CHUNKS = buildChunks(LINES, ['mirror', 'floor', 'cctv', 'dark']);

const SCENES: Record<string, React.FC<SceneProps>> = {
  mirror: (p) => <LiftLast {...p} arm={1} />,
  panel: LiftPanel,
  chat: LiftPhone,
  floor: (p) => <LiftShadow {...p} shown />,
  corridor: (p) => <LiftDoors {...p} opened ajar={eo3(prog(p.t, 0.8, 2.6))} />,
  chat2: LiftPhone,
  cctv: LiftCCTV,
  chat3: (p) => <LiftPhone {...p} lit={Math.floor(p.t * 6) % 5 === 0 ? 0.3 : 0.8} />,
  dark: (p) => <LiftPhone {...p} lit={0.02} ghost={1} />,
};

const ThreeScene: React.FC<{id: string; frm: number; to: number}> = ({id, frm, to}) => {
  const frame = useCurrentFrame();
  const Comp = SCENES[id];
  return (
    <AbsoluteFill style={id === 'cctv' ? {filter: 'grayscale(1) contrast(1.25) brightness(1.1)'} : undefined}>
      <ThreeCanvas
        width={W}
        height={H}
        shadows
        gl={{antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2}}
        camera={{fov: 50, near: 0.02, far: 100}}
      >
        <Comp t={frame / FPS} d={to - frm} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

const k = (id: string, t: number) => (t - SC[id].frm) / (SC[id].to - SC[id].frm);
const inScene = (id: string, t: number) => t >= SC[id].frm && t < SC[id].to;

const chatShow = (t: number) => {
  const wins: [number, number][] = ['chat', 'chat2', 'chat3'].map((id) => [SC[id].frm, SC[id].to]);
  return Math.max(0, ...wins.map(([a, b]) => Math.min(prog(t, a, a + 0.3), 1 - prog(t, b - 0.2, b))));
};

/** The panel display, stuck on 13 and blinking. */
const FloorLED: React.FC<{t: number}> = ({t}) => {
  if (!inScene('panel', t)) return null;
  const blink = Math.floor(t * 4) % 2 === 0 ? 0.35 : 1;
  return (
    <div style={{position: 'absolute', left: 540, top: 330, transform: 'translateX(-50%)', background: '#0B0606', border: '3px solid #2A1414', borderRadius: 18, padding: '6px 34px', fontFamily: MONO, fontWeight: 700, fontSize: 150, color: '#FF3B30', textShadow: '0 0 24px rgba(255,59,48,0.8)', opacity: blink}}>
      ■ 13
    </div>
  );
};

/** CCTV frame: REC dot, camera name, running timestamp, scanlines. */
const CCTV: React.FC<{t: number}> = ({t}) => {
  if (!inScene('cctv', t)) return null;
  const s = 9 * 60 + 14 + Math.floor(t - SC.cctv.frm);
  const ts = `27.10.2026  01:${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 2px, rgba(0,0,0,0) 2px 5px)'}} />
      <div style={{position: 'absolute', left: 60, top: 1500, fontFamily: MONO, color: '#fff', fontSize: 34, textShadow: '0 2px 6px #000'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <div style={{width: 22, height: 22, borderRadius: 11, background: RED, opacity: Math.floor(t * 2) % 2 ? 0.2 : 1}} />
          REC · КАМ 1 · ЛИФТ П3
        </div>
        <div style={{marginTop: 6}}>{ts}</div>
      </div>
    </AbsoluteFill>
  );
};

const Overlays: React.FC<{t: number}> = ({t}) => {
  const door = project('l_doors', k('corridor', t), [0, 1.75, 5.85]);
  return (
    <>
      <TopTag t={t} until={TAG_UNTIL} title={SERIES} sub="ЧАСТЬ 2 · ВТОРАЯ ТЕНЬ" />
      <FloorLED t={t} />
      <Pill t={t} at={SC.floor.frm + 0.4} until={SC.floor.to} x={540} y={300} text="теней: 2 · людей: 1" bg={RED} size={30} />
      {inScene('corridor', t) && <Pill t={t} at={L(7) + 1.8} until={SC.corridor.to} x={door.x} y={door.y - 70} text="кв. 36 · свет горит" bg="#D9792B" size={28} />}
      <Pill t={t} at={L(10) + 1.6} until={SC.chat2.to} x={540} y={760} text="кв. 47 пустует с 2023" bg="rgba(20,22,30,0.85)" size={30} />
      <CCTV t={t} />
      <Pill t={t} at={SC.cctv.frm + 0.3} until={SC.cctv.to} x={540} y={300} text="аватарка «Ольги»" bg="rgba(255,255,255,0.92)" fg="#111" size={30} />
      <Glitch t={t} at={SC.floor.frm} dur={0.25} />
      <Glitch t={t} at={SC.cctv.frm} dur={0.2} />
      <Glitch t={t} at={SC.dark.frm + 0.4} dur={0.35} />
      <Chat t={t} msgs={MSGS} show={chatShow(t)} name="Дом 14 · жильцы" status="128 участников" />
    </>
  );
};

const EndTitle: React.FC<{t: number}> = ({t}) => {
  const e = eo3(prog(t, 0, 0.5));
  return (
    <AbsoluteFill style={{background: '#06070A', alignItems: 'center', justifyContent: 'center'}}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{position: 'absolute', left: 0, right: 0, top: 700 + i * 150, height: 4, background: i % 2 ? 'rgba(255,59,48,0.35)' : 'rgba(80,200,255,0.25)', transform: `translateX(${(i % 2 ? -1 : 1) * 300 * (1 - e)}px)`}} />
      ))}
      <div style={{fontFamily: MONO, fontSize: 40, color: '#888', opacity: e, marginBottom: 10}}>часть 3</div>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 104, color: RED, opacity: e, transform: `scale(${1.1 - 0.1 * e})`, letterSpacing: 3}}>ОБЕРНИСЬ</div>
    </AbsoluteFill>
  );
};

export const Lift2: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const end = SC.end;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {data.scenes
        .filter((s) => SCENES[s.id])
        .map((s) => (
          <Sequence key={s.id} from={Math.round(s.frm * FPS)} durationInFrames={Math.round((s.to - s.frm) * FPS)} name={s.id}>
            <ThreeScene id={s.id} frm={s.frm} to={s.to} />
          </Sequence>
        ))}
      <Vignette />
      <Overlays t={t} />
      <Push t={t} at={PUSH.at} dur={PUSH.dur} />
      <Sequence from={Math.round(end.frm * FPS)} name="end">
        {t - end.frm < END_TITLE ? <EndTitle t={t - end.frm} /> : <BannerCard t={t - end.frm - END_TITLE} d={1e9} variant="end" series={SERIES} next={3} />}
      </Sequence>
      {t < end.frm && <Captions t={t} chunks={CHUNKS} />}
      {t >= end.frm && t - end.frm < END_TITLE && <Captions t={t} chunks={CHUNKS} y={1250} />}
    </AbsoluteFill>
  );
};

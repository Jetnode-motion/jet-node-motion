import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {FPS, H, W} from '../../style/tokens';
import {eo3, prog} from '../../style/ease';
import data from './timeline.json';
import {SceneProps, project} from '../Messages1/Scenes';
import {LiftDoors, LiftIn, LiftLast, LiftMirror, LiftPanel, LiftPhone, LiftShadow} from './Scenes';
import {Chat, ChatMsg} from '../Messages1/Chat';
import {Push} from '../Messages1/Push';
import {BannerCard, Captions, FONT, Glitch, Line, MONO, Pill, RED, TopTag, Vignette, buildChunks} from '../Polar7/Overlays';

/*
 * «Лифт», part 1 «13 этаж»: a night lift ride told through the building's residents chat, in the
 * «Переписка» format. Ads: a silent JetnodeVPN push mid-story, the banner at the end.
 * Timings come from legacy/python/lift1.py, which writes timeline.json from the voiceover.
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

const CHUNKS = buildChunks(LINES, ['chat2', 'panel', 'shadow', 'last']);

const SCENES: Record<string, React.FC<SceneProps>> = {
  lift: LiftIn,
  chat: LiftPhone,
  mirror: LiftMirror,
  chat2: LiftPhone,
  panel: LiftPanel,
  doors: LiftDoors,
  chat3: LiftPhone,
  shadow: LiftShadow,
  last: LiftLast,
};

const ThreeScene: React.FC<{id: string; frm: number; to: number}> = ({id, frm, to}) => {
  const frame = useCurrentFrame();
  const Comp = SCENES[id];
  return (
    <ThreeCanvas
      width={W}
      height={H}
      shadows
      gl={{antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2}}
      camera={{fov: 50, near: 0.02, far: 100}}
    >
      <Comp t={frame / FPS} d={to - frm} />
    </ThreeCanvas>
  );
};

const k = (id: string, t: number) => (t - SC[id].frm) / (SC[id].to - SC[id].frm);
const inScene = (id: string, t: number) => t >= SC[id].frm && t < SC[id].to;

const chatShow = (t: number) => {
  const wins: [number, number][] = ['chat', 'chat2', 'chat3'].map((id) => [SC[id].frm, SC[id].to]);
  return Math.max(0, ...wins.map(([a, b]) => Math.min(prog(t, a, a + 0.3), 1 - prog(t, b - 0.2, b))));
};

/** Which floor the display shows: 8 at first, then 9, 10, 11 on the ticks, 13 after the ding. */
const floorAt = (t: number) => {
  if (t >= L(9) + 0.1) return '13';
  const ticks = [0, 1, 2].filter((i) => t >= L(7) + 1.0 + i * 0.75).length;
  return String(8 + ticks);
};

/** Red LED floor number over the panel shot. */
const FloorLED: React.FC<{t: number}> = ({t}) => {
  if (!inScene('panel', t)) return null;
  const f = floorAt(t);
  const blink = f === '13' && Math.floor(t * 4) % 2 === 0 ? 0.35 : 1;
  return (
    <div style={{position: 'absolute', left: 540, top: 330, transform: 'translateX(-50%)', textAlign: 'center'}}>
      <div style={{background: '#0B0606', border: '3px solid #2A1414', borderRadius: 18, padding: '6px 34px', fontFamily: MONO, fontWeight: 700, fontSize: 150, color: '#FF3B30', textShadow: '0 0 24px rgba(255,59,48,0.8)', opacity: blink}}>
        ▲ {f}
      </div>
    </div>
  );
};

const Overlays: React.FC<{t: number}> = ({t}) => {
  const at = (cam: string, id: string, p: [number, number, number]) => project(cam, k(id, t), p);
  return (
    <>
      <TopTag t={t} until={TAG_UNTIL} title={SERIES} sub="ЧАСТЬ 1 · 13 ЭТАЖ" />
      <Pill t={t} at={TAG_UNTIL + 0.2} until={SC.lift.to} x={540} y={300} text="01:02 · подъезд 3" bg="rgba(20,22,30,0.85)" size={30} />
      <Pill t={t} at={SC.mirror.frm + 0.4} until={SC.mirror.to} x={540} y={300} text="на камере: 2 человека" bg={RED} size={30} />
      <FloorLED t={t} />
      <Pill t={t} at={L(9) + 1.0} until={SC.panel.to} x={540} y={1080} text="в доме 12 этажей" bg="rgba(20,22,30,0.85)" size={30} />
      {inScene('doors', t) && (
        <Pill t={t} at={L(11) + 1.6} until={SC.doors.to} x={at('l_doors', 'doors', [0, 1.75, 5.85]).x} y={at('l_doors', 'doors', [0, 1.75, 5.85]).y - 60} text="кв. 36 · моя" bg="#D9792B" size={28} />
      )}
      <Glitch t={t} at={SC.shadow.frm} dur={0.25} />
      <Glitch t={t} at={SC.last.frm + 1.6} dur={0.35} />
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
      <div style={{fontFamily: MONO, fontSize: 40, color: '#888', opacity: e, marginBottom: 10}}>часть 2</div>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 104, color: RED, opacity: e, transform: `scale(${1.1 - 0.1 * e})`, letterSpacing: 3}}>ВТОРАЯ ТЕНЬ</div>
    </AbsoluteFill>
  );
};

export const Lift1: React.FC = () => {
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
        {t - end.frm < END_TITLE ? <EndTitle t={t - end.frm} /> : <BannerCard t={t - end.frm - END_TITLE} d={1e9} variant="end" series={SERIES} next={2} />}
      </Sequence>
      {t < end.frm && <Captions t={t} chunks={CHUNKS} />}
      {t >= end.frm && t - end.frm < END_TITLE && <Captions t={t} chunks={CHUNKS} y={1250} />}
    </AbsoluteFill>
  );
};

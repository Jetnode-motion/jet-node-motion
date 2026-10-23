import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {FPS, H, W} from '../../style/tokens';
import {eo3, prog} from '../../style/ease';
import data from './timeline.json';
import {AtWindow, Block, Hall, Landing, LastMsg, Memory, PhoneOnBed, SceneProps, SitBed, project} from './Scenes';
import {Chat, ChatMsg} from './Chat';
import {BannerCard, Captions, FONT, Glitch, Line, MONO, Pill, RED, TopTag, Vignette, buildChunks} from '../Polar7/Overlays';

/*
 * «Переписка», part 1 «Не открывай»: a chat-story (the «Взахлёб» way of telling it) in the
 * 3D-figurine format. JetnodeVPN banner once in the middle and once at the end.
 * Timings come from legacy/python/messages1.py, which writes timeline.json from the voiceover.
 */

export const DURATION: number = data.duration;
const SERIES = 'ПЕРЕПИСКА';
const LINES = data.lines as Line[];
const MSGS = data.chat as ChatMsg[];
const SC = Object.fromEntries(data.scenes.map((s) => [s.id, s])) as Record<string, {id: string; frm: number; to: number}>;
const L = (n: number) => LINES[n - 1].at;
const END_TITLE = 3.4;

const CHUNKS = buildChunks(
  LINES.filter((l) => l.scene !== 'banner'),
  ['phone', 'bed2', 'voice', 'last']
);

const SCENES: Record<string, React.FC<SceneProps>> = {
  phone: (p) => <PhoneOnBed {...p} />,
  block: Block,
  bed: (p) => <SitBed {...p} />,
  door: (p) => <Hall {...p} id="door" />,
  peep: Landing,
  bed2: (p) => <PhoneOnBed {...p} id="bed2" buzz={1} />,
  memory: Memory,
  door2: (p) => <Hall {...p} id="door2" flicker />,
  window: AtWindow,
  voice: (p) => <Hall {...p} id="voice" lampOff feet={eo3(prog(p.t, 0.3, 1.5))} />,
  last: LastMsg,
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

/** How much the chat card is on screen: in the phone scenes, faded at their edges. */
const chatShow = (t: number) => {
  const wins: [number, number][] = [
    [MSGS[0].at - 0.8, SC.phone.to],
    [SC.bed.frm, SC.bed.to],
    [SC.bed2.frm, SC.bed2.to],
    [L(14), SC.door2.to],
    [SC.window.frm, SC.window.to],
    [SC.last.frm, SC.last.to],
  ];
  return Math.max(0, ...wins.map(([a, b]) => Math.min(prog(t, a, a + 0.3), 1 - prog(t, b - 0.2, b))));
};

/** Portrait with a black ribbon, for the memory beat. */
const Portrait: React.FC<{t: number}> = ({t}) => {
  if (!inScene('memory', t)) return null;
  const e = eo3(prog(t, SC.memory.frm + 0.1, SC.memory.frm + 0.7));
  return (
    <div style={{position: 'absolute', left: '50%', top: 330, transform: `translateX(-50%) rotate(-2deg) scale(${0.92 + 0.08 * e})`, opacity: e}}>
      <div style={{width: 520, padding: 26, background: '#1A1310', boxShadow: '0 20px 60px rgba(0,0,0,0.7)', position: 'relative'}}>
        <div style={{height: 560, background: 'radial-gradient(circle at 50% 38%, #C9B48E 0 22%, #6B5A44 23% 46%, #3A2F24 47%)', filter: 'sepia(0.8) contrast(0.9)'}} />
        <div style={{position: 'absolute', right: -30, top: 40, width: 230, height: 46, background: '#000', transform: 'rotate(45deg)'}} />
        <div style={{textAlign: 'center', marginTop: 18, fontFamily: MONO, color: '#D8CBB0', fontSize: 28}}>Колесников Н. П.</div>
        <div style={{textAlign: 'center', fontFamily: MONO, color: '#9A8C70', fontSize: 24}}>1952 — 2025</div>
      </div>
    </div>
  );
};

/** Round peephole: black outside a slightly soft circle. */
const Peephole: React.FC<{t: number}> = ({t}) =>
  inScene('peep', t) ? (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 42% , rgba(0,0,0,0) 0 400px, rgba(0,0,0,0.85) 470px, #000 520px)'}} />
  ) : null;

const Overlays: React.FC<{t: number}> = ({t}) => {
  const bell = inScene('door2', t) ? 13 + Math.floor((t - SC.door2.frm) / 1.25) : 0;
  return (
    <>
      <TopTag t={t} until={MSGS[0].at - 0.85} title={SERIES} sub="ЧАСТЬ 1 · НЕ ОТКРЫВАЙ" />
      {inScene('block', t) && (
        <Pill t={t} at={L(3) + 1.2} until={SC.block.to} x={project('block', k('block', t), [2.25, 13.4, 1.52]).x} y={project('block', k('block', t), [2.25, 13.4, 1.52]).y} text="9 этаж" bg="#3D6FD8" size={30} />
      )}
      <Pill t={t} at={L(3) + 0.3} until={SC.block.to} x={540} y={300} text="живу один" bg="rgba(20,22,30,0.85)" size={28} />
      <Pill t={t} at={L(7) + 0.3} until={SC.door.to} x={540} y={300} text="01:07 · звонок в дверь" bg={RED} size={30} />
      <Peephole t={t} />
      <Pill t={t} at={L(8) + 1.6} until={SC.peep.to} x={540} y={330} text="сосед · дядя Коля" bg="#D9792B" size={30} />
      {inScene('peep', t) && (
        <Pill t={t} at={L(8) + 4.2} until={SC.peep.to} x={project('peep', 0, [0.33, 1.25, 0.05]).x + 40} y={project('peep', 0, [0.33, 1.25, 0.05]).y - 60} text="пустая" bg="rgba(255,255,255,0.92)" fg="#111" size={26} />
      )}
      <Portrait t={t} />
      <Pill t={t} at={SC.door2.frm + 0.2} until={L(14) - 0.1} x={540} y={300} text={`звонок · ${bell}-й раз`} bg={RED} size={30} />
      <Glitch t={t} at={SC.voice.frm} dur={0.3} />
      <Pill t={t} at={L(17) + 0.2} until={SC.voice.to} x={540} y={330} text="мой голос" bg={RED} size={30} />
      <Chat t={t} msgs={MSGS} show={chatShow(t)} />
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
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 104, color: RED, opacity: e, transform: `scale(${1.1 - 0.1 * e})`, letterSpacing: 3}}>ТВОЯ ОЧЕРЕДЬ</div>
    </AbsoluteFill>
  );
};

export const Messages1: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const banner = SC.banner;
  const end = SC.end;
  const inBanner = (t >= banner.frm && t < banner.to) || t >= end.frm;
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
      <Sequence from={Math.round(banner.frm * FPS)} durationInFrames={Math.round((banner.to - banner.frm) * FPS)} name="banner">
        <BannerCard t={t - banner.frm} d={banner.to - banner.frm} variant="mid" series={SERIES} />
      </Sequence>
      <Sequence from={Math.round(end.frm * FPS)} name="end">
        {t - end.frm < END_TITLE ? <EndTitle t={t - end.frm} /> : <BannerCard t={t - end.frm - END_TITLE} d={1e9} variant="end" series={SERIES} />}
      </Sequence>
      {!inBanner && <Captions t={t} chunks={CHUNKS} />}
      {t >= end.frm && t - end.frm < END_TITLE && <Captions t={t} chunks={CHUNKS} y={1250} />}
    </AbsoluteFill>
  );
};

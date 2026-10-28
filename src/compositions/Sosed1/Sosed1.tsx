import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {FPS, H, W} from '../../style/tokens';
import {eo3, prog} from '../../style/ease';
import data from './timeline.json';
import {SceneProps} from '../Messages1/Scenes';
import {Chat, ChatMsg} from '../Messages1/Chat';
import {Push} from '../Messages1/Push';
import {BannerCard, Captions, FONT, Glitch, Line, MONO, Pill, RED, TopTag, Vignette, buildChunks} from '../Polar7/Overlays';
import {Answer, Knock, Reading, Roof, Silence, Sofa, WindowShot} from './Scenes';

/*
 * «Сосед сверху», part 1: someone knocks Morse on the radiator from above, and above the top
 * floor there is only the roof. First episode in the new look (vinyl toys in a Soviet diorama).
 * Nazar asked for it as tight as possible: no pauses, pressure from frame one, ~34 s.
 * Timings come from legacy/python/sosed1.py, which writes timeline.json from the voiceover.
 */

export const DURATION: number = data.duration;
const SERIES = 'СОСЕД СВЕРХУ';
const LINES = data.lines as Line[];
const MSGS = data.chat as ChatMsg[];
const SC = Object.fromEntries(data.scenes.map((s) => [s.id, s])) as Record<string, {id: string; frm: number; to: number}>;
const L = (n: number) => LINES[n - 1].at;
const END_TITLE = 2.0;
const PUSH = data.push as {at: number; dur: number};

const CHUNKS = buildChunks(LINES, ['knock', 'roof', 'chat2', 'answer', 'window']);

const SCENES: Record<string, React.FC<SceneProps>> = {
  knock: Knock,
  roof: Roof,
  sofa: Sofa,
  chat: (p) => <Reading {...p} id="chat" />,
  chat2: (p) => <Reading {...p} id="chat2" />,
  answer: Answer,
  silence: Silence,
  window: WindowShot,
};

const ThreeScene: React.FC<{id: string; frm: number; to: number}> = ({id, frm, to}) => {
  const frame = useCurrentFrame();
  const Comp = SCENES[id];
  return (
    <AbsoluteFill>
      <ThreeCanvas
        width={W}
        height={H}
        shadows
        gl={{antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2}}
        camera={{fov: 30, near: 0.05, far: 100}}
      >
        <Comp t={frame / FPS} d={to - frm} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

/** Knock times of «ХОЛОДНО» in Morse, the same spacing as morse_knocks() in sosed1.py. */
const MORSE = '.... --- .-.. --- -.. -. ---';
const knockTimes = (t0: number) => {
  const out: {at: number; ch: string}[] = [];
  let t = t0;
  for (const ch of MORSE) {
    if (ch === ' ') {
      out.push({at: t, ch});
      t += 0.22;
      continue;
    }
    out.push({at: t, ch});
    t += ch === '.' ? 0.13 : 0.3;
  }
  return out;
};
const KNOCKS = [knockTimes(0), knockTimes(SC.sofa.frm + 0.2)];

/** The Morse being typed out as the knocks land, the newest symbol flashing red. */
const MorseTape: React.FC<{t: number}> = ({t}) => {
  const id = t < SC.knock.to ? 0 : t >= SC.sofa.frm && t < SC.sofa.to ? 1 : -1;
  if (id < 0) return null;
  const ks = KNOCKS[id].filter((k) => k.at <= t);
  const last = ks.length ? ks[ks.length - 1].at : -1;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 84, letterSpacing: 6, color: '#fff', textShadow: '0 0 24px rgba(255,59,48,0.7), 0 4px 0 #000'}}>
      {ks.map((k, i) => (
        <span key={i} style={{color: i === ks.length - 1 && t - last < 0.12 ? RED : '#fff'}}>
          {k.ch === '.' ? '•' : k.ch === '-' ? '–' : ' '}
        </span>
      ))}
    </div>
  );
};

const chatShow = (t: number) => {
  const wins: [number, number][] = [[SC.chat.frm + 0.9, SC.chat2.to]];
  return Math.max(0, ...wins.map(([a, b]) => Math.min(prog(t, a, a + 0.3), 1 - prog(t, b - 0.2, b))));
};

const Overlays: React.FC<{t: number}> = ({t}) => (
  <>
    <TopTag t={t} until={SC.knock.to} title={SERIES} sub="ЧАСТЬ 1 · СТУК" />
    <MorseTape t={t} />
    <Pill t={t} at={0.2} until={SC.knock.to} x={540} y={1500} text="02:00 · каждую ночь" bg={RED} size={32} />
    <Pill t={t} at={SC.roof.frm + 0.3} until={SC.roof.to} x={540} y={330} text="9 этаж — последний" bg="rgba(255,255,255,0.92)" fg="#111" size={32} />
    <Pill t={t} at={L(2) + 1.4} until={SC.roof.to} x={540} y={420} text="выше — никого" bg={RED} size={32} />
    <Pill t={t} at={SC.answer.frm + 0.85} until={SC.answer.to} x={540} y={330} text="тук · тук · тук" bg="rgba(255,255,255,0.92)" fg="#111" size={34} />
    <Pill t={t} at={SC.window.frm + 1.6} until={SC.window.to} x={540} y={330} text="окно · 9 этаж" bg={RED} size={32} />
    <Glitch t={t} at={SC.roof.frm} dur={0.15} />
    <Glitch t={t} at={SC.chat2.frm} dur={0.15} />
    <Glitch t={t} at={SC.silence.frm} dur={0.2} />
    <Glitch t={t} at={L(9) + 1.0} dur={0.3} />
    <Chat t={t} msgs={MSGS} show={chatShow(t)} name="Дима" status="в сети" />
  </>
);

/** The glass knocks make the whole frame jump. */
const jolt = (t: number) => {
  const at = [0, 1, 2].map((k) => L(9) + 1.05 + k * 0.28);
  const h = Math.max(0, ...at.map((a) => 1 - Math.abs(t - a) / 0.08));
  return h ? `translate(${Math.sin(t * 90) * 14 * h}px, ${Math.cos(t * 70) * 10 * h}px)` : undefined;
};

const EndTitle: React.FC<{t: number}> = ({t}) => {
  const e = eo3(prog(t, 0, 0.4));
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)'}}>
      <div style={{position: 'absolute', top: 520, width: '100%', textAlign: 'center'}}>
        <div style={{fontFamily: MONO, fontSize: 40, color: '#aaa', opacity: e, marginBottom: 10}}>часть 2</div>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 110, color: RED, opacity: e, transform: `scale(${1.1 - 0.1 * e})`, letterSpacing: 3, textShadow: '0 6px 30px #000'}}>ОН ВОШЁЛ?</div>
      </div>
    </AbsoluteFill>
  );
};

export const Sosed1: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const end = SC.end;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: jolt(t)}}>
        {data.scenes
          .filter((s) => SCENES[s.id])
          .map((s) => (
            <Sequence key={s.id} from={Math.round(s.frm * FPS)} durationInFrames={Math.round((s.to - s.frm) * FPS)} name={s.id}>
              <ThreeScene id={s.id} frm={s.frm} to={s.to} />
            </Sequence>
          ))}
        <Sequence from={Math.round(end.frm * FPS)} durationInFrames={Math.round(END_TITLE * FPS)} name="end-window">
          <AbsoluteFill>
            <ThreeCanvas width={W} height={H} shadows gl={{antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2}} camera={{fov: 30, near: 0.05, far: 100}}>
              <WindowShot t={t - end.frm} d={END_TITLE} end />
            </ThreeCanvas>
          </AbsoluteFill>
        </Sequence>
      </AbsoluteFill>
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

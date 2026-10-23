import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {FPS, H, W} from '../../style/tokens';
import {eo3, prog} from '../../style/ease';
import data from './timeline.json';
import {LastMsg, PhoneOnBed, SceneProps, project} from '../Messages1/Scenes';
import {Behind, HallPhone, Hallway, SLIPPERS} from './Scenes';
import {Chat, ChatMsg} from '../Messages1/Chat';
import {Push} from '../Messages1/Push';
import {BannerCard, Captions, FONT, Glitch, Line, MONO, Pill, RED, TopTag, Vignette, buildChunks} from '../Polar7/Overlays';

/*
 * «Переписка», part 2 «Твоя очередь»: he finds out who wrote to him and sends the first message
 * himself, ten minutes into the past. Ads as in part 1: a silent push mid-story, the banner at the end.
 * Timings come from legacy/python/messages2.py, which writes timeline.json from the voiceover.
 */

export const DURATION: number = data.duration;
const SERIES = 'ПЕРЕПИСКА';
const LINES = data.lines as Line[];
// his replies land at 01:04, the time part 1 opened with
const MSGS = (data.chat as ChatMsg[]).map((m) => (m.side === 'out' ? {...m, time: '01:04'} : m));
const SC = Object.fromEntries(data.scenes.map((s) => [s.id, s])) as Record<string, {id: string; frm: number; to: number}>;
const L = (n: number) => LINES[n - 1].at;
const END_TITLE = 3.4;
const PUSH = data.push as {at: number; dur: number};

const CHUNKS = buildChunks(LINES, ['quiet', 'bedroom', 'wake', 'behind']);

const SCENES: Record<string, React.FC<SceneProps>> = {
  reread: (p) => <LastMsg {...p} id="reread" />,
  quiet: (p) => <Hallway {...p} id="quiet" feet={1 - eo3(prog(p.t, 0.6, 2.2))} />,
  chat: HallPhone,
  prints: (p) => <Hallway {...p} id="prints" prints={1 + p.t * 2.2} />,
  roomdoor: (p) => <Hallway {...p} id="roomdoor" prints={9} buzz />,
  bedroom: (p) => <PhoneOnBed {...p} id="bedroom" prints />,
  send: (p) => <LastMsg {...p} id="send" />,
  wake: (p) => <PhoneOnBed {...p} id="wake" buzz={1} eyes={eo3(prog(p.t, 1.6, 2.4))} />,
  behind: Behind,
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
const TAG_UNTIL = 1.8;

/** How much the chat card is on screen. */
const chatShow = (t: number) => {
  const wins: [number, number][] = [
    [TAG_UNTIL, SC.reread.to],
    [SC.chat.frm, SC.chat.to],
    [L(11), SC.bedroom.to],
    [SC.send.frm, SC.send.to],
  ];
  return Math.max(0, ...wins.map(([a, b]) => Math.min(prog(t, a, a + 0.3), 1 - prog(t, b - 0.2, b))));
};

const Overlays: React.FC<{t: number}> = ({t}) => {
  const at = (id: string, p: [number, number, number]) => project(id, k(id, t), p);
  return (
    <>
      <TopTag t={t} until={TAG_UNTIL} title={SERIES} sub="ЧАСТЬ 2 · ТВОЯ ОЧЕРЕДЬ" />
      <Pill t={t} at={L(2) + 0.3} until={SC.quiet.to} x={540} y={300} text="01:14 · тишина" bg="rgba(20,22,30,0.85)" size={30} />
      {inScene('prints', t) && (
        <>
          <Pill t={t} at={L(7) + 1.8} until={SC.prints.to} x={at('prints', [0.5, 0, -0.55]).x} y={at('prints', [0.5, 0, -0.55]).y - 70} text="босые" bg="rgba(255,255,255,0.92)" fg="#111" size={28} />
          <Pill t={t} at={L(8) + 1.0} until={SC.prints.to} x={at('prints', SLIPPERS).x} y={at('prints', SLIPPERS).y - 70} text="тапки дяди Коли" bg="#D9792B" size={28} />
        </>
      )}
      {inScene('bedroom', t) && t < L(11) && (
        <Pill t={t} at={L(10) + 1.6} until={L(11) - 0.1} x={at('bedroom', [-0.1, 0.75, -0.68]).x} y={at('bedroom', [-0.1, 0.75, -0.68]).y - 90} text="это я" bg={RED} size={30} />
      )}
      <Pill t={t} at={MSGS[5].at + 0.6} until={SC.send.to} x={540} y={760} text="отправлено · 01:04" bg="#3D6FD8" size={28} />
      <Glitch t={t} at={SC.bedroom.frm} dur={0.25} />
      <Glitch t={t} at={SC.behind.frm} dur={0.35} />
      <Chat t={t} msgs={MSGS} show={chatShow(t)} clockFrom={13} />
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
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 104, color: RED, opacity: e, transform: `scale(${1.1 - 0.1 * e})`, letterSpacing: 3}}>ЗА СПИНОЙ</div>
    </AbsoluteFill>
  );
};

export const Messages2: React.FC = () => {
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

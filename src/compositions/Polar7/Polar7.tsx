import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {FPS, H, W} from '../../style/tokens';
import {eo3, prog} from '../../style/ease';
import data from './timeline.json';
import {Bunks, Coats, Gena, Journal, Mugs, OneMug, Outside, RadioCorner, SceneProps, project} from './Scenes';
import {BannerCard, Captions, FONT, Glitch, Line, MONO, PaperNote, Pill, RED, Readout, Stamp, TopTag, Vignette, buildChunks} from './Overlays';

/*
 * Polar7, part 1 «Четвёртая кружка»: a dark survival story in the format of the trending
 * 3D-figurine series, with the JetnodeVPN banner once in the middle and once at the end.
 * Timings come from legacy/python/polar7.py (it writes timeline.json from the voiceover).
 */

export const DURATION: number = data.duration;
const LINES = data.lines as Line[];
const SC = Object.fromEntries(data.scenes.map((s) => [s.id, s])) as Record<string, {id: string; frm: number; to: number}>;
/** Start of voiceover line n (1-based), the anchor for every overlay. */
const L = (n: number) => LINES[n - 1].at;
const LE = (n: number) => LINES[n - 1].at + LINES[n - 1].dur;
const END_TITLE = 3.4; // part-2 title card before the end banner

const CHUNKS = buildChunks(
  LINES.filter((l) => l.scene !== 'banner'),
  ['mugs', 'note', 'coats', 'behind']
);

const SCENES: Record<string, React.FC<SceneProps>> = {
  mugs: Mugs,
  outside: Outside,
  radio: (p) => <RadioCorner {...p} />,
  gena: Gena,
  mug: OneMug,
  journal: Journal,
  note: (p) => <Journal {...p} cam="note" />,
  bunks: Bunks,
  coats: Coats,
  radio2: (p) => (
    <RadioCorner
      {...p}
      cam="radio2"
      on={prog(SC.radio2.frm + p.t, L(17) - 0.3, L(17))}
      reach={eo3(prog(SC.radio2.frm + p.t, L(19), L(19) + 0.6))}
    />
  ),
  behind: (p) => (
    <RadioCorner
      {...p}
      cam="behind"
      on={1}
      reach={1}
      flicker={0.55 + 0.45 * (Math.floor(p.t * 9) % 7 === 0 ? 0.2 : 1)}
      guest={eo3(prog(p.t, 0.2, p.d * 0.8))}
    />
  ),
};

/** Screen point of a 3D spot in scene `id` at global time t. */
const at3 = (id: string, t: number, p: [number, number, number]) => project(id, (t - SC[id].frm) / (SC[id].to - SC[id].frm), p);

const ThreeScene: React.FC<{id: string; frm: number; to: number}> = ({id, frm, to}) => {
  const frame = useCurrentFrame();
  const Comp = SCENES[id];
  const t = frame / FPS;
  return (
    <ThreeCanvas
      width={W}
      height={H}
      shadows
      gl={{antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15}}
      camera={{fov: 40, near: 0.05, far: 100}}
    >
      <Comp t={t} d={to - frm} />
    </ThreeCanvas>
  );
};

/** Overlays per scene, on the global clock. */
const MUGS: [number, number, number][] = [
  [-0.28, 1.08, 0.32],
  [0.26, 1.08, 0.12],
  [-0.22, 1.08, -0.16],
  [0.3, 1.08, -0.38],
];
const BAGS: [number, number, number][] = [
  [-0.4, 1.05, -1.6],
  [-0.4, 1.05, -0.4],
  [-0.4, 1.05, 0.8],
];
const COATS: [number, number, number][] = [
  [-1.1, 2.3, -1.73],
  [-0.25, 2.3, -1.73],
  [0.55, 2.3, -1.73],
  [1.3, 2.3, -1.73],
];

const Overlays: React.FC<{t: number}> = ({t}) => (
  <>
    <TopTag t={t} until={L(2) - 0.1} title="ПОЛЯРНАЯ-7" sub="ЧАСТЬ 1 · ЧЕТВЁРТАЯ КРУЖКА" />
    {/* mugs: count them */}
    {MUGS.map((m, i) => {
      if (t < SC.mugs.frm || t >= SC.mugs.to) return null;
      const q = at3('mugs', t, m);
      return <Pill key={i} t={t} at={L(2) + 0.9 + i * 0.22} until={SC.mugs.to} x={q.x} y={q.y} text={String(i + 1)} bg={i === 3 ? RED : 'rgba(255,255,255,0.92)'} fg={i === 3 ? '#fff' : '#111'} size={34} />;
    })}
    {/* outside */}
    <Pill t={t} at={L(3) + 0.2} until={SC.outside.to} x={540} y={300} text="−38° за бортом" />
    <Pill t={t} at={L(4) + 0.3} until={SC.outside.to} x={540} y={380} text="вертолёт · март" bg="rgba(20,22,30,0.85)" size={26} />
    {/* radio */}
    <PaperNote t={t} at={SC.radio.frm + 0.2} until={SC.radio.to} y={230} header="РАСПИСАНИЕ · ПОЛЯРНАЯ-7" lines={[{at: L(5) + 0.3, text: 'Сеанс связи: 1 раз в сутки'}, {at: L(5) + 1.8, text: '21:00 — материк', red: true}]} />
    {/* Gena */}
    <Pill t={t} at={L(6) + 1.0} until={SC.gena.to} x={540} y={300} text="Гена · механик" bg="#D9792B" />
    <Pill t={t} at={L(7) + 0.6} until={SC.gena.to} x={540} y={380} text="«я спал»" bg="rgba(20,22,30,0.85)" size={28} />
    {/* the mug */}
    <Readout t={t} at={L(8) + 0.8} until={SC.mug.to} x={110} y={330} label="кружка №4" value="41°" />
    {/* journal */}
    <PaperNote
      t={t}
      at={SC.journal.frm + 0.2}
      until={SC.journal.to}
      y={220}
      header="ЖУРНАЛ · ПОЛЯРНАЯ-7 · 1987"
      lines={[
        {at: L(9) + 0.8, text: 'День 112.'},
        {at: L(9) + 2.2, text: 'Нас: 3'},
        {at: L(9) + 3.2, text: 'Топливо: 640 л'},
        {at: L(9) + 4.4, text: 'Еда: 38 дней'},
        {at: L(10) + 0.9, text: 'Нас четверо. Не говорите материку.', hand: true, blur: true},
      ]}
    />
    <Stamp t={t} at={L(11) + 0.4} until={SC.journal.to} x={560} y={900} text="почерк не мой" />
    {/* the note, after the banner */}
    <PaperNote
      t={t}
      at={SC.note.frm + 0.05}
      until={SC.note.to}
      y={300}
      w={900}
      scale={1.05}
      header="ЖУРНАЛ · ДЕНЬ 112"
      lines={[
        {at: SC.note.frm + 0.1, text: 'Нас: 3\nТопливо: 640 л\nЕда: 38 дней'},
        {at: L(13) + 1.2, text: 'Нас четверо.', hand: true},
        {at: L(13) + 2.3, text: 'Не говорите материку.', hand: true},
      ]}
      cps={40}
    />
    {/* bunks */}
    {BAGS.map((m, i) => {
      if (t < SC.bunks.frm || t >= SC.bunks.to) return null;
      const q = at3('bunks', t, m);
      return <Pill key={i} t={t} at={L(14) + 1.4 + i * 0.3} until={SC.bunks.to} x={q.x} y={q.y} text={String(i + 1)} bg="rgba(255,255,255,0.92)" fg="#111" size={34} />;
    })}
    {/* coats */}
    {COATS.map((m, i) => {
      if (t < SC.coats.frm || t >= SC.coats.to) return null;
      const q = at3('coats', t, m);
      return <Pill key={i} t={t} at={L(15) + 1.2 + i * 0.25} until={SC.coats.to} x={q.x} y={q.y} text={String(i + 1)} bg={i === 3 ? RED : 'rgba(255,255,255,0.92)'} fg={i === 3 ? '#fff' : '#111'} size={34} />;
    })}
    {t >= SC.coats.frm && t < SC.coats.to && (
      <Pill t={t} at={L(16) + 0.4} until={SC.coats.to} x={at3('coats', t, [1.3, 1.0, -1.6]).x} y={at3('coats', t, [1.3, 1.0, -1.6]).y} text="мокрая" bg="#3D6FD8" size={28} />
    )}
    {/* radio, part 2 */}
    <Readout t={t} at={L(17) - 0.2} until={SC.radio2.to} x={110} y={300} label="21:00" value="ПРИЁМ" color="#7CFFB0" />
    <Glitch t={t} at={L(18) - 0.15} />
    <PaperNote t={t} at={L(18) - 0.05} until={SC.radio2.to} y={400} rot={1} header="РАЦИЯ · МАТЕРИК" lines={[{at: L(18), text: 'ПОЛЯРНАЯ-7, ЭТО МАТЕРИК.\nКАК ОБСТАНОВКА?'}]} cps={18} />
    {/* behind */}
    <Glitch t={t} at={L(21) - 0.1} dur={0.35} />
    <Pill t={t} at={L(21) + 0.1} until={SC.behind.to} x={540} y={330} text="голос за спиной" bg={RED} size={28} />
  </>
);

/** Last scene: part-2 title card, then the end banner. */
const EndTitle: React.FC<{t: number}> = ({t}) => {
  const k = eo3(prog(t, 0, 0.5));
  return (
    <AbsoluteFill style={{background: '#06070A', alignItems: 'center', justifyContent: 'center'}}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{position: 'absolute', left: 0, right: 0, top: 700 + i * 150, height: 4, background: i % 2 ? 'rgba(255,59,48,0.35)' : 'rgba(80,200,255,0.25)', transform: `translateX(${(i % 2 ? -1 : 1) * 300 * (1 - k)}px)`}} />
      ))}
      <div style={{fontFamily: MONO, fontSize: 40, color: '#888', opacity: k, marginBottom: 10}}>часть 2</div>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 120, color: RED, opacity: k, transform: `scale(${1.1 - 0.1 * k})`, letterSpacing: 4}}>ЧЕТВЁРТЫЙ</div>
    </AbsoluteFill>
  );
};

export const Polar7: React.FC = () => {
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
        <BannerCard t={t - banner.frm} d={banner.to - banner.frm} variant="mid" />
      </Sequence>
      <Sequence from={Math.round(end.frm * FPS)} name="end">
        {t - end.frm < END_TITLE ? <EndTitle t={t - end.frm} /> : <BannerCard t={t - end.frm - END_TITLE} d={1e9} variant="end" />}
      </Sequence>
      {!inBanner && <Captions t={t} chunks={CHUNKS} />}
      {t >= end.frm && t - end.frm < END_TITLE && <Captions t={t} chunks={CHUNKS} y={1250} />}
    </AbsoluteFill>
  );
};

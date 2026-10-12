import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../style/tokens';
import {eback, eio, eo3, lerp, press, prog} from '../style/ease';
import {Plane, Txt} from '../components/Primitives';
import {Check, Power} from '../components/Icons';
import {StatusBar} from './Common';
import {TAP3} from '../compositions/JetnodePromo/timeline';

const mix = (a: number[], b: number[], k: number) => a.map((v, i) => lerp(v, b[i], k));
const rgba = (c: number[]) => `rgba(${c[0]},${c[1]},${c[2]},${c[3]})`;

/** The app after the deeplink: splash → toast «Подписка добавлена» → connect. */
export const AppHome: React.FC<{t: number}> = ({t}) => {
  const sp = eback(prog(t, 6.85, 7.2), 1.4);
  const mv = eio(prog(t, 7.25, 7.6));
  const ui = eo3(prog(t, 7.35, 7.7));
  const con = eo3(prog(t, TAP3 + 0.05, TAP3 + 0.35));
  const pr = press(t, TAP3);
  const tk = eback(prog(t, 7.65, 8.0), 1.3) * (1 - eio(prog(t, 9.4, 9.7)));
  const by = 640;
  const btn = rgba(mix([255, 255, 255, 0.12 * ui], [134, 232, 168, 1], con));
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #081A42, #1D55B5)'}}>
      <StatusBar dark />
      <Txt x={110} y={110} size={32} weight={600} color={C.white} opacity={ui}>
        Jetnode<span style={{color: C.mint}}>VPN</span>
      </Txt>
      {/* connect button */}
      <div style={{position: 'absolute', left: 302, top: by, transform: `scale(${lerp(0.85, 1, ui)})`, opacity: ui}}>
        {con > 0 && (
          <>
            <div style={{position: 'absolute', left: -300, top: -300, width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, rgba(134,232,168,${0.45 * con}) 33%, rgba(134,232,168,0) 70%)`}} />
            {[0, 1, 2].map((i) => {
              const q = ((t - TAP3) * 0.8 + i / 3) % 1;
              const r = 160 + 140 * q;
              return <div key={i} style={{position: 'absolute', left: -r, top: -r, width: 2 * r, height: 2 * r, borderRadius: '50%', border: `3px solid rgba(134,232,168,${0.35 * (1 - q) * con})`}} />;
            })}
          </>
        )}
        <div style={{position: 'absolute', left: -180, top: -180, width: 360, height: 360, borderRadius: '50%', border: '5px solid rgba(255,255,255,0.10)', boxSizing: 'border-box'}} />
        <div
          style={{
            position: 'absolute',
            left: -140,
            top: -140,
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.35), rgba(255,255,255,0) 70%), ${btn}`,
            border: '2.5px solid rgba(255,255,255,0.5)',
            boxSizing: 'border-box',
            transform: `scale(${1 - 0.06 * pr})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Power size={128} color={con > 0.5 ? C.navy : '#fff'} />
        </div>
      </div>
      <Txt x={302} y={by + 250} size={34} weight={500} color={C.white} anchor="c" opacity={0.6 * ui * (1 - con)}>
        Не подключено
      </Txt>
      <Txt x={302} y={by + 250} size={34} weight={600} color={C.mint} anchor="c" opacity={con}>
        Подключено
      </Txt>
      {con > 0 && (
        <Txt x={302} y={by + 300} size={26} weight={400} color={C.white} anchor="c" opacity={0.6 * con}>
          00:00:{String(Math.floor(Math.max(0, t - TAP3))).padStart(2, '0')}
        </Txt>
      )}
      <div style={{position: 'absolute', left: 60, top: 1284 - 210, width: 484, height: 100, borderRadius: 50, background: `rgba(255,255,255,${0.1 * ui})`}} />
      <div style={{position: 'absolute', left: 92, top: 1284 - 184, width: 48, height: 48, borderRadius: 24, background: C.mint, opacity: ui}} />
      <Txt x={156} y={1284 - 160} size={28} weight={500} color={C.white} opacity={ui}>
        Лучший сервер
      </Txt>
      <Txt x={500} y={1284 - 160} size={24} weight={400} color={C.mint} anchor="c" opacity={ui}>
        авто
      </Txt>
      {/* splash plane that becomes the header logo */}
      <Plane x={lerp(302, 70, mv)} y={lerp(560, 110, mv)} width={lerp(240, 52, mv) * sp} />
      {/* toast */}
      {tk > 0.001 && (
        <div
          style={{
            position: 'absolute',
            left: 24,
            top: lerp(-160, 190, tk),
            width: 556,
            height: 130,
            borderRadius: 30,
            background: 'linear-gradient(100deg, #FFFFFF, #E9F0FF)',
            boxShadow: '0 0 28px rgba(255,255,255,0.28), 0 24px 48px rgba(0,0,30,0.35)',
          }}
        >
          <div style={{position: 'absolute', left: 34, top: 31, width: 68, height: 68, borderRadius: 34, background: C.mint, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Check size={44} p={prog(t, 7.8, 8.1)} color={C.navy} stroke={6} />
          </div>
          <Txt x={122} y={46} size={28} weight={600}>
            Подписка добавлена
          </Txt>
          <Txt x={122} y={88} size={22} weight={400} color={C.gray}>
            JetnodeVPN · пробный период 3 дня
          </Txt>
        </div>
      )}
    </AbsoluteFill>
  );
};

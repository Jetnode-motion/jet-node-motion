import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../style/tokens';
import {clamp, pop, press, prog} from '../style/ease';
import {Plane, Txt} from '../components/Primitives';
import {Plate} from '../components/Plate';
import {Check} from '../components/Icons';
import {StatusBar} from './Common';
import {B1, B2, TAP1, TAP2} from '../compositions/JetnodePromo/timeline';

const Bubble: React.FC<{x: number; y: number; w: number; h: number; bg: string; k: number; right?: boolean; children: React.ReactNode}> = ({
  x,
  y,
  w,
  h,
  bg,
  k,
  right,
  children,
}) =>
  k <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 26,
        background: bg,
        boxShadow: '0 4px 14px rgba(40,60,90,0.10)',
        transform: `scale(${k})`,
        transformOrigin: right ? '100% 100%' : '0% 100%',
        filter: k < 1 ? `blur(${8 * (1 - Math.min(1, k))}px)` : undefined,
        opacity: Math.min(1, k * 1.5),
      }}
    >
      {children}
    </div>
  );

/** Telegram-like inline button. `solid` = the deeplink button in plate style. */
const BotButton: React.FC<{r: typeof B1; label: string; k: number; t: number; tap: number; solid?: boolean; glow?: number}> = ({
  r,
  label,
  k,
  t,
  tap,
  solid,
  glow = 0,
}) => {
  if (k <= 0) return null;
  const s = k * (1 - 0.06 * press(t, tap));
  const flash = t >= tap ? clamp(1 - (t - tap) / 0.3) : 0;
  const text = (
    <span style={{fontWeight: solid ? 600 : 500, fontSize: 28, color: '#fff', position: 'relative'}}>{label}</span>
  );
  return (
    <div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, transform: `scale(${s})`}}>
      {solid ? (
        <Plate width={r.w} height={r.h} radius={20} glow={`rgba(97,115,244,${0.35 + 0.3 * glow})`} shadow={0.18} corner={0.35}>
          {text}
        </Plate>
      ) : (
        <div style={{width: '100%', height: '100%', borderRadius: 20, background: 'rgba(126,156,196,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          {text}
        </div>
      )}
      <div style={{position: 'absolute', inset: 0, borderRadius: 20, background: '#fff', opacity: (solid ? 0.25 : 0.35) * flash}} />
    </div>
  );
};

export const Chat: React.FC<{t: number}> = ({t}) => {
  const glow = (0.6 + 0.4 * Math.sin(t * 9)) * prog(t, 5.2, 5.5) * (1 - prog(t, TAP2, TAP2 + 0.1));
  return (
    <AbsoluteFill style={{background: 'linear-gradient(135deg, #C9DCEC, #DCE8D2)'}}>
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.35) 3px, transparent 3.5px)', backgroundSize: '70px 70px', top: 150}} />
      {/* header */}
      <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: 150, background: 'rgba(255,255,255,0.96)'}} />
      <StatusBar />
      <svg style={{position: 'absolute', left: 26, top: 86}} width={30} height={44} viewBox="0 0 30 44">
        <path d="M20 6 L6 22 L20 38" fill="none" stroke="#5B8DEF" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{position: 'absolute', left: 78, top: 76, width: 64, height: 64, borderRadius: 32, background: 'linear-gradient(135deg, #0A1E4A, #3D7EDB)'}}>
        <Plane x={32} y={32} width={44} />
      </div>
      <Txt x={158} y={94} size={28} weight={600}>
        JetnodeVPN
      </Txt>
      <Txt x={158} y={126} size={22} weight={400} color={C.gray}>
        бот
      </Txt>

      <Bubble x={430} y={190} w={150} h={66} bg="#E1F7CB" k={pop(t, 2.55)} right>
        <Txt x={75} y={33} size={26} anchor="c">
          /start
        </Txt>
      </Bubble>
      <Bubble x={24} y={280} w={470} h={150} bg="#fff" k={pop(t, 2.95)}>
        <Txt x={26} y={46} size={27} weight={600}>
          Привет! Это JetnodeVPN
        </Txt>
        <Txt x={26} y={92} size={27} weight={400}>
          Дарим <span style={{color: C.peri}}>3 дня бесплатно</span>
        </Txt>
        <Txt x={416} y={128} size={18} weight={400} color={C.gray}>
          12:01
        </Txt>
      </Bubble>
      <BotButton r={B1} label="Попробовать бесплатно" k={pop(t, 3.2)} t={t} tap={TAP1} />
      <Bubble x={24} y={540} w={470} h={150} bg="#fff" k={pop(t, 4.75)}>
        <Txt x={26} y={46} size={27} weight={600}>
          Подписка активна
        </Txt>
        <div style={{position: 'absolute', left: 290, top: 26}}>
          <Check size={40} p={prog(t, 4.9, 5.2)} color={C.green} stroke={5} />
        </div>
        <Txt x={26} y={92} size={27} weight={400} opacity={0.7}>
          Осталось: 3 дня
        </Txt>
        <Txt x={416} y={128} size={18} weight={400} color={C.gray}>
          12:01
        </Txt>
      </Bubble>
      <BotButton r={B2} label="Подключиться в 1 клик" k={pop(t, 4.95)} t={t} tap={TAP2} solid glow={glow} />

      {/* input bar */}
      <div style={{position: 'absolute', left: 0, bottom: 0, width: '100%', height: 110, background: 'rgba(255,255,255,0.96)'}} />
      <div style={{position: 'absolute', left: 24, bottom: 30, width: 470, height: 60, borderRadius: 30, background: '#F2F2F7'}} />
      <Txt x={52} y={1284 - 60} size={24} weight={400} color={C.gray}>
        Сообщение
      </Txt>
      <div style={{position: 'absolute', left: 510, bottom: 30, width: 60, height: 60, borderRadius: 30, background: '#5B8DEF'}} />
    </AbsoluteFill>
  );
};

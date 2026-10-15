import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';
import {FPS} from '../../style/tokens';
import {clamp, eo3, eio, lerp, prog} from '../../style/ease';
import {Card, cascade} from '../../components/Reveal';
import {DURATION, SCENES, SUBS, XF} from './timeline';

/*
 * News explainer «Удары по дата-центрам Яндекса», 9:16, silent.
 * House style: settings file «JetnodeVPN — мои установки для видео» (light #F5F5F7, one accent #6173F4,
 * SF Pro Display, pinned headline + one block, captions at y≈1434, numbers as counter plates).
 */

// SF Pro is not committed (Apple licence): copy the .otf files into public/fonts before rendering.
const SF = 'SF Display Local';
for (const [w, f] of [
  ['400', 'Regular'],
  ['500', 'Medium'],
  ['600', 'Semibold'],
  ['700', 'Bold'],
] as const) {
  loadFont({family: SF, url: staticFile(`fonts/SF-Pro-Display-${f}.otf`), weight: w}).catch(() => undefined);
}
const FONT = `"${SF}", "SF Pro Display", "Inter Display", Inter, -apple-system, Helvetica, Arial, sans-serif`;

export const K = {
  bg: '#F5F5F7',
  peri: '#6173F4',
  ink: '#1D1D1F',
  ink2: '#6E6E73',
  foot: '#86868B',
  pill: '#E8E8ED',
};

// ---------- headline: words from blur, the accent word is "written" left to right ----------

const Headline: React.FC<{lt: number; lines: string[]}> = ({lt, lines}) => {
  let wi = 0;
  return (
    <div style={{position: 'absolute', left: 75, right: 75, top: 176, fontFamily: FONT}}>
      {lines.map((line, li) => (
        <div key={li} style={{display: 'flex', flexWrap: 'nowrap', gap: 22, fontSize: 86, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1.2, color: K.ink}}>
          {line.split(' ').map((raw, j) => {
            const acc = raw.startsWith('*');
            const w = raw.replace(/\*/g, '');
            const st = 0.15 + wi++ * 0.09;
            const e = eo3(prog(lt, st, st + 0.5));
            if (acc) {
              const wr = eio(prog(lt, st + 0.1, st + 0.75));
              return (
                <span
                  key={j}
                  style={{
                    color: K.peri,
                    clipPath: `inset(-20% ${100 - wr * 100}% -20% -2%)`,
                    filter: wr < 1 ? `blur(${4 * (1 - wr)}px)` : undefined,
                  }}
                >
                  {w}
                </span>
              );
            }
            return (
              <span key={j} style={{opacity: e, filter: e < 1 ? `blur(${12 * (1 - e)}px)` : undefined, transform: `translateY(${10 * (1 - e)}px)`, display: 'inline-block'}}>
                {w}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ---------- small building blocks ----------

const Pill: React.FC<{label: string; on: boolean; size?: number}> = ({label, on, size = 26}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      padding: `${size * 0.32}px ${size * 0.62}px`,
      borderRadius: 999,
      background: on ? 'rgba(97,115,244,0.10)' : K.pill,
      color: on ? K.peri : K.ink2,
      fontFamily: FONT,
      fontSize: size,
      fontWeight: 500,
      whiteSpace: 'nowrap',
    }}
  >
    <span style={{width: size * 0.36, height: size * 0.36, borderRadius: '50%', background: on ? K.peri : '#AEAEB2'}} />
    {label}
  </span>
);

/** Finite spinner: turns only while `active`. */
const Spinner: React.FC<{lt: number; size?: number}> = ({lt, size = 30}) => (
  <svg width={size} height={size} viewBox="0 0 30 30" style={{transform: `rotate(${lt * 420}deg)`}}>
    <circle cx="15" cy="15" r="11" stroke="#D2D2D7" strokeWidth="3.5" fill="none" />
    <path d="M15 4 A11 11 0 0 1 26 15" stroke={K.ink2} strokeWidth="3.5" fill="none" strokeLinecap="round" />
  </svg>
);

const Foot: React.FC<{y: number; children: React.ReactNode; lt: number; t0: number}> = ({y, children, lt, t0}) => {
  const e = eo3(prog(lt, t0, t0 + 0.4));
  return (
    <div style={{position: 'absolute', left: 75, right: 75, top: y, textAlign: 'center', fontFamily: FONT, fontSize: 26, color: K.foot, opacity: e, filter: e < 1 ? `blur(${6 * (1 - e)}px)` : undefined}}>
      {children}
    </div>
  );
};

/** Number plate: small label above, number counts up. */
const Counter: React.FC<{
  lt: number;
  t0: number;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  to: number;
  prefix?: string;
  suffix?: string;
  size?: number;
}> = ({lt, t0, x, y, w, h, label, to, prefix = '', suffix = '', size = 170}) => {
  const n = Math.round(to * eo3(prog(lt, t0 + 0.2, t0 + 1.4)));
  const txt = n.toLocaleString('ru-RU').replace(/\s/g, ' ');
  return (
    <Card x={x} y={y} w={w} h={h} t={lt} t0={t0} radius={44}>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT}}>
        <div style={{fontSize: 32, fontWeight: 500, color: K.ink2, marginBottom: 4}}>{label}</div>
        <div style={{fontSize: size, fontWeight: 700, color: K.ink, letterSpacing: -4, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>
          {prefix && <span style={{color: K.peri, marginRight: 14, fontSize: prefix.length > 1 ? size * 0.42 : size, fontWeight: 600, letterSpacing: 0}}>{prefix}</span>}
          {txt}
          {suffix && <span style={{fontSize: size * 0.34, fontWeight: 600, letterSpacing: 0, marginLeft: 16, color: K.ink2}}>{suffix}</span>}
        </div>
      </div>
    </Card>
  );
};

// ---------- scene contents (local time lt from the scene start) ----------

const DC = [
  {city: 'Сасово', reg: 'Рязанская обл.', date: '8 окт', end: 'Остановлен', at: 1.5},
  {city: 'Калуга', reg: 'Калужская обл.', date: '9 окт', end: 'Частично', at: 2.1},
  {city: 'Владимир', reg: 'Владимирская обл.', date: '11 окт', end: 'Остановлен', at: 2.7},
];

const S1: React.FC<{lt: number}> = ({lt}) => (
  <>
    {DC.map((d, i) => {
      const y = 540 + i * 220;
      const down = lt >= d.at;
      return (
        <Card key={d.city} x={140} y={y} w={800} h={186} t={lt} t0={cascade(0.55, i, 0.12)} radius={40} live={down ? 0.75 : 1}>
          <div style={{position: 'absolute', inset: '0 44px', display: 'flex', alignItems: 'center', fontFamily: FONT}}>
            <div style={{width: 22, height: 22, borderRadius: '50%', background: down ? '#AEAEB2' : K.peri, marginRight: 30}} />
            <div style={{flex: 1}}>
              <div style={{fontSize: 52, fontWeight: 600, color: K.ink, letterSpacing: -0.6}}>{d.city}</div>
              <div style={{fontSize: 28, color: K.ink2, marginTop: 2}}>
                {d.reg} · {d.date}
              </div>
            </div>
            {!down && lt > d.at - 0.6 ? <Spinner lt={lt} /> : <Pill label={down ? d.end : 'Работает'} on={!down} />}
          </div>
        </Card>
      );
    })}
    <Foot y={1222} lt={lt} t0={3.0}>
      удары беспилотников, 8–11 октября 2026
    </Foot>
  </>
);

const S2: React.FC<{lt: number}> = ({lt}) => (
  <>
    <Counter lt={lt} t0={0.5} x={160} y={560} w={760} h={320} label="сервисов облачной платформы" to={84} />
    <Counter lt={lt} t0={1.2} x={160} y={910} w={760} h={320} label="клиентов Yandex Cloud" to={64000} prefix="≈" size={150} />
    <Foot y={1258} lt={lt} t0={2.2}>
      по данным Хабра; новые ресурсы в облаке ограничены
    </Foot>
  </>
);

const SERVICES = ['Пэй', 'Директ', 'Метрика', 'Диск', 'Телемост', 'Лавка'];
const S3: React.FC<{lt: number}> = ({lt}) => (
  <>
    {SERVICES.map((s, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const at = 1.5 + i * 0.22;
      return (
        <Card key={s} x={125 + col * 430} y={540 + row * 230} w={400} h={200} t={lt} t0={cascade(0.5, i, 0.08)} radius={38} live={lt >= at ? 0.8 : 1}>
          <div style={{position: 'absolute', inset: '0 34px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, fontFamily: FONT}}>
            <div style={{fontSize: 24, color: K.foot, fontWeight: 500}}>Яндекс</div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div style={{fontSize: 46, fontWeight: 600, color: K.ink, letterSpacing: -0.5}}>{s}</div>
              {lt < at ? <Spinner lt={lt} size={28} /> : <Pill label="сбой" on={false} size={24} />}
            </div>
          </div>
        </Card>
      );
    })}
    <Foot y={1242} lt={lt} t0={2.6}>
      статус на 12 октября, у части пользователей
    </Foot>
  </>
);

const PARTNERS = [
  {n: 'Магнит', k: 'ритейл'},
  {n: 'М.Видео', k: 'ритейл'},
  {n: 'Ламода', k: 'маркетплейс'},
  {n: 'Дом.ру', k: 'провайдер'},
];
const S4: React.FC<{lt: number}> = ({lt}) => {
  const hub = {x: 540, y: 600};
  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {PARTNERS.map((p, i) => {
          const tx = 125 + (i % 2) * 430 + 200;
          const ty = 820 + Math.floor(i / 2) * 230;
          const d = eio(prog(lt, 0.9 + i * 0.08, 1.6 + i * 0.08));
          const len = Math.hypot(tx - hub.x, ty - hub.y);
          // one impulse per line, then the line fades to grey: the link is down
          const pk = prog(lt, 1.7 + i * 0.12, 2.5 + i * 0.12);
          const px = lerp(hub.x, tx, pk);
          const py = lerp(hub.y, ty, pk);
          return (
            <g key={p.n}>
              <line x1={hub.x} y1={hub.y} x2={tx} y2={ty} stroke={lt > 2.6 ? '#C7C7CC' : 'rgba(97,115,244,0.45)'} strokeWidth={3} strokeDasharray={len} strokeDashoffset={len * (1 - d)} />
              {pk > 0 && pk < 1 && <circle cx={px} cy={py} r={9} fill={K.peri} opacity={1 - pk * 0.6} />}
            </g>
          );
        })}
      </svg>
      <Card x={240} y={520} w={600} h={160} t={lt} t0={0.4} radius={80}>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, fontFamily: FONT}}>
          <div style={{fontSize: 44, fontWeight: 600, color: K.ink}}>Yandex Cloud</div>
          <Pill label="ограничено" on={false} size={24} />
        </div>
      </Card>
      {PARTNERS.map((p, i) => {
        const down = lt > 2.6 + i * 0.12;
        return (
          <Card key={p.n} x={125 + (i % 2) * 430} y={760 + Math.floor(i / 2) * 230} w={400} h={200} t={lt} t0={cascade(1.0, i, 0.08)} radius={38} live={down ? 0.8 : 1}>
            <div style={{position: 'absolute', inset: '0 34px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14, fontFamily: FONT}}>
              <div style={{fontSize: 46, fontWeight: 600, color: K.ink, letterSpacing: -0.5}}>{p.n}</div>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <div style={{fontSize: 26, color: K.ink2}}>{p.k}</div>
                {down && <Pill label="недоступен" on={false} size={22} />}
              </div>
            </div>
          </Card>
        );
      })}
    </>
  );
};

const S5: React.FC<{lt: number}> = ({lt}) => (
  <>
    <Counter lt={lt} t0={0.5} x={160} y={600} w={760} h={420} label="поставка нового оборудования" to={6} prefix="до" suffix="месяцев" size={240} />
    <Foot y={1060} lt={lt} t0={1.8}>
      оценка участников ИТ-рынка (Коммерсантъ)
    </Foot>
  </>
);

const OUT = [
  {who: 'Пользователи', what: 'недели до привычной работы'},
  {who: 'Бизнес', what: 'последствия от полугода до года'},
  {who: 'Рынок', what: 'дефицит мощностей вырастет'},
];
const S6: React.FC<{lt: number}> = ({lt}) => (
  <>
    {OUT.map((o, i) => (
      <Card key={o.who} x={90} y={540 + i * 210} w={900} h={180} t={lt} t0={cascade(0.55, i, 0.35)} radius={40}>
        <div style={{position: 'absolute', inset: '0 44px', display: 'flex', alignItems: 'center', gap: 30, fontFamily: FONT}}>
          <div style={{width: 22, height: 22, borderRadius: '50%', background: K.peri, flex: 'none'}} />
          <div>
            <div style={{fontSize: 30, color: K.ink2, fontWeight: 500}}>{o.who}</div>
            <div style={{fontSize: 44, fontWeight: 600, color: K.ink, letterSpacing: -0.5, marginTop: 2}}>{o.what}</div>
          </div>
        </div>
      </Card>
    ))}
    <Foot y={1200} lt={lt} t0={1.8}>
      прогнозы экспертов: vc.ru, Фонтанка
    </Foot>
  </>
);

const S7: React.FC<{lt: number}> = ({lt}) => (
  <>
    <Card x={90} y={600} w={900} h={300} t={lt} t0={0.5} radius={44}>
      <div style={{position: 'absolute', inset: '0 60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, fontFamily: FONT, textAlign: 'center'}}>
        <div style={{display: 'flex', gap: 14}}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{width: 18, height: 18, borderRadius: '50%', background: K.peri, opacity: eo3(prog(lt, 0.8 + i * 0.12, 1.2 + i * 0.12))}} />
          ))}
        </div>
        <div style={{fontSize: 46, fontWeight: 600, color: K.ink, lineHeight: 1.2, letterSpacing: -0.5}}>Яндекс не называет даты восстановления</div>
      </div>
    </Card>
    <Foot y={960} lt={lt} t0={1.1}>
      Источники: Яндекс, Коммерсантъ, Хабр,
      <br />
      Фонтанка, vc.ru, Lenta.ru · на 15.10.2026
    </Foot>
  </>
);

const CONTENT = [S1, S2, S3, S4, S5, S6, S7];

// ---------- camera: slow push ≤6% + soft punch-ins on the content layer ----------

const camera = (lt: number, zooms: {t: number; s: number; x: number; y: number}[], dur: number) => {
  let s = 1;
  let x = 540;
  let y = 900;
  let blur = 0;
  for (const z of zooms) {
    const p = prog(lt, z.t, z.t + 0.32);
    if (p <= 0) break;
    const e = eio(p);
    s = lerp(s, z.s, e);
    x = lerp(x, z.x, e);
    y = lerp(y, z.y, e);
    if (p < 1) blur = 6 * Math.sin(Math.PI * p);
  }
  const push = 1 + 0.04 * eo3(prog(lt, 0, dur * 0.85));
  return {s: s * push, x, y, blur};
};

// ---------- captions: 1–2 words at y≈1434, from blur, fresh word tinted ----------

const Captions: React.FC<{t: number}> = ({t}) => {
  const c = SUBS.find((s) => t >= s.from && t < s.to);
  if (!c) return null;
  const e = eo3(prog(t, c.from, c.from + 0.25));
  const out = eo3(prog(t, c.to - 0.18, c.to));
  const tint = 1 - prog(t, c.from + 0.1, c.from + 0.6);
  const k = e * (1 - out);
  return (
    <div
      style={{
        position: 'absolute',
        left: 480 - 350,
        width: 700,
        top: 1434,
        transform: 'translateY(-50%)',
        textAlign: 'center',
        fontFamily: FONT,
        fontSize: 60,
        fontWeight: 600,
        letterSpacing: -0.6,
        whiteSpace: 'nowrap',
        color: `color-mix(in srgb, ${K.peri} ${Math.round(tint * 100)}%, ${K.ink})`,
        opacity: k,
        filter: k < 1 ? `blur(${10 * (1 - k)}px)` : undefined,
      }}
    >
      {c.text}
    </div>
  );
};

export const YandexDcNews: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{background: K.bg, overflow: 'hidden'}}>
      {/* faint static glows: lilac and mint-grey */}
      <div style={{position: 'absolute', left: -260, top: 260, width: 900, height: 900, borderRadius: '50%', background: 'radial-gradient(circle, rgba(97,115,244,0.10) 0%, rgba(97,115,244,0) 70%)'}} />
      <div style={{position: 'absolute', right: -300, top: 900, width: 1000, height: 1000, borderRadius: '50%', background: 'radial-gradient(circle, rgba(150,200,185,0.12) 0%, rgba(150,200,185,0) 70%)'}} />
      {SCENES.map((sc, i) => {
        if (t < sc.from - XF || t > sc.to + XF) return null;
        const lt = t - sc.from;
        const dur = sc.to - sc.from;
        const last = i === SCENES.length - 1;
        const vin = i === 0 ? 1 : eo3(prog(t, sc.from - XF, sc.from + XF * 0.5));
        const vout = last ? 1 : 1 - eo3(prog(t, sc.to - XF * 0.5, sc.to + XF * 0.5));
        const v = clamp(Math.min(vin, vout));
        const cam = camera(lt, sc.zooms, dur);
        const Content = CONTENT[i];
        return (
          <AbsoluteFill key={i} style={{opacity: v, filter: v < 1 ? `blur(${14 * (1 - v)}px)` : undefined}}>
            <Headline lt={lt} lines={sc.head} />
            {/* content layer: only this scales; masked so it never runs into the headline */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 430px, #000 500px, #000 1340px, transparent 1380px)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  transformOrigin: `${cam.x}px ${cam.y}px`,
                  transform: `scale(${cam.s})`,
                  filter: cam.blur > 0.3 ? `blur(${cam.blur}px)` : undefined,
                }}
              >
                <Content lt={lt} />
              </div>
            </div>
          </AbsoluteFill>
        );
      })}
      <Captions t={t} />
    </AbsoluteFill>
  );
};

export {DURATION};

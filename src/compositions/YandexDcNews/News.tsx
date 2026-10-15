import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';
import {FPS} from '../../style/tokens';
import {clamp, eo3, eio, lerp, prog} from '../../style/ease';
import {Card, cascade} from '../../components/Reveal';
import {DURATION, SCENES, SUBS, XF} from './timeline';

/*
 * News explainer «Удары по дата-центрам Яндекса», 9:16, silent, told as one story.
 * House style: settings file «JetnodeVPN — мои установки для видео» (light #F5F5F7, one accent #6173F4,
 * SF Pro Display, pinned headline + one block, numbers as counter plates), with Nazar's v2 notes:
 * denser frames, centred soft captions, varied scene patterns, wide/medium/close alternation.
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
  off: '#AEAEB2',
};

const appear = (lt: number, t0: number, d = 0.5) => eo3(prog(lt, t0, t0 + d));
const softIn = (e: number, dy = 14): React.CSSProperties => ({
  opacity: e,
  filter: e < 1 ? `blur(${8 * (1 - e)}px)` : undefined,
  transform: `translateY(${dy * (1 - e)}px)`,
});

// ---------- headline: words from blur, the accent word is "written" left to right ----------

const Headline: React.FC<{lt: number; lines: string[]; size?: number; center?: boolean; top?: number}> = ({lt, lines, size = 92, center, top = 150}) => {
  let wi = 0;
  return (
    <div style={{position: 'absolute', left: 75, right: 75, top, fontFamily: FONT}}>
      {lines.map((line, li) => (
        <div
          key={li}
          style={{display: 'flex', justifyContent: center ? 'center' : 'flex-start', gap: size * 0.25, fontSize: size, fontWeight: 700, lineHeight: 1.06, letterSpacing: -size * 0.014, color: K.ink}}
        >
          {line.split(' ').map((raw, j) => {
            const acc = raw.startsWith('*');
            const w = raw.replace(/\*/g, '');
            const st = 0.12 + wi++ * 0.1;
            if (acc) {
              const wr = eio(prog(lt, st + 0.1, st + 0.8));
              return (
                <span key={j} style={{color: K.peri, clipPath: `inset(-20% ${100 - wr * 100}% -20% -2%)`, filter: wr < 1 ? `blur(${4 * (1 - wr)}px)` : undefined}}>
                  {w}
                </span>
              );
            }
            const e = appear(lt, st, 0.55);
            return (
              <span key={j} style={{display: 'inline-block', ...softIn(e, 10), filter: e < 1 ? `blur(${12 * (1 - e)}px)` : undefined}}>
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

const Pill: React.FC<{label: string; on?: boolean; size?: number; style?: React.CSSProperties}> = ({label, on = false, size = 26, style}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: size * 0.38,
      padding: `${size * 0.32}px ${size * 0.62}px`,
      borderRadius: 999,
      background: on ? 'rgba(97,115,244,0.10)' : K.pill,
      color: on ? K.peri : K.ink2,
      fontFamily: FONT,
      fontSize: size,
      fontWeight: 500,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    <span style={{width: size * 0.36, height: size * 0.36, borderRadius: '50%', background: on ? K.peri : K.off}} />
    {label}
  </span>
);

/** Spinner that turns only while it is on screen. */
const Spinner: React.FC<{lt: number; size?: number}> = ({lt, size = 30}) => (
  <svg width={size} height={size} viewBox="0 0 30 30" style={{transform: `rotate(${lt * 400}deg)`}}>
    <circle cx="15" cy="15" r="11" stroke="#D2D2D7" strokeWidth="3.2" fill="none" />
    <path d="M15 4 A11 11 0 0 1 26 15" stroke={K.ink2} strokeWidth="3.2" fill="none" strokeLinecap="round" />
  </svg>
);

const Foot: React.FC<{y: number; children: React.ReactNode; lt: number; t0: number}> = ({y, children, lt, t0}) => (
  <div style={{position: 'absolute', left: 75, right: 75, top: y, textAlign: 'center', fontFamily: FONT, fontSize: 26, color: K.foot, ...softIn(appear(lt, t0), 6)}}>
    {children}
  </div>
);

/** Touch shown as a ring (no hand): 135 → 100 → press 85 → expands and fades. */
const TapRing: React.FC<{lt: number; at: number; x: number; y: number}> = ({lt, at, x, y}) => {
  const a = prog(lt, at - 0.35, at);
  const b = prog(lt, at, at + 0.45);
  if (a <= 0 || b >= 1) return null;
  const s = b > 0 ? lerp(0.85, 1.7, eo3(b)) : lerp(1.35, 1, eo3(a)) - (a > 0.8 ? 0.15 * prog(a, 0.8, 1) : 0);
  const o = b > 0 ? 1 - b : eo3(a);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 50,
        top: y - 50,
        width: 100,
        height: 100,
        borderRadius: '50%',
        border: `3px solid ${K.peri}`,
        background: 'rgba(97,115,244,0.14)',
        transform: `scale(${s})`,
        opacity: o,
      }}
    />
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
  return (
    <Card x={x} y={y} w={w} h={h} t={lt} t0={t0} radius={48}>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT}}>
        <div style={{fontSize: 34, fontWeight: 500, color: K.ink2, marginBottom: 6}}>{label}</div>
        <div style={{fontSize: size, fontWeight: 700, color: K.ink, letterSpacing: -4, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>
          {prefix && <span style={{color: K.peri, marginRight: 16, fontSize: size * 0.42, fontWeight: 600, letterSpacing: 0}}>{prefix}</span>}
          {n}
          {suffix && <span style={{fontSize: size * 0.34, fontWeight: 600, letterSpacing: 0, marginLeft: 18, color: K.ink2}}>{suffix}</span>}
        </div>
      </div>
    </Card>
  );
};

// ---------- 1. Hook: an app that will not load ----------

const S1: React.FC<{lt: number}> = ({lt}) => {
  const retry = lt >= 3.0;
  const fail = lt >= 1.2 && !retry;
  const e = appear(lt, 1.2, 0.5);
  return (
    <>
      <Card x={150} y={420} w={780} h={900} t={lt} t0={0.35} radius={56}>
        <div style={{position: 'absolute', inset: 0, fontFamily: FONT}}>
          {/* app header */}
          <div style={{position: 'absolute', left: 48, right: 48, top: 44, display: 'flex', alignItems: 'center', gap: 22}}>
            <div style={{width: 76, height: 76, borderRadius: 22, background: 'linear-gradient(150deg, #E9EBFF, #D9DDFB)'}} />
            <div>
              <div style={{fontSize: 40, fontWeight: 600, color: K.ink}}>Яндекс Диск</div>
              <div style={{fontSize: 26, color: K.foot}}>Мои файлы</div>
            </div>
          </div>
          {/* empty list skeleton */}
          {[0, 1, 2].map((i) => (
            <div key={i} style={{position: 'absolute', left: 48, right: 48, top: 170 + i * 76, height: 52, borderRadius: 14, background: '#EEEEF2', opacity: 0.9 - i * 0.2}} />
          ))}
          {/* state */}
          <div style={{position: 'absolute', left: 0, right: 0, top: 440, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
            {fail ? (
              <div style={{width: 92, height: 92, borderRadius: '50%', background: K.pill, display: 'flex', alignItems: 'center', justifyContent: 'center', ...softIn(e, 0)}}>
                <svg width="44" height="44" viewBox="0 0 44 44">
                  <path d="M22 11 v14" stroke={K.ink2} strokeWidth="4.5" strokeLinecap="round" />
                  <circle cx="22" cy="32" r="2.8" fill={K.ink2} />
                </svg>
              </div>
            ) : (
              <Spinner lt={lt} size={92} />
            )}
            <div style={{fontSize: 42, fontWeight: 600, color: K.ink, opacity: fail ? e : 0.0}}>Не удалось загрузить</div>
            <div style={{fontSize: 30, color: K.ink2, opacity: fail ? e : 0}}>Сервис временно недоступен</div>
          </div>
          <div
            style={{
              position: 'absolute',
              left: 190,
              right: 190,
              top: 740,
              height: 96,
              borderRadius: 48,
              background: K.peri,
              color: '#fff',
              fontSize: 34,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: appear(lt, 1.5),
              transform: `scale(${1 - 0.04 * clamp(1 - Math.abs(lt - 3.0) / 0.12)})`,
            }}
          >
            Повторить
          </div>
        </div>
      </Card>
      <TapRing lt={lt} at={3.0} x={540} y={1208} />
    </>
  );
};

// ---------- 2. What a data center is: racks that run the services ----------

const APPS = ['Такси', 'Почта', 'Диск', 'Алиса'];
const S2: React.FC<{lt: number}> = ({lt}) => (
  <>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {APPS.map((a, i) => {
        const cx = 110 + i * 220 + 100;
        const rx = 110 + Math.min(2, Math.round(i * 0.67)) * 300 + 130;
        const d = eio(prog(lt, 3.3 + i * 0.08, 3.9 + i * 0.08));
        const len = Math.hypot(cx - rx, 646 - 560);
        const pk = prog(lt, 3.9 + i * 0.12, 4.6 + i * 0.12);
        return (
          <g key={a}>
            <line x1={rx} y1={646} x2={cx} y2={560} stroke="rgba(97,115,244,0.4)" strokeWidth={3} strokeDasharray={len} strokeDashoffset={len * (1 - d)} />
            {pk > 0 && pk < 1 && <circle cx={lerp(rx, cx, pk)} cy={lerp(646, 560, pk)} r={8} fill={K.peri} />}
          </g>
        );
      })}
    </svg>
    {APPS.map((a, i) => (
      <Card key={a} x={110 + i * 220} y={440} w={200} h={116} t={lt} t0={cascade(3.3, i, 0.1)} radius={30}>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 38, fontWeight: 600, color: K.ink}}>{a}</div>
      </Card>
    ))}
    {[0, 1, 2].map((r) => (
      <Card key={r} x={110 + r * 300} y={650} w={260} h={660} t={lt} t0={cascade(0.9, r, 0.14)} radius={34}>
        <div style={{position: 'absolute', inset: '30px 24px', display: 'flex', flexDirection: 'column', gap: 14}}>
          {Array.from({length: 9}).map((_, k) => {
            const on = lt > 1.4 + r * 0.2 + k * 0.08;
            return (
              <div key={k} style={{height: 52, borderRadius: 12, background: '#F0F0F4', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10}}>
                <div style={{flex: 1, height: 8, borderRadius: 4, background: '#DCDCE2'}} />
                <div style={{width: 12, height: 12, borderRadius: '50%', background: on ? K.peri : '#D2D2D7', boxShadow: on ? '0 0 10px rgba(97,115,244,0.6)' : undefined}} />
                <div style={{width: 12, height: 12, borderRadius: '50%', background: on && k % 3 !== 1 ? K.peri : '#D2D2D7'}} />
              </div>
            );
          })}
        </div>
      </Card>
    ))}
  </>
);

// ---------- 3. Map: three sites around Moscow ----------

const SITES = [
  {city: 'Сасово', date: '8 окт', end: 'встал', x: 800, y: 990, at: 3.9},
  {city: 'Калуга', date: '9 окт', end: 'частично', x: 190, y: 960, at: 4.4},
  {city: 'Владимир', date: '11 окт', end: 'встал', x: 640, y: 660, at: 4.9},
];
const S3: React.FC<{lt: number}> = ({lt}) => (
  <>
    <Card x={75} y={420} w={930} h={910} t={lt} t0={0.3} radius={52}>
      {/* map grid */}
      <svg width={930} height={910} style={{position: 'absolute', inset: 0, opacity: 0.55}}>
        {Array.from({length: 12}).map((_, i) =>
          Array.from({length: 12}).map((__, j) => <circle key={`${i}-${j}`} cx={40 + i * 77} cy={40 + j * 77} r={2.6} fill="#C9CAD6" />)
        )}
      </svg>
      <div style={{position: 'absolute', left: 40, top: 36, ...softIn(appear(lt, 0.6), 6)}}>
        <Pill label="8–11 октября 2026" size={26} />
      </div>
    </Card>
    {/* Moscow for reference */}
    <div style={{position: 'absolute', left: 340 - 13, top: 730 - 13, width: 26, height: 26, borderRadius: '50%', border: `3px solid ${K.ink2}`, background: '#fff', ...softIn(appear(lt, 0.9), 0)}} />
    <div style={{position: 'absolute', left: 340 - 100, width: 200, top: 770, textAlign: 'center', fontFamily: FONT, fontSize: 30, color: K.ink2, fontWeight: 500, ...softIn(appear(lt, 1.0), 6)}}>Москва</div>
    {SITES.map((s, i) => {
      const e = appear(lt, 1.3 + i * 0.15);
      const hit = prog(lt, s.at, s.at + 0.8);
      const down = lt >= s.at;
      return (
        <React.Fragment key={s.city}>
          {hit > 0 && hit < 1 && (
            <div style={{position: 'absolute', left: s.x - 18, top: s.y - 18, width: 36, height: 36, borderRadius: '50%', border: `3px solid ${K.off}`, transform: `scale(${1 + 4 * eo3(hit)})`, opacity: 0.8 * (1 - hit)}} />
          )}
          <div
            style={{
              position: 'absolute',
              left: s.x - 18,
              top: s.y - 18,
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: down ? K.off : K.peri,
              boxShadow: down ? undefined : '0 0 0 10px rgba(97,115,244,0.15)',
              transform: `scale(${e})`,
            }}
          />
          <div style={{position: 'absolute', left: s.x - 130, width: 260, top: s.y + 34, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, fontFamily: FONT, ...softIn(e, 8)}}>
            <div style={{fontSize: 42, fontWeight: 600, color: K.ink}}>{s.city}</div>
            {lt >= s.at + 0.5 ? <Pill label={`${s.date} · ${s.end}`} size={24} /> : <Pill label={s.date} on size={24} />}
          </div>
        </React.Fragment>
      );
    })}
  </>
);

// ---------- 4. The rest got crowded: capacity bar + services slow down ----------

const SLOW = ['Пэй', 'Метрика', 'Почта', 'Диск', 'Директ', 'Телемост'];
const S4: React.FC<{lt: number}> = ({lt}) => {
  const f = lerp(1, 0.1, eio(prog(lt, 0.6, 2.4)));
  return (
    <>
      <Card x={110} y={420} w={860} h={210} t={lt} t0={0.2} radius={44}>
        <div style={{position: 'absolute', inset: '0 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22, fontFamily: FONT}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
            <div style={{fontSize: 36, fontWeight: 600, color: K.ink}}>Свободные мощности</div>
            <div style={{fontSize: 30, color: K.ink2, ...softIn(appear(lt, 2.2), 4)}}>почти нет</div>
          </div>
          <div style={{height: 26, borderRadius: 13, background: '#ECECF1', overflow: 'hidden'}}>
            <div style={{width: `${f * 100}%`, height: '100%', borderRadius: 13, background: `color-mix(in srgb, ${K.peri} ${Math.round(clamp((f - 0.1) / 0.6) * 100)}%, ${K.off})`}} />
          </div>
        </div>
      </Card>
      {SLOW.map((s, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const at = 4.2 + (i === 3 ? 0 : 0.15 * (i + 1));
        return (
          <Card key={s} x={110 + col * 440} y={670 + row * 220} w={420} h={200} t={lt} t0={cascade(2.9, i, 0.08)} radius={38} live={lt >= at ? 0.8 : 1}>
            <div style={{position: 'absolute', inset: '0 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, fontFamily: FONT}}>
              <div style={{fontSize: 26, color: K.foot, fontWeight: 500}}>Яндекс</div>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <div style={{fontSize: 48, fontWeight: 600, color: K.ink, letterSpacing: -0.5}}>{s}</div>
                {lt < at ? <Spinner lt={lt} size={32} /> : <Pill label={i % 2 ? 'сбой' : 'тормозит'} size={24} />}
              </div>
            </div>
          </Card>
        );
      })}
    </>
  );
};

// ---------- 5. Domino: companies renting the cloud ----------

const PARTNERS = [
  {n: 'Магнит', url: 'magnit.ru'},
  {n: 'М.Видео', url: 'mvideo.ru'},
  {n: 'Ламода', url: 'lamoda.ru'},
  {n: 'Дом.ру', url: 'dom.ru'},
];
const S5: React.FC<{lt: number}> = ({lt}) => {
  const hub = {x: 540, y: 575};
  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {PARTNERS.map((p, i) => {
          const tx = 110 + (i % 2) * 440 + 210;
          const ty = 720 + Math.floor(i / 2) * 270;
          const d = eio(prog(lt, 2.1 + i * 0.08, 2.8 + i * 0.08));
          const len = Math.hypot(tx - hub.x, ty - hub.y);
          const pk = prog(lt, 2.9 + i * 0.12, 3.7 + i * 0.12);
          const down = lt > 4.5 + i * 0.2;
          return (
            <g key={p.n}>
              <line x1={hub.x} y1={hub.y} x2={tx} y2={ty} stroke={down ? '#D1D1D6' : 'rgba(97,115,244,0.45)'} strokeWidth={3} strokeDasharray={len} strokeDashoffset={len * (1 - d)} />
              {pk > 0 && pk < 1 && <circle cx={lerp(hub.x, tx, pk)} cy={lerp(hub.y, ty, pk)} r={9} fill={K.peri} opacity={1 - pk * 0.5} />}
            </g>
          );
        })}
      </svg>
      <Card x={210} y={430} w={660} h={150} t={lt} t0={0.4} radius={75}>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, fontFamily: FONT}}>
          <div style={{fontSize: 44, fontWeight: 600, color: K.ink}}>Облако Яндекса</div>
          <Pill label="ограничено" size={24} />
        </div>
      </Card>
      {PARTNERS.map((p, i) => {
        const down = lt > 4.5 + i * 0.2;
        return (
          <Card key={p.n} x={110 + (i % 2) * 440} y={720 + Math.floor(i / 2) * 270} w={420} h={240} t={lt} t0={cascade(2.0, i, 0.1)} radius={40} live={down ? 0.8 : 1}>
            <div style={{position: 'absolute', inset: '0 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, fontFamily: FONT}}>
              <div style={{height: 46, borderRadius: 23, background: '#F0F0F4', display: 'flex', alignItems: 'center', padding: '0 18px', fontSize: 24, color: K.foot}}>{p.url}</div>
              <div style={{fontSize: 48, fontWeight: 600, color: K.ink, letterSpacing: -0.5}}>{p.n}</div>
              <div style={{height: 34}}>{down ? <Pill label="не открывается" size={22} /> : lt > 3.6 ? <Spinner lt={lt} size={30} /> : null}</div>
            </div>
          </Card>
        );
      })}
    </>
  );
};

// ---------- 6. Hardware: counter + six months filling ----------

const S6: React.FC<{lt: number}> = ({lt}) => (
  <>
    <Counter lt={lt} t0={0.25} x={110} y={420} w={860} h={430} label="доставка нового оборудования" to={6} prefix="до" suffix="месяцев" size={260} />
    <Card x={110} y={890} w={860} h={250} t={lt} t0={1.9} radius={44}>
      <div style={{position: 'absolute', inset: '0 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20, fontFamily: FONT}}>
        <div style={{display: 'flex', gap: 14}}>
          {Array.from({length: 6}).map((_, i) => {
            const k = eio(prog(lt, 2.6 + i * 0.4, 3.0 + i * 0.4));
            return (
              <div key={i} style={{flex: 1, height: 30, borderRadius: 15, background: '#ECECF1', overflow: 'hidden'}}>
                <div style={{width: `${k * 100}%`, height: '100%', background: K.peri, borderRadius: 15}} />
              </div>
            );
          })}
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 28, color: K.ink2}}>
          <span>сейчас</span>
          <span>весна 2027</span>
        </div>
      </div>
    </Card>
    <Foot y={1176} lt={lt} t0={2.4}>
      оценка участников ИТ-рынка (Коммерсантъ, vc.ru)
    </Foot>
  </>
);

// ---------- 7. What next: a vertical timeline, no cards ----------

const NEXT = [
  {when: 'через недели', what: 'Обычные сервисы оживут', at: 1.2},
  {when: 'полгода – год', what: 'Бизнес чувствует последствия', at: 3.2},
  {when: 'дальше', what: 'Мощностей для ИИ станет меньше', at: 5.1},
];
const S7: React.FC<{lt: number}> = ({lt}) => {
  const ys = [590, 860, 1130];
  const line = eio(prog(lt, 0.3, 1.1));
  // a single dot travels down the line and stops at each milestone
  let dy = ys[0];
  for (let i = 1; i < ys.length; i++) dy = lerp(dy, ys[i], eio(prog(lt, NEXT[i].at - 0.6, NEXT[i].at)));
  return (
    <>
      <div style={{position: 'absolute', left: 168, top: 520, width: 4, height: 680 * line, borderRadius: 2, background: '#D8D8E0'}} />
      {NEXT.map((n, i) => {
        const e = appear(lt, n.at - 0.1, 0.6);
        const reached = lt >= n.at;
        return (
          <React.Fragment key={n.when}>
            <div style={{position: 'absolute', left: 170 - 16, top: ys[i] - 16, width: 32, height: 32, borderRadius: '50%', background: '#fff', border: `4px solid ${reached ? K.peri : '#D8D8E0'}`, opacity: line}} />
            <div style={{position: 'absolute', left: 230, right: 100, top: ys[i] - 58, fontFamily: FONT, ...softIn(e, 12)}}>
              <div style={{fontSize: 32, color: K.peri, fontWeight: 500}}>{n.when}</div>
              <div style={{fontSize: 56, fontWeight: 600, color: K.ink, letterSpacing: -0.8, lineHeight: 1.1}}>{n.what}</div>
            </div>
          </React.Fragment>
        );
      })}
      <div style={{position: 'absolute', left: 170 - 11, top: dy - 11, width: 22, height: 22, borderRadius: '50%', background: K.peri, opacity: appear(lt, 0.9), boxShadow: '0 0 16px rgba(97,115,244,0.6)'}} />
      <Foot y={1262} lt={lt} t0={1.6}>
        это прогнозы экспертов: vc.ru, Фонтанка
      </Foot>
    </>
  );
};

// ---------- 8. End: big type, one card, sources ----------

const S8: React.FC<{lt: number}> = ({lt}) => (
  <>
    <Card x={110} y={820} w={860} h={250} t={lt} t0={1.3} radius={48}>
      <div style={{position: 'absolute', inset: '0 56px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, fontFamily: FONT, textAlign: 'center'}}>
        <div style={{display: 'flex', gap: 14}}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{width: 18, height: 18, borderRadius: '50%', background: K.peri, opacity: appear(lt, 1.6 + i * 0.12, 0.4)}} />
          ))}
        </div>
        <div style={{fontSize: 44, fontWeight: 600, color: K.ink, lineHeight: 1.2}}>Яндекс не называет даты восстановления</div>
      </div>
    </Card>
    <Foot y={1110} lt={lt} t0={2.0}>
      Источники: Яндекс, Коммерсантъ, Хабр,
      <br />
      Фонтанка, vc.ru, Lenta.ru · на 15.10.2026
    </Foot>
  </>
);

// ---------- 9. JetnodeVPN insert: calm static CTA ----------

const S9: React.FC<{lt: number}> = ({lt}) => (
  <>
    <div style={{position: 'absolute', left: 540 - 105, top: 440, width: 210, height: 210, borderRadius: 52, overflow: 'hidden', boxShadow: '0 24px 60px rgba(40,40,90,0.18)', ...softIn(appear(lt, 0.3, 0.6), 16)}}>
      <Img src={staticFile('brand/logo.png')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.12)'}} />
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', fontFamily: FONT, ...softIn(appear(lt, 0.6), 10)}}>
      <div style={{fontSize: 84, fontWeight: 700, color: K.ink, letterSpacing: -1.5}}>JetnodeVPN</div>
      <div style={{fontSize: 36, color: K.ink2, marginTop: 8}}>работает даже при белых списках</div>
    </div>
    <Counter lt={lt} t0={2.6} x={250} y={880} w={580} h={230} label="бесплатно" to={3} suffix="дня" size={130} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 1140, textAlign: 'center', fontFamily: FONT, fontSize: 40, fontWeight: 600, color: K.peri, ...softIn(appear(lt, 3.6), 8)}}>@jetnodevpn_bot</div>
    <div
      style={{
        position: 'absolute',
        left: 290,
        width: 500,
        top: 1210,
        height: 104,
        borderRadius: 52,
        background: K.peri,
        color: '#fff',
        fontFamily: FONT,
        fontSize: 38,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 14px 36px rgba(97,115,244,0.35)',
        ...softIn(appear(lt, 4.0), 10),
      }}
    >
      Получить 3 дня
    </div>
  </>
);

const CONTENT = [S1, S2, S3, S4, S5, S6, S7, S8, S9];

// ---------- camera: slow push ≤4% + soft punch-ins on the content layer ----------

const camera = (lt: number, zooms: {t: number; s: number; x: number; y: number; d?: number}[], dur: number) => {
  let s = 1;
  let x = 540;
  let y = 900;
  let blur = 0;
  for (const z of zooms) {
    const d = z.d ?? 0.34;
    const p = prog(lt, z.t, z.t + d);
    if (p <= 0) break;
    const e = eio(p);
    s = lerp(s, z.s, e);
    x = lerp(x, z.x, e);
    y = lerp(y, z.y, e);
    if (p < 1 && d > 0.01) blur = 5 * Math.sin(Math.PI * p);
  }
  const push = 1 + 0.035 * eo3(prog(lt, 0, dur * 0.9));
  return {s: s * push, x, y, blur};
};

// ---------- captions: short story chunks, centred, soft Apple-like fade ----------

const Captions: React.FC<{t: number}> = ({t}) => (
  <>
    {SUBS.map((c, i) => {
      if (t < c.from - 0.05 || t > c.to + 0.05) return null;
      const e = eio(prog(t, c.from - 0.05, c.from + 0.5));
      const out = eio(prog(t, c.to - 0.28, c.to + 0.05));
      const k = e * (1 - out);
      if (k <= 0.001) return null;
      const tint = 1 - prog(t, c.from + 0.2, c.from + 0.9);
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 140,
            width: 800,
            top: 1434,
            textAlign: 'center',
            fontFamily: FONT,
            fontSize: 54,
            fontWeight: 600,
            letterSpacing: -0.5,
            whiteSpace: 'nowrap',
            color: `color-mix(in srgb, ${K.peri} ${Math.round(tint * 55)}%, ${K.ink})`,
            opacity: k,
            filter: k < 0.98 ? `blur(${5 * (1 - k)}px)` : undefined,
            transform: `translateY(calc(-50% + ${8 * (1 - e) - 6 * out}px))`,
          }}
        >
          {c.text}
        </div>
      );
    })}
  </>
);

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
        const prevZoom = i > 0 && SCENES[i - 1].out === 'zoom';
        const vin = i === 0 ? 1 : eo3(prog(t, sc.from - XF, sc.from + XF * 0.6));
        const vout = last ? 1 : 1 - eo3(prog(t, sc.to - XF * 0.5, sc.to + XF * 0.5));
        const v = clamp(Math.min(vin, vout));
        const cam = camera(lt, sc.zooms, dur);
        // zoom-through: the block grows into the camera (slow start, sharp end); the next scene settles from 93%
        const zt = sc.out === 'zoom' ? prog(t, sc.to - 0.55, sc.to + 0.1) : 0;
        const zs = 1 + 1.4 * zt ** 3;
        const zin = prevZoom ? lerp(0.93, 1, eo3(prog(lt, -XF, 0.55))) : 1;
        const Content = CONTENT[i];
        return (
          <AbsoluteFill key={i} style={{opacity: v, filter: v < 0.99 ? `blur(${14 * (1 - v)}px)` : undefined}}>
            {sc.head && <Headline lt={lt} lines={sc.head} />}
            {i === 0 && <Headline lt={lt} lines={['Почему Яндекс', '*лежал*?']} center size={96} top={150} />}
            {i === 7 && <Headline lt={lt} lines={['Сроков', 'пока *нет*']} center size={132} top={420} />}
            {/* content layer: only this scales; masked so it never runs into the headline or captions */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 380px, #000 420px, #000 1335px, transparent 1365px)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  transformOrigin: `${cam.x}px ${cam.y}px`,
                  transform: `scale(${cam.s * zs * zin})`,
                  opacity: 1 - zt ** 2,
                  filter: cam.blur + 10 * zt ** 2 > 0.3 ? `blur(${cam.blur + 10 * zt ** 2}px)` : undefined,
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

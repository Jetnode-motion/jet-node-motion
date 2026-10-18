import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {C, FPS, GLASS} from '../../style/tokens';
import {clamp, eback, eio, eo3, eoexpo, lerp, prog} from '../../style/ease';
import {Card, cascade} from '../../components/Reveal';
import {BEATS, Bg, SCENES, SPEED, SUBS, XF, at, sceneAt} from './timeline';

/*
 * Reels «Мобильного интернета стало меньше» with a Jetnode VPN insert, 9:16, voiced.
 * Style: knowledge-base/style-guide.md → «Пересечение стилей»: Shell base, blue glass for the hook and
 * the CTA, one Night scene; glass 3D icons from the bot menu, SF Pro Display, SignPainter accents.
 */

// SF Pro and SignPainter are not committed (Apple licence): copy the .otf files into public/fonts first.
const SF = 'SF Display Local';
for (const [w, f] of [
  ['300', 'Light'],
  ['400', 'Regular'],
  ['500', 'Medium'],
  ['600', 'Semibold'],
  ['700', 'Bold'],
] as const) {
  loadFont({family: SF, url: staticFile(`fonts/SF-Pro-Display-${f}.otf`), weight: w}).catch(() => undefined);
}
const FONT = `"${SF}", "SF Pro Display", "Inter Display", Inter, -apple-system, Helvetica, Arial, sans-serif`;
const ACCENT = '"SignPainter", "Marck Script", cursive';

const K = {
  shell: C.shell,
  plum: C.plum,
  peri: C.peri,
  ink2: '#7A6F80',
  foot: '#9A8F9E',
  pill: 'rgba(97,115,244,0.10)',
  off: '#C9C1CC',
  white: '#FFFFFF',
};

const appear = (lt: number, t0: number, d = 0.45) => eoexpo(prog(lt, t0, t0 + d));
const expoInOut = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 2 ** (20 * x - 10) / 2 : (2 - 2 ** (-20 * x + 10)) / 2);
const softIn = (e: number, dy = 14): React.CSSProperties => ({
  opacity: e,
  filter: e < 0.99 ? `blur(${8 * (1 - e)}px)` : undefined,
  transform: `translateY(${dy * (1 - e)}px)`,
});

// ---------- backgrounds ----------

const GlassBg: React.FC = () => (
  <AbsoluteFill style={{background: `linear-gradient(140deg, ${GLASS.bgFrom} 0%, ${GLASS.bgMid} 42%, #8FB8FB 72%, ${GLASS.bgTo} 100%)`}}>
    <div
      style={{position: 'absolute', right: -380, top: -300, width: 1100, height: 1100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(220,236,255,0.55) 0%, rgba(220,236,255,0) 68%)'}}
    />
    <div
      style={{position: 'absolute', left: -420, bottom: -380, width: 1100, height: 1100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,90,240,0.45) 0%, rgba(30,90,240,0) 70%)'}}
    />
  </AbsoluteFill>
);

const ShellBg: React.FC = () => (
  <AbsoluteFill style={{background: K.shell}}>
    <div style={{position: 'absolute', left: -260, top: 260, width: 900, height: 900, borderRadius: '50%', background: 'radial-gradient(circle, rgba(97,115,244,0.10) 0%, rgba(97,115,244,0) 70%)'}} />
    <div
      style={{position: 'absolute', right: -300, top: 900, width: 1000, height: 1000, borderRadius: '50%', background: 'radial-gradient(circle, rgba(143,201,246,0.16) 0%, rgba(143,201,246,0) 70%)'}}
    />
  </AbsoluteFill>
);

const NightBg: React.FC = () => (
  <AbsoluteFill style={{background: GLASS.darkBg}}>
    <div
      style={{
        position: 'absolute',
        left: 540 - 700,
        top: 1000 - 700,
        width: 1400,
        height: 1400,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(75,129,243,0.42) 0%, rgba(75,129,243,0) 62%)`,
      }}
    />
  </AbsoluteFill>
);

const BG_OF: Record<Bg, React.FC> = {glass: GlassBg, shell: ShellBg, night: NightBg};
const onDark = (bg: Bg) => bg !== 'shell';

// ---------- glass pieces (bot menu style) ----------

/** Frosted front layer: translucent white, background blur, bright top-left edge, soft shadow. */
const Glass: React.FC<{x: number; y: number; w: number; h: number; r: number; dense?: boolean; style?: React.CSSProperties; children?: React.ReactNode}> = ({
  x,
  y,
  w,
  h,
  r,
  dense,
  style,
  children,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: r,
      background: dense ? 'linear-gradient(150deg, rgba(150,180,255,0.62) 0%, rgba(110,150,250,0.42) 100%)' : 'linear-gradient(150deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.14) 100%)',
      backdropFilter: 'blur(26px)',
      WebkitBackdropFilter: 'blur(26px)',
      boxShadow: [dense ? '0 30px 70px rgba(40,80,200,0.30)' : '0 30px 70px rgba(10,40,130,0.28)', 'inset 0 2px 0 rgba(255,255,255,0.55)', 'inset 0 0 40px rgba(255,255,255,0.18)'].join(','),
      ...style,
    }}
  >
    {/* edge: bright top-left, fading to the bottom-right */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: r,
        padding: 3,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.25) 45%, rgba(255,255,255,0.55) 100%)',
        WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        WebkitMaskComposite: 'xor',
      }}
    />
    {children}
  </div>
);

/** Solid back layer of a glass icon. */
const Solid: React.FC<{x: number; y: number; w: number; h: number; r: number; rot?: number; style?: React.CSSProperties}> = ({x, y, w, h, r, rot = 0, style}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: r,
      background: `linear-gradient(160deg, #3D82FF 0%, ${GLASS.solid} 55%, #1747C9 100%)`,
      boxShadow: '0 24px 60px rgba(20,60,190,0.35), inset 0 2px 0 rgba(255,255,255,0.25)',
      transform: `rotate(${rot}deg)`,
      ...style,
    }}
  />
);

/** Sweeping highlight across a glass piece (clip it with the parent's radius). */
const Sheen: React.FC<{lt: number; t0: number; r: number}> = ({lt, t0, r}) => {
  const p = prog(lt, t0, t0 + 0.9);
  if (p <= 0 || p >= 1) return null;
  return (
    <div style={{position: 'absolute', inset: 0, borderRadius: r, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          top: -200,
          bottom: -200,
          width: 140,
          left: `${lerp(-30, 130, eio(p))}%`,
          transform: 'rotate(18deg)',
          background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)',
        }}
      />
    </div>
  );
};

/** Two-layer reveal: the solid lands first, the glass slides over it with a little parallax. */
const iconIn = (lt: number, t0: number) => ({back: eoexpo(prog(lt, t0, t0 + 0.7)), front: eback(prog(lt, t0 + 0.1, t0 + 0.55), 1.6)});

const Logo: React.FC<{lt: number}> = ({lt}) => (
  <div style={{position: 'absolute', left: 75, top: 150, display: 'flex', alignItems: 'center', gap: 16, fontFamily: FONT, ...softIn(appear(lt, 0.05), 6)}}>
    <Img src={staticFile('brand/plane.png')} style={{width: 54, height: 54, filter: 'brightness(0) invert(1)', transform: 'rotate(-8deg)'}} />
    <div style={{fontSize: 34, fontWeight: 600, color: K.white, letterSpacing: -0.3}}>Jetnode VPN</div>
  </div>
);

/** Caption pill under a headline: translucent white on blue, light periwinkle on Shell. */
const Pill: React.FC<{label: string; dark?: boolean; size?: number; style?: React.CSSProperties}> = ({label, dark, size = 30, style}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: `${size * 0.36}px ${size * 0.7}px`,
      borderRadius: 999,
      background: dark ? 'rgba(255,255,255,0.18)' : K.pill,
      border: `2px solid ${dark ? 'rgba(255,255,255,0.55)' : 'rgba(97,115,244,0.28)'}`,
      color: dark ? K.white : K.peri,
      fontFamily: FONT,
      fontSize: size,
      fontWeight: 500,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {label}
  </span>
);

// ---------- headline: first line light, second bold, *accent* in SignPainter ----------

const Headline: React.FC<{lt: number; lines: string[]; dark?: boolean; top?: number; size?: number; center?: boolean}> = ({lt, lines, dark, top = 170, size = 92, center}) => {
  let wi = 0;
  return (
    <div style={{position: 'absolute', left: 75, right: 75, top, fontFamily: FONT}}>
      {lines.map((line, li) => (
        <div
          key={li}
          style={{
            display: 'flex',
            justifyContent: center ? 'center' : 'flex-start',
            alignItems: 'baseline',
            gap: size * 0.25,
            fontSize: size,
            fontWeight: li === 0 && lines.length > 1 ? 400 : 700,
            lineHeight: 1.08,
            letterSpacing: -size * 0.016,
            color: dark ? K.white : K.plum,
          }}
        >
          {line.split(' ').map((raw, j) => {
            const acc = raw.startsWith('*');
            const w = raw.replace(/\*/g, '');
            const st = 0.08 + wi++ * 0.045;
            if (acc) {
              const wr = eio(prog(lt, st + 0.1, st + 0.8));
              return (
                <span
                  key={j}
                  style={{
                    fontFamily: ACCENT,
                    fontWeight: 400,
                    fontSize: size * 1.32,
                    lineHeight: 1,
                    letterSpacing: 0,
                    color: dark ? K.white : K.peri,
                    textShadow: dark ? '0 0 28px rgba(255,255,255,0.55)' : '0 0 22px rgba(97,115,244,0.40)',
                    clipPath: `inset(-30% ${100 - wr * 100}% -30% -4%)`,
                    filter: wr < 1 ? `blur(${4 * (1 - wr)}px)` : undefined,
                  }}
                >
                  {w}
                </span>
              );
            }
            const e = appear(lt, st, 0.45);
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

const Foot: React.FC<{y: number; lt: number; t0: number; dark?: boolean; children: React.ReactNode}> = ({y, lt, t0, dark, children}) => (
  <div style={{position: 'absolute', left: 75, right: 75, top: y, textAlign: 'center', fontFamily: FONT, fontSize: 26, color: dark ? 'rgba(255,255,255,0.6)' : K.foot, ...softIn(appear(lt, t0), 6)}}>
    {children}
  </div>
);

/** Touch shown as a ring (no hand). */
const TapRing: React.FC<{lt: number; at: number; x: number; y: number; dark?: boolean}> = ({lt, at, x, y, dark}) => {
  const a = prog(lt, at - 0.35, at);
  const b = prog(lt, at, at + 0.45);
  if (a <= 0 || b >= 1) return null;
  const s = b > 0 ? lerp(0.85, 1.7, eo3(b)) : lerp(1.35, 1, eo3(a)) - (a > 0.8 ? 0.15 * prog(a, 0.8, 1) : 0);
  const o = b > 0 ? 1 - b : eo3(a);
  const col = dark ? K.white : K.peri;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 50,
        top: y - 50,
        width: 100,
        height: 100,
        borderRadius: '50%',
        border: `3px solid ${col}`,
        background: dark ? 'rgba(255,255,255,0.18)' : 'rgba(97,115,244,0.14)',
        transform: `scale(${s})`,
        opacity: o,
      }}
    />
  );
};

const count = (lt: number, t0: number, to: number, d = 0.8) => to * eoexpo(prog(lt, t0, t0 + d));
const fmt = (n: number, dec = 0) => n.toFixed(dec).replace('.', ',');

/** Headlines, logo and pills stay put; only the body goes under the camera. */
type Part = 'head' | 'body';
const H: React.FC<{part: Part; children: React.ReactNode}> = ({part, children}) => (part === 'head' ? <>{children}</> : null);
const B: React.FC<{part: Part; children: React.ReactNode}> = ({part, children}) => (part === 'body' ? <>{children}</> : null);

// ---------- 1. Hook (blue): signal bars drop out ----------

const BARS = [0, 1, 2, 3];
const DROP = [3.2, 2.4, 1.6]; // bar 1, 2, 3 go out (the shortest bar 0 stays)
const S1: React.FC<{lt: number; part: Part}> = ({lt, part}) => {
  const ic = iconIn(lt, 0.3);
  return (
    <>
      <H part={part}>
        <Logo lt={lt} />
        <Headline lt={lt} lines={['мобильного интернета', 'стало *меньше*']} dark top={260} size={84} />
        <div style={{position: 'absolute', left: 75, top: 520, ...softIn(appear(lt, 0.9), 8)}}>
          <Pill label="впервые в истории" dark />
        </div>
      </H>
      <B part={part}>
        {/* icon: solid tile behind, glass panel with signal bars in front */}
        <div style={{opacity: ic.back, transform: `translate(${30 * (1 - ic.back)}px, ${-30 * (1 - ic.back)}px)`}}>
          <Solid x={600} y={700} w={340} h={340} r={80} rot={8} />
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: clamp(ic.front * 1.4),
            transform: `translateY(${60 * (1 - ic.front)}px) scale(${lerp(0.9, 1, clamp(ic.front))})`,
            transformOrigin: '540px 1000px',
          }}
        >
          <Glass x={250} y={780} w={580} h={480} r={70}>
            <div style={{position: 'absolute', left: 110, bottom: 96, display: 'flex', alignItems: 'flex-end', gap: 40}}>
              {BARS.map((b) => {
                const out = b === 0 ? 0 : eo3(prog(lt, DROP[b - 1], DROP[b - 1] + 0.35));
                return (
                  <div
                    key={b}
                    style={{
                      width: 62,
                      height: 70 + b * 68,
                      borderRadius: 18,
                      background: `rgba(255,255,255,${lerp(1, 0.22, out)})`,
                      boxShadow: out < 0.5 ? '0 0 24px rgba(255,255,255,0.45)' : undefined,
                      transform: `translateY(${10 * Math.sin(Math.PI * out)}px)`,
                    }}
                  />
                );
              })}
            </div>
            <Sheen lt={lt} t0={0.9} r={70} />
          </Glass>
        </div>
      </B>
    </>
  );
};

// ---------- 2. Minus 6%: counter plate + two quarters ----------

const Q = [
  {q: 'I квартал', v: 7.8, at: 6.6},
  {q: 'II квартал', v: 6, at: 4.6},
];
const S2: React.FC<{lt: number; part: Part}> = ({lt, part}) => {
  const n = count(lt, 1.6, 6);
  return (
    <>
      <H part={part}>
        <Headline lt={lt} lines={['мобильный трафик', 'упал на *6%*']} />
      </H>
      <B part={part}>
        <Card x={110} y={430} w={860} h={420} t={lt} t0={1.4} radius={52}>
          <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT}}>
            <div style={{fontSize: 34, fontWeight: 500, color: K.ink2, marginBottom: 4}}>мобильный трафик, II кв. 2026</div>
            <div style={{fontSize: 250, fontWeight: 700, color: K.plum, letterSpacing: -6, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>
              <span style={{color: K.peri}}>−</span>
              {Math.round(n)}
              <span style={{fontSize: 110, fontWeight: 600, letterSpacing: 0, marginLeft: 8, color: K.ink2}}>%</span>
            </div>
            <div style={{fontSize: 30, color: K.ink2, marginTop: 6, ...softIn(appear(lt, 2.6), 4)}}>12,1 млрд ГБ за квартал</div>
          </div>
        </Card>
        <Card x={110} y={890} w={860} h={330} t={lt} t0={4.6} radius={44}>
          <div style={{position: 'absolute', inset: '40px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 34, fontFamily: FONT}}>
            {Q.map((q, i) => {
              const k = eio(prog(lt, q.at, q.at + 0.8));
              const hot = lt >= q.at + 0.2;
              return (
                <div key={q.q} style={{display: 'flex', alignItems: 'center', gap: 26, ...softIn(appear(lt, 4.6 + i * 0.1), 6)}}>
                  <div style={{width: 210, fontSize: 34, fontWeight: 500, color: K.plum}}>{q.q}</div>
                  <div style={{flex: 1, height: 34, borderRadius: 17, background: '#F1E6E6', overflow: 'hidden'}}>
                    <div style={{width: `${(q.v / 8) * 100 * k}%`, height: '100%', borderRadius: 17, background: hot ? K.peri : K.off}} />
                  </div>
                  <div style={{width: 130, textAlign: 'right', fontSize: 40, fontWeight: 700, color: hot ? K.peri : K.ink2, fontVariantNumeric: 'tabular-nums'}}>−{fmt(q.v * k, 1)}%</div>
                </div>
              );
            })}
            <div style={{display: 'flex', justifyContent: 'center', ...softIn(appear(lt, 5.0), 6)}}>
              <Pill label="второй квартал подряд" size={26} />
            </div>
          </div>
        </Card>
        <Foot y={1258} lt={lt} t0={2.2}>
          «Ведомости» по данным Минцифры · 06.10.2026
        </Foot>
      </B>
    </>
  );
};

// ---------- 3. Regions: 3 of 4 down, Ivanovo −31% ----------

const REG = [
  {n: 'Ивановская', v: 31.3},
  {n: 'Волгоградская', v: 28.1},
  {n: 'Адыгея', v: 26.6},
  {n: 'Тульская', v: 24.8},
];
const S3: React.FC<{lt: number; part: Part}> = ({lt, part}) => (
  <>
    <H part={part}>
      <Headline lt={lt} lines={['спад в трёх', 'регионах из *четырёх*']} size={76} />
    </H>
    <B part={part}>
      <Card x={110} y={430} w={860} h={290} t={lt} t0={0.6} radius={44}>
        <div style={{position: 'absolute', inset: '0 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: FONT}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(10, 34px)', gap: 12}}>
            {Array.from({length: 20}).map((_, i) => {
              const down = i % 4 !== 3; // 3 of every 4
              const on = lt > 0.8 + i * 0.05;
              return <div key={i} style={{width: 34, height: 34, borderRadius: 10, background: on ? (down ? K.peri : '#EADFDF') : '#F4ECEC', transform: `scale(${on ? 1 : 0.7})`}} />;
            })}
          </div>
          <div style={{textAlign: 'right', ...softIn(appear(lt, 1.6), 6)}}>
            <div style={{fontSize: 92, fontWeight: 700, color: K.plum, letterSpacing: -2, lineHeight: 1}}>74%</div>
            <div style={{fontSize: 28, color: K.ink2}}>регионов</div>
          </div>
        </div>
      </Card>
      <Card x={110} y={760} w={860} h={480} t={lt} t0={3.0} radius={44}>
        <div style={{position: 'absolute', inset: '44px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: FONT}}>
          {REG.map((r, i) => {
            const k = eio(prog(lt, 3.2 + i * 0.12, 4.0 + i * 0.12));
            const top = i === 0;
            const hot = top && lt >= 5.4;
            return (
              <div key={r.n} style={{display: 'flex', alignItems: 'center', gap: 22}}>
                <div style={{width: 250, fontSize: 32, fontWeight: top ? 600 : 500, color: K.plum}}>{r.n}</div>
                <div style={{flex: 1, height: 30, borderRadius: 15, background: '#F1E6E6', overflow: 'hidden'}}>
                  <div style={{width: `${(r.v / 32) * 100 * k}%`, height: '100%', borderRadius: 15, background: top ? K.peri : K.off, boxShadow: hot ? '0 0 18px rgba(97,115,244,0.6)' : undefined}} />
                </div>
                <div
                  style={{
                    width: 120,
                    textAlign: 'right',
                    fontSize: hot ? 44 : 34,
                    fontWeight: 700,
                    color: top ? K.peri : K.ink2,
                    fontVariantNumeric: 'tabular-nums',
                    transform: `scale(${hot ? eback(prog(lt, 5.4, 5.75), 1.6) : 1})`,
                    transformOrigin: 'right center',
                  }}
                >
                  −{Math.round(r.v * k)}%
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </B>
  </>
);

// ---------- 4. White lists: three rows open, the rest locked ----------

const OPEN = [
  {n: 'Госуслуги', at: 7.0},
  {n: 'ВКонтакте', at: 7.9},
  {n: 'Маркетплейсы', at: 8.8},
];
const Lock: React.FC<{c: string}> = ({c}) => (
  <svg width="30" height="34" viewBox="0 0 30 34">
    <rect x="3" y="14" width="24" height="18" rx="5" fill={c} />
    <path d="M8 14 V10 a7 7 0 0 1 14 0 V14" stroke={c} strokeWidth="4" fill="none" />
  </svg>
);
const Check: React.FC = () => (
  <svg width="36" height="36" viewBox="0 0 36 36">
    <circle cx="18" cy="18" r="18" fill={K.peri} />
    <path d="M10 18.5 l5.5 5.5 L26 13" stroke="#fff" strokeWidth="3.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const S4: React.FC<{lt: number; part: Part}> = ({lt, part}) => {
  const tap = 5.6;
  const shake = lt > tap + 0.05 && lt < tap + 0.45 ? Math.sin((lt - tap) * 60) * 10 * (1 - prog(lt, tap, tap + 0.45)) : 0;
  return (
    <>
      <H part={part}>
        <Headline lt={lt} lines={['причина:', 'белые *списки*']} />
      </H>
      <B part={part}>
        <Card x={150} y={430} w={780} h={830} t={lt} t0={0.4} radius={56}>
          <div style={{position: 'absolute', inset: 0, fontFamily: FONT}}>
            <div style={{position: 'absolute', left: 48, right: 48, top: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div style={{fontSize: 38, fontWeight: 600, color: K.plum}}>Мобильный интернет</div>
              <Pill label="ограничен" size={24} />
            </div>
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const open = i < 3 ? OPEN[i] : null;
              const y = 140 + i * 110;
              const on = open ? lt >= open.at : false;
              const locked = !open && lt >= 5.2;
              const e = appear(lt, 0.9 + i * 0.08, 0.4);
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: 40,
                    right: 40,
                    top: y,
                    height: 90,
                    borderRadius: 24,
                    background: on ? 'rgba(97,115,244,0.10)' : '#F7F0F0',
                    border: on ? '2px solid rgba(97,115,244,0.35)' : '2px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 28px',
                    gap: 22,
                    transform: `translateX(${i === 4 ? shake : 0}px)`,
                    opacity: locked ? lerp(e, 0.55, prog(lt, 5.2, 5.6)) : e,
                  }}
                >
                  <div style={{width: 46, height: 46, borderRadius: 14, background: on ? K.peri : '#E6DCDC'}} />
                  {open ? (
                    <div style={{flex: 1, fontSize: 36, fontWeight: 600, color: on ? K.plum : K.ink2}}>{open.n}</div>
                  ) : (
                    <div style={{flex: 1, height: 14, borderRadius: 7, background: '#E6DCDC', maxWidth: 300 - i * 30}} />
                  )}
                  {on && (
                    <div style={{transform: `scale(${eback(prog(lt, open!.at, open!.at + 0.3), 1.6)})`}}>
                      <Check />
                    </div>
                  )}
                  {locked && (
                    <div style={{opacity: appear(lt, 5.2, 0.3)}}>
                      <Lock c={K.off} />
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{position: 'absolute', left: 0, right: 0, top: 820 - 150, textAlign: 'center', fontSize: 30, color: K.ink2, ...softIn(appear(lt, tap + 0.2), 6)}}>остальное не открывается</div>
          </div>
        </Card>
        <TapRing lt={lt} at={tap} x={540} y={430 + 140 + 4 * 110 + 45} />
      </B>
    </>
  );
};

// ---------- 5. Moved to Wi-Fi: glass Wi-Fi icon + two counters ----------

const Wifi: React.FC = () => (
  <svg width="220" height="170" viewBox="0 0 220 170">
    {[0, 1, 2].map((i) => (
      <path
        key={i}
        d={`M ${110 - (40 + i * 38)} ${120 - (24 + i * 24)} A ${48 + i * 44} ${48 + i * 44} 0 0 1 ${110 + 40 + i * 38} ${120 - (24 + i * 24)}`}
        stroke="#fff"
        strokeWidth="18"
        fill="none"
        strokeLinecap="round"
      />
    ))}
    <circle cx="110" cy="140" r="15" fill="#fff" />
  </svg>
);
const Big: React.FC<{lt: number; t0: number; x: number; label: string; to: number}> = ({lt, t0, x, label, to}) => (
  <Card x={x} y={830} w={410} h={400} t={lt} t0={t0} radius={48}>
    <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, textAlign: 'center'}}>
      <div style={{fontSize: 140, fontWeight: 700, color: K.plum, letterSpacing: -4, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>
        <span style={{color: K.peri, fontSize: 90}}>+</span>
        {Math.round(count(lt, t0 + 0.1, to))}
        <span style={{fontSize: 70, color: K.ink2}}>%</span>
      </div>
      <div style={{fontSize: 32, fontWeight: 500, color: K.ink2, marginTop: 14, lineHeight: 1.2}}>{label}</div>
    </div>
  </Card>
);
const S5: React.FC<{lt: number; part: Part}> = ({lt, part}) => {
  const ic = iconIn(lt, 1.2);
  return (
    <>
      <H part={part}>
        <Headline lt={lt} lines={['люди уходят', 'на *Wi-Fi*']} />
      </H>
      <B part={part}>
        <div style={{opacity: ic.back}}>
          <Solid x={560} y={440} w={210} h={210} r={105} style={{transform: `translate(${20 * (1 - ic.back)}px, ${-20 * (1 - ic.back)}px)`}} />
        </div>
        <div style={{position: 'absolute', inset: 0, opacity: clamp(ic.front * 1.4), transform: `translateY(${40 * (1 - ic.front)}px)`}}>
          <Glass x={330} y={480} w={360} h={290} r={64} dense>
            <div style={{position: 'absolute', left: 70, top: 44}}>
              <Wifi />
            </div>
            <Sheen lt={lt} t0={1.8} r={64} />
          </Glass>
        </div>
        <Big lt={lt} t0={5.4} x={110} label={'трафик домашнего\nинтернета'.split('\n').join(' ')} to={55} />
        <Big lt={lt} t0={7.9} x={560} label="обычные звонки" to={27} />
        <Foot y={1262} lt={lt} t0={5.8}>
          II квартал 2026 к прошлому году
        </Foot>
      </B>
    </>
  );
};

// ---------- 6. Punchline (night) ----------

const S6: React.FC<{lt: number; part: Part}> = ({lt, part}) => {
  const ic = iconIn(lt, 0.2);
  return (
    <>
      <H part={part}>
        <Headline lt={lt} lines={['мобильный интернет', 'всё меньше', '*мобильный*']} dark center top={820} size={88} />
      </H>
      <B part={part}>
        {/* callback to the hook: the same glass tile, one bar left */}
        <div style={{opacity: ic.back}}>
          <Solid x={600} y={430} w={150} h={150} r={38} rot={8} />
        </div>
        <div style={{position: 'absolute', inset: 0, opacity: clamp(ic.front * 1.4), transform: `translateY(${30 * (1 - ic.front)}px)`}}>
          <Glass x={400} y={470} w={280} h={230} r={44}>
            <div style={{position: 'absolute', left: 58, bottom: 48, display: 'flex', alignItems: 'flex-end', gap: 20}}>
              {BARS.map((b) => (
                <div
                  key={b}
                  style={{width: 30, height: 34 + b * 32, borderRadius: 9, background: `rgba(255,255,255,${b === 0 ? 1 : 0.2})`, boxShadow: b === 0 ? '0 0 18px rgba(255,255,255,0.6)' : undefined}}
                />
              ))}
            </div>
          </Glass>
        </div>
      </B>
    </>
  );
};

// ---------- 7. CTA (blue): Jetnode VPN, glass calendar «3», the bot ----------

const S7: React.FC<{lt: number; part: Part}> = ({lt, part}) => {
  const ic = iconIn(lt, 6.4);
  const three = eback(prog(lt, 7.0, 7.35), 1.7);
  const btn = appear(lt, 8.5, 0.5);
  const press = lt > 9.5 && lt < 9.75 ? 1 - 0.05 * Math.sin(Math.PI * prog(lt, 9.5, 9.75)) : 1;
  return (
    <>
      <H part={part}>
        <Logo lt={lt} />
        <Headline lt={lt} lines={['попробуй', '*Jetnode* VPN']} dark top={260} size={92} />
        <div style={{position: 'absolute', left: 75, top: 540, ...softIn(appear(lt, 4.8), 8)}}>
          <Pill label="работает даже при ограничениях" dark />
        </div>
      </H>
      <B part={part}>
        {/* calendar: solid top bar behind, glass body with «3» in front */}
        <div style={{opacity: ic.back, transform: `translate(${24 * (1 - ic.back)}px, ${-24 * (1 - ic.back)}px)`}}>
          <Solid x={330} y={700} w={420} h={170} r={56} />
          {[420, 620].map((x) => (
            <div key={x} style={{position: 'absolute', left: x, top: 660, width: 40, height: 100, borderRadius: 20, background: '#fff', boxShadow: '0 6px 18px rgba(10,40,130,0.3)'}} />
          ))}
        </div>
        <div style={{position: 'absolute', inset: 0, opacity: clamp(ic.front * 1.4), transform: `translateY(${60 * (1 - ic.front)}px)`}}>
          <Glass x={300} y={770} w={480} h={400} r={72}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONT,
                fontSize: 250,
                fontWeight: 700,
                color: '#fff',
                textShadow: '0 8px 30px rgba(10,40,130,0.35)',
                transform: `scale(${three})`,
                opacity: lt >= 7.0 ? 1 : 0,
              }}
            >
              3
            </div>
            <Sheen lt={lt} t0={7.4} r={72} />
          </Glass>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1200, display: 'flex', justifyContent: 'center', ...softIn(appear(lt, 7.3), 8)}}>
          <Pill label="3 дня бесплатно" dark />
        </div>
        {/* glass button with the bot handle */}
        <div style={{position: 'absolute', inset: 0, opacity: btn, transform: `translateY(${20 * (1 - btn)}px)`}}>
          <Glass x={240} y={1290} w={600} h={110} r={55} style={{transform: `scale(${press})`, background: 'linear-gradient(150deg, rgba(255,255,255,0.95), rgba(235,243,255,0.9))'}}>
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 40, fontWeight: 600, color: GLASS.solid}}>
              @jetnodevpn_bot
            </div>
          </Glass>
        </div>
        <TapRing lt={lt} at={9.6} x={540} y={1345} dark />
      </B>
    </>
  );
};

const CONTENT = [S1, S2, S3, S4, S5, S6, S7];

// ---------- camera: quick expo punch-ins on the content layer, no slow drift ----------

const camera = (lt: number, zooms: {t: number; s: number; x: number; y: number; d?: number}[]) => {
  let s = 1;
  let x = 540;
  let y = 900;
  let blur = 0;
  for (const z of zooms) {
    const d = z.d ?? 0.6;
    const p = prog(lt, z.t, z.t + d);
    if (p <= 0) break;
    const e = expoInOut(p);
    s = lerp(s, z.s, e);
    x = lerp(x, z.x, e);
    y = lerp(y, z.y, e);
    if (p < 1 && d > 0.01) blur = 5 * Math.sin(Math.PI * p);
  }
  return {s, x, y, blur};
};

// ---------- glow flash on key beats (welcome video: 0.35 s up, 0.8 s down) ----------

const Flash: React.FC<{t: number}> = ({t}) => (
  <>
    {BEATS.map(([i, b], k) => {
      const t0 = at(i, b);
      const up = prog(t, t0 - 0.05, t0 + 0.3);
      const down = prog(t, t0 + 0.3, t0 + 1.1);
      if (up <= 0 || down >= 1) return null;
      const a = up < 1 ? eo3(up) : 1 - eio(down);
      const s = up < 1 ? lerp(0.7, 1.15, eo3(up)) : lerp(1.15, 1.3, down);
      const dark = onDark(SCENES[i].bg);
      const c = dark ? '255,255,255' : '97,115,244';
      return (
        <div
          key={k}
          style={{
            position: 'absolute',
            left: 540 - 800,
            top: 950 - 800,
            width: 1600,
            height: 1600,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(${c},${dark ? 0.32 : 0.2}) 0%, rgba(${c},0) 62%)`,
            opacity: a,
            transform: `scale(${s})`,
            mixBlendMode: dark ? 'screen' : 'multiply',
          }}
        />
      );
    })}
  </>
);

// ---------- captions: centred chunks; Plum on Shell, white on blue and night ----------

const Captions: React.FC<{t: number}> = ({t}) => {
  const dark = onDark(SCENES[sceneAt(t)].bg);
  return (
    <>
      {SUBS.map((c, i) => {
        if (t < c.from - 0.05 || t > c.to + 0.05) return null;
        const e = eio(prog(t, c.from - 0.05, c.from + 0.45));
        const out = eio(prog(t, c.to - 0.28, c.to + 0.05));
        const k = e * (1 - out);
        if (k <= 0.001) return null;
        const tint = 1 - prog(t, c.from + 0.2, c.from + 0.9);
        const color = dark ? `rgba(255,255,255,${lerp(1, 0.92, 1 - tint)})` : `color-mix(in srgb, ${K.peri} ${Math.round(tint * 55)}%, ${K.plum})`;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 90,
              width: 900,
              top: 1500,
              textAlign: 'center',
              fontFamily: FONT,
              fontSize: 56,
              fontWeight: 600,
              letterSpacing: -0.5,
              whiteSpace: 'nowrap',
              color,
              textShadow: dark ? '0 2px 18px rgba(5,11,40,0.35)' : undefined,
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
};

export const TrafficNews: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{background: K.shell, overflow: 'hidden'}}>
      {/* backgrounds cross-fade with their scenes */}
      {SCENES.map((sc, i) => {
        const prev = SCENES[i - 1];
        if (prev && prev.bg === sc.bg) return null;
        let end = i;
        while (end + 1 < SCENES.length && SCENES[end + 1].bg === sc.bg) end++;
        const to = SCENES[end].to;
        if (t < sc.from - XF || t > to + XF) return null;
        const vin = i === 0 ? 1 : eo3(prog(t, sc.from - XF, sc.from + XF));
        const vout = end === SCENES.length - 1 ? 1 : 1 - eo3(prog(t, to - XF, to + XF));
        const Bgc = BG_OF[sc.bg];
        return (
          <AbsoluteFill key={`bg${i}`} style={{opacity: Math.min(vin, vout)}}>
            <Bgc />
          </AbsoluteFill>
        );
      })}
      {SCENES.map((sc, i) => {
        if (t < sc.from - XF || t > sc.to + XF) return null;
        // scenes run on design time, SPEED× faster than the clock
        const lt = (t - sc.from) * SPEED;
        const last = i === SCENES.length - 1;
        const prevZoom = i > 0 && SCENES[i - 1].out === 'zoom';
        // push like the welcome video's scroll: the old scene leaves up, the new one arrives from below (expo in-out)
        const pin = i === 0 || prevZoom ? 1 : expoInOut(prog(t, sc.from - XF, sc.from + XF));
        const pout = last || sc.out === 'zoom' ? 0 : expoInOut(prog(t, sc.to - XF, sc.to + XF));
        const dy = 1100 * (1 - pin) - 1100 * pout;
        const mv = Math.sin(Math.PI * (pin < 1 ? pin : pout));
        const v = prevZoom ? eo3(prog(t, sc.from - 0.1, sc.from + 0.3)) : 1;
        const cam = camera(lt, sc.zooms);
        const zt = sc.out === 'zoom' ? prog(t, sc.to - 0.45, sc.to + 0.05) : 0;
        const zs = 1 + 1.6 * zt ** 3;
        const zin = prevZoom ? lerp(0.9, 1, eoexpo(prog(t, sc.from - 0.1, sc.from + 0.5))) : 1;
        const Content = CONTENT[i];
        return (
          <AbsoluteFill key={i} style={{opacity: v, transform: `translateY(${dy}px)`, filter: mv > 0.05 || v < 0.99 ? `blur(${10 * mv + 12 * (1 - v)}px)` : undefined}}>
            <Content lt={lt} part="head" />
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
              <Content lt={lt} part="body" />
            </div>
          </AbsoluteFill>
        );
      })}
      <Flash t={t} />
      <Captions t={t} />
    </AbsoluteFill>
  );
};

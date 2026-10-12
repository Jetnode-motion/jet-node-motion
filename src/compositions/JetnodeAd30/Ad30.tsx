import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F, H, W} from '../../style/tokens';
import {clamp, eback, eio, eo3, eq5, lerp, press, prog} from '../../style/ease';
import {DotGrid, ShellBackground} from '../../components/Background';
import {AppIcon, Plane} from '../../components/Primitives';
import {Plate} from '../../components/Plate';
import {Phone, SCREEN} from '../../components/Phone';
import {TouchTap} from '../../components/Touch';
import {Grain} from '../../components/Grain';
import {Glyph, GlyphName} from '../../components/Glyphs';
import {Subtitles} from '../../components/Subtitles';
import {Badge, Card, DrawLine, Pulse, RichLine, Status, cascade} from '../../components/Reveal';
import {Brand, BrandIcon, brandName} from '../../components/BrandIcon';
import {BOT_BTN, BotChat} from '../../screens/BotChat';
import {AppHome} from '../../screens/AppHome';
import {
  ADS_OFF,
  APP_SHIFT,
  APP_SPLASH,
  BOT_MSG,
  DEEPLINK,
  DEVICES_ON,
  DURATION,
  LOGO_PULSE,
  S,
  SPEED_SWEEP,
  START_MSG,
  SUBS,
  TAP_CONNECT,
  TAP_CTA,
  TAP_POWER,
  VO,
} from './timeline';

type Pt = [number, number];
const sw = (t: number, t0: number, d = 0.2) => eo3(prog(t, t0, t0 + d));

const Scene: React.FC<{t: number; w: readonly [number, number]; children: React.ReactNode}> = ({t, w, children}) => {
  if (t < w[0] || t >= w[1]) return null;
  const out = eo3(prog(t, w[1] - 0.22, w[1]));
  return <div style={{position: 'absolute', inset: 0, opacity: 1 - out, filter: out > 0.01 ? `blur(${9 * out}px)` : undefined}}>{children}</div>;
};

const Abs: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, children, style}) => (
  <div style={{position: 'absolute', left: x, top: y, ...style}}>{children}</div>
);

const Caption: React.FC<{t: number; t0: number; y: number; children: React.ReactNode}> = ({t, t0, y, children}) => {
  const e = eo3(prog(t, t0, t0 + 0.4));
  return (
    <div style={{position: 'absolute', left: 75, width: 930, top: y, textAlign: 'center', fontFamily: F.main, fontSize: 32, color: C.gray, opacity: e, transform: `translateY(${14 * (1 - e)}px)`}}>
      {children}
    </div>
  );
};

const Spinner: React.FC<{t: number; size: number; color?: string}> = ({t, size, color = C.gray}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{transform: `rotate(${t * 420}deg)`}}>
    <circle cx={12} cy={12} r={9} fill="none" stroke={color} strokeOpacity={0.2} strokeWidth={3} />
    <path d="M12 3 a9 9 0 0 1 9 9" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
  </svg>
);

/* ---------- 1. hook: real apps stop loading ---------- */

const HOOK_APPS: Brand[] = ['youtube', 'instagram', 'tiktok', 'whatsapp', 'telegram', 'discord', 'netflix', 'spotify', 'chatgpt'];
const failAt = (i: number) => (i < 3 ? 2.95 + i * 0.22 : 3.75 + (i - 3) * 0.07);

const Hook: React.FC<{t: number}> = ({t}) => (
  <>
    {HOOK_APPS.map((b, i) => {
      const c = i % 3;
      const r = Math.floor(i / 3);
      const x = 75 + c * 317;
      const y = 560 + r * 216;
      const fail = sw(t, failAt(i), 0.18);
      return (
        <React.Fragment key={b}>
          <Card x={x} y={y} w={296} h={196} t={t} t0={cascade(0.1, i)} live={1 - 0.45 * fail}>
            <Abs x={22} y={22}>
              <BrandIcon brand={b} size={76} grey={0.6 * fail} />
            </Abs>
            <Abs x={112} y={36} style={{fontFamily: F.main, fontSize: 28, fontWeight: 600, color: C.ink}}>
              {brandName(b)}
            </Abs>
            <Abs x={24} y={132}>
              {fail > 0.5 ? (
                <Status label="не грузится" color={C.coral} t={t} />
              ) : (
                <span style={{display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: F.main, fontSize: 24, fontWeight: 500, color: C.gray}}>
                  <Spinner t={t} size={24} />
                  загрузка…
                </span>
              )}
            </Abs>
          </Card>
          <Badge t={t} t0={failAt(i) + 0.03} color={C.coral} style={{left: x + 296 - 30, top: y - 10}}>
            !
          </Badge>
        </React.Fragment>
      );
    })}
  </>
);

/* ---------- 2. logo: apps come back ---------- */

const LOGO_APPS: Brand[] = ['youtube', 'instagram', 'tiktok', 'whatsapp', 'discord', 'netflix'];
const LX = LOGO_APPS.map((_, i) => 75 + 75 + i * 156);
const lpath = (i: number): Pt[] => [
  [540, 985],
  [540, 1040],
  [LX[i], 1040],
  [LX[i], 1098],
];
const larrive = (i: number) => LOGO_PULSE + 0.12 + (0.42 * Math.abs(LX[i] - 540)) / 390;

const Logo: React.FC<{t: number}> = ({t}) => {
  const a = S.logo[0];
  const ip = eback(prog(t, a + 0.05, a + 0.5), 1.5);
  const nm = eo3(prog(t, a + 0.25, a + 0.6));
  const cap = eo3(prog(t, a + 0.45, a + 0.8));
  return (
    <>
      <div style={{position: 'absolute', left: 540 - 100, top: 640 - 100, transform: `scale(${ip})`}}>
        <AppIcon size={200} glint={prog(t, a + 0.5, a + 1.2)} />
      </div>
      <div style={{position: 'absolute', left: 0, width: W, top: 790, textAlign: 'center', fontFamily: F.main, fontSize: 76, fontWeight: 600, color: C.ink, opacity: nm, transform: `translateY(${20 * (1 - nm)}px)`}}>JetnodeVPN</div>
      <div style={{position: 'absolute', left: 0, width: W, top: 895, textAlign: 'center', opacity: cap}}>
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 24px', borderRadius: 30, background: 'rgba(97,115,244,0.10)', fontFamily: F.main, fontSize: 28, fontWeight: 500, color: C.peri}}>
          <Glyph name="shield" size={30} color={C.peri} stroke={2.2} />
          работает даже при ограничениях операторов
        </span>
      </div>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={W} height={H}>
        {LX.map((_, i) => (
          <DrawLine key={i} pts={lpath(i)} p={prog(t, LOGO_PULSE - 0.45, LOGO_PULSE)} color="rgba(97,115,244,0.4)" width={4} />
        ))}
        {LX.map((_, i) => (
          <Pulse key={i} pts={lpath(i)} u={prog(t, LOGO_PULSE, larrive(i))} />
        ))}
        {[2, 0, 4, 1, 5, 3].map((i, k) => {
          const st = LOGO_PULSE + 0.8 + k * 0.3;
          return <Pulse key={`i${k}`} pts={lpath(i)} u={prog(t, st, st + 0.55)} color={C.green} r={8} />;
        })}
      </svg>
      {LOGO_APPS.map((b, i) => {
        const ok = sw(t, larrive(i), 0.2);
        return (
          <React.Fragment key={b}>
            <Card x={LX[i] - 72} y={1098} w={144} h={176} radius={30} t={t} t0={cascade(a + 0.35, i)} live={0.5 + 0.5 * ok} glow={0.6 * ok * Math.exp(-Math.max(0, t - larrive(i)) * 2)}>
              <Abs x={30} y={22}>
                <BrandIcon brand={b} size={84} grey={1 - ok} />
              </Abs>
              <div style={{position: 'absolute', left: 0, right: 0, top: 122, textAlign: 'center', fontFamily: F.main, fontSize: 21, fontWeight: 500, color: C.ink}}>{brandName(b)}</div>
            </Card>
            <Badge t={t} t0={larrive(i)} color={C.green} size={36} style={{left: LX[i] + 72 - 26, top: 1098 - 10}}>
              <Glyph name="check" size={24} color="#fff" stroke={3.2} />
            </Badge>
          </React.Fragment>
        );
      })}
    </>
  );
};

/* ---------- 3. bot → deeplink → app ---------- */

const PCX = 540;
const PCY = 1180;
const SX0 = PCX - SCREEN.w / 2 - 0;
const SY0 = PCY - SCREEN.h / 2;
const s2w = (x: number, y: number): Pt => [SX0 + x, SY0 + y];

const ScreenContent: React.FC<{t: number}> = ({t}) => {
  if (t < APP_SPLASH) {
    const k = eq5(prog(t, DEEPLINK, APP_SPLASH - 0.05));
    return (
      <>
        <BotChat t={t} startMsg={START_MSG} botMsg={BOT_MSG} tap={TAP_CONNECT} />
        {t >= DEEPLINK && (
          <div
            style={{
              position: 'absolute',
              left: lerp(BOT_BTN.x, 0, k),
              top: lerp(BOT_BTN.y, 0, k),
              width: lerp(BOT_BTN.w, SCREEN.w, k),
              height: lerp(BOT_BTN.h, SCREEN.h, k),
              borderRadius: lerp(16, 80, k),
              background: `rgb(${lerp(163, 8, k)},${lerp(22, 26, k)},${lerp(29, 66, k)})`,
            }}
          />
        )}
      </>
    );
  }
  const e = eo3(prog(t, APP_SPLASH, APP_SPLASH + 0.45));
  return (
    <div style={{position: 'absolute', inset: 0, filter: e < 1 ? `blur(${12 * (1 - e)}px)` : undefined}}>
      <AppHome t={t - APP_SHIFT} />
    </div>
  );
};

const Bot: React.FC<{t: number}> = ({t}) => {
  const a = S.bot[0];
  const up = eo3(prog(t, a, a + 0.5));
  return (
    <div style={{position: 'absolute', left: 0, top: 900 * (1 - up), width: W, height: H}}>
      <Phone cx={PCX} cy={PCY} rot={0.01 * Math.sin(t * 1.1)}>
        <ScreenContent t={t} />
      </Phone>
    </div>
  );
};

/* ---------- 4. servers ---------- */

const Flag: React.FC<{code: string; size: number}> = ({code, size}) => {
  const body = (() => {
    switch (code) {
      case 'CH':
        return (
          <>
            <rect width={30} height={30} fill="#DA291C" />
            <path d="M12.5 7h5v5.5h5.5v5h-5.5v5.5h-5v-5.5h-5.5v-5h5.5z" fill="#fff" />
          </>
        );
      case 'SE':
        return (
          <>
            <rect width={30} height={30} fill="#006AA7" />
            <rect x={9} width={5} height={30} fill="#FECC00" />
            <rect y={12.5} width={30} height={5} fill="#FECC00" />
          </>
        );
      case 'NL':
        return (
          <>
            <rect width={30} height={10} fill="#AE1C28" />
            <rect y={10} width={30} height={10} fill="#fff" />
            <rect y={20} width={30} height={10} fill="#21468B" />
          </>
        );
      case 'PL':
        return (
          <>
            <rect width={30} height={15} fill="#fff" />
            <rect y={15} width={30} height={15} fill="#DC143C" />
          </>
        );
      case 'FI':
        return (
          <>
            <rect width={30} height={30} fill="#fff" />
            <rect x={9} width={5.5} height={30} fill="#002F6C" />
            <rect y={12.25} width={30} height={5.5} fill="#002F6C" />
          </>
        );
      default:
        return (
          <>
            <rect width={30} height={10} fill="#000" />
            <rect y={10} width={30} height={10} fill="#DD0000" />
            <rect y={20} width={30} height={10} fill="#FFCE00" />
          </>
        );
    }
  })();
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" style={{borderRadius: '50%', boxShadow: '0 4px 12px rgba(30,30,60,0.18), inset 0 0 0 1px rgba(0,0,0,0.08)', display: 'block'}}>
      <defs>
        <clipPath id={`fc${code}`}>
          <circle cx={15} cy={15} r={15} />
        </clipPath>
      </defs>
      <g clipPath={`url(#fc${code})`}>{body}</g>
      <circle cx={15} cy={15} r={14.5} fill="none" stroke="rgba(0,0,0,0.08)" />
    </svg>
  );
};

const SERVERS = [
  {code: 'CH', name: 'Швейцария'},
  {code: 'SE', name: 'Швеция'},
  {code: 'NL', name: 'Нидерланды'},
  {code: 'PL', name: 'Польша'},
  {code: 'FI', name: 'Финляндия'},
  {code: 'DE', name: 'Германия'},
];
/** Moments the voiceover names a country: the card lights up. */
const SAY = {CH: 17.75, FI: 18.75} as Record<string, number>;

const Servers: React.FC<{t: number}> = ({t}) => {
  const a = S.servers[0];
  return (
    <>
      {SERVERS.map((s, i) => {
        const c = i % 2;
        const r = Math.floor(i / 2);
        const x = 75 + c * 475;
        const y = 590 + r * 196;
        const t0 = cascade(a + 0.15, i, 0.09);
        const hl = SAY[s.code] ? Math.exp(-Math.max(0, t - SAY[s.code]) * 1.5) * (t >= SAY[s.code] ? 1 : 0) : 0;
        return (
          <Card key={s.code} x={x} y={y} w={455} h={176} t={t} t0={t0} glow={hl} style={{transform: `scale(${1 + 0.03 * hl})`}}>
            <Abs x={26} y={44}>
              <div style={{transform: `scale(${eback(prog(t, t0 + 0.05, t0 + 0.35), 2)})`}}>
                <Flag code={s.code} size={88} />
              </div>
            </Abs>
            <Abs x={136} y={46} style={{fontFamily: F.main, fontSize: 34, fontWeight: 600, color: C.ink}}>
              {s.name}
            </Abs>
            <Abs x={136} y={100}>
              <Status label="онлайн" color={C.green} t={t + i} blink />
            </Abs>
            <div style={{position: 'absolute', right: 28, top: 70, display: 'flex', alignItems: 'flex-end', gap: 5, height: 34}}>
              {[12, 19, 26, 33].map((hh, b) => {
                const on = sw(t, t0 + 0.2 + b * 0.07, 0.12);
                return <div key={b} style={{width: 9, height: hh, borderRadius: 3, background: on > 0.5 ? C.green : 'rgba(59,46,64,0.15)', boxShadow: on > 0.5 ? `0 0 8px ${C.green}80` : undefined}} />;
              })}
            </div>
          </Card>
        );
      })}
      <Caption t={t} t0={a + 0.8} y={1210}>
        Локации в Европе и СНГ
      </Caption>
    </>
  );
};

/* ---------- 5. speed + YouTube without ads ---------- */

const arcPath = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (a: number) => [cx + r * Math.cos(a), cy - r * Math.sin(a)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
  return `M${x0} ${y0} A${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
};

const Speed: React.FC<{t: number}> = ({t}) => {
  const a = S.speed[0];
  const inK = eo3(prog(t, a, a + 0.35));
  const f = eio(prog(t, SPEED_SWEEP[0], SPEED_SWEEP[1]));
  const A0 = Math.PI * 1.15;
  const A1 = -Math.PI * 0.15;
  const af = lerp(A0, A1, f);
  const cx = 540;
  const cy = 860;
  const R = 280;
  const tip = [cx + R * Math.cos(af), cy - R * Math.sin(af)];
  const yt = eback(prog(t, ADS_OFF - 0.45, ADS_OFF - 0.1), 1.4);
  const off = sw(t, ADS_OFF, 0.25);
  const strike = eo3(prog(t, ADS_OFF - 0.08, ADS_OFF + 0.15));
  return (
    <>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: inK}} width={W} height={H}>
        <defs>
          <linearGradient id="spd" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor={C.peri} />
            <stop offset="1" stopColor={C.mint} />
          </linearGradient>
        </defs>
        <path d={arcPath(cx, cy, R, A0, A1)} fill="none" stroke="rgba(97,115,244,0.12)" strokeWidth={34} strokeLinecap="round" />
        {f > 0.005 && <path d={arcPath(cx, cy, R, A0, af)} fill="none" stroke="url(#spd)" strokeWidth={34} strokeLinecap="round" style={{filter: 'drop-shadow(0 0 14px rgba(97,115,244,0.45))'}} />}
        {Array.from({length: 11}, (_, k) => {
          const ak = lerp(A0, A1, k / 10);
          const r0 = R - 48;
          const r1 = R - (k % 5 === 0 ? 74 : 62);
          return <line key={k} x1={cx + r0 * Math.cos(ak)} y1={cy - r0 * Math.sin(ak)} x2={cx + r1 * Math.cos(ak)} y2={cy - r1 * Math.sin(ak)} stroke={k / 10 <= f ? C.peri : 'rgba(59,46,64,0.2)'} strokeWidth={4} strokeLinecap="round" />;
        })}
        <circle cx={tip[0]} cy={tip[1]} r={22} fill="#fff" stroke={C.peri} strokeWidth={6} style={{filter: 'drop-shadow(0 4px 10px rgba(97,115,244,0.45))'}} />
      </svg>
      <div style={{position: 'absolute', left: 0, width: W, top: cy - 120, textAlign: 'center', fontFamily: F.main, fontSize: 190, fontWeight: 600, color: C.ink, letterSpacing: -4, opacity: inK, fontVariantNumeric: 'tabular-nums'}}>
        {Math.round(10 * f)}
      </div>
      <div style={{position: 'absolute', left: 0, width: W, top: cy + 90, textAlign: 'center', fontFamily: F.main, fontSize: 42, fontWeight: 500, color: C.gray, opacity: inK}}>Гбит/с</div>
      {t >= ADS_OFF - 0.45 && (
        <div style={{position: 'absolute', left: 540 - 380, top: 1150, transform: `translateY(${40 * (1 - yt)}px) scale(${lerp(0.94, 1, clamp(yt))})`, opacity: clamp(yt)}}>
          <Card x={0} y={0} w={760} h={150} t={t} t0={ADS_OFF - 0.45} glow={0.5 * off}>
            <Abs x={26} y={30}>
              <BrandIcon brand="youtube" size={90} />
            </Abs>
            <Abs x={140} y={50} style={{fontFamily: F.main, fontSize: 40, fontWeight: 600, color: C.ink}}>
              YouTube
            </Abs>
            <div style={{position: 'absolute', right: 28, top: 46, display: 'flex', alignItems: 'center'}}>
              {off < 0.99 && (
                <div style={{position: 'relative', padding: '12px 22px', borderRadius: 30, background: 'rgba(243,94,62,0.12)', color: C.coral, fontFamily: F.main, fontSize: 28, fontWeight: 600, opacity: 1 - off, transform: `scale(${1 - 0.3 * off})`}}>
                  Реклама 0:15
                  <div style={{position: 'absolute', left: 14, top: '50%', height: 4, width: `${(100 - 18) * strike}%`, background: C.coral, borderRadius: 2}} />
                </div>
              )}
              {off > 0.01 && (
                <div style={{position: off < 0.99 ? 'absolute' : 'relative', right: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 22px', borderRadius: 30, background: 'rgba(43,182,115,0.12)', color: C.green, fontFamily: F.main, fontSize: 28, fontWeight: 600, opacity: off, transform: `scale(${eback(prog(t, ADS_OFF, ADS_OFF + 0.3), 2)})`, whiteSpace: 'nowrap'}}>
                  <Glyph name="check" size={28} color={C.green} stroke={3} />
                  без рекламы
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

/* ---------- 6. price ---------- */

const DEVICES: {g: GlyphName; label: string}[] = [
  {g: 'phone', label: 'телефон'},
  {g: 'laptop', label: 'ноутбук'},
  {g: 'tablet', label: 'планшет'},
];

const Price: React.FC<{t: number}> = ({t}) => {
  const a = S.price[0];
  const bn = eo3(prog(t, a, a + 0.35));
  const pr = eback(prog(t, a + 0.45, a + 0.85), 1.5);
  const sub = eo3(prog(t, a + 0.6, a + 0.95));
  return (
    <>
      <div style={{position: 'absolute', left: 540 - 400, top: 520, width: 800, height: 441, borderRadius: 34, overflow: 'hidden', opacity: bn, transform: `scale(${lerp(0.96, 1, bn)})`, filter: bn < 1 ? `blur(${6 * (1 - bn)}px)` : undefined, boxShadow: '0 30px 60px rgba(29,85,181,0.25), 0 0 40px rgba(97,115,244,0.25)'}}>
        <Img src={staticFile('bot/banner-trial.png')} style={{width: '104%', height: '104%', marginLeft: '-2%', marginTop: '-2%', objectFit: 'cover'}} />
        <div style={{position: 'absolute', inset: 0, borderRadius: 34, boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.35)'}} />
      </div>
      <div style={{position: 'absolute', left: 0, width: W, top: 1000, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 22, transform: `scale(${pr})`, opacity: clamp(pr)}}>
        <span style={{fontFamily: F.main, fontSize: 52, fontWeight: 400, color: C.gray}}>от</span>
        <span style={{fontFamily: F.main, fontSize: 132, fontWeight: 600, color: C.ink, letterSpacing: -3}}>149 ₽</span>
        <span style={{fontFamily: F.main, fontSize: 52, fontWeight: 400, color: C.gray}}>/мес</span>
      </div>
      <div style={{position: 'absolute', left: 0, width: W, top: 1172, textAlign: 'center', fontFamily: F.main, fontSize: 34, color: C.plum, opacity: sub}}>
        за 3 устройства
      </div>
      <div style={{position: 'absolute', left: 0, width: W, top: 1240, display: 'flex', justifyContent: 'center', gap: 46}}>
        {DEVICES.map((d, i) => {
          const on = sw(t, DEVICES_ON + i * 0.18, 0.2);
          const pop = eback(prog(t, DEVICES_ON + i * 0.18, DEVICES_ON + i * 0.18 + 0.3), 2);
          return (
            <div key={d.g} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: sub}}>
              <div
                style={{
                  width: 104,
                  height: 104,
                  borderRadius: 52,
                  background: on > 0.5 ? `linear-gradient(135deg, ${C.peri}, ${C.sky})` : 'linear-gradient(135deg, #EDEDF3, #E3E3EC)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${t >= DEVICES_ON + i * 0.18 ? pop : 1})`,
                  boxShadow: on > 0.5 ? '0 0 26px rgba(97,115,244,0.45), inset 0 0 12px rgba(255,255,255,0.4)' : '0 6px 16px rgba(40,40,90,0.08)',
                }}
              >
                <Glyph name={d.g} size={54} color={on > 0.5 ? '#fff' : C.gray} stroke={2.2} />
              </div>
              <span style={{fontFamily: F.main, fontSize: 24, color: on > 0.5 ? C.peri : C.gray}}>{d.label}</span>
            </div>
          );
        })}
      </div>
    </>
  );
};

/* ---------- 7. end card ---------- */

const End: React.FC<{t: number}> = ({t}) => {
  const a = S.end[0];
  const ip = eback(prog(t, a, a + 0.45), 1.5);
  const nm = eo3(prog(t, a + 0.2, a + 0.55));
  const l1 = eback(prog(t, a + 0.35, a + 0.75), 1.6);
  const pill = eback(prog(t, a + 0.55, a + 0.9), 1.5);
  const cta = eback(prog(t, a + 0.75, a + 1.1), 1.5);
  const cap = eo3(prog(t, a + 1.0, a + 1.4));
  const fl = t >= TAP_CTA ? clamp(1 - (t - TAP_CTA) / 0.3) : 0;
  return (
    <>
      <div style={{position: 'absolute', left: 540 - 105, top: 620 - 105, transform: `scale(${ip})`}}>
        <AppIcon size={210} glint={prog(t, a + 0.5, a + 1.2)} />
      </div>
      <div style={{position: 'absolute', left: 0, width: W, top: 760, textAlign: 'center', fontFamily: F.main, fontSize: 80, fontWeight: 600, color: C.ink, opacity: nm, transform: `translateY(${20 * (1 - nm)}px)`}}>JetnodeVPN</div>
      <div style={{position: 'absolute', left: 0, width: W, top: 870, display: 'flex', justifyContent: 'center', transform: `scale(${l1})`, opacity: clamp(l1)}}>
        <RichLine text="3 дня *бесплатно*" size={62} weight={500} />
      </div>
      <div style={{position: 'absolute', left: 540, top: 1065, transform: `translate(-50%,-50%) scale(${pill})`, opacity: clamp(pill)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '16px 34px 16px 18px', borderRadius: 48, background: '#fff', boxShadow: '0 16px 36px rgba(40,40,90,0.12), inset 0 0 0 2px rgba(38,165,228,0.25)'}}>
          <BrandIcon brand="telegram" size={64} />
          <span style={{fontFamily: F.main, fontSize: 42, fontWeight: 600, color: C.ink}}>@jetnodevpn_bot</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 540, top: 1215, transform: `translate(-50%,-50%) scale(${cta * (1 - 0.05 * press(t, TAP_CTA))})`, opacity: clamp(cta)}}>
        <Plate width={560} height={124} radius={40} glow="rgba(97,115,244,0.45)" shadow={0.25} corner={0.35}>
          <div style={{position: 'relative', width: 56, height: 56, marginRight: 14}}>
            <Plane x={28} y={28} width={56} />
          </div>
          <span style={{fontFamily: F.main, fontSize: 46, fontWeight: 600, color: '#fff'}}>Получить 3 дня</span>
        </Plate>
        <div style={{position: 'absolute', inset: 0, borderRadius: 40, background: '#fff', opacity: 0.2 * fl}} />
      </div>
      <div style={{position: 'absolute', left: 0, width: W, top: 1310, textAlign: 'center', fontFamily: F.main, fontSize: 32, color: C.gray, opacity: cap}}>Ссылка на бота в профиле</div>
    </>
  );
};

/* ---------- camera ---------- */

// [time, scale, cx, cy]; (cx, cy) lands on the screen centre. Hard switches between scenes happen during the blur-out.
const CAM: [number, number, number, number][] = [
  [0, 1.1, 540, 880],
  [2.35, 1.14, 540, 880],
  [2.85, 1.45, 540, 668],
  [3.7, 1.45, 540, 668],
  [4.4, 1.08, 540, 880],
  [4.86, 1.08, 540, 880],
  [4.87, 1.2, 540, 915],
  [5.6, 1.12, 540, 915],
  [8.1, 1.15, 540, 915],
  [8.11, 0.74, 540, 978],
  [9.55, 0.74, 540, 978],
  [10.05, 1.42, 540, SY0 + 871],
  [10.95, 1.42, 540, SY0 + 871],
  [11.45, 1.72, 540, SY0 + BOT_BTN.y + BOT_BTN.h / 2],
  [12.25, 1.72, 540, SY0 + BOT_BTN.y + BOT_BTN.h / 2],
  [12.8, 0.8, 540, 990],
  [14.3, 0.8, 540, 990],
  [14.7, 1.3, 540, SY0 + 640],
  [15.6, 1.3, 540, SY0 + 640],
  [16.25, 1.1, 540, SY0 + 640],
  [16.26, 1.2, 540, 905],
  [16.9, 1.14, 540, 905],
  [18.3, 1.14, 540, 905],
  [19.3, 1.2, 470, 1000],
  [19.36, 1.32, 540, 900],
  [20.6, 1.32, 540, 900],
  [21.0, 1.08, 540, 980],
  [22.4, 1.1, 540, 980],
  [22.46, 1.3, 540, 760],
  [23.25, 1.3, 540, 760],
  [23.75, 1.06, 540, 930],
  [25.45, 1.09, 540, 930],
  [25.5, 1.18, 540, 925],
  [26.3, 1.1, 540, 925],
  [30, 1.13, 540, 925],
];

const camera = (t: number) => {
  let [, s, cx, cy] = CAM[CAM.length - 1];
  for (let i = 0; i < CAM.length - 1; i++) {
    const a = CAM[i];
    const b = CAM[i + 1];
    if (t >= a[0] && t < b[0]) {
      const k = eq5(prog(t, a[0], b[0]));
      s = Math.exp(lerp(Math.log(a[1]), Math.log(b[1]), k));
      cx = lerp(a[2], b[2], k);
      cy = lerp(a[3], b[3], k);
      break;
    }
  }
  cy += 5 * Math.sin(t * 1.2);
  cx += 6 * Math.sin(t * 0.7);
  return {s, cx, cy};
};

const PHRASES = SUBS.map((text, i) => ({
  from: VO[i].at - 0.05,
  to: i < VO.length - 1 ? VO[i + 1].at - 0.12 : DURATION - 0.3,
  text,
  size: 58,
}));

export const JetnodeAd30: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const {s, cx, cy} = camera(t);
  const toScreen = ([x, y]: Pt) => ({x: (x - cx) * s + W / 2, y: (y - cy) * s + H / 2});
  const btn = toScreen(s2w(BOT_BTN.x + BOT_BTN.w * 0.55, BOT_BTN.y + BOT_BTN.h / 2));
  const pwr = toScreen(s2w(302, 640));
  const cta = toScreen([600, 1215]);
  return (
    <AbsoluteFill style={{fontFamily: F.main, color: C.ink, overflow: 'hidden'}}>
      <ShellBackground t={t} />
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: `translate(${W / 2}px, ${H / 2}px) scale(${s}) translate(${-cx}px, ${-cy}px)`}}>
        <DotGrid />
        <Scene t={t} w={S.hook}>
          <Hook t={t} />
        </Scene>
        <Scene t={t} w={S.logo}>
          <Logo t={t} />
        </Scene>
        <Scene t={t} w={S.bot}>
          <Bot t={t} />
        </Scene>
        <Scene t={t} w={S.servers}>
          <Servers t={t} />
        </Scene>
        <Scene t={t} w={S.speed}>
          <Speed t={t} />
        </Scene>
        <Scene t={t} w={S.price}>
          <Price t={t} />
        </Scene>
        <Scene t={t} w={[S.end[0], 99]}>
          <End t={t} />
        </Scene>
      </div>
      <TouchTap t={t} tap={TAP_CONNECT} x={btn.x} y={btn.y} size={120} color="255,255,255" />
      <TouchTap t={t} tap={TAP_POWER} x={pwr.x} y={pwr.y} size={150} color="134,232,168" />
      <TouchTap t={t} tap={TAP_CTA} x={cta.x} y={cta.y} size={110} />
      {/* top band keeps subtitles readable over close-ups */}
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: 500, background: 'linear-gradient(180deg, rgba(252,239,237,1) 0%, rgba(252,239,237,0.96) 62%, rgba(252,239,237,0) 100%)'}} />
      <Subtitles t={t} phrases={PHRASES} y={300} />
      <Grain />
    </AbsoluteFill>
  );
};

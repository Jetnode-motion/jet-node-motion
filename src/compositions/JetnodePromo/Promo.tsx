import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F, W} from '../../style/tokens';
import {clamp, eback, eio, eo3, eq5, lerp, press, prog} from '../../style/ease';
import {ShellBackground, DotGrid} from '../../components/Background';
import {Phone, SCREEN} from '../../components/Phone';
import {AppIcon, Plane, Txt} from '../../components/Primitives';
import {Plate} from '../../components/Plate';
import {TouchTap} from '../../components/Touch';
import {Subtitles} from '../../components/Subtitles';
import {Grain} from '../../components/Grain';
import {Whitelist} from '../../screens/Whitelist';
import {Chat} from '../../screens/Chat';
import {AppHome} from '../../screens/AppHome';
import {Servers} from '../../screens/Servers';
import {B1, B2, CAM_KEYS, FOCUS_Y, PCX, PCY, PHRASES, SX0, TAP1, TAP2, TAP3, TAP4, s2w} from './timeline';

const camera = (t: number) => {
  let s = CAM_KEYS[CAM_KEYS.length - 1][1];
  let cx = CAM_KEYS[CAM_KEYS.length - 1][2];
  let cy = CAM_KEYS[CAM_KEYS.length - 1][3];
  for (let i = 0; i < CAM_KEYS.length - 1; i++) {
    const a = CAM_KEYS[i];
    const b = CAM_KEYS[i + 1];
    if (t >= a[0] && t < b[0]) {
      const k = eq5(prog(t, a[0], b[0]));
      s = Math.exp(lerp(Math.log(a[1]), Math.log(b[1]), k));
      cx = lerp(a[2], b[2], k);
      cy = lerp(a[3], b[3], k);
      break;
    }
  }
  const sh = 9 * (1 - prog(t, 0, 0.5)) ** 2; // hook shake
  if (sh > 0.3) {
    cx += sh * Math.sin(t * 91);
    cy += sh * Math.cos(t * 77);
  }
  cy += 6 * Math.sin(t * 1.3); // gentle float
  cx += 8 * Math.sin(t * 0.7); // slow lateral drift
  return {s, cx, cy};
};

const planeX = (t: number) => lerp(-420, 1500, eio(prog(t, 1.72, 2.42)));

/** Which screen the phone shows, including the plane wipe, the deeplink expand and the push to servers. */
const ScreenContent: React.FC<{t: number}> = ({t}) => {
  if (t < 2.45) {
    if (t < 1.8) return <Whitelist t={t} />;
    const px = clamp(planeX(t) - SX0, 0, SCREEN.w);
    return (
      <>
        <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${SCREEN.w - px}px 0 0)`}}>
          <Chat t={t} />
        </div>
        <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 0 0 ${px}px)`}}>
          <Whitelist t={t} />
        </div>
      </>
    );
  }
  if (t < 6.9) {
    const k = eq5(prog(t, 6.52, 6.92));
    return (
      <>
        <Chat t={t} />
        {t >= 6.52 && (
          <div
            style={{
              position: 'absolute',
              left: lerp(B2.x, 0, k),
              top: lerp(B2.y, 0, k),
              width: lerp(B2.w, SCREEN.w, k),
              height: lerp(B2.h, SCREEN.h, k),
              borderRadius: lerp(20, 80, k),
              background: `rgb(${lerp(97, 14, k)},${lerp(115, 42, k)},${lerp(244, 102, k)})`,
            }}
          />
        )}
      </>
    );
  }
  if (t < 9.75) {
    // app content arrives from blur after the deeplink expand
    const e = eo3(prog(t, 6.9, 7.35));
    return (
      <div style={{position: 'absolute', inset: 0, filter: e < 1 ? `blur(${12 * (1 - e)}px)` : undefined}}>
        <AppHome t={t} />
      </div>
    );
  }
  // stage change: app dims out, the server list builds in from blur
  const out = eo3(prog(t, 9.75, 9.95));
  const inn = eo3(prog(t, 9.85, 10.25));
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: '#000'}} />
      {out < 1 && (
        <div style={{position: 'absolute', inset: 0, opacity: 1 - out, transform: `scale(${1 - 0.03 * out})`, filter: `blur(${8 * out}px)`}}>
          <AppHome t={t} />
        </div>
      )}
      <div style={{position: 'absolute', inset: 0, opacity: inn, filter: inn < 1 ? `blur(${12 * (1 - inn)}px)` : undefined, transform: `scale(${1.03 - 0.03 * inn})`}}>
        <Servers t={t} />
      </div>
    </>
  );
};

const Callout: React.FC<{t: number}> = ({t}) => {
  const a = eo3(prog(t, 5.35, 5.6)) * (1 - prog(t, 6.45, 6.6));
  if (a <= 0) return null;
  const p = eo3(prog(t, 5.45, 5.85));
  const k = eback(prog(t, 5.35, 5.65), 1.4);
  return (
    <>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
        <path
          d="M600 1418 Q700 1400 640 1338"
          fill="none"
          stroke={C.coral}
          strokeWidth={5}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - p}
          opacity={a}
        />
        {p > 0.95 && <path d="M630 1352 L640 1338 L655 1347" fill="none" stroke={C.coral} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={a} />}
      </svg>
      <div style={{position: 'absolute', left: 470, top: 1450, transform: `translate(-50%,-50%) scale(${k})`, opacity: a}}>
        <Plate width={410} height={52} radius={26} from="#1D1D1F" to="#3A3A48" glow="rgba(97,115,244,0.25)" glowSize={20} shadow={0.2} edge={0.7} corner={0.15} inner={0.6}>
          <span style={{fontSize: 21, fontWeight: 500, color: '#fff', whiteSpace: 'nowrap'}}>
            <span style={{color: C.mint}}>Диплинк: </span>подписка добавится сама
          </span>
        </Plate>
      </div>
    </>
  );
};

const PlaneWipe: React.FC<{t: number}> = ({t}) => {
  if (t < 1.72 || t > 2.42) return null;
  const x = planeX(t);
  const y = lerp(1330, 1030, prog(t, 1.72, 2.42));
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: x - 700,
          top: y - 30,
          width: 700,
          height: 60,
          borderRadius: 30,
          background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.55))',
          transform: 'rotate(-0.16rad)',
          transformOrigin: '100% 50%',
        }}
      />
      <Plane x={x} y={y} width={470} rot={Math.PI / 4 - 0.16} />
    </>
  );
};

const EndCard: React.FC<{t: number}> = ({t}) => {
  const u = t - 12.0;
  if (u < 0) return null;
  const ip = eback(prog(u, 0.05, 0.5), 1.4);
  const a = eo3(prog(u, 0.25, 0.6));
  const b = eo3(prog(u, 0.4, 0.75));
  const c = eback(prog(u, 0.55, 0.9), 1.6);
  const d = eback(prog(u, 0.8, 1.15));
  const fl = t >= TAP4 ? clamp(1 - (t - TAP4) / 0.3) : 0;
  return (
    <AbsoluteFill style={{opacity: eo3(prog(t, 11.95, 12.2))}}>
      <div style={{position: 'absolute', left: 540 - 150, top: 720 - 150, transform: `scale(${ip})`}}>
        <AppIcon size={300} glint={prog(u, 0.6, 1.3)} />
      </div>
      <Txt x={540} y={980 + 30 * (1 - a)} size={92} weight={600} anchor="c" opacity={a}>
        JetnodeVPN
      </Txt>
      <Txt x={540} y={1085 + 20 * (1 - b)} size={54} weight={400} anchor="c" opacity={0.75 * b}>
        Попробуй 3 дня
      </Txt>
      <Txt
        x={540}
        y={1200}
        size={130}
        weight={400}
        anchor="c"
        color={C.peri}
        family={F.accent}
        style={{transform: `translate(-50%,-50%) scale(${c})`, textShadow: '0 0 26px rgba(97,115,244,0.5)'}}
      >
        бесплатно
      </Txt>
      <div style={{position: 'absolute', left: 540, top: 1420, transform: `translate(-50%,-50%) scale(${d * (1 - 0.05 * press(t, TAP4))})`}}>
        <Plate width={520} height={128} radius={40} glow="rgba(97,115,244,0.45)" shadow={0.25} corner={0.35}>
          <div style={{position: 'relative', width: 56, height: 56, marginRight: 14}}>
            <Plane x={28} y={28} width={56} />
          </div>
          <span style={{fontSize: 48, fontWeight: 600, color: '#fff'}}>Открыть бота</span>
        </Plate>
        <div style={{position: 'absolute', inset: 0, borderRadius: 40, background: '#fff', opacity: 0.18 * fl}} />
      </div>
      <TouchTap t={t} tap={TAP4} x={600} y={1420} size={110} />
    </AbsoluteFill>
  );
};

export const JetnodePromo: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const {s, cx, cy} = camera(t);
  const toScreen = (x: number, y: number) => ({x: (x - cx) * s + W / 2, y: (y - cy) * s + FOCUS_Y});
  const drop = prog(t, 11.78, 12.12) ** 2 * 1900;
  const taps = [
    {tap: TAP1, ...s2w(B1.x + B1.w / 2, B1.y + B1.h / 2), color: '97,115,244'},
    {tap: TAP2, ...s2w(B2.x + B2.w / 2, B2.y + B2.h / 2), color: '97,115,244'},
    {tap: TAP3, ...s2w(302, 640), color: '134,232,168'},
  ];
  return (
    <AbsoluteFill style={{fontFamily: F.main, color: C.ink, overflow: 'hidden'}}>
      <ShellBackground t={t} />
      {/* world, seen through the camera */}
      <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${W / 2}px, ${FOCUS_Y}px) scale(${s}) translate(${-cx}px, ${-cy}px)`}}>
        <DotGrid />
        {drop < 1800 && (
          <div style={{position: 'absolute', left: 0, top: drop}}>
            <Phone cx={PCX} cy={PCY} rot={0.012 * Math.sin(t * 1.1)}>
              <ScreenContent t={t} />
            </Phone>
          </div>
        )}
        <Callout t={t} />
        <PlaneWipe t={t} />
      </div>
      {/* screen-space interaction layer: constant-size hand and ripples */}
      {taps.map(({tap, x, y, color}) => {
        const p = toScreen(x, y);
        return (
          <React.Fragment key={tap}>
            <TouchTap t={t} tap={tap} x={p.x} y={p.y} color={color} size={tap === TAP3 ? 150 : 100} />
          </React.Fragment>
        );
      })}
      {t >= 11.95 && <EndCard t={t} />}
      {/* top fade keeps subtitles clean when the camera pushes into the phone */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: W,
          height: 660,
          background: 'linear-gradient(180deg, rgba(252,239,237,1) 0%, rgba(252,239,237,0.97) 68%, rgba(252,239,237,0) 100%)',
        }}
      />
      <Subtitles t={t} phrases={PHRASES} />
      <Grain />
    </AbsoluteFill>
  );
};

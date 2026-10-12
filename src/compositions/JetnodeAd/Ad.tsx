import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F, H, W} from '../../style/tokens';
import {clamp, eback, eio, eo3, eq5, lerp, press, prog} from '../../style/ease';
import {DotGrid, ShellBackground} from '../../components/Background';
import {AppIcon, Plane} from '../../components/Primitives';
import {Plate} from '../../components/Plate';
import {TouchTap} from '../../components/Touch';
import {Grain} from '../../components/Grain';
import {Glyph, GlyphName} from '../../components/Glyphs';
import {Badge, Card, DrawLine, Headline, Pulse, Status, cascade} from '../../components/Reveal';
import {
  BY_DRAW,
  BY_PULSE,
  BY_SPREAD,
  FLOW_IN,
  HOOK_BLOCK,
  HOOK_IN,
  S,
  SRV_IN,
  STEP1_DONE,
  STEP2_ON,
  STEP3_DONE,
  STEP3_ON,
  TAB_TIMES,
  TAP_CONNECT,
  TAP_CTA,
  TRIAL_FILL,
} from './timeline';

type Pt = [number, number];

/* ---------- shared bits ---------- */

/** Scene window: hidden outside [a, b), fades out with blur and drifts up in the last 0.22 s. */
const Scene: React.FC<{t: number; w: readonly [number, number]; children: React.ReactNode}> = ({t, w, children}) => {
  if (t < w[0] || t >= w[1]) return null;
  const out = eo3(prog(t, w[1] - 0.22, w[1]));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - out, filter: out > 0.01 ? `blur(${9 * out}px)` : undefined, transform: `translateY(${-26 * out}px)`}}>
      {children}
    </div>
  );
};

const Tile: React.FC<{size: number; from: string; to: string; glyph: GlyphName; radius?: number; glyphColor?: string}> = ({size, from, to, glyph, radius = size * 0.28, glyphColor = '#fff'}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: radius,
      background: `linear-gradient(135deg, ${from}, ${to})`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 ${size * 0.12}px ${size * 0.3}px ${from}40, inset 0 0 ${size * 0.12}px rgba(255,255,255,0.35)`,
    }}
  >
    <Glyph name={glyph} size={size * 0.56} color={glyphColor} stroke={2.2} />
  </div>
);

const Abs: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, children, style}) => (
  <div style={{position: 'absolute', left: x, top: y, ...style}}>{children}</div>
);

const Caption: React.FC<{t: number; t0: number; y: number; children: React.ReactNode; align?: 'l' | 'c'}> = ({t, t0, y, children, align = 'l'}) => {
  const e = eo3(prog(t, t0, t0 + 0.4));
  return (
    <div
      style={{
        position: 'absolute',
        left: 75,
        width: 930,
        top: y,
        textAlign: align === 'c' ? 'center' : 'left',
        fontFamily: F.main,
        fontSize: 34,
        fontWeight: 400,
        color: C.gray,
        opacity: e,
        transform: `translateY(${14 * (1 - e)}px)`,
        filter: e < 1 ? `blur(${4 * (1 - e)}px)` : undefined,
      }}
    >
      {children}
    </div>
  );
};

/** A smooth 0..1 switch at t0. */
const sw = (t: number, t0: number, d = 0.2) => eo3(prog(t, t0, t0 + d));

/* ---------- scene 1: hook ---------- */

const SERVICES: {name: string; glyph: GlyphName; from: string; to: string; white?: boolean}[] = [
  {name: 'Видео', glyph: 'play', from: '#F35E3E', to: '#FF8E6E'},
  {name: 'Соцсети', glyph: 'people', from: '#6173F4', to: '#8FC9F6'},
  {name: 'Музыка', glyph: 'music', from: '#A35CF0', to: '#DE8CF8'},
  {name: 'Игры', glyph: 'game', from: '#23A866', to: '#7FE0A2'},
  {name: 'Новости', glyph: 'news', from: '#3B2E40', to: '#76657C'},
  {name: 'Почта', glyph: 'mail', from: '#1D55B5', to: '#5B8FE8', white: true},
  {name: 'Чаты', glyph: 'chat', from: '#1E9BE0', to: '#7FD0F8'},
  {name: 'Облако', glyph: 'cloud', from: '#7D7D86', to: '#BDBDC6'},
  {name: 'Карты', glyph: 'pin', from: '#F0A020', to: '#FFD36B', white: true},
];

const spark = (i: number): Pt[] =>
  Array.from({length: 9}, (_, k) => [k * 21, 26 - 20 * (0.5 + 0.5 * Math.sin(k * 1.3 + i * 2.1)) * (0.6 + 0.4 * Math.cos(k * 0.7 + i))] as Pt);

const Hook: React.FC<{t: number}> = ({t}) => {
  const blockOrder = SERVICES.map((s, i) => ({s, i})).filter((x) => !x.s.white);
  return (
    <>
      <Headline
        t={t}
        t0={0}
        y={250}
        eyebrow={
          <>
            <Glyph name="shield" size={32} color={C.coral} stroke={2.2} />
            Мобильный интернет
          </>
        }
        lines={[
          {text: 'Интернет по', size: 80, weight: 400},
          {text: '*белым спискам?*', size: 92, weight: 600},
        ]}
      />
      {SERVICES.map((sv, i) => {
        const c = i % 3;
        const r = Math.floor(i / 3);
        const x = 75 + c * 317;
        const y = 650 + r * 207;
        const t0 = cascade(HOOK_IN, i);
        const bi = blockOrder.findIndex((b) => b.i === i);
        const tb = bi >= 0 ? cascade(HOOK_BLOCK, bi, 0.06) : Infinity;
        const blocked = sw(t, tb, 0.18);
        const draw = eo3(prog(t, t0 + 0.12, t0 + 0.7));
        const pts = spark(i).map(([px, py]) => [px, lerp(py, 30, blocked * 0.85)] as Pt);
        return (
          <React.Fragment key={i}>
            <Card x={x} y={y} w={296} h={186} t={t} t0={t0} live={1 - 0.5 * blocked} glow={sv.white ? 0.6 * sw(t, HOOK_BLOCK + 0.5, 0.3) : 0}>
              <Abs x={22} y={22}>
                <Tile size={64} from={sv.from} to={sv.to} glyph={sv.glyph} />
              </Abs>
              <Abs x={100} y={24} style={{fontFamily: F.main, fontSize: 30, fontWeight: 600, color: C.ink}}>
                {sv.name}
              </Abs>
              <svg style={{position: 'absolute', left: 100, top: 66, overflow: 'visible'}} width={170} height={34}>
                <DrawLine pts={pts} p={draw} color={blocked > 0.5 ? C.coral : C.peri} width={3} opacity={0.85} />
              </svg>
              <Abs x={22} y={132}>
                {sv.white ? (
                  <Status label="в белом списке" color={C.green} t={t} />
                ) : blocked > 0.5 ? (
                  <Status label="заблокирован" color={C.coral} t={t} />
                ) : (
                  <Status label="доступен" color={C.green} t={t} />
                )}
              </Abs>
            </Card>
            {bi >= 0 && (
              <Badge t={t} t0={tb + 0.04} color={C.coral} style={{left: x + 296 - 30, top: y - 10}}>
                !
              </Badge>
            )}
          </React.Fragment>
        );
      })}
      <Caption t={t} t0={HOOK_BLOCK + 0.65} y={1290}>
        Открываются только сайты из списка
      </Caption>
    </>
  );
};

/* ---------- scene 2: bypass diagram ---------- */

const BY_SERV: {name: string; glyph: GlyphName; from: string; to: string}[] = [SERVICES[0], SERVICES[1], SERVICES[2], SERVICES[3], SERVICES[6]];
const BX = [150, 345, 540, 735, 930];
const busPath = (i: number): Pt[] => [
  [540, 1000],
  [540, 1062],
  [BX[i], 1062],
  [BX[i], 1112],
];
const arrive = (i: number) => BY_SPREAD + 0.15 + (0.4 * Math.abs(BX[i] - 540)) / 390;

const Bypass: React.FC<{t: number}> = ({t}) => {
  const a = S.bypass[0];
  const line1: Pt[] = [
    [540, 762],
    [540, 860],
  ];
  const srvIn = cascade(a + 0.3, 1, 0.1);
  const srvK = eback(prog(t, srvIn, srvIn + 0.35), 1.4);
  const srvHit = Math.exp(-Math.max(0, t - (BY_PULSE + 0.4)) * 5) * (t > BY_PULSE + 0.4 ? 1 : 0);
  const secured = sw(t, BY_SPREAD + 0.75, 0.25);
  return (
    <>
      <Headline
        t={t}
        t0={a}
        y={250}
        eyebrow={
          <>
            <div style={{width: 40, height: 40}}>
              <AppIcon size={40} />
            </div>
            JetnodeVPN
          </>
        }
        lines={[
          {text: 'Трафик идёт', size: 80, weight: 400},
          {text: 'через наш *сервер*', size: 88, weight: 600},
        ]}
      />
      {/* phone node */}
      <Card x={310} y={642} w={460} h={120} t={t} t0={cascade(a + 0.3, 0, 0.1)} glow={0.5 * secured}>
        <Abs x={24} y={24}>
          <Tile size={72} from="#EEF0FF" to="#E1E6FF" glyph="phone" glyphColor={C.peri} />
        </Abs>
        <Abs x={116} y={22} style={{fontFamily: F.main, fontSize: 32, fontWeight: 600, color: C.ink}}>
          Твой телефон
        </Abs>
        <Abs x={116} y={70}>{secured > 0.5 ? <Status label="всё открывается" color={C.green} t={t} /> : <Status label="белые списки" color={C.coral} t={t} />}</Abs>
      </Card>
      {/* lines */}
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={W} height={H}>
        <DrawLine pts={line1} p={prog(t, BY_DRAW, BY_DRAW + 0.25)} color="rgba(97,115,244,0.45)" width={4} />
        {BX.map((_, i) => (
          <DrawLine key={i} pts={busPath(i)} p={prog(t, BY_DRAW + 0.2, BY_DRAW + 0.6)} color="rgba(97,115,244,0.45)" width={4} />
        ))}
        <Pulse pts={line1} u={prog(t, BY_PULSE, BY_PULSE + 0.4)} />
        {BX.map((_, i) => (
          <Pulse key={i} pts={busPath(i)} u={prog(t, BY_SPREAD, arrive(i))} color={C.peri} />
        ))}
        {/* idle pulses keep the scheme alive */}
        {[1, 3, 0, 4, 2].map((i, k) => {
          const st = BY_SPREAD + 0.95 + k * 0.42;
          return <Pulse key={`l${k}`} pts={[[540, 762], ...busPath(i).slice(0)] as Pt[]} u={prog(t, st, st + 0.7)} color={C.green} r={8} />;
        })}
      </svg>
      {/* server node */}
      {t >= srvIn && (
        <div style={{position: 'absolute', left: 540, top: 930, transform: `translate(-50%,-50%) scale(${srvK * (1 + 0.04 * srvHit)})`}}>
          <Plate width={520} height={140} radius={36} glow={`rgba(97,115,244,${0.4 + 0.35 * srvHit})`} glowSize={26 + 30 * srvHit}>
            <div style={{display: 'flex', alignItems: 'center', gap: 22, width: '100%', padding: '0 28px'}}>
              <div style={{position: 'relative', width: 84, height: 84, flex: 'none'}}>
                <Plane x={42} y={42} width={84} glint={prog(t, BY_PULSE + 0.35, BY_PULSE + 1.0)} />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                <span style={{fontFamily: F.main, fontSize: 36, fontWeight: 600, color: '#fff'}}>Сервер Jetnode</span>
                <Status label="работает" color={C.mint} t={t} blink />
              </div>
            </div>
          </Plate>
        </div>
      )}
      {/* services */}
      {BY_SERV.map((sv, i) => {
        const t0 = cascade(a + 0.5, i);
        const ok = sw(t, arrive(i), 0.2);
        return (
          <React.Fragment key={i}>
            <Card x={BX[i] - 80} y={1112} w={160} h={160} radius={32} t={t} t0={t0} live={0.5 + 0.5 * ok} glow={0.5 * ok * Math.exp(-Math.max(0, t - arrive(i)) * 2)}>
              <Abs x={48} y={22}>
                <Tile size={64} from={sv.from} to={sv.to} glyph={sv.glyph} />
              </Abs>
              <div style={{position: 'absolute', left: 0, right: 0, top: 104, textAlign: 'center', fontFamily: F.main, fontSize: 25, fontWeight: 500, color: C.ink}}>{sv.name}</div>
            </Card>
            {t >= t0 && t < arrive(i) && (
              <Badge t={t} t0={t0 + 0.1} color={C.coral} size={36} style={{left: BX[i] + 80 - 28, top: 1112 - 10}}>
                !
              </Badge>
            )}
            <Badge t={t} t0={arrive(i)} color={C.green} size={36} style={{left: BX[i] + 80 - 28, top: 1112 - 10}}>
              <Glyph name="check" size={24} color="#fff" stroke={3.2} />
            </Badge>
          </React.Fragment>
        );
      })}
      <Caption t={t} t0={BY_SPREAD + 0.7} y={1320} align="c">
        Белые списки больше не мешают
      </Caption>
    </>
  );
};

/* ---------- scene 3: bot → deeplink → app ---------- */

const STEPS: {title: string; sub: string; glyph: GlyphName}[] = [
  {title: 'Открой бота', sub: '3 дня бесплатно сразу после /start', glyph: 'chat'},
  {title: 'Нажми «Подключиться»', sub: 'диплинк сам откроет приложение', glyph: 'link'},
  {title: 'Подписка добавлена', sub: 'приложение уже готово к работе', glyph: 'check'},
];
const STEP_Y = [642, 878, 1114];
const ICON_C = (i: number): Pt => [75 + 32 + 44, STEP_Y[i] + 88];
export const BTN = {x: 705, y: 878 + 46, w: 270, h: 84};

const stepState = (t: number, i: number) => {
  const on = [FLOW_IN + 0.35, STEP2_ON, STEP3_ON][i];
  const done = [STEP1_DONE, TAP_CONNECT + 0.15, STEP3_DONE][i];
  return {on: sw(t, on), done: sw(t, done), tOn: on, tDone: done};
};

const StepIcon: React.FC<{t: number; i: number}> = ({t, i}) => {
  const st = stepState(t, i);
  const t0 = cascade(FLOW_IN, i, 0.1);
  if (t < t0) return null;
  const k = eo3(prog(t, t0, t0 + 0.18));
  const [cx, cy] = ICON_C(i);
  const hit = eback(prog(t, st.tOn, st.tOn + 0.3), 2.2);
  const ring = st.on > 0 && st.done < 1 ? 0.5 + 0.5 * Math.sin((t - st.tOn) * 8) : 0;
  const bg = st.done > 0.5 ? `linear-gradient(135deg, ${C.green}, ${C.mint})` : st.on > 0.5 ? `linear-gradient(135deg, ${C.peri}, ${C.sky})` : 'linear-gradient(135deg, #EDEDF3, #E3E3EC)';
  const glyph = st.done > 0.5 ? 'check' : STEPS[i].glyph;
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - 44,
        top: cy - 44,
        width: 88,
        height: 88,
        borderRadius: '50%',
        background: bg,
        opacity: k,
        transform: `scale(${st.on > 0 ? hit : 1})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 0 0 ${6 + 8 * ring}px rgba(97,115,244,${0.18 * ring}), 0 8px 22px rgba(40,40,90,0.12), inset 0 0 12px rgba(255,255,255,0.4)`,
      }}
    >
      <Glyph name={glyph} size={46} color={st.on > 0.5 || st.done > 0.5 ? '#fff' : C.gray} stroke={2.4} />
    </div>
  );
};

const Flow: React.FC<{t: number}> = ({t}) => {
  const a = S.flow[0];
  const toastK = eback(prog(t, STEP3_DONE + 0.12, STEP3_DONE + 0.5), 1.4);
  const fl = t >= TAP_CONNECT ? clamp(1 - (t - TAP_CONNECT) / 0.3) : 0;
  const c12: Pt[] = [
    [ICON_C(0)[0], ICON_C(0)[1] + 44],
    [ICON_C(1)[0], ICON_C(1)[1] - 44],
  ];
  const c23: Pt[] = [
    [ICON_C(1)[0], ICON_C(1)[1] + 44],
    [ICON_C(2)[0], ICON_C(2)[1] - 44],
  ];
  return (
    <>
      <Headline
        t={t}
        t0={a}
        y={250}
        eyebrow={
          <>
            <Glyph name="chat" size={32} color={C.peri} stroke={2.2} />
            Telegram-бот
          </>
        }
        lines={[
          {text: 'Подключение', size: 80, weight: 400},
          {text: 'в *1 клик*', size: 92, weight: 600},
        ]}
      />
      {STEPS.map((s, i) => {
        const st = stepState(t, i);
        return (
          <Card key={i} x={75} y={STEP_Y[i]} w={930} h={176} t={t} t0={cascade(FLOW_IN, i, 0.1)} live={0.5 + 0.5 * st.on} glow={i === 2 ? 0.8 * st.done : 0.4 * (st.on - st.done)}>
            <Abs x={150} y={40} style={{fontFamily: F.main, fontSize: 36, fontWeight: 600, color: C.ink}}>
              {s.title}
            </Abs>
            <Abs x={150} y={96} style={{fontFamily: F.main, fontSize: 27, fontWeight: 400, color: C.gray}}>
              {s.sub}
            </Abs>
          </Card>
        );
      })}
      {/* connector + pulses */}
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={W} height={H}>
        <DrawLine pts={c12} p={prog(t, FLOW_IN + 0.25, FLOW_IN + 0.5)} color="rgba(97,115,244,0.35)" width={4} />
        <DrawLine pts={c23} p={prog(t, FLOW_IN + 0.35, FLOW_IN + 0.6)} color="rgba(97,115,244,0.35)" width={4} />
        <DrawLine pts={c12} p={prog(t, STEP1_DONE, STEP2_ON)} color={C.peri} width={4} />
        <DrawLine pts={c23} p={prog(t, TAP_CONNECT + 0.1, STEP3_ON)} color={C.green} width={4} />
        <Pulse pts={c12} u={prog(t, STEP1_DONE, STEP2_ON)} />
        <Pulse pts={c23} u={prog(t, TAP_CONNECT + 0.1, STEP3_ON)} color={C.green} />
      </svg>
      {[0, 1, 2].map((i) => (
        <StepIcon key={i} t={t} i={i} />
      ))}
      {/* the deeplink button inside step 2 */}
      {t >= cascade(FLOW_IN, 1, 0.1) + 0.1 && (
        <div
          style={{
            position: 'absolute',
            left: BTN.x,
            top: BTN.y,
            opacity: lerp(0.35, 1, sw(t, STEP2_ON - 0.1)),
            filter: `grayscale(${1 - sw(t, STEP2_ON - 0.1)})`,
            transform: `scale(${(1 - 0.06 * press(t, TAP_CONNECT)) * (1 + 0.04 * Math.sin(Math.PI * prog(t, STEP2_ON, STEP2_ON + 0.4)))})`,
          }}
        >
          <Plate width={BTN.w} height={BTN.h} radius={26} glowSize={22}>
            <span style={{fontFamily: F.main, fontSize: 29, fontWeight: 600, color: '#fff'}}>Подключиться</span>
          </Plate>
          <div style={{position: 'absolute', inset: 0, borderRadius: 26, background: '#fff', opacity: 0.25 * fl}} />
        </div>
      )}
      {/* toast from the app */}
      {t >= STEP3_DONE + 0.12 && (
        <div style={{position: 'absolute', left: 540, top: 1400, transform: `translate(-50%,-50%) translateY(${60 * (1 - toastK)}px) scale(${lerp(0.9, 1, toastK)})`, opacity: clamp(toastK)}}>
          <Plate width={930} height={120} radius={34} glow="rgba(134,232,168,0.45)" glowSize={28}>
            <div style={{display: 'flex', alignItems: 'center', gap: 22, width: '100%', padding: '0 26px'}}>
              <div style={{width: 72, height: 72, flex: 'none'}}>
                <AppIcon size={72} />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                <span style={{fontFamily: F.main, fontSize: 30, fontWeight: 600, color: '#fff'}}>JetnodeVPN</span>
                <span style={{fontFamily: F.main, fontSize: 26, fontWeight: 400, color: 'rgba(255,255,255,0.9)'}}>Подписка добавлена · 3 дня бесплатно</span>
              </div>
            </div>
          </Plate>
        </div>
      )}
    </>
  );
};

/* ---------- scene 4: servers ---------- */

const TABS = ['Все', 'Стриминг', 'Игры', 'Обход'];
const TAB_W = [96, 186, 124, 132];
const TAB_X = TAB_W.reduce<number[]>((acc, w, i) => [...acc, i ? acc[i - 1] + TAB_W[i - 1] + 14 : 75], []);
const SERVERS = [
  {code: 'DE', name: 'Германия', cat: 'Стриминг', ping: 24},
  {code: 'NL', name: 'Нидерланды', cat: 'Обход', ping: 31},
  {code: 'FI', name: 'Финляндия', cat: 'Игры', ping: 18},
  {code: 'US', name: 'США', cat: 'Стриминг', ping: 96},
  {code: 'TR', name: 'Турция', cat: 'Игры', ping: 42},
  {code: 'KZ', name: 'Казахстан', cat: 'Обход', ping: 38},
];

const tabAt = (t: number) => {
  let idx = 0;
  TAB_TIMES.forEach((tt, i) => {
    if (t >= tt) idx = i;
  });
  return idx;
};

const Servers: React.FC<{t: number}> = ({t}) => {
  const a = S.servers[0];
  const idx = tabAt(t);
  const prev = Math.max(0, idx - 1);
  const k = eq5(prog(t, TAB_TIMES[idx], TAB_TIMES[idx] + 0.28));
  const hx = lerp(TAB_X[prev], TAB_X[idx], idx ? k : 1);
  const hw = lerp(TAB_W[prev], TAB_W[idx], idx ? k : 1);
  const tabsIn = eo3(prog(t, a + 0.15, a + 0.4));
  const match = (cat: string, i: number) => i === 0 || TABS[i] === cat;
  return (
    <>
      <Headline
        t={t}
        t0={a}
        y={250}
        eyebrow={
          <>
            <Glyph name="bolt" size={32} color={C.peri} stroke={2.2} />
            Серверы
          </>
        }
        lines={[
          {text: 'Быстрые серверы', size: 80, weight: 400},
          {text: 'на *любой вкус*', size: 92, weight: 600},
        ]}
      />
      {/* tabs */}
      <div style={{position: 'absolute', left: 0, top: 640, width: W, height: 64, opacity: tabsIn}}>
        <div style={{position: 'absolute', left: hx, top: 0, width: hw, height: 60}}>
          <Plate width={hw} height={60} radius={30} glowSize={16} shadow={0.15}>
            {null}
          </Plate>
        </div>
        {TABS.map((tb, i) => {
          const sel = i === idx ? (idx ? k : 1) : i === prev && idx ? 1 - k : 0;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: TAB_X[i],
                width: TAB_W[i],
                top: 0,
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: F.main,
                fontSize: 28,
                fontWeight: 500,
                color: sel > 0.5 ? '#fff' : C.ink,
                background: sel > 0.5 ? 'transparent' : 'rgba(255,255,255,0.7)',
                borderRadius: 30,
                boxShadow: sel > 0.5 ? undefined : 'inset 0 0 0 1.5px rgba(97,115,244,0.15)',
              }}
            >
              {tb}
            </div>
          );
        })}
      </div>
      {SERVERS.map((s, i) => {
        const c = i % 2;
        const r = Math.floor(i / 2);
        const x = 75 + c * 475;
        const y = 734 + r * 176;
        const t0 = cascade(SRV_IN, i);
        const was = match(s.cat, prev) ? 1 : 0;
        const now = match(s.cat, idx) ? 1 : 0;
        const live = idx ? lerp(was, now, k) : 1;
        const cnt = eo3(prog(t, t0 + 0.1, t0 + 0.7));
        return (
          <Card key={i} x={x} y={y} w={455} h={156} t={t} t0={t0} live={0.4 + 0.6 * live} glow={0.35 * live * (idx ? 1 : 0)}>
            <Abs x={22} y={40}>
              <div style={{width: 76, height: 76, borderRadius: '50%', background: 'rgba(97,115,244,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.main, fontSize: 28, fontWeight: 700, color: C.peri}}>{s.code}</div>
            </Abs>
            <Abs x={116} y={38} style={{fontFamily: F.main, fontSize: 31, fontWeight: 600, color: C.ink}}>
              {s.name}
            </Abs>
            <Abs x={116} y={86} style={{fontFamily: F.main, fontSize: 24, fontWeight: 400, color: C.gray}}>
              {s.cat}
            </Abs>
            <div style={{position: 'absolute', right: 24, top: 36, fontFamily: F.main, fontSize: 29, fontWeight: 600, color: C.ink, fontVariantNumeric: 'tabular-nums'}}>
              {Math.round(s.ping * cnt)} мс
            </div>
            <div style={{position: 'absolute', right: 24, top: 88, display: 'flex', alignItems: 'flex-end', gap: 5, height: 30}}>
              {[10, 16, 22, 28].map((hh, b) => {
                const on = s.ping < 60 || b < 3 ? sw(t, t0 + 0.2 + b * 0.07, 0.12) : 0;
                return <div key={b} style={{width: 8, height: hh, borderRadius: 3, background: on > 0.5 ? C.green : 'rgba(59,46,64,0.15)', boxShadow: on > 0.5 ? `0 0 8px ${C.green}80` : undefined}} />;
              })}
            </div>
          </Card>
        );
      })}
      <Caption t={t} t0={SRV_IN + 0.55} y={1290}>
        Стриминг, игры и обход блокировок
      </Caption>
    </>
  );
};

/* ---------- scene 5: end card ---------- */

const End: React.FC<{t: number}> = ({t}) => {
  const a = S.end[0];
  const ip = eback(prog(t, a, a + 0.45), 1.5);
  const name = eo3(prog(t, a + 0.2, a + 0.55));
  const l1 = eo3(prog(t, a + 0.3, a + 0.7));
  const l2 = eback(prog(t, a + 0.45, a + 0.85), 1.8);
  const f = eio(prog(t, TRIAL_FILL[0], TRIAL_FILL[1]));
  const barIn = eo3(prog(t, a + 0.5, a + 0.8));
  const cta = eback(prog(t, a + 0.75, a + 1.1), 1.5);
  const fl = t >= TAP_CTA ? clamp(1 - (t - TAP_CTA) / 0.3) : 0;
  const X0 = 150;
  const BW = 780;
  return (
    <>
      <div style={{position: 'absolute', left: 540 - 110, top: 470 - 110, transform: `scale(${ip})`}}>
        <AppIcon size={220} glint={prog(t, a + 0.5, a + 1.2)} />
      </div>
      <div style={{position: 'absolute', left: 0, width: W, top: 640, textAlign: 'center', fontFamily: F.main, fontSize: 80, fontWeight: 600, color: C.ink, opacity: name, transform: `translateY(${24 * (1 - name)}px)`}}>JetnodeVPN</div>
      <div style={{position: 'absolute', left: 0, width: W, top: 760, height: 80, overflow: 'hidden', textAlign: 'center'}}>
        <div style={{fontFamily: F.main, fontSize: 62, fontWeight: 400, color: C.plum, transform: `translateY(${80 * (1 - l1)}px)`}}>Попробуй 3 дня</div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: W,
          top: 830,
          textAlign: 'center',
          fontFamily: F.accent,
          fontSize: 150,
          color: C.peri,
          textShadow: '0 0 26px rgba(97,115,244,0.45)',
          transform: `scale(${l2})`,
          opacity: clamp(l2),
        }}
      >
        бесплатно
      </div>
      {/* trial progress: three days fill in */}
      <div style={{position: 'absolute', left: X0, top: 1090, width: BW, opacity: barIn, transform: `translateY(${16 * (1 - barIn)}px)`}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: BW, height: 16, borderRadius: 8, background: 'rgba(97,115,244,0.14)'}} />
        <div style={{position: 'absolute', left: 0, top: 0, width: BW * f, height: 16, borderRadius: 8, background: `linear-gradient(90deg, ${C.peri}, ${C.sky})`, boxShadow: '0 0 16px rgba(97,115,244,0.45)'}} />
        {[1, 2].map((d) => (
          <div key={d} style={{position: 'absolute', left: (BW * d) / 3 - 2, top: -6, width: 4, height: 28, borderRadius: 2, background: f >= d / 3 ? '#fff' : 'rgba(97,115,244,0.3)'}} />
        ))}
        <div style={{position: 'absolute', left: BW * f - 22, top: -14, width: 44, height: 44, borderRadius: '50%', background: '#fff', border: `5px solid ${C.peri}`, boxSizing: 'border-box', boxShadow: '0 4px 14px rgba(97,115,244,0.4)'}} />
        {[0, 1, 2].map((d) => (
          <div
            key={d}
            style={{
              position: 'absolute',
              left: (BW * (d + 0.5)) / 3,
              top: 46,
              transform: 'translateX(-50%)',
              fontFamily: F.main,
              fontSize: 27,
              fontWeight: 500,
              color: f > (d + 0.5) / 3 ? C.peri : C.gray,
              whiteSpace: 'nowrap',
            }}
          >
            День {d + 1}
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 540, top: 1310, transform: `translate(-50%,-50%) scale(${cta * (1 - 0.05 * press(t, TAP_CTA))})`}}>
        <Plate width={560} height={128} radius={40} glow="rgba(97,115,244,0.45)" shadow={0.25} corner={0.35}>
          <div style={{position: 'relative', width: 56, height: 56, marginRight: 14}}>
            <Plane x={28} y={28} width={56} />
          </div>
          <span style={{fontFamily: F.main, fontSize: 48, fontWeight: 600, color: '#fff'}}>Открыть бота</span>
        </Plate>
        <div style={{position: 'absolute', inset: 0, borderRadius: 40, background: '#fff', opacity: 0.2 * fl}} />
      </div>
      <Caption t={t} t0={a + 1.0} y={1420} align="c">
        Ссылка на бота в профиле
      </Caption>
    </>
  );
};

/* ---------- camera ---------- */

/** Layout sits high in world space; the camera shifts it down so it fills the frame above the Shorts UI. */
const OFFSET_Y = 90;

const camera = (t: number) => {
  let s = 1;
  let cx = 540;
  let cy = 960 - OFFSET_Y;
  if (t < S.hook[1]) {
    s = 1 + 0.06 * eio(prog(t, 0.1, S.hook[1]));
    cy = lerp(960 - OFFSET_Y, 990 - OFFSET_Y, eio(prog(t, 0.1, S.hook[1])));
    const sh = 7 * (1 - prog(t, HOOK_BLOCK, HOOK_BLOCK + 0.5)) ** 2 * (t >= HOOK_BLOCK ? 1 : 0);
    cx += sh * Math.sin(t * 93);
    cy += sh * Math.cos(t * 71);
  } else if (t < S.bypass[1]) {
    s = lerp(1.05, 1, eo3(prog(t, S.bypass[0], S.bypass[0] + 0.7))) + 0.03 * prog(t, S.bypass[0] + 0.7, S.bypass[1]);
    cy = 980 - OFFSET_Y;
  } else if (t < S.flow[1]) {
    const zin = eq5(prog(t, STEP2_ON - 0.05, TAP_CONNECT - 0.15));
    const zout = eq5(prog(t, TAP_CONNECT + 0.3, STEP3_DONE + 0.15));
    const z = zin * (1 - zout);
    s = lerp(lerp(1.04, 1, eo3(prog(t, S.flow[0], S.flow[0] + 0.7))), 1.22, z) + 0.02 * prog(t, STEP3_DONE, S.flow[1]);
    cx = lerp(540, 720, z);
    cy = lerp(960 - OFFSET_Y, 966, z) + 40 * eo3(prog(t, STEP3_DONE, S.flow[1]));
  } else if (t < S.servers[1]) {
    s = lerp(1.04, 1, eo3(prog(t, S.servers[0], S.servers[0] + 0.7))) + 0.025 * prog(t, S.servers[0] + 0.7, S.servers[1]);
  } else {
    s = lerp(1.05, 1, eo3(prog(t, S.end[0], S.end[0] + 0.8)));
  }
  cy += 5 * Math.sin(t * 1.2);
  cx += 6 * Math.sin(t * 0.7);
  return {s, cx, cy};
};

export const JetnodeAd: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const {s, cx, cy} = camera(t);
  const toScreen = (x: number, y: number) => ({x: (x - cx) * s + W / 2, y: (y - cy) * s + H / 2});
  const btn = toScreen(BTN.x + BTN.w * 0.62, BTN.y + BTN.h / 2);
  const cta = toScreen(600, 1310);
  return (
    <AbsoluteFill style={{fontFamily: F.main, color: C.ink, overflow: 'hidden'}}>
      <ShellBackground t={t} />
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: `translate(${W / 2}px, ${H / 2}px) scale(${s}) translate(${-cx}px, ${-cy}px)`}}>
        <DotGrid />
        <Scene t={t} w={S.hook}>
          <Hook t={t} />
        </Scene>
        <Scene t={t} w={S.bypass}>
          <Bypass t={t} />
        </Scene>
        <Scene t={t} w={S.flow}>
          <Flow t={t} />
        </Scene>
        <Scene t={t} w={S.servers}>
          <Servers t={t} />
        </Scene>
        <Scene t={t} w={[S.end[0], 99]}>
          <End t={t} />
        </Scene>
      </div>
      <TouchTap t={t} tap={TAP_CONNECT} x={btn.x} y={btn.y} size={110} />
      <TouchTap t={t} tap={TAP_CTA} x={cta.x} y={cta.y} size={110} />
      <Grain />
      <Audio src={staticFile('audio/ad.wav')} />
    </AbsoluteFill>
  );
};

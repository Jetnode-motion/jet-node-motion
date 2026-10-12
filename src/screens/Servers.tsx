import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../style/tokens';
import {eo3, lerp, prog} from '../style/ease';
import {Txt} from '../components/Primitives';
import {StatusBar} from './Common';

// Placeholder data: replace with the real server list.
const SERVERS: [string, string, string, number][] = [
  ['NL', 'Нидерланды', '#FF7A45', 18],
  ['DE', 'Германия', '#F3C43E', 24],
  ['FI', 'Финляндия', '#4AA3DF', 31],
  ['SE', 'Швеция', '#3E7BE0', 35],
  ['PL', 'Польша', '#E05D6F', 29],
  ['TR', 'Турция', '#E0453E', 47],
  ['US', 'США', '#6173F4', 96],
  ['JP', 'Япония', '#E05D8B', 140],
];
const CATS = ['Все', 'Стриминг', 'Игры', 'Обход'];
const CAT_T = [9.75, 10.25, 10.65, 11.05];
const CAT_ORDER = [
  [0, 1, 2, 3, 4, 5, 6, 7],
  [6, 0, 1, 3, 7, 2, 4, 5],
  [1, 0, 4, 2, 5, 3, 6, 7],
  [0, 2, 3, 1, 5, 4, 6, 7],
];
const CAT_TAG = ['', 'Стриминг 4K', 'Низкий пинг', 'Обход белых списков'];

export const Servers: React.FC<{t: number}> = ({t}) => {
  let ci = 0;
  CAT_T.forEach((ct, i) => {
    if (t >= ct) ci = i;
  });
  const segw = 556 / 4;
  const prev = Math.max(0, ci - 1);
  const hx = lerp(24 + prev * segw, 24 + ci * segw, eo3(prog(t, CAT_T[ci], CAT_T[ci] + 0.22)));
  return (
    <AbsoluteFill style={{background: '#F2F2F7'}}>
      <StatusBar />
      <Txt x={36} y={130} size={44} weight={700}>
        Серверы
      </Txt>
      <div style={{position: 'absolute', left: 24, top: 190, width: 556, height: 64, borderRadius: 18, background: '#E3E3E8'}} />
      <div style={{position: 'absolute', left: hx + 4, top: 194, width: segw - 8, height: 56, borderRadius: 15, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}} />
      {CATS.map((c, i) => (
        <Txt key={c} x={24 + segw * (i + 0.5)} y={222} size={23} weight={i === ci ? 500 : 400} anchor="c">
          {c}
        </Txt>
      ))}
      {CAT_ORDER[ci].map((si, j) => {
        const [code, name, col, ping] = SERVERS[si];
        const y = 290 + j * 112;
        const a = eo3(prog(t, CAT_T[ci] + 0.03 * j, CAT_T[ci] + 0.03 * j + 0.3));
        const bars = ping < 30 ? 4 : ping < 60 ? 3 : 2;
        const sel = j === 0 ? prog(t, CAT_T[ci] + 0.2, CAT_T[ci] + 0.4) : 0;
        return (
          <div
            key={`${ci}-${j}`}
            style={{
              position: 'absolute',
              left: 24,
              top: y,
              width: 556,
              height: 96,
              borderRadius: 22,
              background: '#fff',
              opacity: a,
              transform: `translateY(${26 * (1 - a)}px)`,
              boxShadow: sel ? `inset 0 0 0 4px rgba(97,115,244,${sel})` : undefined,
            }}
          >
            <div style={{position: 'absolute', left: 30, top: 22, width: 52, height: 52, borderRadius: 26, background: col}} />
            <Txt x={56} y={48} size={20} weight={600} color="#fff" anchor="c">
              {code}
            </Txt>
            {CAT_TAG[ci] ? (
              <>
                <Txt x={100} y={34} size={27} weight={500}>
                  {name}
                </Txt>
                <Txt x={100} y={66} size={20} weight={400} color={C.gray}>
                  {CAT_TAG[ci]}
                </Txt>
              </>
            ) : (
              <Txt x={100} y={48} size={27} weight={500}>
                {name}
              </Txt>
            )}
            {[0, 1, 2, 3].map((b) => (
              <div
                key={b}
                style={{position: 'absolute', left: 456 + b * 11, top: 60 - (8 + b * 7), width: 7, height: 8 + b * 7, borderRadius: 1, background: b < bars ? C.green : '#D1D1D6'}}
              />
            ))}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

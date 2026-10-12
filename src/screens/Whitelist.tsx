import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../style/tokens';
import {eo3, pop, prog} from '../style/ease';
import {Txt} from '../components/Primitives';
import {Check, Lock, XMark} from '../components/Icons';
import {StatusBar} from './Common';

const DOTS = ['#6173F4', '#F3A43E', '#43B581', '#E05D8B', '#4AA3DF', '#9B6CF0', '#E07A3E', '#3EC1B5'];
const WIDTHS = [300, 240, 330, 210, 280, 350, 260, 300];
const ALLOWED = new Set([0, 3]);

/** Hook screen: «Доступ ограничен» banner + a list where most rows get struck out. */
export const Whitelist: React.FC<{t: number}> = ({t}) => {
  const k = pop(t, -0.05, 0.3);
  return (
    <AbsoluteFill style={{background: '#F2F2F7'}}>
      <StatusBar />
      <div style={{position: 'absolute', left: 24, top: 83, width: 556, height: 164, borderRadius: 34, background: '#FFE5E0', transform: `scale(${k})`}}>
        <div style={{position: 'absolute', left: 36, top: 44}}>
          <Lock size={64} color={C.coral} />
        </div>
        <Txt x={128} y={60} size={34} weight={600} color="#C8381B">
          Доступ ограничен
        </Txt>
        <Txt x={128} y={106} size={24} weight={400} color={C.ink} opacity={0.6}>
          Сайта нет в белом списке
        </Txt>
      </div>
      {WIDTHS.map((w, i) => {
        const y = 280 + i * 100;
        const ap = eo3(prog(t, -0.1 + i * 0.03, 0.2 + i * 0.03));
        const bad = !ALLOWED.has(i);
        const xp = prog(t, 0.18 + i * 0.09, 0.32 + i * 0.09);
        const dim = bad ? 1 - 0.5 * xp : 1;
        return (
          <div key={i} style={{position: 'absolute', left: 24, top: y, width: 556, height: 84, borderRadius: 22, background: '#fff', opacity: ap, transform: `translateY(${20 * (1 - ap)}px)`}}>
            <div style={{position: 'absolute', left: 30, top: 20, width: 44, height: 44, borderRadius: 22, background: DOTS[i], opacity: dim}} />
            <div style={{position: 'absolute', left: 92, top: 26, width: w, height: 14, borderRadius: 7, background: C.ink, opacity: 0.75 * dim}} />
            <div style={{position: 'absolute', left: 92, top: 50, width: w * 0.55, height: 10, borderRadius: 5, background: C.gray, opacity: 0.5 * dim}} />
            {bad ? (
              <>
                <div style={{position: 'absolute', left: 86, top: 38, height: 4, width: (w + 16) * eo3(xp), background: C.coral, opacity: 0.8, borderRadius: 2}} />
                <div style={{position: 'absolute', left: 494, top: 20}}>
                  <XMark size={44} p={xp} color={C.coral} stroke={6} />
                </div>
              </>
            ) : (
              <div style={{position: 'absolute', left: 494, top: 20}}>
                <Check size={44} p={prog(t, 0.1, 0.35)} color={C.green} stroke={6} />
              </div>
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

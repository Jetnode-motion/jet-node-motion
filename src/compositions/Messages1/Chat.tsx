import React from 'react';
import {eback, eo3, prog} from '../../style/ease';
import {FONT} from '../Polar7/Overlays';

/*
 * The messenger: a dark chat with the contact «Я». Messages pop in with a ping;
 * incoming ones are preceded by «печатает…». Only the last few stay on screen.
 */

export type ChatMsg = {at: number; side: 'in' | 'out' | 'sys' | string; text: string; time?: string};

const TYPING = 0.7; // s of «печатает…» before an incoming message
const clock = (i: number, from: number) => `01:${String(from + i).padStart(2, '0')}`;

export const Chat: React.FC<{t: number; msgs: ChatMsg[]; show: number; y?: number; keep?: number; clockFrom?: number}> = ({t, msgs, show, y = 200, keep = 4, clockFrom = 4}) => {
  if (show <= 0) return null;
  const k = eo3(show);
  const seen = msgs.map((m, i) => ({...m, i})).filter((m) => t >= m.at);
  const shown = seen.slice(-keep);
  const next = msgs.find((m) => m.at > t);
  const typing = next && next.side === 'in' && t > next.at - TYPING;
  return (
    <div
      style={{
        position: 'absolute',
        left: 90,
        right: 90,
        top: y,
        opacity: k,
        transform: `translateY(${-30 * (1 - k)}px)`,
        background: 'rgba(14,22,33,0.94)',
        borderRadius: 34,
        overflow: 'hidden',
        boxShadow: '0 24px 70px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.06)',
        fontFamily: FONT,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 20, padding: '22px 28px', background: '#17212B'}}>
        <div style={{width: 62, height: 62, borderRadius: 31, background: 'linear-gradient(135deg,#5B8DEF,#2B5278)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 30}}>Я</div>
        <div>
          <div style={{color: '#fff', fontWeight: 700, fontSize: 32}}>Я</div>
          <div style={{color: typing ? '#6AB3F3' : '#7F91A4', fontSize: 24}}>{typing ? 'печатает…' : 'был(а) только что'}</div>
        </div>
      </div>
      <div style={{padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 120}}>
        {shown.map((m) => {
          const e = eback(prog(t, m.at, m.at + 0.3), 1.6);
          const out = m.side === 'out';
          if (m.side === 'sys')
            return (
              <div key={m.i} style={{alignSelf: 'center', background: 'rgba(255,255,255,0.08)', color: '#9FB0C2', fontSize: 26, padding: '8px 20px', borderRadius: 20, opacity: e}}>
                {m.text}
              </div>
            );
          return (
            <div
              key={m.i}
              style={{
                alignSelf: out ? 'flex-end' : 'flex-start',
                maxWidth: '82%',
                background: out ? '#2B5278' : '#182533',
                color: '#fff',
                fontSize: 36,
                lineHeight: 1.25,
                padding: '14px 22px 12px',
                borderRadius: out ? '26px 26px 8px 26px' : '26px 26px 26px 8px',
                transform: `scale(${e})`,
                transformOrigin: out ? 'right bottom' : 'left bottom',
              }}
            >
              {m.text}
              <span style={{fontSize: 20, color: out ? '#9DC3E6' : '#6D7F8F', marginLeft: 14}}>
                {m.time ?? clock(m.i, clockFrom)}
                {out ? ' ✓✓' : ''}
              </span>
            </div>
          );
        })}
        {typing && (
          <div style={{alignSelf: 'flex-start', background: '#182533', borderRadius: 26, padding: '18px 24px', display: 'flex', gap: 8}}>
            {[0, 1, 2].map((d) => (
              <div key={d} style={{width: 12, height: 12, borderRadius: 6, background: '#7F91A4', opacity: 0.35 + 0.65 * Math.max(0, Math.sin(t * 9 - d * 0.9))}} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

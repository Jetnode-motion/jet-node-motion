import React from 'react';
import {Img, staticFile} from 'remotion';
import {eback, eo3, prog} from '../../style/ease';
import {FONT} from '../Polar7/Overlays';

/*
 * Mid-story ad (option C): a JetnodeVPN push notification drops in at the top like one on the
 * hero's phone, stays `dur` seconds and slides away. No voice, the story keeps going under it.
 */
export const Push: React.FC<{t: number; at: number; dur: number}> = ({t, at, dur}) => {
  if (t < at || t > at + dur) return null;
  const inK = eback(prog(t, at, at + 0.45), 1.3);
  const outK = eo3(prog(t, at + dur - 0.4, at + dur));
  const y = -260 + 450 * inK - 450 * outK;
  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        top: y,
        background: 'rgba(30,32,40,0.82)',
        backdropFilter: 'blur(24px)',
        borderRadius: 40,
        padding: '26px 28px',
        display: 'flex',
        gap: 24,
        alignItems: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.55), inset 0 0 0 1.5px rgba(255,255,255,0.08)',
        fontFamily: FONT,
      }}
    >
      <Img src={staticFile('brand/logo.png')} style={{width: 92, height: 92, borderRadius: 22, flex: 'none'}} />
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.55)', fontSize: 24}}>
          <span style={{fontWeight: 600, color: 'rgba(255,255,255,0.8)'}}>JetnodeVPN</span>
          <span>сейчас · Реклама</span>
        </div>
        <div style={{color: '#fff', fontWeight: 700, fontSize: 34, marginTop: 4}}>Интернет по белым спискам?</div>
        <div style={{color: 'rgba(255,255,255,0.85)', fontSize: 30, marginTop: 2}}>Работает даже там · 3 дня бесплатно, ссылка в профиле</div>
      </div>
    </div>
  );
};

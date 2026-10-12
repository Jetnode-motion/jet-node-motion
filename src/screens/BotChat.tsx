import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {F} from '../style/tokens';
import {clamp, eback, eo3, lerp, press, prog} from '../style/ease';
import {Glyph, GlyphName} from '../components/Glyphs';

/*
 * The real JetnodeVPN bot in Telegram (dark theme), rebuilt from Nazar's screenshots
 * (videos/jetnodevpn/bot-screens). Banners are the bot's own images.
 */

const RED = '#C8141C';
const LINK = '#E5484D';
const BUBBLE = 'rgba(28,28,32,0.94)';
const W = 604;

/** Inline buttons in screen-local coordinates (after the bot message has arrived). */
export const BOT_BTN = {x: 22, y: 980, w: 560, h: 62};
/** Text block with the trial offer, screen-local. */
export const BOT_TEXT = {y0: 770, y1: 972};

const Line: React.FC<{icon?: GlyphName; children: React.ReactNode; bold?: boolean; color?: string}> = ({icon, children, bold, color = '#F2F2F5'}) => (
  <div style={{display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 22, lineHeight: 1.32, fontWeight: bold ? 600 : 400, color}}>
    {icon && (
      <div style={{marginTop: 3, flex: 'none'}}>
        <Glyph name={icon} size={24} color={color} stroke={2} />
      </div>
    )}
    <div>{children}</div>
  </div>
);

const InlineBtn: React.FC<{y: number; label: string; icon: GlyphName; bg: string; pressed?: number; flash?: number; corner?: boolean}> = ({y, label, icon, bg, pressed = 0, flash = 0, corner}) => (
  <div
    style={{
      position: 'absolute',
      left: BOT_BTN.x,
      top: y,
      width: BOT_BTN.w,
      height: BOT_BTN.h,
      borderRadius: 16,
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
      fontFamily: F.main,
      fontSize: 25,
      fontWeight: 600,
      color: '#fff',
      transform: `scale(${1 - 0.05 * pressed})`,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
    }}
  >
    <Glyph name={icon} size={26} color="#fff" stroke={2.2} />
    {label}
    {corner && <div style={{position: 'absolute', right: 12, top: 8, fontSize: 18, opacity: 0.85}}>↗</div>}
    <div style={{position: 'absolute', inset: 0, borderRadius: 16, background: '#fff', opacity: 0.25 * flash}} />
  </div>
);

export const BotChat: React.FC<{t: number; startMsg: number; botMsg: number; tap: number}> = ({t, startMsg, botMsg, tap}) => {
  const arrive = eo3(prog(t, botMsg, botMsg + 0.5));
  const msgIn = eback(prog(t, botMsg + 0.05, botMsg + 0.45), 1.3);
  const startIn = eback(prog(t, startMsg, startMsg + 0.3), 1.6);
  const shift = lerp(700, 0, arrive);
  const fl = t >= tap ? clamp(1 - (t - tap) / 0.3) : 0;
  return (
    <AbsoluteFill style={{fontFamily: F.main, background: 'radial-gradient(circle at 80% 40%, #3A332C 0%, #17151A 55%, #0C0B0E 100%)'}}>
      {/* soft wallpaper shapes */}
      <div style={{position: 'absolute', left: 380, top: 380, width: 200, height: 640, background: 'linear-gradient(180deg, #1B2230, #0A0E16)', opacity: 0.6, borderRadius: 8}} />
      {/* messages */}
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: 1284, transform: `translateY(${shift}px)`}}>
        <div style={{position: 'absolute', left: 22, top: 120, width: 540, borderRadius: 26, background: BUBBLE, padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 14}}>
          <Line icon="bolt">Скорость до 10 Gb/s</Line>
          <Line>
            ✦ Наш канал: <span style={{color: LINK}}>@jetnodevpn</span>
          </Line>
          <Line>
            ✦ Выберите «Пробный период» и получите бесплатный доступ!
          </Line>
        </div>
        <div style={{position: 'absolute', left: W / 2 - 56, top: 352, width: 112, height: 34, borderRadius: 17, background: 'rgba(120,95,70,0.75)', color: '#F4E9DD', fontSize: 19, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          Сегодня
        </div>
        {t >= startMsg && (
          <div
            style={{
              position: 'absolute',
              right: 18,
              top: 398,
              height: 52,
              padding: '0 18px 0 22px',
              borderRadius: '24px 24px 6px 24px',
              background: RED,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 25,
              transform: `scale(${startIn})`,
              transformOrigin: '100% 100%',
            }}
          >
            <span style={{textDecoration: 'underline'}}>/start</span>
            <span style={{fontSize: 15, opacity: 0.75}}>17:51 ✓✓</span>
          </div>
        )}
        {t >= botMsg && (
          <div style={{position: 'absolute', left: 0, top: 0, width: W, transform: `translateY(${30 * (1 - msgIn)}px) scale(${lerp(0.96, 1, clamp(msgIn))})`, transformOrigin: '20% 100%', opacity: clamp(msgIn * 1.4)}}>
            <div style={{position: 'absolute', left: 22, top: 468, width: 560, height: 302, borderRadius: '24px 24px 0 0', overflow: 'hidden'}}>
              <Img src={staticFile('bot/banner-trial.png')} style={{width: '104%', height: '104%', marginLeft: '-2%', marginTop: '-2%', objectFit: 'cover'}} />
            </div>
            <div style={{position: 'absolute', left: 22, top: 770, width: 560, height: 202, borderRadius: '0 0 24px 24px', background: BUBBLE, padding: '16px 22px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 8}}>
              <Line bold>Пробный период активирован, 3 дня бесплатно — без пополнений!</Line>
              <Line icon="check">Работает даже при ограничениях операторов.</Line>
              <Line icon="check">Локации в Европе и СНГ. YouTube без рекламы.</Line>
              <Line icon="bolt" bold>
                Далее всего от 149₽/мес за 3 устройства
              </Line>
            </div>
            <InlineBtn y={BOT_BTN.y} label="Подключиться бесплатно" icon="link" bg="linear-gradient(180deg, #A3161D, #7E1015)" pressed={press(t, tap)} flash={fl} corner />
            <InlineBtn y={BOT_BTN.y + 70} label="Инструкция" icon="news" bg="linear-gradient(180deg, #8E1418, #6E0F13)" />
            <InlineBtn y={BOT_BTN.y + 140} label="Пропустить" icon="back" bg="linear-gradient(180deg, #4A3328, #33231C)" />
          </div>
        )}
      </div>
      {/* header */}
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: 150, background: 'linear-gradient(180deg, rgba(12,11,14,0.95), rgba(12,11,14,0.6) 70%, rgba(12,11,14,0))'}} />
      <div style={{position: 'absolute', left: 22, top: 70, width: 64, height: 64, borderRadius: 32, background: 'rgba(40,40,46,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Glyph name="back" size={34} color="#fff" stroke={2.6} />
      </div>
      <div style={{position: 'absolute', left: W / 2 - 150, top: 66, width: 300, height: 72, borderRadius: 36, background: 'rgba(40,40,46,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontSize: 26, fontWeight: 600, color: '#fff'}}>Jetnode VPN</div>
        <div style={{fontSize: 17, color: 'rgba(255,255,255,0.6)'}}>1 749 пользователей</div>
      </div>
      <div style={{position: 'absolute', left: W - 22 - 68, top: 68, width: 68, height: 68, borderRadius: 34, overflow: 'hidden', boxShadow: '0 0 0 2px rgba(255,255,255,0.1)'}}>
        <Img src={staticFile('bot/avatar.png')} style={{width: '120%', height: '120%', marginLeft: '-10%', marginTop: '-10%'}} />
      </div>
      {/* input bar */}
      <div style={{position: 'absolute', left: 0, top: 1196, width: W, height: 88, background: 'linear-gradient(180deg, rgba(12,11,14,0), rgba(12,11,14,0.85))'}} />
      <div style={{position: 'absolute', left: 18, top: 1206, width: 56, height: 56, borderRadius: 28, background: 'rgba(40,40,46,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Glyph name="clip" size={28} color="#ddd" />
      </div>
      <div style={{position: 'absolute', left: 84, top: 1206, width: 436, height: 56, borderRadius: 28, background: 'rgba(40,40,46,0.9)', color: 'rgba(255,255,255,0.45)', fontSize: 22, display: 'flex', alignItems: 'center', paddingLeft: 22, boxSizing: 'border-box'}}>
        Сообщение
      </div>
      <div style={{position: 'absolute', left: 530, top: 1206, width: 56, height: 56, borderRadius: 28, background: 'rgba(40,40,46,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Glyph name="mic" size={28} color="#ddd" />
      </div>
      {/* status bar */}
      <div style={{position: 'absolute', left: 52, top: 22, fontSize: 24, fontWeight: 600, color: '#fff'}}>17:51</div>
    </AbsoluteFill>
  );
};

import React from 'react';
import {siDiscord, siInstagram, siNetflix, siOpenai, siSpotify, siTelegram, siTiktok, siWhatsapp, siYoutube} from 'simple-icons';

export type Brand = 'youtube' | 'instagram' | 'tiktok' | 'whatsapp' | 'telegram' | 'discord' | 'netflix' | 'spotify' | 'chatgpt';

/** App tile look for each brand: tile background + logo colour (logos from simple-icons, CC0). */
const LOOK: Record<Brand, {path: string; bg: string; fg: string; name: string}> = {
  youtube: {path: siYoutube.path, bg: '#FFFFFF', fg: '#FF0000', name: 'YouTube'},
  instagram: {path: siInstagram.path, bg: 'radial-gradient(circle at 30% 107%, #FDF497 0%, #FD5949 45%, #D6249F 60%, #285AEB 90%)', fg: '#FFFFFF', name: 'Instagram'},
  tiktok: {path: siTiktok.path, bg: '#000000', fg: '#FFFFFF', name: 'TikTok'},
  whatsapp: {path: siWhatsapp.path, bg: 'linear-gradient(160deg, #5BEA7C, #1FAF38)', fg: '#FFFFFF', name: 'WhatsApp'},
  telegram: {path: siTelegram.path, bg: 'linear-gradient(160deg, #37AEE2, #1E96C8)', fg: '#FFFFFF', name: 'Telegram'},
  discord: {path: siDiscord.path, bg: '#5865F2', fg: '#FFFFFF', name: 'Discord'},
  netflix: {path: siNetflix.path, bg: '#000000', fg: '#E50914', name: 'Netflix'},
  spotify: {path: siSpotify.path, bg: '#000000', fg: '#1ED760', name: 'Spotify'},
  chatgpt: {path: siOpenai.path, bg: '#000000', fg: '#FFFFFF', name: 'ChatGPT'},
};

export const brandName = (b: Brand) => LOOK[b].name;

export const BrandIcon: React.FC<{brand: Brand; size: number; grey?: number}> = ({brand, size, grey = 0}) => {
  const l = LOOK[brand];
  const pad = brand === 'telegram' ? 0.2 : 0.22;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.24,
        background: l.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 ${size * 0.1}px ${size * 0.26}px rgba(30,30,60,0.18), inset 0 0 0 1px rgba(0,0,0,0.06)`,
        filter: grey > 0.01 ? `grayscale(${grey}) opacity(${1 - 0.4 * grey})` : undefined,
        flex: 'none',
      }}
    >
      <svg width={size * (1 - 2 * pad)} height={size * (1 - 2 * pad)} viewBox="0 0 24 24" style={{display: 'block'}}>
        {brand === 'tiktok' && (
          <>
            <path d={l.path} fill="#25F4EE" transform="translate(-0.6,-0.4)" />
            <path d={l.path} fill="#FE2C55" transform="translate(0.6,0.4)" />
          </>
        )}
        <path d={l.path} fill={l.fg} />
      </svg>
    </div>
  );
};

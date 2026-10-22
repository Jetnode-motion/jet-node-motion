# jet-node-motion

Motion templates for JetnodeVPN, built with [Remotion](https://www.remotion.dev) (React → video).

## Start

```bash
npm install
npm run dev          # Remotion Studio: preview and scrub
npx remotion render src/index.ts JetnodePromo out/jetnode-promo.mp4   # final, with motion blur
npx remotion render src/index.ts JetnodePromoDraft out/draft.mp4      # fast preview
npx remotion render src/index.ts JetnodeAd out/jetnode-ad.mp4         # v4 ad, Privata-style plate animations
npx remotion render src/index.ts JetnodeAd30 out/jetnode-ad30.mp4     # v5, 30 s with voiceover and the real bot
npx remotion render src/index.ts Polar7 out/polar7-ch1.mp4 --gl=swangle  # 3D story series, part 1, JetnodeVPN banner mid-roll + end
```

Fonts: install **SF Pro Display** on your machine (developer.apple.com/fonts). It is not stored here because of Apple's licence; without it the text falls back to Inter. The accent font is **SignPainter HouseScript** (Apple-distributed, not stored here): put `SignPainter-HouseScript.otf` into `public/fonts`. Without it accents fall back to Marck Script (OFL), which ships in `public/fonts`.

## Structure

- `src/style/` – palette and fonts from the project style guide, plus easing curves
- `src/components/` – reusable pieces: `Plate` (gradient plate with light corner, edge stroke and glow), `Phone`, `TouchTap`, `TapHand` + `Ripple`, `Subtitles` (kinetic words, `*accent*` in Marck Script), backgrounds, grain
- `src/components/Reveal.tsx` – plate animations: `Card` (cascade in from grey), `Headline` (lines from under a mask), `Status`, `Badge`, `DrawLine`, `Pulse` (light dots along lines); `Glyphs.tsx` – line icons
- `src/screens/` – phone screens: whitelist hook, bot chat, app home, server list
- `src/compositions/JetnodePromo/` – the 15 s phone-screen promo (v3); all timings and camera keys live in `timeline.ts`
- `src/compositions/JetnodeAd/` – the 15 s plate-based ad (v4): hook, bypass diagram, bot → deeplink → app, servers, end card
- `src/compositions/JetnodeAd30/` – the 30 s ad (v5) with voiceover: real app icons (`BrandIcon`, simple-icons), the real bot (`screens/BotChat.tsx`, banners in `public/bot`), servers, speed, price, end card
- `src/compositions/Polar7/` – «Полярная-7», a 9:16 story series in the trending 3D-figurine format: toy world (`World.tsx`), scenes and camera framings (`Scenes.tsx`), captions, paper notes, pills, stamps and the JetnodeVPN banner card (`Overlays.tsx`). `legacy/python/polar7.py` holds the script: it voices every line with RHVoice, writes `timeline.json` and mixes `public/audio/polar7.wav`. Edit a line there and rerun it, the video re-times itself.
- Voiceover: RHVoice `aleksandr-hq` (`apt install rhvoice rhvoice-russian`), lines in `public/audio/vo`; soundtrack mixed by `legacy/python/audio5.py`
- `legacy/python/` – the first Python/Cairo renderer this promo was ported from

Data in the screens (countries, ping, «12 мс») is placeholder.

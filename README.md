# jet-node-motion

Motion templates for JetnodeVPN, built with [Remotion](https://www.remotion.dev) (React → video).

## Start

```bash
npm install
npm run dev          # Remotion Studio: preview and scrub
npx remotion render src/index.ts JetnodePromo out/jetnode-promo.mp4   # final, with motion blur
npx remotion render src/index.ts JetnodePromoDraft out/draft.mp4      # fast preview
npx remotion render src/index.ts JetnodeAd out/jetnode-ad.mp4         # v4 ad, Privata-style plate animations
```

Fonts: install **SF Pro Display** on your machine (developer.apple.com/fonts). It is not stored here because of Apple's licence; without it the text falls back to Inter. Marck Script (OFL) ships in `public/fonts`.

## Structure

- `src/style/` – palette and fonts from the project style guide, plus easing curves
- `src/components/` – reusable pieces: `Plate` (gradient plate with light corner, edge stroke and glow), `Phone`, `TouchTap`, `TapHand` + `Ripple`, `Subtitles` (kinetic words, `*accent*` in Marck Script), backgrounds, grain
- `src/components/Reveal.tsx` – plate animations: `Card` (cascade in from grey), `Headline` (lines from under a mask), `Status`, `Badge`, `DrawLine`, `Pulse` (light dots along lines); `Glyphs.tsx` – line icons
- `src/screens/` – phone screens: whitelist hook, bot chat, app home, server list
- `src/compositions/JetnodePromo/` – the 15 s phone-screen promo (v3); all timings and camera keys live in `timeline.ts`
- `src/compositions/JetnodeAd/` – the 15 s plate-based ad (v4): hook, bypass diagram, bot → deeplink → app, servers, end card
- `legacy/python/` – the first Python/Cairo renderer this promo was ported from

Data in the screens (countries, ping, «12 мс») is placeholder.

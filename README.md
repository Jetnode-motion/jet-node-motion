# jet-node-motion

Motion templates for JetnodeVPN, built with [Remotion](https://www.remotion.dev) (React → video).

## Start

```bash
npm install
npm run dev          # Remotion Studio: preview and scrub
npx remotion render src/index.ts JetnodePromo out/jetnode-promo.mp4   # final, with motion blur
npx remotion render src/index.ts JetnodePromoDraft out/draft.mp4      # fast preview
```

Fonts: install **SF Pro Display** on your machine (developer.apple.com/fonts). It is not stored here because of Apple's licence; without it the text falls back to Inter. Marck Script (OFL) ships in `public/fonts`.

## Structure

- `src/style/` – palette and fonts from the project style guide, plus easing curves
- `src/components/` – reusable pieces: `Plate` (gradient plate with light corner, edge stroke and glow), `Phone`, `TapHand` + `Ripple`, `Subtitles` (kinetic words, `*accent*` in Marck Script), backgrounds, grain
- `src/screens/` – phone screens: whitelist hook, bot chat, app home, server list
- `src/compositions/JetnodePromo/` – the 15 s vertical promo; all timings and camera keys live in `timeline.ts`
- `legacy/python/` – the first Python/Cairo renderer this promo was ported from

Data in the screens (countries, ping, «12 мс») is placeholder.

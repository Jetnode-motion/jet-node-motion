import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Marck Script is OFL and ships with the repo. SF Pro is picked up from the system.
// SignPainter HouseScript (accent) is Apple-distributed: put it in public/fonts yourself, it is not committed.
export const fontsReady = loadFont({
  family: 'Marck Script',
  url: staticFile('fonts/MarckScript-Regular.ttf'),
  weight: '400',
});

// Checked with a HEAD request first: a missing file inside loadFont cancels the whole render.
export const accentReady = fetch(staticFile('fonts/SignPainter-HouseScript.otf'), {method: 'HEAD'})
  .then((r) =>
    r.ok ? loadFont({family: 'SignPainter', url: staticFile('fonts/SignPainter-HouseScript.otf'), weight: '400'}) : undefined
  )
  .catch(() => undefined);

// JetBrains Mono (OFL) for the typed notes in Polar7.
export const monoReady = Promise.all([
  loadFont({family: 'JetBrains Mono', url: staticFile('fonts/JetBrainsMono-Regular.ttf'), weight: '400'}),
  loadFont({family: 'JetBrains Mono', url: staticFile('fonts/JetBrainsMono-Bold.ttf'), weight: '700'}),
]);

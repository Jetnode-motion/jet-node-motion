import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Marck Script is OFL and ships with the repo. SF Pro is picked up from the system.
// SignPainter HouseScript (accent) is Apple-distributed: put it in public/fonts yourself, it is not committed.
export const fontsReady = loadFont({
  family: 'Marck Script',
  url: staticFile('fonts/MarckScript-Regular.ttf'),
  weight: '400',
});

export const accentReady = loadFont({
  family: 'SignPainter',
  url: staticFile('fonts/SignPainter-HouseScript.otf'),
  weight: '400',
}).catch(() => undefined);

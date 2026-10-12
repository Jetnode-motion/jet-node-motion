import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Marck Script is OFL and ships with the repo. SF Pro is picked up from the system.
export const fontsReady = loadFont({
  family: 'Marck Script',
  url: staticFile('fonts/MarckScript-Regular.ttf'),
  weight: '400',
});

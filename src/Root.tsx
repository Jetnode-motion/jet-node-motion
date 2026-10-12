import React from 'react';
import {Audio, Composition, staticFile} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {FPS, H, W} from './style/tokens';
import './style/fonts';
import {JetnodePromo} from './compositions/JetnodePromo/Promo';
import {DURATION} from './compositions/JetnodePromo/timeline';
import {JetnodeAd} from './compositions/JetnodeAd/Ad';
import {DURATION as AD_DURATION} from './compositions/JetnodeAd/timeline';
import {JetnodeAd30} from './compositions/JetnodeAd30/Ad30';
import {DURATION as AD30_DURATION} from './compositions/JetnodeAd30/timeline';

/*
 * The soundtrack lives here, outside CameraMotionBlur: the blur renders its children as
 * offset copies and drops any <Audio> inside them, so the final render came out silent.
 */
const withSound = (Comp: React.FC, wav: string, blur: boolean): React.FC => {
  const Wrapped: React.FC = () => (
    <>
      {blur ? (
        <CameraMotionBlur shutterAngle={180} samples={5}>
          <Comp />
        </CameraMotionBlur>
      ) : (
        <Comp />
      )}
      <Audio src={staticFile(`audio/${wav}`)} />
    </>
  );
  return Wrapped;
};

const Promo = withSound(JetnodePromo, 'promo.wav', true);
const PromoDraft = withSound(JetnodePromo, 'promo.wav', false);
const Ad = withSound(JetnodeAd, 'ad.wav', true);
const AdDraft = withSound(JetnodeAd, 'ad.wav', false);
const Ad30 = withSound(JetnodeAd30, 'ad30.wav', true);
const Ad30Draft = withSound(JetnodeAd30, 'ad30.wav', false);

export const RemotionRoot: React.FC = () => (
  <>
    {/* Final render: with motion blur */}
    <Composition id="JetnodePromo" component={Promo} durationInFrames={DURATION * FPS} fps={FPS} width={W} height={H} />
    {/* Fast preview without motion blur */}
    <Composition id="JetnodePromoDraft" component={PromoDraft} durationInFrames={DURATION * FPS} fps={FPS} width={W} height={H} />
    {/* v4 ad: Privata-style plate animations in our light style */}
    <Composition id="JetnodeAd" component={Ad} durationInFrames={AD_DURATION * FPS} fps={FPS} width={W} height={H} />
    <Composition id="JetnodeAdDraft" component={AdDraft} durationInFrames={AD_DURATION * FPS} fps={FPS} width={W} height={H} />
    {/* v5: ~30 s ad with voiceover and the real bot */}
    <Composition id="JetnodeAd30" component={Ad30} durationInFrames={AD30_DURATION * FPS} fps={FPS} width={W} height={H} />
    <Composition id="JetnodeAd30Draft" component={Ad30Draft} durationInFrames={AD30_DURATION * FPS} fps={FPS} width={W} height={H} />
  </>
);

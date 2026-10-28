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
import {Polar7, DURATION as POLAR7_DURATION} from './compositions/Polar7/Polar7';
import {Messages1, DURATION as MESSAGES1_DURATION} from './compositions/Messages1/Messages1';
import {Messages2, DURATION as MESSAGES2_DURATION} from './compositions/Messages2/Messages2';
import {Messages2Cover} from './compositions/Messages2/Cover';
import {Lift1, DURATION as LIFT1_DURATION} from './compositions/Lift1/Lift1';
import {Lift1Cover} from './compositions/Lift1/Cover';
import {Lift2, DURATION as LIFT2_DURATION} from './compositions/Lift2/Lift2';
import {Lift2Cover} from './compositions/Lift2/Cover';
import {ToyTest} from './compositions/Toy/ToyTest';

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
const Polar7Ep1 = withSound(Polar7, 'polar7.wav', false);
const Messages1Ep = withSound(Messages1, 'messages1.wav', false);
const Messages2Ep = withSound(Messages2, 'messages2.wav', false);
const Lift1Ep = withSound(Lift1, 'lift1.wav', false);
const Lift2Ep = withSound(Lift2, 'lift2.wav', false);

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
    {/* Polar7 part 1: 3D-figurine story series with the JetnodeVPN banner mid-roll and at the end */}
    <Composition id="Polar7" component={Polar7Ep1} durationInFrames={Math.ceil(POLAR7_DURATION * FPS)} fps={FPS} width={W} height={H} />
    {/* «Переписка» part 1: chat-story in the same 3D format, ElevenLabs voice, mood score */}
    <Composition id="Messages1" component={Messages1Ep} durationInFrames={Math.ceil(MESSAGES1_DURATION * FPS)} fps={FPS} width={W} height={H} />
    {/* «Переписка» part 2 «Твоя очередь» */}
    <Composition id="Messages2" component={Messages2Ep} durationInFrames={Math.ceil(MESSAGES2_DURATION * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="Messages2Cover" component={Messages2Cover} durationInFrames={1} fps={FPS} width={W} height={H} />
    {/* «Лифт» part 1 «13 этаж»: new series in the «Переписка» format */}
    <Composition id="Lift1" component={Lift1Ep} durationInFrames={Math.ceil(LIFT1_DURATION * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="Lift1Cover" component={Lift1Cover} durationInFrames={1} fps={FPS} width={W} height={H} />
    {/* «Лифт» part 2 «Вторая тень» */}
    <Composition id="Lift2" component={Lift2Ep} durationInFrames={Math.ceil(LIFT2_DURATION * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="Lift2Cover" component={Lift2Cover} durationInFrames={1} fps={FPS} width={W} height={H} />
    {/* look test: vinyl-toy characters in a Soviet-flat diorama */}
    <Composition id="ToyTest" component={ToyTest} durationInFrames={60} fps={FPS} width={W} height={H} />
  </>
);

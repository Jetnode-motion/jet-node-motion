import React from 'react';
import {Composition} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {FPS, H, W} from './style/tokens';
import './style/fonts';
import {JetnodePromo} from './compositions/JetnodePromo/Promo';
import {DURATION} from './compositions/JetnodePromo/timeline';
import {JetnodeAd} from './compositions/JetnodeAd/Ad';
import {DURATION as AD_DURATION} from './compositions/JetnodeAd/timeline';

const PromoWithBlur: React.FC = () => (
  <CameraMotionBlur shutterAngle={180} samples={5}>
    <JetnodePromo />
  </CameraMotionBlur>
);

const AdWithBlur: React.FC = () => (
  <CameraMotionBlur shutterAngle={180} samples={5}>
    <JetnodeAd />
  </CameraMotionBlur>
);

export const RemotionRoot: React.FC = () => (
  <>
    {/* Final render: with motion blur */}
    <Composition id="JetnodePromo" component={PromoWithBlur} durationInFrames={DURATION * FPS} fps={FPS} width={W} height={H} />
    {/* Fast preview without motion blur */}
    <Composition id="JetnodePromoDraft" component={JetnodePromo} durationInFrames={DURATION * FPS} fps={FPS} width={W} height={H} />
    {/* v4 ad: Privata-style plate animations in our light style */}
    <Composition id="JetnodeAd" component={AdWithBlur} durationInFrames={AD_DURATION * FPS} fps={FPS} width={W} height={H} />
    <Composition id="JetnodeAdDraft" component={JetnodeAd} durationInFrames={AD_DURATION * FPS} fps={FPS} width={W} height={H} />
  </>
);

import { Composition } from "remotion";
import { BURN_DURATION, BurnRate } from "./BurnRate";
import { KYC_DURATION, KycPipeline } from "./KycPipeline";
import { MRZ_DURATION, MrzCheckDigit } from "./MrzCheckDigit";
import { FPS, H, W } from "./theme";

const size = { width: W, height: H, fps: FPS };

export function RemotionRoot() {
  return (
    <>
      <Composition id="kyc-pipeline" component={KycPipeline} durationInFrames={KYC_DURATION} {...size} />
      <Composition id="mrz-check-digit" component={MrzCheckDigit} durationInFrames={MRZ_DURATION} {...size} />
      <Composition id="slo-burn-rate" component={BurnRate} durationInFrames={BURN_DURATION} {...size} />
    </>
  );
}

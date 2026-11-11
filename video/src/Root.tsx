import { Composition } from "remotion";
import { BURN_DURATION, BurnRate } from "./BurnRate";
import { KYC_DURATION, KycPipeline } from "./KycPipeline";
import { MRZ_DURATION, MrzCheckDigit } from "./MrzCheckDigit";
import { FPS } from "./theme";

const size = { width: 1280, height: 720, fps: FPS };

export function RemotionRoot() {
  return (
    <>
      <Composition id="kyc-pipeline" component={KycPipeline} durationInFrames={KYC_DURATION} {...size} />
      <Composition id="mrz-check-digit" component={MrzCheckDigit} durationInFrames={MRZ_DURATION} {...size} />
      <Composition id="slo-burn-rate" component={BurnRate} durationInFrames={BURN_DURATION} {...size} />
    </>
  );
}

import { Composition } from "remotion";
import { APPROVAL_DURATION, ApprovalFlow } from "./ApprovalFlow";
import { BURN_DURATION, BurnRate } from "./BurnRate";
import { SSRF_DURATION, SsrfGuard } from "./SsrfGuard";
import { KYC_DURATION, KycPipeline } from "./KycPipeline";
import { MRZ_DURATION, MrzCheckDigit } from "./MrzCheckDigit";
import { FIG_H, FIG_W, figures } from "./Figures";
import { FPS, H, W } from "./theme";

const size = { width: W, height: H, fps: FPS };

export function RemotionRoot() {
  return (
    <>
      <Composition id="kyc-pipeline" component={KycPipeline} durationInFrames={KYC_DURATION} {...size} />
      <Composition id="mrz-check-digit" component={MrzCheckDigit} durationInFrames={MRZ_DURATION} {...size} />
      <Composition id="slo-burn-rate" component={BurnRate} durationInFrames={BURN_DURATION} {...size} />
      <Composition id="approval-flow" component={ApprovalFlow} durationInFrames={APPROVAL_DURATION} {...size} />
      <Composition id="ssrf-guard" component={SsrfGuard} durationInFrames={SSRF_DURATION} {...size} />
      {figures.map((f) => (
        <Composition key={f.id} id={f.id} component={f.component} durationInFrames={1} width={FIG_W} height={FIG_H} fps={FPS} />
      ))}
    </>
  );
}

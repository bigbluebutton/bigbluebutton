import Interop from '@jitsi/sdp-interop';
import transform from 'sdp-transform';
import logger from '/imports/startup/client/logger';

// sdp-interop library for unified-plan <-> plan-b translation
const interop = new Interop.Interop();

// Some heuristics to determine if the input SDP is Unified Plan
const isUnifiedPlan = (sdp) => {
  const parsedSDP = transform.parse(sdp);
  if (parsedSDP.media.length <= 3 && parsedSDP.media.every(m => ['video', 'audio', 'data'].indexOf(m.mid) !== -1)) {
    logger.info({ logCode: 'sdp_utils_not_unified_plan' }, 'SDP does not look like Unified Plan');
    return false;
  }

  logger.info({ logCode: 'sdp_utils_is_unified_plan' }, 'SDP looks like Unified Plan');

  return true;
};

// Some heuristics to determine if the input SDP is Plan B
const isPlanB = (sdp) => {
  const parsedSDP = transform.parse(sdp);
  if (parsedSDP.media.length > 3 || !parsedSDP.media.every(m => ['video', 'audio', 'data'].indexOf(m.mid) !== -1)) {
    logger.info({ logCode: 'sdp_utils_not_plan_b' }, 'SDP does not look like Plan B');
    return false;
  }

  logger.info({ logCode: 'sdp_utils_is_plan_b' }, 'SDP looks like Plan B');

  return true;
};


// Specific method for translating FS SDPs from Plan B to Unified Plan (vice-versa)
const toPlanB = (unifiedPlanSDP) => {
  const planBSDP = interop.toPlanB(unifiedPlanSDP);
  logger.info({ logCode: 'sdp_utils_unified_plan_to_plan_b' }, `Converted Unified Plan to Plan B ${JSON.stringify(planBSDP)}`);
  return planBSDP;
};

const toUnifiedPlan = (planBSDP) => {
  const unifiedPlanSDP = interop.toUnifiedPlan(planBSDP);
  logger.info({ logCode: 'sdp_utils_plan_b_to_unified_plan' }, `Converted Plan B to Unified Plan ${JSON.stringify(unifiedPlanSDP)}`);
  return unifiedPlanSDP;
};

const stripMDnsCandidates = (sdp) => {
  const parsedSDP = transform.parse(sdp);
  let strippedCandidates = 0;
  parsedSDP.media.forEach((media) => {
    if (media.candidates) {
      media.candidates = media.candidates.filter((candidate) => {
        if (candidate.ip && candidate.ip.indexOf('.local') === -1) {
          return true;
        }
        strippedCandidates += 1;
        return false;
      });
    }
  });
  if (strippedCandidates > 0) {
    logger.info({ logCode: 'sdp_utils_mdns_candidate_strip' }, `Stripped ${strippedCandidates} mDNS candidates`);
  }
  return transform.write(parsedSDP);
};

export {
  interop, isUnifiedPlan, toPlanB, toUnifiedPlan, stripMDnsCandidates,
};

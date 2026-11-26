import {
  CameraDockPropagationState, Input, MeetingCameraDock, Output,
} from '../layoutTypes';

const equalDouble = (n1: number, n2: number) => {
  const precision = 0.01;

  return Math.abs(n1 - n2) <= precision;
};

const calculatePresentationVideoRate = (cameraDockOutput: Output['cameraDock']) => {
  const {
    position,
    height,
    width,
  } = cameraDockOutput;
  const horizontalPosition = position === 'contentLeft' || position === 'contentRight';
  let presentationVideoRate;
  if (horizontalPosition) {
    presentationVideoRate = width / window.innerWidth;
  } else {
    presentationVideoRate = height / window.innerHeight;
  }
  const rate = parseFloat(presentationVideoRate.toFixed(2));
  return Number.isFinite(rate) ? Math.min(1, Math.max(0, rate)) : 0;
};

// No position fallback while suppressed: a changed position notifies everyone.
const getPropagatedCameraDock = ({
  isSuppressed,
  cameraDockOutput,
  cameraDockInput,
  meetingCameraDock,
}: {
  isSuppressed: boolean;
  cameraDockOutput: Output['cameraDock'];
  cameraDockInput: Input['cameraDock'];
  meetingCameraDock: MeetingCameraDock;
}) => (isSuppressed
  ? {
    isResizing: false,
    cameraPosition: meetingCameraDock.position ?? '',
    presentationVideoRate: meetingCameraDock.videoRate,
  }
  : {
    isResizing: cameraDockInput.isResizing,
    cameraPosition: cameraDockOutput.position || 'contentTop',
    presentationVideoRate: calculatePresentationVideoRate(cameraDockOutput),
  });

const hasCameraDockChanged = (
  curr: CameraDockPropagationState,
  prev: Partial<CameraDockPropagationState>,
) => {
  if (curr.isCameraDockPropagationSuppressed) return false;

  const suppressionLifted = prev.isCameraDockPropagationSuppressed === true;
  return suppressionLifted
    || curr.cameraIsResizing !== prev.cameraIsResizing
    || curr.cameraPosition !== prev.cameraPosition
    || prev.presentationVideoRate === undefined
    || !equalDouble(curr.presentationVideoRate, prev.presentationVideoRate);
};

export {
  calculatePresentationVideoRate,
  equalDouble,
  getPropagatedCameraDock,
  hasCameraDockChanged,
};

export default {
  calculatePresentationVideoRate,
  equalDouble,
  getPropagatedCameraDock,
  hasCameraDockChanged,
};

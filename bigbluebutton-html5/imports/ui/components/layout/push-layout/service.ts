import { Input, Output } from '../layoutTypes';
import deviceInfo from '/imports/utils/deviceInfo';

// A device-enforced position is local to the output, so what a presenter propagates
// comes off the input, geometry included - or the rate and the position disagree.
const getPropagatedCameraDock = (
  cameraDockOutput: Output['cameraDock'],
  cameraDockInput: Input['cameraDock'],
) => {
  const isPositionEnforced = deviceInfo.isPhoneLandscape()
    && !!cameraDockOutput.position
    && cameraDockOutput.position !== cameraDockInput.position;

  if (!isPositionEnforced) return cameraDockOutput;

  return {
    ...cameraDockOutput,
    position: cameraDockInput.position,
    width: cameraDockInput.width,
    height: cameraDockInput.height,
  };
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

export {
  calculatePresentationVideoRate,
  getPropagatedCameraDock,
};

export default {
  calculatePresentationVideoRate,
  getPropagatedCameraDock,
};

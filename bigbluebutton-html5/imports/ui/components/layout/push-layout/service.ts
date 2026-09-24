import { Output } from '../layoutTypes';

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
};

export default {
  calculatePresentationVideoRate,
};

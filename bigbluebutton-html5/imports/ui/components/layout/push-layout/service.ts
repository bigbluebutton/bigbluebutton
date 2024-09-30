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
  return parseFloat(presentationVideoRate.toFixed(2));
};

export {
  calculatePresentationVideoRate,
};

export default {
  calculatePresentationVideoRate,
};

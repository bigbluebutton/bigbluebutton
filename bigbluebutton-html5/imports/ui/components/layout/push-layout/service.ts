import { Output } from '../layoutTypes';

const viewportWidth = () => window.document.documentElement.clientWidth;
const viewportHeight = () => window.document.documentElement.clientHeight;

const getPropagatedCameraDock = (
  cameraDockOutput: Output['cameraDock'],
) => {
  if (!cameraDockOutput.isPositionEnforced) return cameraDockOutput;

  return {
    ...cameraDockOutput,
    position: cameraDockOutput.intendedPosition ?? cameraDockOutput.position,
    width: cameraDockOutput.intendedWidth ?? cameraDockOutput.width,
    height: cameraDockOutput.intendedHeight ?? cameraDockOutput.height,
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
    presentationVideoRate = width / viewportWidth();
  } else {
    presentationVideoRate = height / viewportHeight();
  }
  const rate = parseFloat(presentationVideoRate.toFixed(2));
  return Number.isFinite(rate) ? Math.min(1, Math.max(0, rate)) : 0;
};

const calculateCameraDockSizeFromRate = (
  rate: number,
  horizontalPosition: boolean,
  fallbackWidth: number,
  fallbackHeight: number,
) => (horizontalPosition
  ? { width: viewportWidth() * rate, height: fallbackHeight }
  : { width: fallbackWidth, height: viewportHeight() * rate });

export {
  calculateCameraDockSizeFromRate,
  calculatePresentationVideoRate,
  getPropagatedCameraDock,
  viewportHeight,
  viewportWidth,
};

export default {
  calculateCameraDockSizeFromRate,
  calculatePresentationVideoRate,
  getPropagatedCameraDock,
  viewportHeight,
  viewportWidth,
};

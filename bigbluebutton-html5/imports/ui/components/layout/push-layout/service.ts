import { Output } from '../layoutTypes';

interface MediaAreaSize {
  width: number;
  height: number;
}

const calculatePresentationVideoRate = (
  cameraDockOutput: Output['cameraDock'],
  mediaAreaSize?: MediaAreaSize,
) => {
  const {
    position,
    height,
    width,
  } = cameraDockOutput;
  const horizontalPosition = position === 'contentLeft' || position === 'contentRight';
  const refWidth = mediaAreaSize?.width || window.innerWidth;
  const refHeight = mediaAreaSize?.height || window.innerHeight;
  let presentationVideoRate;
  if (horizontalPosition) {
    presentationVideoRate = refWidth > 0 ? width / refWidth : 0;
  } else {
    presentationVideoRate = refHeight > 0 ? height / refHeight : 0;
  }
  return parseFloat(presentationVideoRate.toFixed(2));
};

export {
  calculatePresentationVideoRate,
};

export default {
  calculatePresentationVideoRate,
};

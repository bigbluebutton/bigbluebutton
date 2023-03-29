
const calculateSlideData = (slideData) => {
  const {
    width, height, xOffset, yOffset, widthRatio, heightRatio,
  } = slideData;

  // calculating viewBox and offsets for the current presentation
  const maxImageWidth = 1440;
  const maxImageHeight = 1080;

  const ratio = Math.min(maxImageWidth / width, maxImageHeight / height);
  const scaledWidth = width * ratio;
  const scaledHeight = height * ratio;
  const scaledViewBoxWidth = width * widthRatio / 100 * ratio;
  const scaledViewBoxHeight = height * heightRatio / 100 * ratio;

  return {
    width: scaledWidth,
    height: scaledHeight,
    x: xOffset,
    y: yOffset,
    viewBoxWidth: scaledViewBoxWidth,
    viewBoxHeight: scaledViewBoxHeight,
  };
};

export default calculateSlideData;

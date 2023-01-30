
const calculateSlideData = (slideData) => {
  const {
    width, height, xOffset, yOffset, widthRatio, heightRatio,
  } = slideData;

  // calculating viewBox and offsets for the current presentation
  return {
    width,
    height,
    x: xOffset,
    y: yOffset,
    viewBoxWidth: (width * widthRatio) / 100,
    viewBoxHeight: (height * heightRatio) / 100,
  };
};

export default calculateSlideData;

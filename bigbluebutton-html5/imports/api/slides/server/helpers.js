
const calculateSlideData = (slideData) => {
  const {
    width, height, xOffset, yOffset, widthRatio, heightRatio,
  } = slideData;

  // calculating viewBox and offsets for the current presentation
  return {
    width,
    height,
    x: ((-xOffset * 2) * width) / 100,
    y: ((-yOffset * 2) * height) / 100,
    viewBoxWidth: (width * widthRatio) / 100,
    viewBoxHeight: (height * heightRatio) / 100,
  };
};

export default calculateSlideData;

// applies zooming to the stroke thickness
const zoomStroke = (thickness, widthRatio, heightRatio) => {
  let ratio;

  ratio = (widthRatio + heightRatio) / 2;
  return thickness * 100 / ratio;
};

const formatColor = (color) => {
  // let color = this.props.annotation.annotation.annotation.color;
  if (!color) {
    color = '0'; // default value
  }

  if (!color.toString().match(/\#.*/)) {
    color = colourToHex(color);
  }

  return color;
};

const colourToHex = (value) => {
  let hex;
  hex = parseInt(value).toString(16);
  while (hex.length < 6) {
    hex = `0${hex}`;
  }

  return `#${hex}`;
};

const getStrokeWidth = (thickness, slideWidth) => thickness * slideWidth / 100;

export default {
  formatColor,
  getStrokeWidth,
};

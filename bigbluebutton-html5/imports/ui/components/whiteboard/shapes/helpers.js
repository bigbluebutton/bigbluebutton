// applies zooming to the stroke thickness
const zoomStroke = (thickness, widthRatio, heightRatio) => {
  let ratio;

  ratio = (widthRatio  + heightRatio) / 2;
  return thickness * 100 / ratio;
};

const formatColor = (color) => {
  //let color = this.props.shape.shape.shape.color;
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

const getStrokeWidth = ((thickness, widthRatio, heightRatio) =>
  zoomStroke(formatThickness(thickness), widthRatio, heightRatio)
);

const formatThickness = (thickness) => {
  if (thickness == null) {
    thickness = '1'; // default value
  }

  if (!thickness.toString().match(/.*px$/)) {
    `#${thickness}px`; // leading "#" - to be compatible with Firefox
  }

  return thickness;
};

export default {
  formatColor,
  getStrokeWidth,
};

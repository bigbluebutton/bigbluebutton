const colourToHex = (value) => {
  let hex;
  hex = parseInt(value, 10).toString(16);
  while (hex.length < 6) {
    hex = `0${hex}`;
  }

  return `#${hex}`;
};

const getFormattedColor = (color) => {
  let _color = color || '0';

  if (!_color.toString().match(/#.*/)) {
    _color = colourToHex(_color);
  }

  return _color;
};

const getStrokeWidth = (thickness, slideWidth) => (thickness * slideWidth) / 100;

export default {
  getFormattedColor,
  getStrokeWidth,
};

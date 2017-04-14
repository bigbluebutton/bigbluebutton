//This is the code to generate the colors for the user avatar when no image is provided

const stringToPastelColour = (str) => {
  str = str.trim().toLowerCase();

  let baseRed = 128;
  let baseGreen = 128;
  let baseBlue = 128;

  let seed = 0;
  for (let i = 0; i < str.length; seed = str.charCodeAt(i++) + ((seed << 5) - seed));
  let a = Math.abs((Math.sin(seed++) * 10000)) % 256;
  let b = Math.abs((Math.sin(seed++) * 10000)) % 256;
  let c = Math.abs((Math.sin(seed++) * 10000)) % 256;

  //build colour
  let red = Math.round((a + baseRed) / 2);
  let green = Math.round((b + baseGreen) / 2);
  let blue = Math.round((c + baseBlue) / 2);

  return {
    r: red,
    g: green,
    b: blue,
  };
};

// https://www.w3.org/TR/WCAG20/#relativeluminancedef
// http://entropymine.com/imageworsener/srgbformula/
const relativeLuminance = (rgb) => {
  let tmp = {};

  Object.keys(rgb).forEach((i) => {
    let c = rgb[i] / 255;
    if (c <= 0.03928) {
      tmp[i] = c / 12.92;
    } else {
      tmp[i] = Math.pow(((c + 0.055) / 1.055), 2.4);
    }
  });

  return (0.2126 * tmp.r + 0.7152 * tmp.g + 0.0722 * tmp.b);
};

/**
 * Calculate contrast ratio acording to WCAG 2.0 formula
 * Will return a value between 1 (no contrast) and 21 (max contrast)
 * @link http://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
const contrastRatio = (a, b) => {
  let c;

  a = relativeLuminance(a);
  b = relativeLuminance(b);

  //Arrange so a is lightest
  if (a < b) {
    c = a;
    a = b;
    b = c;
  }

  return (a + 0.05) / (b + 0.05);
};

const shadeColor = (rgb, amt) => {
  let r = rgb.r + amt;
  if (r > 255) r = 255;
  else if (r < 0) r = 0;

  let b = rgb.b + amt;
  if (b > 255) b = 255;
  else if (b < 0) b = 0;

  let g = rgb.g + amt;
  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return {
    r: r,
    g: g,
    b: b,
  };
};

const addShadeIfNoContrast = (rgb) => {
  let base = {
    r: 255,
    g: 255,
    b: 255,
  }; // white

  let cr = contrastRatio(base, rgb);

  if (cr > 4.5) {
    return rgb;
  }

  return addShadeIfNoContrast(shadeColor(rgb, -25));
};

const getColor = (str) => {
  let rgb = stringToPastelColour(str);
  rgb = addShadeIfNoContrast(rgb);
  return 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')';
};

export default getColor;

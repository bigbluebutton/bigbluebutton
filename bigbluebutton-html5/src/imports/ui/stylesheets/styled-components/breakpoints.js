const smallOnly = 'only screen and (max-width: 40em)';
const mediumOnly = 'only screen and (min-width: 40.063em) and (max-width: 64em)';
const mediumUp = 'only screen and (min-width: 40.063em)';
const mediumDown = 'only screen and (max-width: 40.0629em)';
const landscape = "only screen and (orientation: landscape)";
const phoneLandscape = 'only screen and (max-width: 480px) and (orientation: landscape)';
const largeUp = 'only screen and (min-width: 64.063em)';
const hasPhoneDimentions = 'only screen and (max-height: 479px), only screen and (max-width: 479px)';
const hasPhoneWidth = 'only screen and (max-width: 479px)';

export {
  smallOnly,
  mediumOnly,
  mediumUp,
  landscape,
  phoneLandscape,
  largeUp,
  hasPhoneDimentions,
  mediumDown,
  hasPhoneWidth,
};

const deviceType = () => {
  const MAX_PHONE_SHORT_SIDE = 480;

  const smallSide = window.screen.width < window.screen.height
    ? window.screen.width
    : window.screen.height;

  return {
    isPhone: smallSide <= MAX_PHONE_SHORT_SIDE,
  };
};

export default deviceType;


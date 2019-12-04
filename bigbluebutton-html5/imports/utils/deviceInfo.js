const deviceInfo = {
  type() {
    // Listing of Device Viewport sizes, Updated : March 25th, 2018
    // http://mediag.com/news/popular-screen-resolutions-designing-for-all/
    const MAX_PHONE_SHORT_SIDE = 480;

    const smallSide = window.screen.width < window.screen.height
      ? window.screen.width
      : window.screen.height;

    return {
      isPhone: smallSide <= MAX_PHONE_SHORT_SIDE,
    };
  },
  hasMediaDevices: !!navigator.mediaDevices,
};


export default deviceInfo;

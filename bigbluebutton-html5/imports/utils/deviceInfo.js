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
  browserType() {
    return {
      isChrome: !!window.chrome && !!window.chrome.webstore,
      isFirefox: typeof InstallTrigger !== 'undefined',
    };
  },
  osType() {
    return {
      isWindows: window.navigator.userAgent.indexOf('Windows') !== -1,
      isMac: window.navigator.userAgent.indexOf('Mac') !== -1,
      isLinux: window.navigator.userAgent.indexOf('Linux') !== -1,
    };
  },

};


export default deviceInfo;


// Network Profiles (GPRS, Regular2G, Good2G, Regular3G, Good3G, Regular4G, DSL, WiFi)
exports.NETWORK_PRESETS = {
  GPRS: {
    offline: false,
    downloadThroughput: 50 * 1024 / 8,
    uploadThroughput: 20 * 1024 / 8,
    latency: 500,
  },
  Regular2G: {
    offline: false,
    downloadThroughput: 250 * 1024 / 8,
    uploadThroughput: 50 * 1024 / 8,
    latency: 300,
  },
  Good2G: {
    offline: false,
    downloadThroughput: 450 * 1024 / 8,
    uploadThroughput: 150 * 1024 / 8,
    latency: 150,
  },
  Regular3G: {
    offline: false,
    downloadThroughput: 750 * 1024 / 8,
    uploadThroughput: 250 * 1024 / 8,
    latency: 100,
  },
  Good3G: {
    offline: false,
    downloadThroughput: 1.5 * 1024 * 1024 / 8,
    uploadThroughput: 750 * 1024 / 8,
    latency: 40,
  },
  Regular4G: {
    offline: false,
    downloadThroughput: 4 * 1024 * 1024 / 8,
    uploadThroughput: 3 * 1024 * 1024 / 8,
    latency: 20,
  },
  DSL: {
    offline: false,
    downloadThroughput: 2 * 1024 * 1024 / 8,
    uploadThroughput: 1 * 1024 * 1024 / 8,
    latency: 5,
  },
  WiFi: {
    offline: false,
    downloadThroughput: 30 * 1024 * 1024 / 8,
    uploadThroughput: 15 * 1024 * 1024 / 8,
    latency: 2,
  },
};

// Mobile Devices (iPhoneX, GalaxyA31, iPad)
exports.MOBILE_DEVICES = {
  iPhoneX: {
    devtools: true,
    ignoreHTTPSErrors: true,
    defaultViewport: {
      width: 375,
      height: 812,
      isMobile: true,
    },
  },
  GalaxyNote3: {
    devtools: true,
    ignoreHTTPSErrors: true,
    defaultViewport: {
      width: 360,
      height: 640,
      isMobile: true,
    },
  },
  iPad: {
    devtools: true,
    ignoreHTTPSErrors: true,
    defaultViewport: {
      width: 765,
      height: 850,
      isMobile: true,
    },
  },
};

// User Agents (iPhoneX, GalaxyNote3, iPad, Desktop)
exports.USER_AGENTS = {
  iPhoneX:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
  GalaxyNote3:
    'Mozilla/5.0 (Linux; Android 10; SAMSUNG SM-N900V 4G Build/LRX21V) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4408.2 Mobile Safari/537.36',
  iPad:
    'Mozilla/5.0 (iPad; CPU OS 14_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
  Desktop:
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
};

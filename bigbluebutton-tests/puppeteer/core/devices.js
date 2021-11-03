const devices = [
    {
        name: 'iPhone X',
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        viewport: {
          width: 375,
          height: 812,
          deviceScaleFactor: 3,
          isMobile: true,
          hasTouch: true,
          isLandscape: false,
        },
    },
    {
        name: 'iPad Pro',
        userAgent:
          'Mozilla/5.0 (iPad; CPU OS 14_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        viewport: {
          width: 1024,
          height: 720,
          deviceScaleFactor: 2,
          isMobile: true,
          hasTouch: true,
          isLandscape: false,
        },
    },
    {
        name: 'Galaxy Note 3',
        userAgent:
          'Mozilla/5.0 (Linux; Android 10; SAMSUNG SM-N900V 4G Build/LRX21V) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4408.2 Mobile Safari/537.36',
        viewport: {
          width: 360,
          height: 640,
          deviceScaleFactor: 3,
          isMobile: true,
          hasTouch: true,
          isLandscape: false,
        },
    },
    {
        name: 'Linux Desktop',
        userAgent:
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
        viewport: {
          width: 1024,
          height: 720,    
          deviceScaleFactor: 1,
          isMobile: false,
          hasTouch: false,
          isLandscape: true,
        },
    },
]

const devicesMap = {};
for (const device of devices)
    devicesMap[device.name] = device;
module.exports = devicesMap;

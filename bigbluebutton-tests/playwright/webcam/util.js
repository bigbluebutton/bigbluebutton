const e = require('../core/elements');
const { sleep } = require('../core/helpers');
const { LOOP_INTERVAL, ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');

// loop 5 times, every LOOP_INTERVAL milliseconds, and check that all
// videos displayed are changing by comparing a hash of their
// displayed contents

async function webcamContentCheck(test) {
  await test.waitForSelector(e.webcamVideoItem);
  await test.wasRemoved(e.webcamConnecting, ELEMENT_WAIT_LONGER_TIME);
  const repeats = 5;
  let check;
  for (let i = repeats; i >= 1; i--) {
    console.log(`loop ${i}`);
    const checkCameras = () => {
      const videos = document.querySelectorAll('video');
      const lastVideoHash = document.lastVideoHash || {};
      document.lastVideoHash = lastVideoHash;

      // If this code was running in the playwright test harness, we
      // could just require('sha1'), but it's running in the test
      // browser via test.page.evaluate, and I'm not sure how to get a
      // node module (like sha1) into the test browser.  So I just
      // found a nice hash function on the Internet.  -bwb

      // public domain code from https://stackoverflow.com/a/52171480/1493790
      // and/or https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js

      const cyrb53 = function(array, seed = 0) {
          let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
          for (let i = 0, ch; i < array.length; i++) {
              ch = array[i];
              h1 = Math.imul(h1 ^ ch, 2654435761);
              h2 = Math.imul(h2 ^ ch, 1597334677);
          }
          h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
          h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
          return 4294967296 * (2097151 & h2) + (h1>>>0);
      };

      for (let v = 0; v < videos.length; v++) {
        const video = videos[v];
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const pixel = context.getImageData(0, 0, video.videoWidth, video.videoHeight).data;
        const pixelHash = cyrb53(pixel);

        if (lastVideoHash[v]) {
          if (lastVideoHash[v] == pixelHash) {
            return false;
          }
        }
        lastVideoHash[v] = pixelHash;
      }
      return true;
    };

    check = await test.page.evaluate(checkCameras, i);
    if (!check) return false;
    await sleep(LOOP_INTERVAL);
  }
  return check === true;
}

exports.webcamContentCheck = webcamContentCheck;

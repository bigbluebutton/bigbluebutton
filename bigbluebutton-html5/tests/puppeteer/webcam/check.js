const Share = require('./share');
const util = require('./util');
const we = require('./elements');

class Check extends Share {
  constructor() {
    super('check-webcam-content');
  }

  async test() {
    await util.enableWebcam(this.page);
    await this.waitForSelector(we.videoContainer);
    await this.page.waitFor(15000);
    const LOOP_INTERVAL = 1000;
    const repeats = 5;
    let check;
    console.log(`repeats ${repeats}`);
    for (let i = repeats; i >= 1; i--) {
      console.log(`loop ${i}`);
      const checkCameras = function (i) {
        const videos = document.querySelectorAll('video');
        const lastVideoColor = document.lastVideoColor || {};
        document.lastVideoColor = lastVideoColor;

        for (let v = 0; v < videos.length; v++) {
          console.log(`video ${v}`);
          const video = videos[v];
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          const pixel = context.getImageData(50, 50, 1, 1).data;
          const pixelString = new Array(pixel).join(' ').toString();

          if (lastVideoColor[v]) {
            if (lastVideoColor[v] == pixelString) {
              console.log(`Video N°${v} didn't change the color ! ${lastVideoColor[v]} = ${pixelString}`);
              return false;
            }
          }
          lastVideoColor[v] = pixelString;
          console.log(`Check_${i} Video_${v}`);
          return true;
        }
      };

      check = await this.page.evaluate(checkCameras, i);

      if (check !== true) {
        console.log(`Exiting with Failure due to checkCameras (${check}) !`);
      }
      await this.page.waitFor(LOOP_INTERVAL);
    }
    return check === true;
  }
}
module.exports = exports = Check;

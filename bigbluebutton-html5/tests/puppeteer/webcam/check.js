const Share = require('./share');
const util = require('./util');

class Check extends Share {
  constructor() {
    super('webcam-check-content-test');
  }

  async compare() {
    await util.enableWebcam(page1, page2);
    const respUser = await util.compareWebcamsContents(this);
    return respUser === true;
  }

  async test() {
    const parsedSettings = await this.getSettingsYaml();
    const videoPreviewTimeout = parseInt(parsedSettings.public.kurento.gUMTimeout);

    await util.enableWebcam(this, videoPreviewTimeout);
    const respUser = await util.webcamContentCheck(this);
    return respUser === true;
  }
}
module.exports = exports = Check;

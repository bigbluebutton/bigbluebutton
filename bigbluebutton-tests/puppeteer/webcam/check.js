const Share = require('./share');
const util = require('./util');

class Check extends Share {
  constructor() {
    super();
  }

  async compare() {
    try {
      await util.enableWebcam(page1, page2);
      const respUser = await util.compareWebcamsContents(this);
      return respUser === true;
    } catch (err) {
      await this.logger(err);
      return false;
    }
  }

  async test() {
    try {
      const parsedSettings = await this.getSettingsYaml();
      const videoPreviewTimeout = parseInt(parsedSettings.public.kurento.gUMTimeout);

      await this.shareWebcam(true, videoPreviewTimeout);
      const respUser = await util.webcamContentCheck(this);
      return respUser === true;
    } catch (err) {
      await this.logger(err);
      return false;
    }
  }
}

module.exports = exports = Check;

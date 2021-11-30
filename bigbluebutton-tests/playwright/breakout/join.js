const Create = require('./create');
const utilScreenShare = require('../screenshare/util');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');

class Join extends Create {
  constructor(browser, context) {
    super(browser, context);
  }

  async joinRoom(shouldJoinAudio = false) {
    await this.userPage1.bringToFront();
    if (shouldJoinAudio) {
      await this.userPage1.waitAndClick(e.joinAudio);
      await this.userPage1.joinMicrophone();
    }

    await this.userPage1.waitAndClick(e.breakoutRoomsItem);
    await this.userPage1.waitAndClick(e.joinRoom1);
    await this.userPage1.waitForSelector(e.alreadyConnected, ELEMENT_WAIT_LONGER_TIME);

    const breakoutUserPage1 = await this.userPage1.getLastTargetPage(this.context);
    await breakoutUserPage1.bringToFront();

    await breakoutUserPage1.hasElement(e.presentationPlaceholder);
    if (!shouldJoinAudio) await breakoutUserPage1.closeAudioModal();
    return breakoutUserPage1;
  }

  async joinAndShareWebcam() {
    const breakoutPage = await this.joinRoom();

    const parsedSettings = await this.userPage1.getSettingsYaml();
    const videoPreviewTimeout = parseInt(parsedSettings.public.kurento.gUMTimeout);
    await breakoutPage.shareWebcam(true, videoPreviewTimeout);
    await breakoutPage.hasElement(e.presentationPlaceholder);
  }

  async joinAndShareScreen() {
    const breakoutPage = await this.joinRoom();

    await utilScreenShare.startScreenshare(breakoutPage);
    await utilScreenShare.getScreenShareBreakoutContainer(breakoutPage);
  }

  async joinWithAudio() {
    const breakoutUserPage1 = await this.joinRoom(true);

    await breakoutUserPage1.waitForSelector(e.talkingIndicator);
    await breakoutUserPage1.hasElement(e.isTalking);
  }
}

module.exports = exports = Join;

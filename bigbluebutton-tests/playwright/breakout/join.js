const { Create } = require('./create');
const utilScreenShare = require('../screenshare/util');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { getSettings } = require('../core/settings');

class Join extends Create {
  constructor(browser, context) {
    super(browser, context);
  }

  async joinRoom(shouldJoinAudio = false) {
    await this.userPage.bringToFront();
    if (shouldJoinAudio) {
      await this.userPage.waitAndClick(e.joinAudio);
      await this.userPage.joinMicrophone();
    }

    await this.userPage.waitAndClick(e.breakoutRoomsItem);
    await this.userPage.waitAndClick(e.joinRoom1);
    await this.userPage.waitForSelector(e.alreadyConnected, ELEMENT_WAIT_LONGER_TIME);

    const breakoutUserPage = await this.userPage.getLastTargetPage(this.context);
    await breakoutUserPage.bringToFront();

    if (!shouldJoinAudio) await breakoutUserPage.closeAudioModal();
    await breakoutUserPage.waitForSelector(e.presentationTitle);
    return breakoutUserPage;
  }

  async joinAndShareWebcam() {
    const breakoutPage = await this.joinRoom();

    const { videoPreviewTimeout } = getSettings();
    await breakoutPage.shareWebcam(true, videoPreviewTimeout);
    await breakoutPage.hasElement(e.presentationPlaceholder);
    await breakoutPage.waitForSelector(e.presentationTitle);
  }

  async joinAndShareScreen() {
    const breakoutPage = await this.joinRoom();

    await utilScreenShare.startScreenshare(breakoutPage);
    await utilScreenShare.getScreenShareBreakoutContainer(breakoutPage);
  }

  async joinWithAudio() {
    const breakoutUserPage = await this.joinRoom(true);

    await breakoutUserPage.waitForSelector(e.talkingIndicator);
    await breakoutUserPage.hasElement(e.isTalking);
  }
}

exports.Join = Join;

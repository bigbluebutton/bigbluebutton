const Page = require('./page');
const helper = require('./helper');
const e = require('../core/elements');

class HotkeysMicFirstTestPage extends Page {
  constructor() {
    super();
    this.tabCounts =
    {
      audioNoMic: 12,
      audioMic: 13,
    };
  }

  async test() {
    await this.createBBBMeeting();
    await this.joinAudioMicrophone();
    await this.page.screenshot({ path: 'screenshots/test-hotkeys-mic-first-0.png' });

    await this.page.waitFor(e.whiteboard);
    await this.page.waitFor(e.options);
    await this.page.waitFor(e.userList);
    await this.page.waitFor(e.toolbox);
    await this.page.waitFor(e.leaveAudio);
    await this.page.waitFor(e.chatButton);
    await this.page.waitFor(e.firstUser);
    await this.page.waitFor(e.startScreenSharing);
    await this.page.waitFor(e.videoMenu);
    await this.page.waitFor(e.actions);
    await this.page.waitFor(e.nextSlide);
    await this.page.waitFor(e.prevSlide);

    // Leave/Join Audio as Listen Only
    await this.elementRemoved(e.alerts);
    await this.page.click(e.title);
    await this.tab(this.tabCounts.audioMic);
    await this.enter();
    await this.enter();
    await this.page.waitFor(e.listenOnlyButton);
    await this.tab(3);
    await this.enter();
    await this.elementRemoved(e.audioModal);
    await helper.sleep(500);
    await this.page.screenshot({ path: 'screenshots/test-hotkeys-mic-first-1.png' });

    // Leave/Join Audio with Microphone
    await this.elementRemoved(e.alerts);
    await this.page.click(e.title);
    await this.tab(this.tabCounts.audioNoMic);
    await this.enter();
    await this.enter();
    await this.page.waitFor(e.microphoneButton);
    await this.tab(2);
    await this.enter();
    await this.page.waitFor(e.echoYesButton);
    await helper.sleep(500); // Echo test confirmation sometimes fails without this
    await this.tab(1);
    await this.enter();
    await this.elementRemoved(e.audioModal);
    await helper.sleep(500);
    await this.page.screenshot({ path: 'screenshots/test-hotkeys-mic-first-2.png' });
  }
}

module.exports = exports = HotkeysMicFirstTestPage;

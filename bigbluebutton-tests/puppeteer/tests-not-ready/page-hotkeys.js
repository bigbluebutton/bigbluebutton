const Page = require('./page');
const helper = require('./helper');
const e = require('../core/elements');

class HotkeysTestPage extends Page {
  constructor() {
    super();
    this.tabCounts =
    {
      options: 1,
      actions: 11,
      audioNoMic: 12,
      audioMic: 13,
      mute: 12,
      chat: 15,
      closeChat: 17, // Only when chat is open
      status: 16,
      userList: 18,
    };
  }

  async test() {
    await this.createBBBMeeting();
    await this.joinAudioListenOnly();

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

    await this.elementRemoved(e.alerts);

    // Options
    await this.page.click(e.title);
    await this.tab(this.tabCounts.options);
    await this.enter();
    await helper.sleep(500);
    await this.page.screenshot({ path: 'screenshots/test-hotkeys-options-0.png' });
    await this.enter();
    await helper.sleep(500);
    await this.page.screenshot({ path: 'screenshots/test-hotkeys-options-1.png' });

    // User List
    await this.page.click(e.title);
    await this.tab(this.tabCounts.userList);
    await this.enter();
    await helper.sleep(500);
    await this.page.screenshot({ path: 'screenshots/test-hotkeys-userlist-0.png' });
    await this.enter();
    await helper.sleep(500);
    await this.page.screenshot({ path: 'screenshots/test-hotkeys-userlist-1.png' });

    // Toggle Public Chat
    await this.elementRemoved(e.alerts);
    await this.page.click(e.title);
    await this.tab(this.tabCounts.chat);
    await this.up(1);
    await this.enter();
    await helper.sleep(500);
    await this.page.screenshot({ path: 'screenshots/test-hotkeys-chat-0.png' });
    await this.page.click(e.title);
    await this.tab(this.tabCounts.closeChat);
    await this.enter();
    await helper.sleep(500);
    await this.page.screenshot({ path: 'screenshots/test-hotkeys-chat-1.png' });

    // Open Actions Menu
    await this.page.click(e.title);
    await this.tab(this.tabCounts.actions);
    await this.enter();
    await helper.sleep(500);
    await this.page.screenshot({ path: 'screenshots/test-hotkeys-actions-0.png' });
    await this.enter();
    await helper.sleep(500);
    await this.page.screenshot({ path: 'screenshots/test-hotkeys-actions-1.png' });

    // Open Status Menu
    await this.elementRemoved(e.alerts);
    await this.page.click(e.title);
    await this.tab(this.tabCounts.status);
    await this.up(1);
    await this.enter();
    await helper.sleep(500);
    await this.page.screenshot({ path: 'screenshots/test-hotkeys-status-0.png' });
    await this.tab(1);
    await this.enter();
    await this.tab(1);
    await this.down(7); // Applaud status
    await this.enter();
    await helper.sleep(500);
    await this.page.screenshot({ path: 'screenshots/test-hotkeys-status-1.png' });

    // Leave/Join Audio
    await this.page.click(e.title);
    await this.tab(this.tabCounts.audioNoMic);
    await this.enter();
    await helper.sleep(500);
    await this.page.screenshot({ path: 'screenshots/test-hotkeys-audio-0.png' });
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
    await this.page.screenshot({ path: 'screenshots/test-hotkeys-audio-1.png' });

    // Mute/Unmute
    await this.elementRemoved(e.alerts);
    await this.page.click(e.title);
    await this.tab(this.tabCounts.mute);
    await this.enter();
    await helper.sleep(500);
    await this.page.screenshot({ path: 'screenshots/test-hotkeys-mute-0.png' });
    await this.enter();
    await helper.sleep(500);
    await this.page.screenshot({ path: 'screenshots/test-hotkeys-mute-1.png' });
  }

  async tab(count) {
    for (let i = 0; i < count; i++) {
      await this.page.keyboard.press('Tab');
    }
  }

  async enter() {
    await this.page.keyboard.press('Enter');
  }

  async down(count) {
    for (let i = 0; i < count; i++) {
      await this.page.keyboard.press('ArrowDown');
    }
  }

  async up(count) {
    for (let i = 0; i < count; i++) {
      await this.page.keyboard.press('ArrowUp');
    }
  }
}

module.exports = exports = HotkeysTestPage;

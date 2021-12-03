const { expect } = require('@playwright/test');
const Page = require('../core/page');
const e = require('../core/elements');
const c = require('../core/constants');
const { checkIncludeClass } = require('./util');

class Stress {
  constructor(browser, context, page) {
    this.modPage = new Page(browser, page);
    this.browser = browser;
    this.context = context;
    this.userPages = [];
  }

  async moderatorAsPresenter() {
    const maxFailRate = c.JOIN_AS_MODERATOR_TEST_ROUNDS * c.MAX_JOIN_AS_MODERATOR_FAIL_RATE;
    let failureCount = 0;
    for (let i = 1; i <= c.JOIN_AS_MODERATOR_TEST_ROUNDS; i++) {
      await this.modPage.init(true, true, { fullName: `Moderator-${i}` });
      await this.modPage.waitForSelector(e.userAvatar);
      const hasPresenterClass = await this.modPage.page.evaluate(checkIncludeClass, [e.userAvatar, e.presenterClassName]);
      await this.modPage.waitAndClick(e.actions);
      const canStartPoll = await this.modPage.checkElement(e.polling);
      if (!hasPresenterClass || !canStartPoll) {
        failureCount++;
      }

      const newPage = await this.context.newPage();
      await this.modPage.page.close();
      this.modPage.page = newPage;
      console.log(`Loop ${i} of ${c.JOIN_AS_MODERATOR_TEST_ROUNDS} completed`);
      await expect(failureCount).toBeLessThanOrEqual(maxFailRate);
    }
  }

  async breakoutRoomInvitation() {
    await this.modPage.init(true, true, { fullName: 'Moderator' });
    for (let i = 1; i <= c.BREAKOUT_ROOM_INVITATION_TEST_ROUNDS; i++) {
      const userName = `User-${i}`;
      const newPage = await this.browser.newPage();
      const userPage = new Page(this.browser, newPage);
      await userPage.init(false, true, { fullName: userName, meetingId: this.modPage.meetingId });
      console.log(`${userName} joined`);
      this.userPages.push(userPage);
    }

    // Create breakout rooms with the allow choice option enabled
    await this.modPage.bringToFront();
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.waitAndClick(e.allowChoiceRoom);
    await this.modPage.waitAndClick(e.modalConfirmButton);

    for (const page of this.userPages) {
      await page.bringToFront();
      await page.hasElement(e.modalConfirmButton, c.ELEMENT_WAIT_LONGER_TIME);
      await page.hasElement(e.labelGeneratingURL, c.ELEMENT_WAIT_LONGER_TIME);
    }

    // End breakout rooms
    await this.modPage.bringToFront();
    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.waitAndClick(e.endBreakoutRoomsButton);
    await this.modPage.closeAudioModal();

    // Create breakout rooms with the allow choice option NOT enabled (randomly assign)
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.waitAndClick(e.randomlyAssign);
    await this.modPage.waitAndClick(e.modalConfirmButton);

    for (const page of this.userPages) {
      await page.bringToFront();
      await page.hasElement(e.modalConfirmButton);
    }
  }
}

exports.Stress = Stress;

const Page = require('../core/page');
const e = require('../core/elements');
const c = require('../core/constants');
const util = require('./util');

class Stress {
  constructor() {
    this.modPage = new Page();
    this.userPages = [];
  }

  async moderatorAsPresenter(testName) {
    try {
      const maxFailRate = c.JOIN_AS_MODERATOR_TEST_ROUNDS * c.MAX_JOIN_AS_MODERATOR_FAIL_RATE;
      let failureCount = 0;
      for (let i = 1; i <= c.JOIN_AS_MODERATOR_TEST_ROUNDS; i++) {
        await this.modPage.init(true, true, testName, `Moderator-${i}`);
        await this.modPage.waitForSelector(e.userAvatar);
        const hasPresenterClass = await this.modPage.page.evaluate(util.checkIncludeClass, e.userAvatar, e.presenterClassName);
        await this.modPage.waitAndClick(e.actions);
        const canStartPoll = await this.modPage.hasElement(e.polling);
        if (!hasPresenterClass || !canStartPoll) {
          failureCount++;
          await this.modPage.screenshot(testName, `loop-${i}-failure-${testName}`);
        }
        await this.modPage.close();
        await this.modPage.logger(`Loop ${i} of ${c.JOIN_AS_MODERATOR_TEST_ROUNDS} completed`);
        if (failureCount > maxFailRate) return false;
      }
      return true;
    } catch (err) {
      await this.modPage.logger(err);
      return false;
    }
  }

  async breakoutRoomInvitation(testName) {
    try {
      await this.modPage.init(true, true, testName, 'Moderator');
      for (let i = 1; i <= c.BREAKOUT_ROOM_INVITATION_TEST_ROUNDS; i++) {
        const userName = `User-${i}`;
        const userPage = new Page();
        await userPage.init(false, true, testName, userName, this.modPage.meetingId);
        await userPage.logger(`${userName} joined`);
        this.userPages.push(userPage);
      }

      // Create breakout rooms with the allow choice option enabled
      await this.modPage.bringToFront();
      await this.modPage.waitAndClick(e.manageUsers);
      await this.modPage.waitAndClick(e.createBreakoutRooms);
      await this.modPage.waitAndClick(e.allowChoiceRoom);
      await this.modPage.screenshot(testName, '01-modPage-before-create-breakout-rooms-allowing-choice');
      await this.modPage.waitAndClick(e.modalConfirmButton);

      for (const page of this.userPages) {
        await page.bringToFront();
        const firstCheck = await page.hasElement(e.modalConfirmButton, c.ELEMENT_WAIT_LONGER_TIME);
        const secondCheck = await page.wasRemoved(e.labelGeneratingURL, c.ELEMENT_WAIT_LONGER_TIME);

        if (!firstCheck || !secondCheck) {
          await page.screenshot(testName, `${page.effectiveParams.fullName}-breakout-modal-failed`);
          return false;
        }
        await page.screenshot(testName, `${page.effectiveParams.fullName}-breakout-modal-allowing-choice-success`);
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
      await this.modPage.screenshot(testName, '02-modPage-before-create-breakout-rooms-not-allowing-choice');
      await this.modPage.waitAndClick(e.modalConfirmButton);

      for (const page of this.userPages) {
        await page.bringToFront();
        const check = await page.hasElement(e.modalConfirmButton);

        if (!check) {
          await page.screenshot(testName, `${page.effectiveParams.fullName}-breakout-modal-not-allowing-choose-failed`);
          return false;
        }
        await page.screenshot(testName, `${page.effectiveParams.fullName}-breakout-modal-not-allowing-choose-success`);
      }

      return true;
    } catch (err) {
      await this.modPage.logger(err);
      return false;
    }
  }

  async closeUsersPages() {
    for (const page of this.userPages) {
      try {
        await page.close();
      } catch (err) {
        await this.modPage.logger(err);
      }
    }
  }
}

module.exports = exports = Stress;
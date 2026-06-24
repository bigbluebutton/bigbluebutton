import { Browser, BrowserContext, expect, Page as PlaywrightPage, TestInfo } from '@playwright/test';

import * as c from '../core/constants';
import { elements as e } from '../core/elements';
import { createMeeting } from '../core/helpers';
import { Page } from '../core/page';
import { checkIsPresenter } from '../user/util';

export class Stress {
  public modPage: Page;

  public browser: Browser;

  public context: BrowserContext;

  public userPages: Page[];

  constructor(browser: Browser, context: BrowserContext, page: PlaywrightPage, testInfo: TestInfo) {
    this.modPage = new Page(browser, page, testInfo);
    this.browser = browser;
    this.context = context;
    this.userPages = [];
  }

  async getNewPageTab() {
    return this.browser.newPage();
  }

  async moderatorAsPresenter() {
    const maxFailRate = c.JOIN_AS_MODERATOR_TEST_ROUNDS * c.MAX_JOIN_AS_MODERATOR_FAIL_RATE;
    let failureCount = 0;
    for (let i = 1; i <= c.JOIN_AS_MODERATOR_TEST_ROUNDS; i++) {
      await this.modPage.init(true, { fullName: `Moderator-${i}` });
      await this.modPage.waitForSelector(e.userAvatar);
      const isPresenter = await checkIsPresenter(this.modPage);
      await this.modPage.waitAndClick(e.actions);
      const canStartPoll = await this.modPage.checkElement(e.polling);
      if (!isPresenter || !canStartPoll) {
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
    await this.modPage.init(true, { fullName: 'Moderator' });
    for (let i = 1; i <= c.BREAKOUT_ROOM_INVITATION_TEST_ROUNDS; i++) {
      const userName = `User-${i}`;
      const newPage = await this.getNewPageTab();
      const userPage = new Page(this.browser, newPage, this?.modPage?.testInfo);
      await userPage.init(false, {
        fullName: userName,
        meetingId: this.modPage.meetingId,
        testInfo: this?.modPage?.testInfo,
      });
      console.log(`${userName} joined`);
      this.userPages.push(userPage);
    }

    // Create breakout rooms with the allow choice option enabled
    await this.modPage.page.bringToFront();
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.waitAndClick(e.allowChoiceRoom);
    await this.modPage.waitAndClick(e.modalConfirmButton);

    for (const page of this.userPages) {
      await page.page.bringToFront();
      await page.hasElement(
        e.modalConfirmButton,
        'should display the modal confirm button',
        c.ELEMENT_WAIT_LONGER_TIME,
      );
      await page.hasElement(
        e.labelGeneratingURL,
        'should display the label generating URL',
        c.ELEMENT_WAIT_LONGER_TIME,
      );
    }

    // End breakout rooms
    await this.modPage.page.bringToFront();
    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.waitAndClick(e.endBreakoutRoomsButton);
    await this.modPage.closeAudioModal();

    // Create breakout rooms with the allow choice option NOT enabled (randomly assign)
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.waitAndClick(e.randomlyAssign);
    await this.modPage.waitAndClick(e.modalConfirmButton);

    for (const page of this.userPages) {
      await page.page.bringToFront();
      await page.hasElement(e.modalConfirmButton, 'should display the modal confirm button');
    }
  }

  async twoUsersJoinSameTime() {
    for (let i = 1; i <= c.JOIN_TWO_USERS_ROUNDS; i++) {
      console.log(`loop ${i} of ${c.JOIN_TWO_USERS_ROUNDS}`);
      const meetingId = await createMeeting();
      const modPage = new Page(this.browser, await this.getNewPageTab(), this?.modPage?.testInfo);
      const userPage = new Page(this.browser, await this.getNewPageTab(), this?.modPage?.testInfo);
      await Promise.all([
        modPage.init(true, { meetingId, shouldCloseAudioModal: false }),
        userPage.init(false, { meetingId, shouldCloseAudioModal: false }),
      ]);
      await modPage.waitForSelector(e.audioModal);
      await userPage.waitForSelector(e.audioModal);
      await modPage.page.close();
      await userPage.page.close();
    }
  }

  async usersJoinKeepingConnected() {
    const meetingId = await createMeeting();
    const pages = [];

    for (let i = 1; i <= c.JOIN_TWO_USERS_KEEPING_CONNECTED_ROUNDS / 2; i++) {
      console.log(`joining ${i * 2} users of ${c.JOIN_TWO_USERS_KEEPING_CONNECTED_ROUNDS}`);
      const modPage = new Page(this.browser, await this.getNewPageTab(), this?.modPage?.testInfo);
      const userPage = new Page(this.browser, await this.getNewPageTab(), this?.modPage?.testInfo);
      pages.push(modPage);
      pages.push(userPage);
      await Promise.all([
        modPage.init(true, { meetingId, fullName: `Mod-${i}`, shouldCloseAudioModal: false }),
        userPage.init(false, { meetingId, fullName: `User-${i}`, shouldCloseAudioModal: false }),
      ]);
      await modPage.waitForSelector(e.audioModal, c.ELEMENT_WAIT_LONGER_TIME);
      await userPage.waitForSelector(e.audioModal, c.ELEMENT_WAIT_LONGER_TIME);
    }

    await Promise.all(pages.map((currentPage) => currentPage.page.close()));
  }

  async usersJoinExceedingParticipantsLimit() {
    for (let i = 1; i <= c.JOIN_TWO_USERS_EXCEEDING_MAX_PARTICIPANTS; i++) {
      console.log(`loop ${i} of ${c.JOIN_TWO_USERS_EXCEEDING_MAX_PARTICIPANTS}`);

      const pages = [];
      const meetingId = await createMeeting(`maxParticipants=${c.MAX_PARTICIPANTS_TO_JOIN}`);

      for (let j = 1; j <= c.MAX_PARTICIPANTS_TO_JOIN + 1; j++) {
        pages.push(new Page(this.browser, await this.getNewPageTab(), this?.modPage?.testInfo));
      }

      for (let j = 1; j < c.MAX_PARTICIPANTS_TO_JOIN; j++) {
        console.log(`- joining user ${j} of ${c.MAX_PARTICIPANTS_TO_JOIN}`);
        await pages[j - 1].init(true, { meetingId, fullName: `User-${j}`, shouldCloseAudioModal: false });
      }
      console.log('- joining two users at the same time');

      const lastPages = [pages[pages.length - 1], pages[pages.length - 2]];

      await Promise.all(
        lastPages.map((page, index) =>
          page.init(true, { meetingId, fullName: `User-last-${index}`, shouldCloseAudioModal: false }),
        ),
      );

      try {
        await lastPages[0].waitForSelector(e.audioModal);
        await lastPages[1].waitForSelector(e.errorScreenMessage);
      } catch {
        await lastPages[1].waitForSelector(e.audioModal);
        await lastPages[0].waitForSelector(e.errorScreenMessage);
      }

      await Promise.all(pages.map((currentPage) => currentPage.page.close()));
    }
  }
}

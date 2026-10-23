import { expect } from '@playwright/test';

import { Join } from '../breakout/join';
import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { DASHBOARD_UPDATE_TIME, rowFilter } from './util';

export class BreakoutLearningDashboard extends Join {
  // Each breakout room gets a dashboard of its own (new in 4.0), kept while the parent meeting runs.
  async breakoutRoomHasItsOwnDashboard() {
    await this.create();
    const breakoutUserPage = await this.joinRoom();
    await breakoutUserPage.hasElement(e.chatBox, 'should open the public chat of the breakout room');
    await breakoutUserPage.fill(e.chatBox, e.message);
    await breakoutUserPage.waitAndClick(e.sendButton);
    await breakoutUserPage.hasElementCount(e.chatUserMessageText, 1, 'should send a message in the breakout room');

    const breakoutModPage = new Page(
      this.browser,
      await this.joinFirstBreakoutRoomAsModerator(),
      this.modPage.testInfo,
    );
    const [dashboardTab] = await Promise.all([
      this.context.waitForEvent('page'),
      breakoutModPage.waitAndClick(e.learningDashboardSidebarButton),
    ]);
    await expect(dashboardTab, 'should open the dashboard of the breakout room').toHaveTitle(/Dashboard - Room 1$/);
    const dashboardPage = new Page(this.browser, dashboardTab, this.modPage.testInfo);
    const attendeeMessages = await rowFilter(dashboardPage, /Attendee/, e.messageLearningDashboard);
    await expect(attendeeMessages, 'should count the message the attendee sent in the breakout room').toHaveText(/1/, {
      timeout: DASHBOARD_UPDATE_TIME,
    });

    await this.modPage.waitAndClick(e.finishBreakoutButton);
    await breakoutModPage.hasElement(e.meetingEndedModal, 'should end the breakout room', ELEMENT_WAIT_LONGER_TIME);
    await dashboardPage.reloadPage();
    await expect(dashboardTab, 'should still show the dashboard of the ended breakout room').toHaveTitle(
      /Dashboard - Room 1$/,
      { timeout: ELEMENT_WAIT_EXTRA_LONG_TIME },
    );
    await expect(attendeeMessages, 'should keep the breakout room activity while the parent meeting runs').toHaveText(
      /1/,
      { timeout: ELEMENT_WAIT_EXTRA_LONG_TIME },
    );
  }
}

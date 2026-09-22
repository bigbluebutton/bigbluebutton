import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { MultiUsers } from './multiusers';
import { setGuestPolicyOption } from './util';

export class GuestPolicy extends MultiUsers {
  async messageToGuestLobby() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    await this.modPage.page.waitForTimeout(500);
    await this.initUserPage(this.context, { shouldCloseAudioModal: false, shouldCheckAllInitialSteps: false });
    await this.modPage.hasElement(e.waitingUsersBtn, 'should display the waiting users button');

    await this.modPage.waitAndClick(e.waitingUsersBtn);
    await this.modPage.fill(e.waitingUsersLobbyMessage, 'test');
    await this.modPage.waitAndClick(e.sendLobbyMessage);
    await this.modPage.hasText(e.lobbyMessage, /test/, 'should the lobby message contain the text "test"');
  }

  async allowEveryone() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    await this.modPage.page.waitForTimeout(500);
    await this.initUserPage(this.context, { shouldCloseAudioModal: false, shouldCheckAllInitialSteps: false });
    await this.userPage.hasText(
      e.guestMessage,
      /wait/,
      'should the guest message contain the text "wait" for the attendee',
    );
    await this.userPage.hasText(
      e.positionInWaitingQueue,
      /first/,
      'should the position in waiting queue contain the text "first" for the attendee',
    );
    await this.modPage.waitAndClick(e.waitingUsersBtn);
    await this.modPage.waitAndClick(e.allowEveryone);

    await this.userPage.hasText(
      e.guestMessage,
      /approved/,
      'should the guest message contain the text "approved" for the attendee',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.modPage.hasElement(
      e.viewerAvatar,
      'should display the viewer avatar for the moderator',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.userPage.hasElement(e.audioModal, 'should display the audio modal for the attendee');
  }

  async denyEveryone() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    await this.modPage.page.waitForTimeout(500);
    await this.initUserPage(this.context, { shouldCloseAudioModal: false, shouldCheckAllInitialSteps: false });
    await this.modPage.waitAndClick(e.waitingUsersBtn);
    await this.modPage.waitAndClick(e.denyEveryone);

    await this.userPage.hasText(
      e.guestMessage,
      /denied/,
      'should the guest message contain the text "denied" for the attendee',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  async rememberChoice() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    await this.modPage.page.waitForTimeout(500);
    await this.modPage.waitAndClick(e.waitingUsersBtn);

    await this.modPage.waitAndClick(e.rememberCheckboxId);
    await this.modPage.hasElementEnabled(e.rememberCheckboxId, 'should display the remember checkbox id as enabled');
    await this.modPage.waitAndClick(e.denyEveryone);

    await this.initUserPage(this.context, { shouldCloseAudioModal: false, shouldCheckAllInitialSteps: false });
    await this.userPage.hasElement(e.deniedMessageElement, 'should display the denied message for the attendee');
  }

  async messageToSpecificUser() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    await this.modPage.page.waitForTimeout(500);
    await this.initUserPage(this.context, { shouldCloseAudioModal: false, shouldCheckAllInitialSteps: false });
    await this.modPage.waitAndClick(e.waitingUsersBtn);

    await this.modPage.waitAndClick(e.privateMessageGuest);
    await this.modPage.fill(e.inputPrivateLobbyMessage, 'test');
    await this.modPage.waitAndClick(e.sendPrivateLobbyMessage);
    await this.userPage.hasText(
      e.guestMessage,
      /test/,
      'should the guest message contain the text "test" for the attendee',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  async acceptSpecificUser() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    await this.modPage.page.waitForTimeout(500);
    await this.initUserPage(this.context, { shouldCloseAudioModal: false, shouldCheckAllInitialSteps: false });
    await this.userPage.hasText(
      e.guestMessage,
      /wait/,
      'should the guest message contain the text "wait" for the attendee',
    );
    await this.userPage.hasText(
      e.positionInWaitingQueue,
      /first/,
      'should the position in waiting queue contain the text "first"',
    );
    await this.modPage.waitAndClick(e.waitingUsersBtn);
    await this.modPage.waitAndClick(e.acceptGuest);
    await this.userPage.hasText(
      e.guestMessage,
      /approved/,
      'should the guest message contain the text "approved" for the attendee',
      ELEMENT_WAIT_LONGER_TIME,
    );

    await this.modPage.waitForSelector(e.viewerAvatar, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.hasElement(e.audioModal, 'should display the audio modal for the attendee');
  }

  async denySpecificUser() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    await this.modPage.page.waitForTimeout(500);
    await this.initUserPage(this.context, { shouldCloseAudioModal: false, shouldCheckAllInitialSteps: false });
    await this.modPage.waitAndClick(e.waitingUsersBtn);

    await this.modPage.waitAndClick(e.denyGuest);
    await this.userPage.hasText(
      e.guestMessage,
      /denied/,
      'should the guest message contain the text "denied" for the attendee',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  async keepsWaitingListOrderedByArrival() {
    const guestNames = ['LobbyAlpha', 'LobbyBravo', 'LobbyCharlie'];
    const arrivalOrder = guestNames.map((name, index) => `[${index + 1}] ${name}`);
    const positionInQueue = [/first/, /2/, /3/];

    await setGuestPolicyOption(this.modPage, e.askModerator);
    await this.modPage.page.waitForTimeout(500);

    // join one guest at a time, confirming each one's own queue position before the next joins, so
    // the arrival order is established independently of whatever the moderator's panel shows
    for (const [index, fullName] of guestNames.entries()) {
      const guestPage = new Page(this.browser, await this.context.newPage(), this.modPage.testInfo);
      await guestPage.init(false, {
        fullName,
        meetingId: this.modPage.meetingId,
        shouldCloseAudioModal: false,
        shouldCheckAllInitialSteps: false,
      });
      await guestPage.hasText(
        e.positionInWaitingQueue,
        positionInQueue[index],
        `should report ${fullName} at position ${index + 1} of the waiting queue`,
      );
    }

    await this.modPage.waitAndClick(e.waitingUsersBtn);
    await expect(
      this.modPage.page.locator(e.waitingUserName),
      'should list the waiting users in order of arrival',
    ).toHaveText(arrivalOrder, { timeout: ELEMENT_WAIT_LONGER_TIME });

    // writing to a waiting user's row must not move them within the list
    await this.modPage.getLocatorByIndex(e.privateMessageGuest, 0).click();
    await this.modPage.getLocatorByIndex(e.inputPrivateLobbyMessage, 0).fill('orderprobe');
    await this.modPage.getLocatorByIndex(e.sendPrivateLobbyMessage, 0).click();

    // the echoed message and the row order arrive in the same subscription payload, so once the
    // moderator's own panel shows the message the post-update ordering is already rendered
    await expect(
      this.modPage.page.locator(e.privateLobbyMessage, { hasText: 'orderprobe' }),
      "should echo the private lobby message back in the moderator's panel",
    ).toHaveCount(1, { timeout: ELEMENT_WAIT_LONGER_TIME });

    await expect(
      this.modPage.page.locator(e.waitingUserName),
      'should keep the waiting users in order of arrival after one of their rows is updated',
    ).toHaveText(arrivalOrder, { timeout: ELEMENT_WAIT_LONGER_TIME });
  }

  async alwaysAccept() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    await setGuestPolicyOption(this.modPage, e.alwaysAccept);
    await this.modPage.page.waitForTimeout(500);
    await this.initUserPage(this.context, { shouldCloseAudioModal: false, shouldCheckAllInitialSteps: false });
    await this.userPage.hasElement(e.audioModal, 'should display the audio modal for the attendee');
  }

  async alwaysDeny() {
    await setGuestPolicyOption(this.modPage, e.alwaysDeny);
    await this.modPage.page.waitForTimeout(1500);
    await this.initUserPage(this.context, { shouldCloseAudioModal: false, shouldCheckAllInitialSteps: false });
    await this.userPage.hasElement(e.deniedMessageElement, 'should display the denied message for the attendee');
  }
}

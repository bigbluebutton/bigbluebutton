import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { MultiUsers } from './multiusers';
import { setGuestPolicyOption } from './util';

export class GuestPolicy extends MultiUsers {
  async initTwoWaitingQueues() {
    await this.initUserPage(this.context, {
      fullName: 'AuthenticatedViewer',
      shouldCloseAudioModal: false,
      shouldCheckAllInitialSteps: false,
    });
    await this.initUserPage2(this.context, {
      fullName: 'GuestViewer',
      joinParameter: 'guest=true',
      shouldCloseAudioModal: false,
      shouldCheckAllInitialSteps: false,
    });
    await this.userPage.hasText(
      e.guestMessage,
      /wait/,
      'should display the waiting message for the authenticated viewer',
    );
    await this.userPage2.hasText(e.guestMessage, /wait/, 'should display the waiting message for the guest viewer');
  }

  async distinguishWaitingQueues() {
    await this.initTwoWaitingQueues();

    const authenticatedQueue = this.modPage.page.locator(e.authenticatedWaitingUsers);
    const guestQueue = this.modPage.page.locator(e.guestWaitingUsers);
    await expect(authenticatedQueue, 'should display the authenticated waiting users queue').toBeVisible();
    await expect(guestQueue, 'should display the guest waiting users queue').toBeVisible();
    await expect(authenticatedQueue, 'should identify the authenticated queue').not.toHaveText(
      await guestQueue.innerText(),
    );
  }

  async denyEveryoneInWaitingQueues() {
    await this.initTwoWaitingQueues();
    await this.modPage.waitAndClick(e.denyEveryoneWaiting);

    await this.userPage.hasText(
      e.guestMessage,
      /denied/,
      'should deny the authenticated viewer',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.userPage2.hasText(e.guestMessage, /denied/, 'should deny the guest viewer', ELEMENT_WAIT_LONGER_TIME);
    await expect(this.modPage.page.locator(e.authenticatedWaitingUsers)).toHaveCount(0);
    await expect(this.modPage.page.locator(e.guestWaitingUsers)).toHaveCount(0);
  }

  async keepQueuesVisibleWhileSearching() {
    await this.initTwoWaitingQueues();
    await this.modPage.fill(e.waitingUsersSearch, 'AuthenticatedViewer');

    await expect(this.modPage.page.locator(e.authenticatedWaitingUsers)).toBeVisible();
    await expect(this.modPage.page.locator(e.guestWaitingUsers)).toBeVisible();
    await expect(this.modPage.page.locator(e.guestWaitingUsers)).toContainText('1');
  }

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

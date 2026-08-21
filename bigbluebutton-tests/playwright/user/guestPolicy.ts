import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { MultiUsers } from './multiusers';
import { openLockViewers, setGuestPolicyOption } from './util';

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
    await this.modPage.waitAndClick(e.usersListSidebarButton);
  }

  async distinguishWaitingQueues() {
    await this.initTwoWaitingQueues();

    const authenticatedQueue = this.modPage.page.locator(e.authenticatedWaitingUsers);
    const guestQueue = this.modPage.page.locator(e.guestWaitingUsers);
    await expect(authenticatedQueue, 'should display the authenticated waiting users queue').toBeVisible();
    await expect(guestQueue, 'should display the guest waiting users queue').toBeVisible();
    await authenticatedQueue.click();
    const allowAllAuthenticated = this.modPage.page.locator(e.allowAllAuthenticatedWaiting);
    const denyAllAuthenticated = this.modPage.page.locator(e.denyAllAuthenticatedWaiting);
    await expect(allowAllAuthenticated).toHaveText('Allow all authenticated (1)');
    await expect(denyAllAuthenticated).toHaveText('Deny all authenticated (1)');
    await expect(allowAllAuthenticated).toHaveCSS('color', 'rgb(0, 128, 129)');
    await expect(denyAllAuthenticated).toHaveCSS('color', 'rgb(223, 39, 33)');

    const actionButtonsBox = await allowAllAuthenticated.locator('..').boundingBox();
    const actionRowBox = await allowAllAuthenticated.locator('../..').boundingBox();
    expect(actionButtonsBox).not.toBeNull();
    expect(actionRowBox).not.toBeNull();
    const rightInset = actionRowBox!.x + actionRowBox!.width - actionButtonsBox!.x - actionButtonsBox!.width;
    expect(rightInset).toBeGreaterThanOrEqual(0);
    expect(rightInset).toBeLessThanOrEqual(8);
  }

  async denyEveryoneInWaitingQueues() {
    await this.initTwoWaitingQueues();
    await this.modPage.waitAndClick(e.denyEveryone);

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

  async allowEveryoneInWaitingQueues() {
    await this.initTwoWaitingQueues();
    await this.modPage.waitAndClick(e.allowEveryone);

    await this.userPage.hasText(
      e.guestMessage,
      /approved/,
      'should allow the authenticated viewer',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.userPage2.hasText(e.guestMessage, /approved/, 'should allow the guest viewer', ELEMENT_WAIT_LONGER_TIME);
    await expect(this.modPage.page.locator(e.authenticatedWaitingUsers)).toHaveCount(0);
    await expect(this.modPage.page.locator(e.guestWaitingUsers)).toHaveCount(0);
  }

  async keepQueuesVisibleWhileSearching() {
    await this.initTwoWaitingQueues();
    await this.modPage.waitAndClick(e.guestWaitingUsers);
    await expect(this.modPage.page.getByText('[1] GuestViewer', { exact: true })).toBeVisible();
    await this.modPage.fill(e.userListSearch, 'AuthenticatedViewer');

    await expect(this.modPage.page.getByText('[1] GuestViewer', { exact: true })).toHaveCount(0);
    await this.modPage.waitAndClick(e.authenticatedWaitingUsers);
    await expect(this.modPage.page.getByText('[1] AuthenticatedViewer', { exact: true })).toBeVisible();
    await expect(this.modPage.page.locator(e.authenticatedWaitingUsers)).toBeVisible();
    await expect(this.modPage.page.locator(e.guestWaitingUsers)).toBeVisible();
    await expect(this.modPage.page.locator(e.guestWaitingUsers)).toHaveText(/Waiting Guests\s*1$/);
    await this.modPage.waitAndClick(e.denyEveryone);
    await this.userPage.hasText(
      e.guestMessage,
      /denied/,
      'should deny the authenticated viewer excluded by the search',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.userPage2.hasText(
      e.guestMessage,
      /denied/,
      'should deny the guest viewer excluded by the search',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  async messageToGuestLobby() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    await this.modPage.page.waitForTimeout(500);
    await this.initUserPage(this.context, { shouldCloseAudioModal: false, shouldCheckAllInitialSteps: false });
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClick(e.guestPolicyTab);
    await this.modPage.page
      .getByText("Message to the guests' lobby", { exact: true })
      .locator('..')
      .getByRole('checkbox')
      .click();
    await this.modPage.fill(e.waitingUsersLobbyMessage, 'test');
    await this.modPage.waitAndClick(e.sendLobbyMessage);
    await this.userPage.hasText(
      e.guestMessage,
      /test/,
      'should the guest message contain the text "test"',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  async allowAllAuthenticated() {
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
    await this.modPage.waitAndClick(e.authenticatedWaitingUsers);
    await this.modPage.waitAndClick(e.allowAllAuthenticatedWaiting);

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
    await this.userPage.hasElement(
      e.audioModal,
      'should display the audio modal for the attendee',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  async denyAllAuthenticated() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    await this.modPage.page.waitForTimeout(500);
    await this.initUserPage(this.context, { shouldCloseAudioModal: false, shouldCheckAllInitialSteps: false });
    await this.modPage.waitAndClick(e.authenticatedWaitingUsers);
    await this.modPage.waitAndClick(e.denyAllAuthenticatedWaiting);

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
    await this.initUserPage(this.context, { shouldCloseAudioModal: false, shouldCheckAllInitialSteps: false });
    await this.modPage.waitAndClick(e.authenticatedWaitingUsers);

    await this.modPage.waitAndClick(e.rememberChoice);
    await this.modPage.hasElementEnabled(e.rememberChoice, 'should display the remember checkbox as enabled');
    await this.modPage.waitAndClick(e.denyAllAuthenticatedWaiting);

    await this.initUserPage2(this.context, { shouldCloseAudioModal: false, shouldCheckAllInitialSteps: false });
    await this.userPage2.hasElement(e.deniedMessageElement, 'should display the denied message for the attendee');
  }

  async messageToSpecificUser() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    await this.modPage.page.waitForTimeout(500);
    await this.initUserPage(this.context, { shouldCloseAudioModal: false, shouldCheckAllInitialSteps: false });
    await this.modPage.waitAndClick(e.authenticatedWaitingUsers);

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
    await this.modPage.waitAndClick(e.authenticatedWaitingUsers);
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
    await this.modPage.waitAndClick(e.authenticatedWaitingUsers);

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

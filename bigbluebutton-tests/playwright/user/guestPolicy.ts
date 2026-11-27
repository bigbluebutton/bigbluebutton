import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { MultiUsers } from './multiusers';
import { openLockViewers, setGuestPolicyOption, withSeparateGuestQueues } from './util';

export class GuestPolicy extends MultiUsers {
  // These tests assume the separate queues unless a test's own clientSettingsOverrides say otherwise.
  async initModPage(...[page, options = {}]: Parameters<MultiUsers['initModPage']>) {
    await super.initModPage(page, {
      ...options,
      clientSettingsOverrides: withSeparateGuestQueues(options.clientSettingsOverrides),
    });
  }

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

    // guests joining without `guest=true` are authenticated, and that queue renders collapsed, so
    // the rows only enter the DOM once this toggle is clicked
    await this.modPage.waitAndClick(e.authenticatedWaitingUsers);
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
      this.modPage.page.locator(e.privateLobbyMessageEcho, { hasText: 'orderprobe' }),
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

  async alwaysAcceptAdmitsWaitingUsers(): Promise<void> {
    await this.initTwoWaitingQueues();
    await this.modPage.hasElement(e.lockViewersButton, 'should finish opening the users panel');
    await setGuestPolicyOption(this.modPage, e.alwaysAccept);
    await expect(
      this.modPage.page.getByText('The guest policy is now: Always accept'),
      'should confirm that the guest policy changed to Always accept',
    ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await this.userPage.hasText(
      e.guestMessage,
      /approved/,
      'should approve the authenticated viewer who was already waiting',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.userPage2.hasText(
      e.guestMessage,
      /approved/,
      'should approve the guest viewer who was already waiting',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await expect(this.modPage.page.locator(e.authenticatedWaitingUsers)).toHaveCount(0);
    await expect(this.modPage.page.locator(e.guestWaitingUsers)).toHaveCount(0);
    await this.userPage.hasElement(
      e.audioModal,
      'should display the audio modal for the authenticated viewer',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.userPage2.hasElement(
      e.audioModal,
      'should display the audio modal for the guest viewer',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  async rememberChoiceAcceptAdmitsTheRest(): Promise<void> {
    await this.initTwoWaitingQueues();
    await this.modPage.waitAndClick(e.rememberChoice);
    await expect(
      this.modPage.page.locator(`${e.rememberChoice} input`),
      'should keep Remember choice checked before accepting one user',
    ).toBeChecked();
    await this.modPage.waitAndClick(e.authenticatedWaitingUsers);
    await this.modPage.waitAndClick(e.acceptGuest);
    await expect(
      this.modPage.page.getByText('The guest policy is now: Always accept'),
      'should confirm that Remember choice changed the policy to Always accept',
    ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await this.userPage.hasText(
      e.guestMessage,
      /approved/,
      'should approve the selected authenticated viewer',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.userPage2.hasText(
      e.guestMessage,
      /approved/,
      'should approve the other guest viewer after the policy change',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await expect(this.modPage.page.locator(e.guestWaitingUsers)).toHaveCount(0);
    await this.userPage2.hasElement(
      e.audioModal,
      'should display the audio modal for the other guest viewer',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  // Guard: Always deny applies only to later arrivals and leaves the existing queue actionable.
  async alwaysDenyKeepsWaitingUsers(): Promise<void> {
    await this.initTwoWaitingQueues();
    await this.modPage.hasElement(e.lockViewersButton, 'should finish opening the users panel');
    await setGuestPolicyOption(this.modPage, e.alwaysDeny);
    await expect(
      this.modPage.page.getByText('The guest policy is now: Always deny'),
      'should confirm that the guest policy changed to Always deny',
    ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });

    const lateViewer = new Page(this.browser, await this.context.newPage(), this.modPage.testInfo);
    await lateViewer.init(false, {
      fullName: 'LateViewer',
      meetingId: this.modPage.meetingId,
      shouldCloseAudioModal: false,
      shouldCheckAllInitialSteps: false,
    });
    await lateViewer.hasElement(
      e.deniedMessageElement,
      'should deny a viewer who arrives after the policy change',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.userPage.hasText(e.guestMessage, /wait/, 'should keep the authenticated viewer waiting');
    await this.userPage2.hasText(e.guestMessage, /wait/, 'should keep the guest viewer waiting');
    await expect(this.modPage.page.locator(e.authenticatedWaitingUsers)).toBeVisible();
    await expect(this.modPage.page.locator(e.guestWaitingUsers)).toBeVisible();

    await this.modPage.waitAndClick(e.authenticatedWaitingUsers);
    await this.modPage.waitAndClick(e.acceptGuest);
    await this.userPage.hasText(
      e.guestMessage,
      /approved/,
      'should still allow the moderator to accept the authenticated viewer',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await expect(this.modPage.page.locator(e.authenticatedWaitingUsers)).toHaveCount(0);
    await this.modPage.waitAndClick(e.guestWaitingUsers);
    await this.modPage.waitAndClick(e.denyGuest);
    await this.userPage2.hasText(
      e.guestMessage,
      /denied/,
      'should still allow the moderator to deny the guest viewer',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  // With combineGuestWaitingQueues, every waiting user is in one list, in order of arrival.
  async combinedWaitingList(): Promise<void> {
    // the guest first, so the order can only come from arrival, not from grouping by queue; one at a
    // time, each confirmed in the queue before the next joins
    await this.initUserPage(this.context, {
      fullName: 'GuestViewer',
      joinParameter: 'guest=true',
      shouldCloseAudioModal: false,
      shouldCheckAllInitialSteps: false,
    });
    await this.userPage.hasText(e.positionInWaitingQueue, /first/, 'should put the guest viewer first');
    await this.initUserPage2(this.context, {
      fullName: 'AuthenticatedViewer',
      shouldCloseAudioModal: false,
      shouldCheckAllInitialSteps: false,
    });
    await this.userPage2.hasText(e.positionInWaitingQueue, /2/, 'should put the authenticated viewer second');
    await this.modPage.waitAndClick(e.usersListSidebarButton);

    const waitingList = this.modPage.page.locator(e.waitingUsers);
    await expect(waitingList, 'should count every waiting user in one list').toHaveText(/Waiting Users\s*2$/);
    await expect(this.modPage.page.locator(e.authenticatedWaitingUsers)).toHaveCount(0);
    await expect(this.modPage.page.locator(e.guestWaitingUsers)).toHaveCount(0);
    await expect(this.modPage.page.locator(e.allowEveryone)).toHaveText('Allow everyone (2)');
    await waitingList.click();
    await expect(
      this.modPage.page.locator(e.waitingUserName),
      'should list the guest and the authenticated viewer in order of arrival',
    ).toHaveText(['[1] GuestViewer', '[2] AuthenticatedViewer']);
    await expect(this.modPage.page.locator(e.allowAllAuthenticatedWaiting)).toHaveCount(0);
    await expect(this.modPage.page.locator(e.denyAllGuestWaiting)).toHaveCount(0);

    await this.modPage.fill(e.userListSearch, 'AuthenticatedViewer');
    await expect(
      this.modPage.page.locator(e.waitingUserName),
      'should keep the authenticated viewer at its place in the queue',
    ).toHaveText(['[2] AuthenticatedViewer']);
    await expect(waitingList, 'should keep counting the user the search leaves out').toHaveText(/Waiting Users\s*2$/);
    await this.modPage.waitAndClick(e.denyEveryone);
    await this.userPage.hasText(
      e.guestMessage,
      /denied/,
      'should deny the guest viewer the search leaves out',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.userPage2.hasText(
      e.guestMessage,
      /denied/,
      'should deny the authenticated viewer',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await expect(waitingList).toHaveCount(0);
  }

  // Allow everyone shows for a single waiting user too, since the list has no allow all of its own.
  async combinedWaitingListAllowsOne(): Promise<void> {
    await this.initUserPage(this.context, { shouldCloseAudioModal: false, shouldCheckAllInitialSteps: false });
    await this.userPage.hasText(e.guestMessage, /wait/, 'should display the waiting message for the attendee');
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.modPage.waitAndClick(e.waitingUsers);
    await expect(this.modPage.page.locator(e.allowAllAuthenticatedWaiting)).toHaveCount(0);
    await expect(this.modPage.page.locator(e.allowEveryone)).toHaveText('Allow everyone (1)');
    await this.modPage.waitAndClick(e.allowEveryone);
    await this.userPage.hasText(e.guestMessage, /approved/, 'should approve the attendee', ELEMENT_WAIT_LONGER_TIME);
    await expect(this.modPage.page.locator(e.waitingUsers)).toHaveCount(0);
  }
}

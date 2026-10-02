import { expect, Locator } from '@playwright/test';

import { ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';

// Glyph of the microphone badge the user list draws on an avatar. The badge is a CSS
// pseudo-element, so another user's mute state has no attribute or text to select on.
const USER_LIST_MIC_BADGE = { unmuted: '\ue931', muted: '\ue932' };

export async function openLockViewers(testPage: Page) {
  await testPage.waitAndClick(e.manageUsers);
  await testPage.waitAndClick(e.lockViewersButton);
}

// Turn on the "Hide user list" lock and dismiss the resulting toast.
export async function applyUserListLock(testPage: Page) {
  await openLockViewers(testPage);
  await testPage.waitAndClickElement(e.lockUserList);
  await testPage.waitAndClick(e.applyLockSettings);
  await testPage.closeAllToastNotifications();
}

// The talking indicator of one user, while that user is talking.
export function isTalkingLocator(testPage: Page, userName: string): Locator {
  return testPage.page.locator(e.isTalking).locator(`:text-is("${userName}")`);
}

// The talking indicator of one user in either state: talking, or shown a moment after.
export function talkingIndicatorLocator(testPage: Page, userName: string): Locator {
  return testPage.page.locator(`${e.isTalking}, ${e.wasTalking}`).filter({ hasText: userName });
}

export async function hasUserListMicState(
  testPage: Page,
  userName: string,
  state: keyof typeof USER_LIST_MIC_BADGE,
  description: string,
  timeout: number = ELEMENT_WAIT_TIME,
) {
  const avatar = testPage.page.locator(e.userListItem, { hasText: userName }).locator(e.userAvatar);
  await expect
    .poll(() => avatar.evaluate((el) => window.getComputedStyle(el, '::after').content), {
      message: description,
      timeout,
    })
    .toContain(USER_LIST_MIC_BADGE[state]);
}

export async function setGuestPolicyOption(testPage: Page, option: string) {
  await testPage.waitAndClick(e.manageUsers);
  await testPage.waitAndClick(e.guestPolicyLabel);
  await testPage.waitAndClick(option);
}

export async function checkAvatarIcon(testPage: Page, checkModIcon = true) {
  await testPage.hasElement(
    `${e.currentUser} ${checkModIcon ? e.moderatorAvatar : e.viewerAvatar}`,
    'should display correct avatar',
  );
}

export async function checkIsPresenter(testPage: Page) {
  return testPage.page.evaluate(
    ([currentAvatarSelector, userAvatarSelector]) =>
      document
        .querySelectorAll(`${currentAvatarSelector} ${userAvatarSelector}`)[0]
        .hasAttribute('data-test-presenter'),
    [e.currentUser, e.userAvatar],
  );
}

export async function checkMutedUser(testPage: Page) {
  await testPage.wasRemoved(e.muteMicButton, 'should not display mute mic button when user is muted');
  await testPage.hasElement(e.unmuteMicButton, 'should display unmute mic button when user is muted');
}

export async function drawArrow(testPage: Page) {
  const modWbLocator = testPage.page.locator(e.whiteboard);
  const wbBox = await modWbLocator.boundingBox();

  await testPage.waitAndClick(e.wbArrowShape);
  if (!wbBox) throw new Error('whiteboard boundingBox is null');
  await testPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
  await testPage.page.mouse.down();
  await testPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
  await testPage.page.mouse.up();
}

export async function timeInSeconds(locator: Locator) {
  const text = await locator.innerText();
  const [minutes, seconds] = text.split(':').map(Number);
  const totalSeconds = minutes * 60 + seconds;
  return totalSeconds;
}

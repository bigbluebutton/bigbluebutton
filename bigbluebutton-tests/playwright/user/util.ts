import { Locator } from '@playwright/test';

import { ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';

// Locator for audio-only tiles (camera-less users that hold the audio floor): a webcam
// grid item rendering the connecting/avatar placeholder instead of a <video> element.
export function audioOnlyTilesLocator(testPage: Page): Locator {
  return testPage.page
    .locator(`${e.webcamItem}, ${e.webcamItemTalkingUser}`)
    .filter({ has: testPage.page.locator(e.webcamConnecting) });
}

export async function openLockViewers(testPage: Page) {
  const isLockViewersButtonVisible = await testPage.page.locator(e.lockViewersButton).isVisible({ timeout: ELEMENT_WAIT_TIME }).catch(() => false);
  if (!isLockViewersButtonVisible) {
    await testPage.waitAndClick(e.usersListSidebarButton);
  }
  await testPage.waitAndClick(e.lockViewersButton);
}

export async function setGuestPolicyOption(testPage: Page, option: string) {
  await openLockViewers(testPage);
  await testPage.waitAndClick(e.guestPolicyTab);
  await testPage.waitAndClick(e.guestPolicySelector);
  await testPage.waitAndClick(option);
  await testPage.waitAndClick(e.applyLockSettings);
}

export async function setPresentationPermission(testPage: Page, option: string) {
  await openLockViewers(testPage);
  await testPage.waitAndClick(e.presentationPermissionsTab);
  await testPage.waitAndClick(e.presentationPolicySelector);
  await testPage.waitAndClick(option);
  await testPage.waitAndClick(e.applyLockSettings);
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

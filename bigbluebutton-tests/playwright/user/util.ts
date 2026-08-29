import { Locator } from '@playwright/test';

import { elements as e } from '../core/elements';
import { Page } from '../core/page';

export async function openLockViewers(testPage: Page) {
  await testPage.waitAndClick(e.manageUsers);
  await testPage.waitAndClick(e.lockViewersButton);
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

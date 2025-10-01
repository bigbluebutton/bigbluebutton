import { elements as e } from '../core/elements.ts';

export async function openLockViewers(testPage) {
  await testPage.waitAndClick(e.manageUsers);
  await testPage.waitAndClick(e.lockViewersButton);
}

export async function setGuestPolicyOption(testPage, option) {
  await testPage.waitAndClick(e.manageUsers);
  await testPage.waitAndClick(e.guestPolicyLabel);
  await testPage.waitAndClick(option);
}

export async function checkAvatarIcon(testPage, checkModIcon = true) {
  await testPage.hasElement(`${e.currentUser} ${checkModIcon ? e.moderatorAvatar : e.viewerAvatar}`);
}

export async function checkIsPresenter(testPage) {
  return testPage.page.evaluate(([currentAvatarSelector, userAvatarSelector]) => {
    return document.querySelectorAll(`${currentAvatarSelector} ${userAvatarSelector}`)[0].hasAttribute('data-test-presenter')
  }, [e.currentUser, e.userAvatar])
}

export async function checkMutedUser(testPage) {
  await testPage.wasRemoved(e.muteMicButton, 'should not display mute mic button when user is muted');
  await testPage.hasElement(e.unmuteMicButton, 'should display unmute mic button when user is muted');
}

export async function drawArrow(testPage) {
  const modWbLocator = testPage.page.locator(e.whiteboard);
  const wbBox = await modWbLocator.boundingBox();
    
  await testPage.waitAndClick(e.wbArrowShape);
  await testPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
  await testPage.page.mouse.down();
  await testPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
  await testPage.page.mouse.up();
}

export async function timeInSeconds(locator) {
  const text = await locator.innerText();
  const [minutes, seconds] = text.split(':').map(Number);
  const timeInSeconds = minutes * 60 + seconds;
  return timeInSeconds;
}

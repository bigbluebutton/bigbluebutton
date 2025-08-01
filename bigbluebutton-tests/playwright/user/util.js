const e = require('../core/elements');

async function openLockViewers(test) {
  await test.waitAndClick(e.usersListSidebarButton);
  await test.waitAndClick(e.lockViewersButton);
}

async function setGuestPolicyOption(test, option) {
  await test.waitAndClick(e.manageUsers);
  await test.waitAndClick(e.guestPolicyLabel);
  await test.waitAndClick(option);
}

async function checkAvatarIcon(test, checkModIcon = true) {
  await test.hasElement(`${e.currentUser} ${checkModIcon ? e.moderatorAvatar : e.viewerAvatar}`);
}

async function checkIsPresenter(test) {
  return test.page.evaluate(([currentAvatarSelector, userAvatarSelector]) => {
    return document.querySelectorAll(`${currentAvatarSelector} ${userAvatarSelector}`)[0].hasAttribute('data-test-presenter')
  }, [e.currentUser, e.userAvatar])
}

async function checkMutedUser(test) {
  await test.wasRemoved(e.muteMicButton, 'should not display mute mic button when user is muted');
  await test.hasElement(e.unmuteMicButton, 'should display unmute mic button when user is muted');
}

async function drawArrow(test) {
  const modWbLocator = test.getLocator(e.whiteboard);
  const wbBox = await modWbLocator.boundingBox();
    
  await test.waitAndClick(e.wbArrowShape);
  await test.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
  await test.page.mouse.down();
  await test.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
  await test.page.mouse.up();
}

async function timeInSeconds(locator) {
  const text = await locator.innerText();
  const [minutes, seconds] = text.split(':').map(Number);
  const timeInSeconds = minutes * 60 + seconds;
  return timeInSeconds;
}

exports.openLockViewers = openLockViewers;
exports.setGuestPolicyOption = setGuestPolicyOption;
exports.checkAvatarIcon = checkAvatarIcon;
exports.checkIsPresenter = checkIsPresenter;
exports.checkMutedUser = checkMutedUser;
exports.drawArrow = drawArrow;
exports.timeInSeconds = timeInSeconds;

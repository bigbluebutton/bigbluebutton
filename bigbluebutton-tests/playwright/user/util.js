const e = require('../core/elements');

async function setStatus(page, status) {
  await page.waitAndClick(e.currentUser);
  await page.waitAndClick(e.setStatus);
  await page.waitAndClick(status);
}

async function openLockViewers(test) {
  await test.waitAndClick(e.manageUsers);
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

async function checkMutedUsers(test) {
  await test.wasRemoved(e.muteMicButton);
  await test.hasElement(e.unmuteMicButton);
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

exports.setStatus = setStatus;
exports.openLockViewers = openLockViewers;
exports.setGuestPolicyOption = setGuestPolicyOption;
exports.checkAvatarIcon = checkAvatarIcon;
exports.checkIsPresenter = checkIsPresenter;
exports.checkMutedUsers = checkMutedUsers;
exports.drawArrow = drawArrow;

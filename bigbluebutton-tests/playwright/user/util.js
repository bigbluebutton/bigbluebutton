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

exports.setStatus = setStatus;
exports.openLockViewers = openLockViewers;
exports.setGuestPolicyOption = setGuestPolicyOption;
exports.checkAvatarIcon = checkAvatarIcon;
exports.checkIsPresenter = checkIsPresenter;

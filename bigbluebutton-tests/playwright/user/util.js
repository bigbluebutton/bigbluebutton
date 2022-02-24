const e = require('../core/elements');
const { checkIncludeClass } = require('../core/util');

async function setStatus(page, status) {
  await page.waitAndClick(e.firstUser);
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
  await test.hasElement(`${e.firstUser} ${checkModIcon ? e.moderatorAvatar : e.viewerAvatar}`);
}

async function checkPresenterClass(test) {
  return test.page.evaluate(checkIncludeClass, [e.userAvatar, e.presenterClassName]);
}

exports.setStatus = setStatus;
exports.openLockViewers = openLockViewers;
exports.setGuestPolicyOption = setGuestPolicyOption;
exports.checkAvatarIcon = checkAvatarIcon;
exports.checkPresenterClass = checkPresenterClass;

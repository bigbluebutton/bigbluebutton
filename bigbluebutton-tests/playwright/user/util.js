const e = require('../core/elements');

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

exports.setStatus = setStatus;
exports.openLockViewers = openLockViewers;
exports.setGuestPolicyOption = setGuestPolicyOption;

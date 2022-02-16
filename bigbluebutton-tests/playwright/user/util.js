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

exports.setStatus = setStatus;
exports.openLockViewers = openLockViewers;

const e = require('../core/elements');

async function setStatus(page, status) {
  await page.waitAndClick(e.firstUser);
  await page.waitAndClick(e.setStatus);
  await page.waitAndClick(status);
}

exports.setStatus = setStatus;

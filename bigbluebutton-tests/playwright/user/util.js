const e = require('../core/elements');

async function setStatus(page, status) {
  await page.waitForSelector(e.firstUser);
  await page.click(e.firstUser);
  await page.waitForSelector(e.setStatus);
  await page.click(e.setStatus);
  await page.waitForSelector(status);
  await page.click(status);
}

exports.setStatus = setStatus;

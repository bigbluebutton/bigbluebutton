const e = require('../core/elements');

async function openSettings(page) {
  await page.waitForSelector(e.options);
  await page.click(e.options);
  await page.waitForSelector(e.settings);
  await page.click(e.settings);
}

exports.openSettings = openSettings;

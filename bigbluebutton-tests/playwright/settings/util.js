const e = require('../core/elements');

async function openSettings(page) {
  await page.waitForSelector(e.optionsButton);
  await page.click(e.optionsButton);
  await page.waitForSelector(e.settings);
  await page.click(e.settings);
}

exports.openSettings = openSettings;

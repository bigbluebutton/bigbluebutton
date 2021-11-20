const elements = require('../elements');

async function openSettings(page) {
  await page.waitForSelector(elements.options);
  await page.click(elements.options);
  await page.waitForSelector(elements.settings);
  await page.click(elements.settings);
}

exports.openSettings = openSettings;

const e = require('../core/elements');

async function openSettings(test) {
  await test.waitAndClick(e.optionsButton);
  await test.waitAndClick(e.settings);
}

exports.openSettings = openSettings;

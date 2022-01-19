const e = require('../core/elements');

async function openSettings(test) {
  await test.waitAndClick(e.options);
  await test.waitAndClick(e.settings);
}

exports.openSettings = openSettings;

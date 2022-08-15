const e = require('../../../core/elements');

async function openAboutModal(test) {
  await test.waitAndClick(e.optionsButton);
  await test.waitAndClick(e.showAboutModalButton);
}

exports.openAboutModal = openAboutModal;

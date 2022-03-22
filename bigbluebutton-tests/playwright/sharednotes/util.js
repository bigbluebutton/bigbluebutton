const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const e = require('../core/elements');

async function startSharedNotes(test) {
  await test.waitAndClick(e.sharedNotes);
  await test.waitForSelector(e.hideNotesLabel, ELEMENT_WAIT_LONGER_TIME);
  await test.hasElement(e.etherpadFrame);
}

function getNotesLocator(test) {
  return test.page.frameLocator(e.etherpadFrame)
    .frameLocator(e.etherpadOuter)
    .frameLocator(e.etherpadInner)
    .locator(e.etherpadEditable);
}

exports.startSharedNotes = startSharedNotes;
exports.getNotesLocator = getNotesLocator;

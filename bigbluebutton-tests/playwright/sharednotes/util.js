const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const e = require('../core/elements');

async function startSharedNotes(test) {
  await test.waitAndClick(e.sharedNotes);
  await test.waitForSelector(e.hideNoteLabel, ELEMENT_WAIT_LONGER_TIME);
  await test.hasElement(e.etherpad);
}

exports.startSharedNotes = startSharedNotes;

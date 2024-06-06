const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const e = require('../core/elements');
const { getElementLength } = require('../core/util');

async function startSharedNotes(test) {
  try {
    await test.waitAndClick(e.sharedNotes);
    await test.waitForSelector(e.hideNoteLabel, ELEMENT_WAIT_LONGER_TIME);
    const resp = await test.page.evaluate(getElementLength, e.etherpad) >= 1;
    await test.waitForSelector(e.etherpad);
    return resp === true;
  } catch (err) {
    await test.logger(err);
    return false;
  }
}

exports.startSharedNotes = startSharedNotes;

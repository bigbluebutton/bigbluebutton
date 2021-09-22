const { ELEMENT_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const e = require('../core/elements');
const { getElementLength } = require('../core/util');

async function startSharedNotes(test) {
  try {
    await test.waitForSelector(e.sharedNotes, ELEMENT_WAIT_TIME);
    await test.click(e.sharedNotes, true);
    await test.waitForSelector(e.hideNoteLabel, ELEMENT_WAIT_LONGER_TIME);
    const resp = await test.page.evaluate(getElementLength, e.etherpad) >= 1;
    await test.waitForSelector(e.etherpad, ELEMENT_WAIT_TIME);
    return resp === true;
  } catch (err) {
    await test.logger(err);
    return false;
  }
}

exports.startSharedNotes = startSharedNotes;

const { ELEMENT_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const se = require('./elements');
const { getElementLength } = require('../core/util');

async function startSharedNotes(test) {
  try {
    await test.waitForSelector(se.sharedNotes, ELEMENT_WAIT_TIME);
    await test.click(se.sharedNotes, true);
    await test.waitForSelector(se.hideNoteLabel, ELEMENT_WAIT_LONGER_TIME);
    const resp = await test.page.evaluate(getElementLength, se.etherpad) >= 1;
    await test.waitForSelector(se.etherpad, ELEMENT_WAIT_TIME);
    return resp === true;
  } catch (e) {
    await test.logger(e);
    return false;
  }
}

exports.startSharedNotes = startSharedNotes;

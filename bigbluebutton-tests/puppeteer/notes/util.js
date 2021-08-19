const { ELEMENT_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const se = require('./elements');

async function startSharedNotes(test) {
  try {
    await test.waitForSelector(se.sharedNotes, ELEMENT_WAIT_TIME);
    await test.click(se.sharedNotes, true);
    await test.waitForSelector(se.hideNoteLabel, ELEMENT_WAIT_LONGER_TIME);
    const resp = await test.page.evaluate(getTestElement, se.etherpad);
    await test.waitForSelector(se.etherpad, ELEMENT_WAIT_TIME);
    return resp === true;
  } catch (e) {
    await test.logger(e);
    return false;
  }
}

async function getTestElement(element) {
  return document.querySelectorAll(element).length >= 1;
}

exports.getTestElement = getTestElement;
exports.startSharedNotes = startSharedNotes;

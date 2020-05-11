const se = require('./elements');

async function startSharedNotes(test) {
  await test.waitForSelector(se.sharedNotes);
  await test.click(se.sharedNotes, true);
  await test.waitForSelector(se.hideNoteLabel);
  const resp = await test.page.evaluate(getTestElement, se.etherpad);
  await test.waitForSelector(se.etherpad);
  return resp;
}

async function getTestElement(element) {
  const response = document.querySelectorAll(element).length >= 1;
  return response;
}

exports.getTestElement = getTestElement;
exports.startSharedNotes = startSharedNotes;

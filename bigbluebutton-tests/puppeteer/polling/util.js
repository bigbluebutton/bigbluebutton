const e = require('../core/elements');

async function openPoll(test) {
  await test.waitAndClick(e.actions);
  await test.waitAndClick(e.polling);
  await test.waitForSelector(e.hidePollDesc);
  await test.waitAndClick(e.pollLetterAlteratives);
  await test.waitForSelector(e.pollOptionItem);
}

async function startPoll(test, shouldPublishPoll = false, isAnonymous = false) {
  await openPoll(test);
  if (isAnonymous) test.waitAndClickElement(e.anonymousPoll);
  await test.waitAndClick(e.startPoll);
  if (shouldPublishPoll) await test.waitAndClick(e.publishPollingLabel);
}

exports.openPoll = openPoll;
exports.startPoll = startPoll;
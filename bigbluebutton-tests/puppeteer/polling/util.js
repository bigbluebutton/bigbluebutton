const e = require('../core/elements');

async function startPoll(test, shouldPublishPoll = false, isAnonymous = false) {
  await test.waitAndClick(e.actions);
  await test.waitAndClick(e.polling);
  await test.waitForSelector(e.hidePollDesc);
  await test.waitAndClick(e.pollYesNoAbstentionBtn);
  if (isAnonymous) test.waitAndClickElement(e.anonymousPoll);
  await test.waitAndClick(e.startPoll);
  if (shouldPublishPoll) await test.waitAndClick(e.publishPollingLabel);
}

exports.startPoll = startPoll;
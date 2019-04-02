const e = require('./elements');

async function getTestElements(test) {
  const status = await test.page.evaluate(statusIcon => document.querySelector(statusIcon).innerHTML, e.statusIcon);
  return status;
}

async function setStatus(test, status) {
  await test.click(e.firstUser);
  await test.click(e.setStatus, true);
  await test.click(status, true);
}

exports.setStatus = setStatus;
exports.getTestElements = getTestElements;

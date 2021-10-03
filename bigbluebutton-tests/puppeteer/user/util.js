const e = require('../core/elements');

async function setStatus(test, status) {
  await test.waitAndClick(e.firstUser);
  await test.waitAndClick(e.setStatus);
  await test.waitAndClick(status);
}

async function connectionStatus(test) {
  await test.waitAndClick(e.connectionStatusBtn);
  await test.waitForSelector(e.connectionStatusModal);
}

exports.setStatus = setStatus;
exports.connectionStatus = connectionStatus;

const e = require('./elements');

async function setStatus(test, status) {
  await test.click(e.firstUser);
  await test.click(e.setStatus, true);
  await test.click(status, true);
}

exports.setStatus = setStatus;

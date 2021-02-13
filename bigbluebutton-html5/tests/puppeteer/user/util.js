const { ELEMENT_WAIT_TIME } = require('../core/constants');
const e = require('./elements');

async function setStatus(test, status) {
  await test.waitForSelector(e.firstUser, ELEMENT_WAIT_TIME);
  await test.click(e.firstUser, true);
  await test.waitForSelector(e.setStatus, ELEMENT_WAIT_TIME);
  await test.click(e.setStatus, true);
  await test.waitForSelector(status, ELEMENT_WAIT_TIME);
  await test.click(status, true);
}


async function countTestElements(element) {
  return document.querySelectorAll(element).length !== 0;
}

exports.countTestElements = countTestElements;
exports.setStatus = setStatus;

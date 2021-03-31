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

async function connectionStatus(test) {
  await test.click('button[data-test="connectionStatusButton"]', true);
  await test.waitForSelector('div[aria-label="Connection status modal"]', ELEMENT_WAIT_TIME);
}

exports.countTestElements = countTestElements;
exports.setStatus = setStatus;
exports.connectionStatus = connectionStatus;

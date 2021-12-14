const e = require('../core/elements');

async function setStatus(page, status) {
  await page.waitAndClick(e.firstUser);
  await page.waitAndClick(e.setStatus);
  await page.waitAndClick(status);
}

async function connectionStatus(test) {
  await test.waitAndClick(e.connectionStatusBtn);
  await test.waitForSelector(e.connectionStatusModal);
}

function checkNetworkStatus({ dataContainer, networdData }) {
  const values = Array.from(document.querySelectorAll(`${dataContainer} > ${networdData}`));
  values.splice(4, values.length - 4);
  const check = values.filter(elem => elem.textContent.includes(' 0 k'))[0];

  if (!check) return true;
}

exports.setStatus = setStatus;
exports.connectionStatus = connectionStatus;
exports.checkNetworkStatus = checkNetworkStatus;

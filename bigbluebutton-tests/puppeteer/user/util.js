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

function checkNetworkStatus(dataContainer, networdData) {
  const values = Array.from(document.querySelectorAll(`${dataContainer} > ${networdData}`));
  values.splice(4, values.length - 4);
  const check = values.filter(e => e.textContent.includes(' 0 k'))[0];

  if (!check) return true;
}


exports.setStatus = setStatus;
exports.connectionStatus = connectionStatus;
exports.checkNetworkStatus = checkNetworkStatus;

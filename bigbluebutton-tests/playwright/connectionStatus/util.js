const e = require('../core/elements');

async function openConnectionStatus(test) {
  await test.waitAndClick(e.connectionStatusBtn);
  await test.waitForSelector(e.connectionStatusModal);
}

function checkNetworkStatus(dataContainer) {
  const values = Array.from(document.querySelectorAll(`${dataContainer} > div`));
  values.splice(4, values.length - 4);
  const check = values.filter(elem => elem.textContent.includes(' 0 k'))[0];

  if (!check) return true;
}

exports.openConnectionStatus = openConnectionStatus;
exports.checkNetworkStatus = checkNetworkStatus;

const fs = require('fs');
const path = require('path');

function initializeLogsFolder() {
  const logsDir = path.join(__dirname, 'logs');
  if (fs.existsSync(logsDir)) {
    fs.rmSync(logsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(logsDir, { recursive: true });
}


async function globalSetup() {
  initializeLogsFolder();
}

module.exports = globalSetup;

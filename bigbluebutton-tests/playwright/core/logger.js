const fs = require("fs");
const path = require("path");

class Logger {
  constructor(pageInstance) {
    this.pageInstance = pageInstance;
    this.page = pageInstance.page;
    this.logsDir = path.join(__dirname, "../logs");
    this.logFiles = new Map();
    this.testInfo = null;
    this.page?.once("close", () => {
      try { this.#closeAll(); } catch (_) {}
    });
  }

  static #getTimestamp() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");
    const ms = String(now.getMilliseconds()).padStart(4, "0");
    return `[${h}:${m}:${s}:${ms}]`;
  }

  setTestInfo(testInfo) {
    this.testInfo = testInfo;
  }

  generateTestPath() {
    if (!this?.testInfo?.outputDir) return "unknown-test";
    return path.basename(this.testInfo.outputDir).toLowerCase();
  }

  getLogFile() {
    const testPath = this.generateTestPath();
    const logKey = `${testPath}:${this.pageInstance.username}`;
    const username = this.pageInstance?.username || "unknown";
    const sanitizedUsername = username.replace(/[^a-zA-Z0-9-_]/g, "_");

    if (!this.logFiles.has(logKey)) {
      const testDir = path.join(this.logsDir, testPath);
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }

      const logFilePath = path.join(testDir, `${sanitizedUsername}.log`);
      const stream = fs.createWriteStream(logFilePath, { flags: "a" });
      this.logFiles.set(logKey, stream);
    }

    return this.logFiles.get(logKey);
  }

  pageLog(message) {
    const logFile = this.getLogFile();
    logFile.write(`${message}\n`);
  }

  pageError(errorInfo) {
    const logFile = this.getLogFile();
    const timestamp = Logger.#getTimestamp();
    logFile.write(`${timestamp} ERROR: ${errorInfo.text}\n`);

    if (errorInfo.stack) {
      const stackLines = errorInfo.stack.split('\n');
      stackLines.forEach((line, index) => {
        if (index === 0) return;
        logFile.write(`  ${line}\n`);
      });
    }
  }

  #closeAll() {
    for (const s of this.logFiles.values()) {
      try { s.end(); } catch (_) {}
    }
    this.logFiles.clear();
  }
}

module.exports = Logger;

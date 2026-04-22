import type { TestInfo } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

import { Page } from './page';

interface ErrorInfo {
  type: 'error' | 'pageerror';
  timestamp: string;
  text: string;
  stack?: string;
  user: string;
}

export default class Logger {
  private pageInstance: Page;

  private logsDir: string;

  private logFiles: Map<string, fs.WriteStream>;

  private testInfo: TestInfo | null;

  constructor(pageInstance: Page) {
    this.pageInstance = pageInstance;
    this.logsDir = path.join(__dirname, '../logs');
    this.logFiles = new Map();
    this.testInfo = null;
    // Only attach the 'close' event listener if the page is a PlaywrightPage (not Frame)
    this.pageInstance.page.once('close', () => {
      try {
        this.closeAll();
      } catch {
        // ignore
      }
    });
  }

  static getTimestamp(): string {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(4, '0');
    return `[${h}:${m}:${s}:${ms}]`;
  }

  setTestInfo(testInfo: TestInfo): void {
    this.testInfo = testInfo;
  }

  generateTestPath(): string {
    if (!this?.testInfo?.outputDir) return 'unknown-test';
    return path.basename(this.testInfo.outputDir).toLowerCase();
  }

  getLogFile(): fs.WriteStream {
    const testPath = this.generateTestPath();
    const logKey = `${testPath}:${this.pageInstance.username}`;
    const username = this.pageInstance?.username || 'unknown';
    const sanitizedUsername = username.replace(/[^a-zA-Z0-9-_]/g, '_');

    if (!this.logFiles.has(logKey)) {
      const testDir = path.join(this.logsDir, testPath);
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }

      const logFilePath = path.join(testDir, `${sanitizedUsername}.log`);
      const stream = fs.createWriteStream(logFilePath, { flags: 'a' });
      this.logFiles.set(logKey, stream);
    }

    return this.logFiles.get(logKey)!;
  }

  pageLog(message: string): void {
    const logFile = this.getLogFile();
    logFile.write(`${message}\n`);
  }

  pageError(errorInfo: ErrorInfo): void {
    const logFile = this.getLogFile();
    const timestamp = Logger.getTimestamp();
    logFile.write(`${timestamp} ERROR: ${errorInfo.text}\n`);

    if (errorInfo.stack) {
      const stackLines = errorInfo.stack.split('\n');
      stackLines.forEach((line, index) => {
        if (index === 0) return;
        logFile.write(`  ${line}\n`);
      });
    }
  }

  private closeAll(): void {
    for (const s of this.logFiles.values()) {
      try {
        s.end();
      } catch {
        // ignore
      }
    }
    this.logFiles.clear();
  }
}

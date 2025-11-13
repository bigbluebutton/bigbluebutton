/* eslint-disable class-methods-use-this */
import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

export default class CustomReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult): void {
    const { retries } = test;
    const { status, error, retry } = result;
    const titlePath = test.titlePath();
    let logTitle: string;
    if (titlePath.length >= 2) {
      titlePath.shift();
      logTitle = `[${titlePath.shift()}] › ${titlePath.join(' › ')}`;
    } else {
      logTitle = `[${titlePath.join(' › ')}]`;
    }

    logTitle = logTitle.replace('@ci', '').trim();

    if (status === 'failed') {
      const baseMessage = `${logTitle}\n${error?.stack || error?.message || 'Unknown error'}`;

      if (retries !== retry) {
        const warningMessage =
          `Flaky (attempt #${retry + 1}) ` +
          `────────────────────────────────────────────────────────────\n${baseMessage}\n`;
        console.log(`::warning title=${logTitle}::  ${warningMessage}`.replace(/\n/g, '%0A  '));
        return;
      }

      console.log(`::error title=${logTitle}::  ${baseMessage}`.replace(/\n/g, '%0A  '));
    }
  }
}

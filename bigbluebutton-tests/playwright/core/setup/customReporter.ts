import { FullConfig, Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { appendFileSync } from 'fs';
import { relative } from 'path';

const ANSI_ESCAPE = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');

function tableCell(text: string): string {
  return text.replace(ANSI_ESCAPE, '').replace(/\s+/g, ' ').replace(/\|/g, '\\|').trim();
}

export default class CustomReporter implements Reporter {
  private config?: FullConfig;

  private readonly passedOnRetry: { title: string; firstFailure: string }[] = [];

  onBegin(config: FullConfig): void {
    this.config = config;
  }

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

    if (status === 'failed' || status === 'timedOut') {
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

    if (test.outcome() === 'flaky') {
      const [, project, , ...titles] = test.titlePath();
      const file = relative(this.config?.rootDir || process.cwd(), test.location.file);
      const failed = test.results.find((attempt) => attempt.status !== 'passed' && attempt.status !== 'skipped');
      const message = failed?.error?.message || failed?.status || '';
      this.passedOnRetry.push({
        title: `[${project}] › ${file}:${test.location.line} › ${titles.join(' › ')}`,
        firstFailure: (message.split('\n').find((line) => line.trim()) || '').slice(0, 200),
      });
    }
  }

  onEnd(): void {
    const summaryFile = process.env.GITHUB_STEP_SUMMARY;
    if (!summaryFile || this.passedOnRetry.length === 0) return;
    const shard = this.config?.shard;
    const lines = [
      `### Passed only on retry: ${this.passedOnRetry.length}${shard ? ` (shard ${shard.current}/${shard.total})` : ''}`,
      '',
      'These tests failed their first attempt and passed the retry, so the job stays green.',
      'A test that is new to this list may be flakiness brought in by the change under test.',
      '',
      '| Test | First failure |',
      '|---|---|',
      ...this.passedOnRetry.map(({ title, firstFailure }) => `| ${tableCell(title)} | ${tableCell(firstFailure)} |`),
      '',
    ];
    appendFileSync(summaryFile, lines.join('\n'));
  }
}

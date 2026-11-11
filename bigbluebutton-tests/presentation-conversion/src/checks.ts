import fs from 'fs';
import path from 'path';
import type { TestInfo } from '@playwright/test';
import { findKnown } from './knownFailures';
import { CheckName } from './manifest';

export type CheckOutcome = 'pass' | 'known' | 'fixed' | 'regression' | 'measure' | 'info';

export interface CheckRecord {
  fixture: string;
  profile: string;
  page: number;
  check: CheckName | 'reference';
  outcome: CheckOutcome;
  message?: string;
  issue?: string;
  value?: number | string;
}

export function checksFile(profile: string): string {
  return path.join(__dirname, '..', 'results', profile, 'checks.jsonl');
}

export function resetChecks(profile: string): void {
  fs.mkdirSync(path.dirname(checksFile(profile)), { recursive: true });
  fs.writeFileSync(checksFile(profile), '');
}

const stripAnsi = (s: string) => s.replace(/\u001b\[[0-9;]*m/g, '');

/**
 * Runs the checks of one test, classifies each result against known-failures.yaml and records it.
 * The test fails only on regressions; known failures, fixed known failures and measured fixtures pass with annotations.
 */
export class CheckRun {
  private readonly results: { check: CheckName; ok: boolean; message?: string; value?: string | number }[] = [];

  constructor(
    private readonly fixture: string,
    private readonly profile: string,
    private readonly page: number,
    private readonly enabled: CheckName[],
    private readonly measureOnly: boolean,
    private readonly testInfo: TestInfo,
  ) {}

  /** fn may return the observed value (for example the slide kind), which is recorded with the outcome. */
  async run(check: CheckName, fn: () => void | string | number | Promise<void | string | number>): Promise<void> {
    if (!this.enabled.includes(check)) return;
    try {
      const value = await fn();
      this.results.push({ check, ok: true, value: value ?? undefined });
    } catch (e: any) {
      let message = stripAnsi(String(e?.message ?? e)).trim();
      if (/doesn't exist|does not exist|missing/i.test(message) && /snapshot/i.test(message)) message = `missing golden (bless it with bin/bless.sh): ${message.split('\n')[0]}`;
      this.results.push({ check, ok: false, message: message.split('\n').slice(0, 6).join('\n') });
    }
  }

  info(check: 'reference', value: number | string, message?: string): void {
    this.write({ fixture: this.fixture, profile: this.profile, page: this.page, check, outcome: 'info', value, message });
    this.testInfo.annotations.push({ type: check, description: `${value}${message ? ` ${message}` : ''}` });
  }

  private write(r: CheckRecord): void {
    const file = checksFile(this.profile);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.appendFileSync(file, `${JSON.stringify(r)}\n`);
  }

  finish(): void {
    const regressions: string[] = [];
    for (const r of this.results) {
      const known = findKnown(this.fixture, this.profile, this.page, r.check);
      let outcome: CheckOutcome;
      if (this.measureOnly) outcome = r.ok ? 'pass' : 'measure';
      else if (r.ok) outcome = known ? 'fixed' : 'pass';
      else outcome = known ? 'known' : 'regression';
      this.write({ fixture: this.fixture, profile: this.profile, page: this.page, check: r.check, outcome, message: r.message, issue: known?.issue, value: r.value });
      if (outcome !== 'pass') this.testInfo.annotations.push({ type: `${outcome}:${r.check}`, description: [known?.issue, r.message].filter(Boolean).join(' | ') });
      if (outcome === 'regression') regressions.push(`${r.check}: ${r.message}`);
    }
    if (regressions.length) throw new Error(`regression in ${this.fixture}${this.page ? ` page ${this.page}` : ''}:\n${regressions.join('\n')}`);
  }
}

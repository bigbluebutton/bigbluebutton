import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { SUITE_ROOT } from './env';

export interface KnownFailure {
  fixture: string;
  profiles?: string[] | '*';
  pages?: number[] | '*';
  checks: string[];
  issue: string;
  since?: string;
  note?: string;
}

let cache: KnownFailure[] | undefined;
export function knownFailures(): KnownFailure[] {
  if (!cache) {
    const file = path.join(SUITE_ROOT, 'known-failures.yaml');
    cache = fs.existsSync(file) ? ((YAML.parse(fs.readFileSync(file, 'utf8')) as KnownFailure[]) ?? []) : [];
  }
  return cache;
}

/** page 0 means a fixture-level check (outcome, pages, served). */
export function findKnown(fixture: string, profile: string, page: number, check: string): KnownFailure | undefined {
  return knownFailures().find(
    (k) =>
      k.fixture === fixture &&
      (k.profiles === undefined || k.profiles === '*' || k.profiles.includes(profile)) &&
      (k.pages === undefined || k.pages === '*' || page === 0 || k.pages.includes(page)) &&
      k.checks.includes(check),
  );
}

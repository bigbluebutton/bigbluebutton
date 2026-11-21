import fs from 'fs';
import { profileWorkDir } from './env';
import { UploadMethod } from './manifest';

/** 'error' is a failure of the harness itself (an exception while uploading, waiting or collecting), not a server outcome. */
export type Outcome = 'converted' | 'rejected' | 'dropped' | 'timeout' | 'upload-failed' | 'error';

export interface PdfPageBox {
  w: number;
  h: number;
  rot: number;
}

export interface CollectedPage {
  n: number;
  svg?: string;
  thumb?: string;
  text?: string;
  png?: string;
  ref?: string;
  refThumb?: string;
  box?: PdfPageBox;
  db?: { width: number; height: number; uploadCompleted: boolean };
}

export interface CollectedFixture {
  id: string;
  meetingExternal: string;
  meetingInternal: string;
  method: UploadMethod;
  uploadName: string;
  sha256: string;
  bytes: number;
  uploadResponse?: { status: number; returncode?: string; messageKey?: string; message?: string };
  outcome: Outcome;
  errorKey?: string;
  errorDetails?: string;
  presId?: string;
  dir?: string;
  pageCount: number;
  pages: CollectedPage[];
  /** seconds: from the upload until the outcome was decided; queuedSeconds: until the presentation first appeared (directory or row) */
  timings: { uploadedAt: number; firstSeenAt?: number; doneAt?: number; seconds?: number; queuedSeconds?: number };
  served?: { ok: boolean; detail: string };
  notes: string[];
}

export interface Collected {
  runId: string;
  profile: string;
  target: string;
  startedAt: string;
  finishedAt: string;
  statusSource: 'db' | 'disk';
  environment: Record<string, string>;
  warnings: string[];
  fixtures: Record<string, CollectedFixture>;
}

export function describeOutcome(c: CollectedFixture): string {
  if (c.outcome === 'rejected') return `rejected:${c.errorKey}`;
  if (c.outcome === 'upload-failed') return `upload-failed (${c.uploadResponse?.messageKey ?? c.uploadResponse?.status})`;
  if (c.outcome === 'error') return `error (${c.notes.join('; ')})`;
  return c.outcome;
}

export function matchesExpectation(expectation: string, c: CollectedFixture): boolean {
  if (c.outcome === 'error') return false;
  if (expectation === 'converted') return c.outcome === 'converted';
  if (expectation === 'dropped') return c.outcome === 'dropped' || c.outcome === 'upload-failed';
  if (expectation.startsWith('rejected:')) return c.outcome === 'rejected' && c.errorKey === expectation.slice(9);
  return true;
}

export function collectedPath(): string {
  return profileWorkDir('collected.json');
}

let cache: Collected | undefined;
export function loadCollected(): Collected {
  if (!cache) {
    const file = collectedPath();
    if (!fs.existsSync(file)) throw new Error(`${file} is missing: the convert step did not finish`);
    cache = JSON.parse(fs.readFileSync(file, 'utf8')) as Collected;
  }
  return cache;
}

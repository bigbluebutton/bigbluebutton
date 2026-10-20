import fs from 'fs';
import { profileWorkDir } from './env';
import { UploadMethod } from './manifest';

export type Outcome = 'converted' | 'rejected' | 'dropped' | 'timeout' | 'upload-failed';

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
  timings: { uploadedAt: number; firstSeenAt?: number; doneAt?: number; seconds?: number };
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

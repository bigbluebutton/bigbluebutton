import fs from 'fs';
import path from 'path';
import { BbbApi, documentXml, modulesXml, pageToken } from './api';
import { Collected, CollectedFixture, CollectedPage, Outcome, PdfPageBox } from './collected';
import { loadTarget, profileName, profileWorkDir, runId, serverHost, Target, workDir } from './env';
import { canReadDir, copyTree, listDir, readFileBytes, run, statSize, sudo } from './host';
import { BASE64_LIMIT, expectationFor, lintManifests, loadAllManifests, Manifest, selectedManifests, sha256, UploadMethod, uploadName } from './manifest';
import { generateRuntimeFixture, RuntimeSpec } from './runtimeFixtures';
import { PresentationRow, StatusDb } from './status';
import { toolVersions } from './tools';

const MAX_DOCS_PER_MEETING = Number(process.env.PC_MAX_DOCS_PER_MEETING || 8);
const MAX_CREATE_BODY = 900_000;
const INSERT_GAP_MS = 3_000;
const POLL_MS = 2_000;
const DROP_AFTER_MS = Number(process.env.PC_DROP_AFTER_SECONDS || 90) * 1000;
const COMPLETED_GRACE_MS = 30_000;
const OFFICE_EXT = new Set(['.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.odt', '.ods', '.odp', '.odg', '.rtf', '.txt']);

interface Prepared {
  m: Manifest;
  expect: string;
  sourcePath: string;
  bytes: number;
  sha: string;
  name: string;
  method: UploadMethod;
  base64?: string;
  url?: string;
}

interface MeetingPlan {
  externalId: string;
  kind: 'create' | 'insert';
  fixtures: Prepared[];
  createParams: Record<string, string>;
}

interface State {
  p: Prepared;
  uploadedAt: number;
  firstSeenAt?: number;
  completedSeenAt?: number;
  presId?: string;
  row?: PresentationRow;
  outcome?: Outcome;
  decidedAt?: number;
  dirGoneSince?: number;
  lastSizes?: string;
  uploadResponse?: CollectedFixture['uploadResponse'];
  notes: string[];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const log = (...a: unknown[]) => console.log(`[convert ${new Date().toISOString().slice(11, 19)}]`, ...a);

function timeoutMs(p: Prepared): number {
  const office = OFFICE_EXT.has(path.extname(p.name).toLowerCase()) ? 120 : 0;
  return Math.min(900, 120 + 20 * Math.max(1, p.m.pages) + office) * 1000;
}

function meetingRoot(target: Target, key: string): string {
  return path.join(target.presentationDir, target.layout.split('{presId}')[0].replace(/\{meetingId\}/g, key));
}

function filePattern(pattern: string, n: number): string {
  return pattern.replace('{n}', String(n));
}

export class Converter {
  private readonly target = loadTarget();
  private readonly api = new BbbApi(this.target);
  private readonly profile = profileName();
  private db: StatusDb | null = null;
  private readonly hashCache = new Map<string, string>();
  private readonly warnings: string[] = [];
  private readonly staged: string[] = [];

  async run(): Promise<Collected> {
    const startedAt = new Date().toISOString();
    const problems = lintManifests(loadAllManifests());
    if (problems.length) throw new Error(`manifest lint failed:\n${problems.join('\n')}`);
    const environment = await this.preflight();
    const prepared = await this.prepare(selectedManifests(this.profile));
    log(`profile ${this.profile}: ${prepared.length} fixtures`);
    const plans = this.plan(prepared);
    log(`${plans.length} meetings planned`);
    const fixtures: Record<string, CollectedFixture> = {};
    const parallel = Number(process.env.PC_PARALLEL_MEETINGS || 2);
    let next = 0;
    const workers = Array.from({ length: Math.min(parallel, plans.length) }, async () => {
      while (next < plans.length) {
        const plan = plans[next++];
        for (const f of await this.runMeeting(plan)) fixtures[f.id] = f;
      }
    });
    await Promise.all(workers);
    await this.unstage();
    const collected: Collected = {
      runId: runId(),
      profile: this.profile,
      target: this.target.name,
      startedAt,
      finishedAt: new Date().toISOString(),
      statusSource: this.db ? 'db' : 'disk',
      environment,
      warnings: this.warnings,
      fixtures,
    };
    fs.mkdirSync(profileWorkDir(), { recursive: true });
    fs.writeFileSync(profileWorkDir('collected.json'), JSON.stringify(collected, null, 1));
    return collected;
  }

  private async preflight(): Promise<Record<string, string>> {
    if (!(await this.api.alive())) throw new Error(`preflight: ${this.target.apiBase} does not answer SUCCESS`);
    const meetings = await this.api.call('getMeetings', {});
    if (meetings.returncode !== 'SUCCESS') throw new Error(`preflight: signed getMeetings failed (${meetings.messageKey}): wrong secret or checksum algorithm?`);
    if (!(await canReadDir(this.target.presentationDir)) && (await sudo(['ls', this.target.presentationDir])).code !== 0)
      throw new Error(`preflight: cannot read ${this.target.presentationDir} (run on the BBB host, as a user with read access or passwordless sudo)`);
    if (this.target.statusSource === 'db' && this.target.db) {
      const db = new StatusDb(this.target);
      const problem = await db.available();
      if (problem) this.warnings.push(`status database unavailable, falling back to disk only: ${problem}`);
      else this.db = db;
    }
    const env = await toolVersions();
    env.target = this.target.name;
    env.apiBase = this.target.apiBase;
    env.version = (await (await fetch(this.target.apiBase)).text()).match(/<version>(.*?)<\/version>/)?.[1] ?? 'unknown';
    return env;
  }

  private async prepare(manifests: Manifest[]): Promise<Prepared[]> {
    const out: Prepared[] = [];
    for (const m of manifests) {
      const sourcePath =
        m.tier === 'runtime' ? generateRuntimeFixture(m.id, m.generate as RuntimeSpec, workDir('runtime')) : (m.filePath as string);
      let data = fs.readFileSync(sourcePath);
      if (m.upload.uniqueBytes ?? m.tier === 'variant') data = Buffer.concat([data, Buffer.from(`\n% pc-variant ${m.id}\n`, 'latin1')]);
      const name = uploadName(m, sourcePath);
      const p: Prepared = { m, expect: expectationFor(m, this.profile), sourcePath, bytes: data.length, sha: sha256(data), name, method: m.upload.method };
      if (p.method.endsWith('-url')) p.url = await this.stage(p, data);
      else {
        if (data.length > BASE64_LIMIT) throw new Error(`${m.id}: ${data.length} bytes is too big for a base64 upload`);
        p.base64 = data.toString('base64');
      }
      out.push(p);
    }
    return out;
  }

  /** URL documents are served by the BBB host's own nginx (the default site root), so bbb-web downloads them over https. */
  private async stage(p: Prepared, data: Buffer): Promise<string> {
    const rel = [this.target.urlDocuments.urlPath, runId(), this.profile, p.m.id];
    const dir = path.join(this.target.urlDocuments.webroot, ...rel);
    const servedAs = p.m.upload.servedAs ?? p.name;
    const tmp = path.join(workDir('staging'), `${p.m.id}-${path.basename(servedAs)}`);
    fs.mkdirSync(path.dirname(tmp), { recursive: true });
    fs.writeFileSync(tmp, data);
    const r = await sudo(['install', '-D', '-m', '0644', tmp, path.join(dir, servedAs)]);
    if (r.code !== 0) throw new Error(`${p.m.id}: cannot stage ${path.join(dir, servedAs)}: ${r.stderr}`);
    this.staged.push(path.join(this.target.urlDocuments.webroot, this.target.urlDocuments.urlPath, runId(), this.profile));
    const host = serverHost(this.target);
    const base = `https://${host}/${rel.join('/')}`;
    const template = p.m.upload.url ?? '{base}/{name}';
    return template.replace('{base}', base).replace('{host}', host).replace('{name}', encodeURIComponent(servedAs));
  }

  private async unstage(): Promise<void> {
    for (const dir of new Set(this.staged)) {
      await sudo(['rm', '-rf', dir]);
      await sudo(['rmdir', '--ignore-fail-on-non-empty', path.dirname(dir), path.dirname(path.dirname(dir))]);
    }
  }

  private plan(items: Prepared[]): MeetingPlan[] {
    const plans: MeetingPlan[] = [];
    const prefix = `pc-${runId()}-${this.profile}`;
    const add = (kind: MeetingPlan['kind'], fixtures: Prepared[], createParams: Record<string, string> = {}) =>
      plans.push({ externalId: `${prefix}-${plans.length + 1}`, kind, fixtures, createParams });
    const kindOf = (p: Prepared): MeetingPlan['kind'] => (p.method.startsWith('insert') ? 'insert' : 'create');
    const own = items.filter((p) => p.m.createParams && Object.keys(p.m.createParams).length);
    for (const p of own) add(kindOf(p), [p], p.m.createParams);
    for (const kind of ['create', 'insert'] as const) {
      let cur: Prepared[] = [];
      let bodyBytes = 0;
      const flush = () => {
        if (cur.length) add(kind, cur);
        cur = [];
        bodyBytes = 0;
      };
      for (const p of items.filter((i) => !own.includes(i) && kindOf(i) === kind)) {
        const size = p.base64?.length ?? 300;
        const clash = cur.some((c) => c.sha === p.sha || c.name === p.name);
        if (cur.length >= MAX_DOCS_PER_MEETING || clash || (kind === 'create' && bodyBytes + size > MAX_CREATE_BODY)) flush();
        cur.push(p);
        bodyBytes += size;
      }
      flush();
    }
    return plans;
  }

  private async runMeeting(plan: MeetingPlan): Promise<CollectedFixture[]> {
    const params = {
      record: 'false',
      meetingExpireIfNoUserJoinedInMinutes: '60',
      meetingExpireWhenLastUserLeftInMinutes: '60',
      ...plan.createParams,
      meta_pcsuite: '1',
    };
    const body =
      plan.kind === 'create'
        ? modulesXml(plan.fixtures.map((p, i) => documentXml({ name: p.name, base64: p.base64, url: p.url, current: i === 0 })))
        : undefined;
    const t0 = Date.now();
    const states = plan.fixtures.map<State>((p) => ({ p, uploadedAt: t0, notes: [] }));
    const created = await this.api.create(plan.externalId, params, body);
    log(`${plan.externalId}: create ${created.returncode} (${plan.fixtures.map((p) => p.m.id).join(', ')})`);
    if (created.returncode !== 'SUCCESS' || !created.internalMeetingID) {
      for (const s of states) {
        s.outcome = 'upload-failed';
        s.uploadResponse = { status: created.status, returncode: created.returncode, messageKey: created.messageKey, message: created.message };
      }
      return states.map((s) => this.result(plan, '', s, []));
    }
    const internal = created.internalMeetingID;
    const key = this.target.meetingKey === 'internal' ? internal : plan.externalId;
    if (plan.kind === 'insert') {
      for (const [i, s] of states.entries()) {
        if (i > 0) await sleep(INSERT_GAP_MS);
        s.uploadedAt = Date.now();
        const r = await this.api.insertDocument(plan.externalId, modulesXml([documentXml({ name: s.p.name, base64: s.p.base64, url: s.p.url })]));
        s.uploadResponse = { status: r.status, returncode: r.returncode, messageKey: r.messageKey, message: r.message };
        if (r.returncode !== 'SUCCESS') s.outcome = 'upload-failed';
      }
    }
    await this.waitFor(states, internal, meetingRoot(this.target, key));
    const results: CollectedFixture[] = [];
    let servedDone = false;
    for (const s of states) {
      const pages = s.outcome === 'converted' && s.presId ? await this.collect(s, meetingRoot(this.target, key)) : [];
      const r = this.result(plan, internal, s, pages);
      if (!servedDone && r.outcome === 'converted' && r.pageCount > 0) {
        r.served = await this.servedCheck(plan.externalId, key, r);
        servedDone = true;
      }
      results.push(r);
    }
    await this.api.end(plan.externalId).catch(() => undefined);
    return results;
  }

  private async hashOf(file: string): Promise<string | null> {
    const size = await statSize(file);
    if (size === null) return null;
    const cacheKey = `${file}:${size}`;
    if (!this.hashCache.has(cacheKey)) this.hashCache.set(cacheKey, sha256(await readFileBytes(file)));
    return this.hashCache.get(cacheKey)!;
  }

  private async artifactSizes(dir: string, pages: number): Promise<string | null> {
    const sizes: number[] = [];
    for (let n = 1; n <= pages; n++) {
      for (const pattern of [this.target.files.svg, this.target.files.thumb, this.target.files.text]) {
        const s = await statSize(path.join(dir, filePattern(pattern, n)));
        if (s === null) return null;
        sizes.push(s);
      }
    }
    return sizes.join(',');
  }

  private async pdfPageCount(dir: string, presId: string): Promise<number | null> {
    for (const f of [path.join(dir, `${presId}.pdf`), path.join(dir, 'svgs', 'slide-1.pdf')]) {
      if ((await statSize(f)) === null) continue;
      const r = await run('pdfinfo', [f], { timeoutMs: 30_000 });
      const m = r.stdout.match(/^Pages:\s+(\d+)/m);
      if (m) return Number(m[1]);
    }
    return null;
  }

  private async waitFor(states: State[], internal: string, root: string): Promise<void> {
    const assigned = new Map<string, State>();
    while (states.some((s) => !s.outcome)) {
      const rows = this.db ? await this.db.presentations(internal).catch((e) => (this.warnings.push(String(e)), [])) : [];
      for (const d of await listDir(root)) {
        if (assigned.has(d)) continue;
        for (const f of await listDir(path.join(root, d))) {
          if (!f.startsWith(`${d}.`) || f.endsWith('.downloadable')) continue;
          const h = await this.hashOf(path.join(root, d, f));
          const s = states.find((x) => !x.presId && x.p.sha === h);
          if (s) {
            s.presId = d;
            assigned.set(d, s);
            break;
          }
        }
      }
      const now = Date.now();
      for (const s of states.filter((x) => !x.outcome)) {
        const row = rows.find((r) => r.presentationId === s.presId) ?? rows.find((r) => !r.isDefault && r.name === s.p.name);
        if (row && !s.presId && !assigned.has(row.presentationId)) {
          s.presId = row.presentationId;
          assigned.set(row.presentationId, s);
        }
        s.row = row ?? s.row;
        if (!s.firstSeenAt && (s.presId || row)) s.firstSeenAt = now;
        if (row?.errorKey) {
          s.outcome = 'rejected';
          continue;
        }
        if (s.presId && (await this.ready(s, row, path.join(root, s.presId), now))) {
          s.outcome = 'converted';
          continue;
        }
        if (s.presId && !row?.uploadCompleted && (await statSize(path.join(root, s.presId))) === null) {
          s.dirGoneSince ??= now;
          if (now - s.dirGoneSince > 20_000) {
            s.outcome = 'dropped';
            s.notes.push('bbb-web created the presentation directory and removed it again without reporting an error');
            continue;
          }
        } else s.dirGoneSince = undefined;
        if (!s.presId && !row && now - s.uploadedAt > DROP_AFTER_MS) s.outcome = 'dropped';
        else if (now - s.uploadedAt > timeoutMs(s.p)) s.outcome = 'timeout';
      }
      for (const s of states) if (s.outcome && !s.decidedAt) {
        s.decidedAt = Date.now();
        log(`${s.p.m.id}: ${s.outcome}${s.row?.errorKey ? ` ${s.row.errorKey}` : ''} after ${Math.round((Date.now() - s.uploadedAt) / 1000)}s`);
      }
      if (states.some((s) => !s.outcome)) await sleep(POLL_MS);
    }
  }

  private async ready(s: State, row: PresentationRow | undefined, dir: string, now: number): Promise<boolean> {
    let pages: number | null;
    if (this.db) {
      if (!row?.uploadCompleted) return false;
      s.completedSeenAt ??= now;
      pages = row.totalPages || null;
    } else {
      pages = await this.pdfPageCount(dir, s.presId!);
    }
    if (!pages) return false;
    const sizes = await this.artifactSizes(dir, pages);
    if (sizes !== null && sizes === s.lastSizes) return true;
    s.lastSizes = sizes ?? undefined;
    if (s.completedSeenAt && now - s.completedSeenAt > COMPLETED_GRACE_MS) {
      s.notes.push('artifacts incomplete 30 s after the database reported completion');
      return true;
    }
    return false;
  }

  private async collect(s: State, root: string): Promise<CollectedPage[]> {
    const id = s.p.m.id;
    const base = profileWorkDir('fixtures', id);
    fs.rmSync(base, { recursive: true, force: true });
    await copyTree(path.join(root, s.presId!), path.join(base, 'server'));
    const server = path.join(base, 'server');
    const pdf = [path.join(server, `${s.presId}.pdf`), path.join(server, 'svgs', 'slide-1.pdf')].find((f) => fs.existsSync(f));
    const count = s.row?.totalPages || (await this.pdfPageCount(server, s.presId!)) || 0;
    const boxes = pdf ? await pdfBoxes(pdf, count) : {};
    if (pdf && count) await popplerRefs(pdf, count, path.join(base, 'ref'));
    const dbPages = this.db ? await this.db.pages(s.presId!).catch(() => []) : [];
    const rel = (f: string) => (fs.existsSync(path.join(server, f)) ? path.relative(profileWorkDir(), path.join(server, f)) : undefined);
    const pages: CollectedPage[] = [];
    for (let n = 1; n <= count; n++) {
      const ref = path.join(base, 'ref', `page-${n}.png`);
      const refThumb = path.join(base, 'ref', `thumb-${n}.png`);
      const dbp = dbPages.find((p) => p.num === n);
      pages.push({
        n,
        svg: rel(filePattern(this.target.files.svg, n)),
        thumb: rel(filePattern(this.target.files.thumb, n)),
        text: rel(filePattern(this.target.files.text, n)),
        png: rel(filePattern(this.target.files.png, n)),
        ref: fs.existsSync(ref) ? path.relative(profileWorkDir(), ref) : undefined,
        refThumb: fs.existsSync(refThumb) ? path.relative(profileWorkDir(), refThumb) : undefined,
        box: boxes[n],
        db: dbp ? { width: dbp.width, height: dbp.height, uploadCompleted: dbp.uploadCompleted } : undefined,
      });
    }
    return pages;
  }

  private result(plan: MeetingPlan, internal: string, s: State, pages: CollectedPage[]): CollectedFixture {
    const done = s.decidedAt ?? Date.now();
    return {
      id: s.p.m.id,
      meetingExternal: plan.externalId,
      meetingInternal: internal,
      method: s.p.method,
      uploadName: s.p.name,
      sha256: s.p.sha,
      bytes: s.p.bytes,
      uploadResponse: s.uploadResponse,
      outcome: s.outcome ?? 'timeout',
      errorKey: s.row?.errorKey || undefined,
      errorDetails: s.row?.errorDetails || undefined,
      presId: s.presId,
      dir: s.presId ? path.relative(profileWorkDir(), profileWorkDir('fixtures', s.p.m.id, 'server')) : undefined,
      pageCount: pages.length,
      pages,
      timings: { uploadedAt: s.uploadedAt, firstSeenAt: s.firstSeenAt, doneAt: done, seconds: Math.round((done - s.uploadedAt) / 1000) },
      notes: s.notes,
    };
  }

  /** Fetches slide 1 the way the client does (session cookie + sessionToken + pageToken) and compares it with the file on disk. */
  private async servedCheck(meetingId: string, key: string, r: CollectedFixture): Promise<{ ok: boolean; detail: string }> {
    if (this.target.served.token === 'none' || !this.target.served.base) return { ok: true, detail: 'not applicable for this target' };
    const joined = await this.api.join(meetingId, 'pc-suite');
    if ('error' in joined) return { ok: false, detail: joined.error };
    const token = pageToken(this.target.secret, r.presId!, 1);
    const url = `${this.target.served.base}${key}/${key}/${r.presId}/svg/1?pageToken=${token}&sessionToken=${joined.sessionToken}`;
    const headers = { cookie: joined.cookie };
    const ok = await fetch(url, { headers, signal: AbortSignal.timeout(30_000) });
    const body = Buffer.from(await ok.arrayBuffer());
    const disk = fs.readFileSync(path.join(profileWorkDir(), r.pages[0].svg!));
    const denied = await fetch(url.replace(/pageToken=[0-9a-f]+/, 'pageToken=0'), { headers, signal: AbortSignal.timeout(30_000) });
    const good = ok.status === 200 && body.equals(disk) && denied.status === 403;
    return { ok: good, detail: `with token ${ok.status} (${body.equals(disk) ? 'same bytes as disk' : 'differs from disk'}), wrong token ${denied.status}` };
  }
}

async function pdfBoxes(pdf: string, count: number): Promise<Record<number, PdfPageBox>> {
  const r = await run('pdfinfo', ['-f', '1', '-l', String(count), pdf], { timeoutMs: 60_000 });
  const out: Record<number, PdfPageBox> = {};
  for (const m of r.stdout.matchAll(/^Page\s+(\d+)\s+size:\s+([\d.]+) x ([\d.]+)/gm)) out[Number(m[1])] = { w: Number(m[2]), h: Number(m[3]), rot: 0 };
  for (const m of r.stdout.matchAll(/^Page\s+(\d+)\s+rot:\s+(\d+)/gm)) if (out[Number(m[1])]) out[Number(m[1])].rot = Number(m[2]);
  return out;
}

async function popplerRefs(pdf: string, count: number, outDir: string): Promise<void> {
  fs.mkdirSync(outDir, { recursive: true });
  const prefix = path.join(outDir, 'p');
  await run('pdftoppm', ['-png', '-cropbox', '-scale-to-x', '400', '-scale-to-y', '-1', '-f', '1', '-l', String(count), pdf, prefix], { timeoutMs: 300_000 });
  await run('pdftoppm', ['-png', '-cropbox', '-scale-to', '150', '-f', '1', '-l', String(count), pdf, path.join(outDir, 't')], { timeoutMs: 300_000 });
  for (const f of fs.readdirSync(outDir)) {
    const m = f.match(/^([pt])-0*(\d+)\.png$/);
    if (m) fs.renameSync(path.join(outDir, f), path.join(outDir, `${m[1] === 'p' ? 'page' : 'thumb'}-${Number(m[2])}.png`));
  }
}

import fs from 'fs';
import path from 'path';
import { CheckRecord } from '../checks';
import { Collected } from '../collected';
import { SUITE_ROOT } from '../env';
import { expectationFor, loadAllManifests } from '../manifest';

/**
 * Combines the per-profile check records into results/summary.md (for $GITHUB_STEP_SUMMARY) and results/summary.json.
 * Exit code: 0 no regressions, 1 regressions, 2 a profile could not run or a test failed outside the check runner.
 */
const resultsDir = path.join(SUITE_ROOT, 'results');
const workRoot = path.join(SUITE_ROOT, 'work');
const runId =
  process.env.PC_RUN_ID ||
  (fs.existsSync(workRoot)
    ? fs
        .readdirSync(workRoot)
        .filter((d) => d !== 'runtime' && fs.statSync(path.join(workRoot, d)).isDirectory())
        .map((d) => ({ d, mtime: fs.statSync(path.join(workRoot, d)).mtimeMs }))
        .sort((a, b) => a.mtime - b.mtime)
        .pop()?.d
    : undefined);
const order = ['defaults', 'rasterize-all', 'low-thresholds', 'tight-limits', 'office-precheck'];
const profiles = (fs.existsSync(resultsDir) ? fs.readdirSync(resultsDir) : [])
  .filter((p) => fs.existsSync(path.join(resultsDir, p, 'checks.jsonl')) || fs.existsSync(path.join(resultsDir, p, 'status')))
  .sort((a, b) => (order.indexOf(a) + 99) % 99 - (order.indexOf(b) + 99) % 99 || a.localeCompare(b));

const gha = !!process.env.GITHUB_ACTIONS;
const manifests = new Map(loadAllManifests().map((m) => [m.id, m]));
const records: CheckRecord[] = [];
const errors: string[] = [];
const measured: string[][] = [];
const warnings: string[] = [];
let environment: Record<string, string> = {};
const perProfile: Record<string, Record<string, number>> = {};

interface ReportSuite {
  title: string;
  specs?: { title: string; tests: { results: { status: string; errors?: { message?: string }[] }[] }[] }[];
  suites?: ReportSuite[];
}

const firstLine = (s?: string) => (s ?? '').replace(/\u001b\[[0-9;]*m/g, '').split('\n').find((l) => l.trim())?.trim() ?? '';

/**
 * Tests of the Playwright JSON report that neither passed nor were skipped and left no regression record: a test that
 * throws outside CheckRun (a truncated PNG, a failed attach) or times out writes nothing to checks.jsonl.
 */
function failedOutsideChecks(profile: string, file: string, rows: CheckRecord[]): string[] {
  const report = JSON.parse(fs.readFileSync(file, 'utf8')) as { suites?: ReportSuite[]; errors?: { message?: string }[] };
  const out = (report.errors ?? []).map((e) => `${profile}: Playwright reported an error outside the tests: ${firstLine(e.message)}`);
  const walk = (suite: ReportSuite) => {
    for (const spec of suite.specs ?? [])
      for (const t of spec.tests) {
        const last = t.results[t.results.length - 1];
        if (!last || last.status === 'passed' || last.status === 'skipped') continue;
        const page = spec.title === 'outcome' ? 0 : Number(spec.title.match(/^page (\d+)$/)?.[1] ?? NaN);
        if (rows.some((r) => r.outcome === 'regression' && r.profile === profile && r.fixture === suite.title && r.page === page)) continue;
        const how = last.status === 'failed' ? '' : ` (${last.status})`;
        out.push(`${profile}: ${suite.title} ${spec.title} failed outside the check runner${how}: ${firstLine(last.errors?.[0]?.message) || 'no error message'}`);
      }
    for (const s of suite.suites ?? []) walk(s);
  };
  for (const s of report.suites ?? []) walk(s);
  return out;
}

for (const profile of profiles) {
  const status = fs.existsSync(path.join(resultsDir, profile, 'status')) ? fs.readFileSync(path.join(resultsDir, profile, 'status'), 'utf8').trim() : '';
  const file = path.join(resultsDir, profile, 'checks.jsonl');
  const rows = fs.existsSync(file)
    ? fs
        .readFileSync(file, 'utf8')
        .split('\n')
        .filter(Boolean)
        .map((l) => JSON.parse(l) as CheckRecord)
    : [];
  records.push(...rows);
  const counts: Record<string, number> = { pass: 0, known: 0, fixed: 0, regression: 0, measure: 0 };
  for (const r of rows) if (r.outcome !== 'info') counts[r.outcome] = (counts[r.outcome] ?? 0) + 1;
  const collectedFile = runId ? path.join(workRoot, runId, profile, 'collected.json') : '';
  if (status === 'setup-failed') errors.push(`${profile}: the profile could not be applied (bbb-web.properties or restart failed)`);
  else if (!collectedFile || !fs.existsSync(collectedFile)) errors.push(`${profile}: the convert step did not finish (see the HTML report)`);
  else {
    const collected = JSON.parse(fs.readFileSync(collectedFile, 'utf8')) as Collected;
    environment = { ...collected.environment, ...environment };
    warnings.push(...collected.warnings.map((w) => `${profile}: ${w}`));
    counts.fixtures = Object.keys(collected.fixtures).length;
    for (const f of Object.values(collected.fixtures)) {
      const m = manifests.get(f.id);
      if (m && expectationFor(m, profile) === 'measure')
        measured.push([profile, f.id, `${f.outcome}${f.errorKey ? ` ${f.errorKey}` : ''}`, `${f.pageCount}`, `${f.timings.seconds}s`]);
    }
  }
  const reportFile = path.join(resultsDir, profile, 'report.json');
  if (status !== 'setup-failed') {
    if (fs.existsSync(reportFile)) errors.push(...failedOutsideChecks(profile, reportFile, rows));
    else if (status && status !== '0' && !rows.some((r) => r.outcome === 'regression'))
      errors.push(`${profile}: Playwright exited ${status} but recorded no regression, and results/${profile}/report.json is missing`);
  }
  perProfile[profile] = counts;
}

const regressions = records.filter((r) => r.outcome === 'regression');
const fixed = records.filter((r) => r.outcome === 'fixed');
const known = records.filter((r) => r.outcome === 'known');
const verdict = errors.length ? 'ERROR' : regressions.length ? 'FAIL' : 'PASS';
const cell = (s: unknown) => String(s ?? '').replace(/\|/g, '/').replace(/\n/g, ' ').slice(0, 300);
const where = (r: CheckRecord) => `${r.page ? `page ${r.page}` : 'fixture'}`;

const lines: string[] = [];
lines.push(`## Presentation conversion: ${verdict}`, '');
lines.push(`Run \`${runId ?? 'unknown'}\` against ${environment.apiBase ?? 'unknown'}`, '');
const stamp = ['bbb-web', 'bbb-release', 'poppler-utils', 'libcairo2', 'imagemagick', 'ghostscript', 'bbb-libreoffice-docker', 'os', 'node']
  .filter((k) => environment[k])
  .map((k) => `${k} ${environment[k]}`)
  .join(' · ');
if (stamp) lines.push(`Versions: ${stamp}`, '');
lines.push('| Profile | Fixtures | Pass | Known | Fixed | Regression | Measured |', '|---|---|---|---|---|---|---|');
for (const p of profiles) {
  const c = perProfile[p];
  lines.push(`| ${p} | ${c.fixtures ?? '-'} | ${c.pass} | ${c.known} | ${c.fixed} | ${c.regression} | ${c.measure} |`);
}
lines.push('');
if (errors.length) lines.push('### Errors', '', ...errors.map((e) => `- ${e}`), '');
if (regressions.length) {
  lines.push('### Regressions', '', '| Profile | Fixture | Where | Check | Message |', '|---|---|---|---|---|');
  for (const r of regressions) lines.push(`| ${r.profile} | ${r.fixture} | ${where(r)} | ${r.check} | ${cell(r.message)} |`);
  lines.push('');
}
if (fixed.length) {
  lines.push('### Fixed: remove these from known-failures.yaml', '', '| Profile | Fixture | Where | Check | Issue |', '|---|---|---|---|---|');
  for (const r of fixed) lines.push(`| ${r.profile} | ${r.fixture} | ${where(r)} | ${r.check} | ${cell(r.issue)} |`);
  lines.push('');
}
if (known.length) {
  const grouped = new Map<string, { profiles: Set<string>; pages: Set<number>; issue?: string }>();
  for (const r of known) {
    const k = `${r.fixture}\u0000${r.check}`;
    const g = grouped.get(k) ?? { profiles: new Set(), pages: new Set(), issue: r.issue };
    g.profiles.add(r.profile);
    g.pages.add(r.page);
    grouped.set(k, g);
  }
  lines.push('### Known failures (the defaults do not suffice)', '', '| Fixture | Check | Profiles | Pages | Issue |', '|---|---|---|---|---|');
  for (const [k, g] of grouped) {
    const [fixture, check] = k.split('\u0000');
    const pages = [...g.pages].filter((p) => p > 0).sort((a, b) => a - b);
    lines.push(`| ${fixture} | ${check} | ${[...g.profiles].join(', ')} | ${pages.length ? pages.join(', ') : 'fixture'} | ${cell(g.issue)} |`);
  }
  lines.push('');
}
if (measured.length) {
  lines.push('### Measured, not asserted yet', '', '| Profile | Fixture | Observed | Pages | Time |', '|---|---|---|---|---|');
  for (const r of measured) lines.push(`| ${r.map(cell).join(' | ')} |`);
  lines.push('');
}
if (warnings.length) lines.push('### Warnings', '', ...warnings.map((w) => `- ${cell(w)}`), '');

const md = lines.join('\n');
fs.mkdirSync(resultsDir, { recursive: true });
fs.writeFileSync(path.join(resultsDir, 'summary.md'), md);
fs.writeFileSync(
  path.join(resultsDir, 'summary.json'),
  JSON.stringify({ runId, verdict, profiles: perProfile, errors, regressions, fixed, known, measured, warnings, environment }, null, 1),
);
console.log(md);
if (gha) {
  for (const r of regressions) console.log(`::error title=presentation conversion regression::${r.profile} ${r.fixture} ${where(r)} ${r.check}: ${cell(r.message)}`);
  for (const r of fixed) console.log(`::warning title=known failure now passes::${r.profile} ${r.fixture} ${where(r)} ${r.check} (${r.issue}): remove it from known-failures.yaml`);
  for (const e of errors) console.log(`::error title=presentation conversion setup::${e}`);
}
process.exit(errors.length ? 2 : regressions.length ? 1 : 0);

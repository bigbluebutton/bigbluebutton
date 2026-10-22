import fs from 'fs';
import path from 'path';
import { CheckRecord } from '../checks';
import { Collected } from '../collected';
import { SUITE_ROOT } from '../env';
import { expectationFor, loadAllManifests } from '../manifest';

/**
 * Combines the per-profile check records into results/summary.md (for $GITHUB_STEP_SUMMARY) and results/summary.json.
 * Exit code: 0 no regressions, 1 regressions, 2 a profile could not run.
 */
const resultsDir = path.join(SUITE_ROOT, 'results');
const workRoot = path.join(SUITE_ROOT, 'work');
const runId =
  process.env.PC_RUN_ID ||
  (fs.existsSync(workRoot)
    ? fs
        .readdirSync(workRoot)
        .filter((d) => d !== 'runtime' && fs.statSync(path.join(workRoot, d)).isDirectory())
        .sort()
        .pop()
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

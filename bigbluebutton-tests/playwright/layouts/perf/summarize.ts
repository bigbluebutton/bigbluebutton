/* eslint-disable no-console */
// Summarizes the layout perf harness output: per scenario, CPU profile and metric, the median and IQR of
// each variant, and, against a reference variant, the delta in % and a 95% bootstrap CI of the difference
// of medians. A difference whose CI crosses 0 is "no significant difference".
//   node layouts/perf/summarize.ts <PERF_OUT dir> [reference variant]   (Node >= 24 runs .ts directly)
import fs from 'fs';
import path from 'path';

interface Measurement {
  scenario: string;
  variant: string;
  cpu: number;
  run: number;
  metrics: Record<string, number>;
}

const [outDir, referenceArg] = process.argv.slice(2);
if (!outDir) {
  console.error('usage: node layouts/perf/summarize.ts <PERF_OUT dir> [reference variant]');
  process.exit(1);
}

const measurements: Measurement[] = fs
  .readdirSync(outDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .flatMap((dir) =>
    fs
      .readdirSync(path.join(outDir, dir.name))
      .filter((file) => file.endsWith('.json'))
      .map((file) => JSON.parse(fs.readFileSync(path.join(outDir, dir.name, file), 'utf8')) as Measurement),
  );

const variants = [...new Set(measurements.map((m) => m.variant))].sort();
const reference = referenceArg ?? variants[0];

const quantile = (values: number[], q: number) => {
  const sorted = [...values].sort((a, b) => a - b);
  const position = (sorted.length - 1) * q;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
};
const median = (values: number[]) => quantile(values, 0.5);

// Deterministic resampling (a fixed-seed LCG), so the same data always gives the same CI
function bootstrapMedianDiffCI(a: number[], b: number[], iterations = 5000): [number, number] {
  let seed = 20261123;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const resample = (values: number[]) => values.map(() => values[Math.floor(random() * values.length)]);
  const diffs = Array.from({ length: iterations }, () => median(resample(b)) - median(resample(a)));
  return [quantile(diffs, 0.025), quantile(diffs, 0.975)];
}

const fmt = (value: number) => (Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(2));

const groups = new Map<string, Measurement[]>();
measurements.forEach((m) => {
  const key = `${m.scenario}|${m.cpu}`;
  groups.set(key, [...(groups.get(key) ?? []), m]);
});

const rows: string[] = [];
rows.push(
  `| scenario | cpu | metric | ${variants.map((v) => `${v} median [IQR] (n)`).join(' | ')} | ${variants
    .filter((v) => v !== reference)
    .map((v) => `${v} vs ${reference}: delta, 95% CI`)
    .join(' | ')} |`,
);
rows.push(`|${' --- |'.repeat(3 + variants.length + variants.length - 1)}`);

[...groups.keys()].sort().forEach((key) => {
  const [scenario, cpu] = key.split('|');
  const group = groups.get(key)!;
  const metricNames = [...new Set(group.flatMap((m) => Object.keys(m.metrics)))].sort();
  metricNames.forEach((metric) => {
    const valuesOf = (variant: string) =>
      group.filter((m) => m.variant === variant && metric in m.metrics).map((m) => m.metrics[metric]);
    const cells = variants.map((variant) => {
      const values = valuesOf(variant);
      if (!values.length) return '-';
      return `${fmt(median(values))} [${fmt(quantile(values, 0.25))}-${fmt(quantile(values, 0.75))}] (${values.length})`;
    });
    const comparisons = variants
      .filter((variant) => variant !== reference)
      .map((variant) => {
        const a = valuesOf(reference);
        const b = valuesOf(variant);
        if (a.length < 2 || b.length < 2) return '-';
        const delta = median(a) === 0 ? 0 : ((median(b) - median(a)) / median(a)) * 100;
        const [low, high] = bootstrapMedianDiffCI(a, b);
        const verdict = low <= 0 && high >= 0 ? 'no significant difference' : 'significant';
        return `${delta.toFixed(1)}%, [${fmt(low)}, ${fmt(high)}] ${verdict}`;
      });
    rows.push(`| ${scenario} | ${cpu}x | ${metric} | ${cells.join(' | ')} | ${comparisons.join(' | ')} |`);
  });
});

console.log(rows.join('\n'));

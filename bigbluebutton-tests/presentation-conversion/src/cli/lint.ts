import { lintManifests, loadAllManifests } from '../manifest';

const all = loadAllManifests();
const problems = lintManifests(all);
for (const p of problems) console.error(p);
const byTier: Record<string, number> = {};
for (const m of all) byTier[m.tier] = (byTier[m.tier] ?? 0) + 1;
console.log(`${all.length} manifests (${Object.entries(byTier).map(([t, n]) => `${t} ${n}`).join(', ')}), ${problems.length} problems`);
process.exit(problems.length ? 1 : 0);

import path from 'path';
import { SUITE_ROOT } from '../env';
import { loadAllManifests } from '../manifest';

/** Prints the fixture files that live outside the suite directory, relative to the repository root (for bin/remote.sh). */
const repoRoot = path.resolve(SUITE_ROOT, '..', '..');
const files = new Set<string>();
for (const m of loadAllManifests()) {
  if (m.filePath && !m.filePath.startsWith(SUITE_ROOT + path.sep)) files.add(path.relative(repoRoot, m.filePath));
}
process.stdout.write([...files].sort().map((f) => `${f}\n`).join(''));

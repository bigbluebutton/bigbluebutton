import { test } from '@playwright/test';
import { resetChecks } from '../src/checks';
import { Converter } from '../src/convert';
import { profileName } from '../src/env';

test('upload fixtures and collect conversion results', async ({}, testInfo) => {
  resetChecks(profileName());
  const collected = await new Converter().run();
  const counts: Record<string, number> = {};
  for (const f of Object.values(collected.fixtures)) counts[f.outcome] = (counts[f.outcome] ?? 0) + 1;
  await testInfo.attach('environment', { body: JSON.stringify(collected.environment, null, 2), contentType: 'application/json' });
  await testInfo.attach('outcomes', {
    body: Object.values(collected.fixtures)
      .map((f) => `${f.id}\t${f.outcome}${f.errorKey ? ` ${f.errorKey}` : ''}\t${f.pageCount} pages\t${f.timings.seconds}s`)
      .join('\n'),
    contentType: 'text/plain',
  });
  for (const w of collected.warnings) testInfo.annotations.push({ type: 'warning', description: w });
  testInfo.annotations.push({ type: 'outcomes', description: JSON.stringify(counts) });
});

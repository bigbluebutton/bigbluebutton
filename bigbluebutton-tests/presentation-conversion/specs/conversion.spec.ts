import fs from 'fs';
import path from 'path';
import { expect, test } from '@playwright/test';
import { embeddedJpegOrientations, slideKind, svgAspect } from '../src/assert/svg';
import { CheckRun } from '../src/checks';
import { CollectedFixture, describeOutcome, loadCollected, matchesExpectation } from '../src/collected';
import { loadTarget, profileName, profileWorkDir } from '../src/env';
import { findKnown } from '../src/knownFailures';
import { enabledChecks, expectationFor, goldenProfile, Manifest, pageSpec, selectedManifests } from '../src/manifest';
import { decodePng, markerOrientation, meanDifference, ORIENTATION_NAMES } from '../src/render/png';
import { renderSvg } from '../src/render/resvg';

const profile = profileName();
const target = loadTarget();
const blessing = process.env.PC_BLESS === '1';
const blessFromReference = process.env.PC_BLESS_FROM === 'reference';

function fixtureResult(m: Manifest): CollectedFixture {
  const c = loadCollected().fixtures[m.id];
  if (!c) throw new Error(`${m.id} was not collected by the convert step`);
  return c;
}

for (const m of selectedManifests(profile)) {
  const expectation = expectationFor(m, profile);
  const measureOnly = expectation === 'measure';
  const gp = goldenProfile(m, profile);
  const snapshotsAllowed = !blessing || gp === profile;
  const tolerance = (raster: boolean) => ({
    maxDiffPixelRatio: m.tolerance?.maxDiffPixelRatio ?? (raster ? 0.02 : 0.01),
    threshold: m.tolerance?.threshold ?? 0.2,
  });

  test.describe(m.id, () => {
    test('outcome', async ({}, testInfo) => {
      const c = fixtureResult(m);
      testInfo.annotations.push({ type: 'observed', description: `${describeOutcome(c)}, ${c.pageCount} pages, ${c.timings.seconds}s` });
      const run = new CheckRun(m.id, profile, 0, enabledChecks(m), measureOnly, testInfo);
      await run.run('outcome', () => {
        if (!matchesExpectation(expectation, c)) throw new Error(`expected ${expectation}, got ${describeOutcome(c)}`);
        return describeOutcome(c);
      });
      if (expectation === 'converted') {
        await run.run('pages', () => expect(c.pageCount, 'converted page count').toBe(m.pages));
      }
      if (c.outcome === 'converted' && c.pageCount > 0) {
        await run.run('served', () => {
          if (!c.served) throw new Error('served check was not performed by the convert step');
          if (!c.served.ok) throw new Error(`served slide check failed: ${c.served.detail}`);
        });
      }
      run.finish();
    });

    if (expectation !== 'converted' && expectation !== 'measure') return;

    for (let n = 1; n <= m.pages; n++) {
      test(`page ${n}`, async ({}, testInfo) => {
        const c = fixtureResult(m);
        test.skip(c.outcome !== 'converted', `not converted (${describeOutcome(c)})`);
        const page = c.pages.find((p) => p.n === n);
        test.skip(!page, `page ${n} missing (the outcome test reports the page count)`);
        const spec = pageSpec(m, n, profile);
        const abs = (rel?: string) => (rel ? path.join(profileWorkDir(), rel) : undefined);
        const svgFile = abs(page!.svg);
        const svg = svgFile ? fs.readFileSync(svgFile, 'utf8') : '';
        const kind = svg ? slideKind(svg, target.blankSvgBytes) : 'missing';
        testInfo.annotations.push({ type: 'kind', description: kind });
        const run = new CheckRun(m.id, profile, n, enabledChecks(m), measureOnly, testInfo);
        const golden = (file: string) => [m.id, gp, file];
        // A bless run must not replace the golden of a known failure, which holds the correct output, with the server's:
        // the file to bless from (the poppler render), null to leave the golden alone, undefined when nothing is known.
        const knownGolden = (check: 'text' | 'pixels' | 'thumb', reference?: string): string | null | undefined => {
          const known = blessing ? findKnown(m.id, profile, n, check) : undefined;
          if (!known) return undefined;
          const description = `${reference ? 'golden blessed from the poppler reference' : 'golden kept'}: known failure ${known.issue}`;
          testInfo.annotations.push({ type: 'bless', description });
          return reference ?? null;
        };

        await run.run('kind', () => {
          if (!svg) throw new Error('slide SVG missing');
          if (spec.kind !== 'any' && kind !== spec.kind) throw new Error(`expected a ${spec.kind} slide, got ${kind}`);
          return kind;
        });

        await run.run('aspect', () => {
          if (spec.aspect === 'none') return;
          const actual = svgAspect(svg);
          const box = page!.box;
          const expected =
            typeof spec.aspect === 'number' ? spec.aspect : box ? (box.rot % 180 === 90 ? box.h / box.w : box.w / box.h) : null;
          if (actual === null || expected === null) return;
          if (Math.abs(actual / expected - 1) > 0.01) throw new Error(`aspect ${actual.toFixed(4)} differs from ${expected.toFixed(4)} by more than 1%`);
        });

        await run.run('exif', () => {
          const bad = embeddedJpegOrientations(svg).filter((o) => o !== 1);
          if (bad.length) throw new Error(`${bad.length} embedded JPEG(s) carry EXIF Orientation ${[...new Set(bad)].join(', ')}: browsers rotate them (#26001)`);
        });

        await run.run('text', () => {
          const file = abs(page!.text);
          if (!file) throw new Error('text file missing');
          if (!snapshotsAllowed || knownGolden('text') === null) return;
          expect(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).toMatchSnapshot(golden(`page-${n}.txt`));
        });

        let rendered: ReturnType<typeof renderSvg> | undefined;
        let renderError = '';
        try {
          rendered = svg ? renderSvg(svg) : undefined;
        } catch (e: any) {
          renderError = String(e?.message ?? e);
        }

        if (spec.marker) {
          const split = spec.marker.split;
          await run.run('marker', () => {
            if (!rendered) throw new Error(`nothing rendered ${renderError}`);
            const img = { data: rendered.rgba, width: rendered.width, height: rendered.height };
            const states = Array.from({ length: split }, (_, i) =>
              markerOrientation(img, Math.floor((i * img.width) / split), Math.floor(((i + 1) * img.width) / split)),
            );
            const wrong = states.map((s, i) => ({ s, i })).filter(({ s }) => s !== 1);
            if (wrong.length)
              throw new Error(wrong.map(({ s, i }) => `${split > 1 ? `part ${i + 1}: ` : ''}${s === null ? 'marker not found' : ORIENTATION_NAMES[s]}`).join('; '));
          });
        }

        await run.run('pixels', () => {
          if (!rendered) throw new Error(`nothing rendered ${renderError}`);
          if (!snapshotsAllowed) return;
          const ref = abs(page!.ref);
          const from = blessing && blessFromReference && ref ? ref : knownGolden('pixels', ref);
          if (from === null) return;
          expect(from ? fs.readFileSync(from) : rendered.png).toMatchSnapshot(golden(`page-${n}.png`), tolerance(kind === 'raster'));
        });

        await run.run('thumb', () => {
          const file = abs(page!.thumb);
          if (!file) throw new Error('thumbnail missing');
          if (!snapshotsAllowed) return;
          const refThumb = abs(page!.refThumb);
          const from = blessing && blessFromReference && refThumb ? refThumb : knownGolden('thumb', refThumb);
          if (from === null) return;
          expect(fs.readFileSync(from ?? file)).toMatchSnapshot(golden(`thumb-${n}.png`), tolerance(true));
        });

        const ref = abs(page!.ref);
        if (rendered && ref) {
          run.info('reference', meanDifference({ data: rendered.rgba, width: rendered.width, height: rendered.height }, decodePng(ref)), 'mean RGB difference to the poppler render');
          await testInfo.attach(`page-${n}-rendered.png`, { body: rendered.png, contentType: 'image/png' });
          await testInfo.attach(`page-${n}-poppler.png`, { path: ref, contentType: 'image/png' });
        }
        run.finish();
      });
    }
  });
}

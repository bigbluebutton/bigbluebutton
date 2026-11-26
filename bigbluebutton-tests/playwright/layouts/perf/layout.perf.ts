import { Browser, BrowserContext, CDPSession, Page as PlaywrightPage, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

import { bundleNameOf } from '../../core/clientBuild';
import { DOCK_HANDLE, findHandle, newDeviceContext, openClient, recordLayoutProps, shareWebcam } from '../layoutDriver';
import { between, cdpMetrics, installPerfInstrumentation, perfSnapshot, waitForLayoutReady } from './instrumentation';

// Layout loading-time and interaction cost, per client build. Configure with:
//   PERF_VARIANTS  label=dist,label=dist  the builds to compare (required)
//   PERF_RUNS      runs per variant and CPU profile (default 1); the variants are interleaved A, B, A, B
//   PERF_CPU       CPU throttling rates, e.g. "1,4" (default "1")
//   PERF_OUT       where the raw JSON goes (default test-results/layout-perf)
// Each run uses a fresh browser context. Run with: npx playwright test -c layouts/perf/playwright.perf.config.ts

const VARIANTS = (process.env.PERF_VARIANTS ?? '')
  .split(',')
  .filter(Boolean)
  .map((entry) => {
    const [label, dist] = entry.split('=');
    return { label, dist };
  });
const RUNS = Number(process.env.PERF_RUNS ?? 1);
const CPU_RATES = (process.env.PERF_CPU ?? '1').split(',').map(Number);
const OUT = process.env.PERF_OUT ?? path.join(__dirname, '../../test-results/layout-perf');

type Variant = (typeof VARIANTS)[number];

interface Measurement {
  scenario: string;
  variant: string;
  cpu: number;
  run: number;
  metrics: Record<string, number>;
}

function save(measurement: Measurement) {
  const dir = path.join(OUT, measurement.variant);
  fs.mkdirSync(dir, { recursive: true });
  const file = `${measurement.scenario}-cpu${measurement.cpu}-run${measurement.run}.json`;
  fs.writeFileSync(path.join(dir, file), `${JSON.stringify(measurement, null, 2)}\n`);
}

async function measuredContext(browser: Browser): Promise<BrowserContext> {
  const context = await newDeviceContext(browser);
  await installPerfInstrumentation(context);
  return context;
}

async function throttle(page: PlaywrightPage, cpu: number): Promise<CDPSession> {
  const session = await page.context().newCDPSession(page);
  await session.send('Performance.enable');
  if (cpu > 1) await session.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  return session;
}

// A page whose CDP session exists from the first navigation: throttling and metrics cover the load.
async function openMeasuredPage(
  browser: Browser,
  testInfo: Parameters<typeof openClient>[1],
  variant: Variant,
  cpu: number,
  options: Parameters<typeof openClient>[2] = {},
) {
  const context = await measuredContext(browser);
  const layoutProps = await recordLayoutProps(context);
  let session: CDPSession | undefined;
  const client = await openClient(browser, testInfo, {
    ...options,
    context,
    clientDist: variant.dist,
    onPage: async (page) => {
      session = await throttle(page, cpu);
    },
  });
  return { client, session: session!, layoutProps };
}

async function coldJoin(
  browser: Browser,
  testInfo: Parameters<typeof openClient>[1],
  variant: Variant,
  cpu: number,
  meetingId?: string,
) {
  const { client, session } = await openMeasuredPage(browser, testInfo, variant, cpu, {
    fullName: 'Measured',
    meetingId,
  });
  const tReady = await waitForLayoutReady(client.page);
  const snapshot = await perfSnapshot(client.page);
  if (!snapshot.hookInjected)
    throw new Error('the React DevTools hook stub was not injected: commits cannot be counted');
  const window = between(snapshot, 0, tReady);
  return {
    client,
    metrics: {
      tReadyMs: tReady,
      commitsUntilReady: window.commits,
      tbtMs: window.blockingMs,
      longFrameMs: window.longFrameMs,
      cls: window.cls,
      ...(await cdpMetrics(session)),
    },
  };
}

async function dockResize(browser: Browser, testInfo: Parameters<typeof openClient>[1], variant: Variant, cpu: number) {
  const { client, layoutProps } = await openMeasuredPage(browser, testInfo, variant, cpu, { fullName: 'Presenter' });
  await shareWebcam(client);
  await waitForLayoutReady(client.page);
  const handle = await findHandle(client.page, DOCK_HANDLE, '#cameraDock');
  if (!handle) throw new Error('no dock handle');
  const start = { x: handle.box.x + handle.box.width / 2, y: handle.box.y + handle.box.height - 2 };
  const pushesBefore = layoutProps.length;
  const before = await perfSnapshot(client.page);
  // 300 px in 60 mouse steps (one move call: Playwright sends them back to back, about 1 s here)
  await client.page.mouse.move(start.x, start.y);
  await client.page.mouse.down();
  await client.page.mouse.move(start.x, start.y + 300, { steps: 60 });
  await client.page.mouse.up();
  const end = await perfSnapshot(client.page);
  await waitForLayoutReady(client.page);
  await client.page.waitForTimeout(1000);
  const window = between(end, before.now, end.now);
  return {
    commits: window.commits,
    longFrameMs: window.longFrameMs,
    framesDelivered: end.frames - before.frames,
    durationMs: end.now - before.now,
    setLayoutProps: layoutProps.length - pushesBefore,
  };
}

const WITHIN_BREAKPOINT = [1366, 1400, 1450, 1500, 1550, 1600, 1650, 1700, 1750, 1800];
const ACROSS_BREAKPOINT = [1366, 1150, 1366, 1150, 1366, 1150, 1366, 1150, 1366, 1150];
const IDLE_WINDOW_MS = 2000;
const STEP_WINDOW_MS = 100;

async function windowResize(
  browser: Browser,
  testInfo: Parameters<typeof openClient>[1],
  variant: Variant,
  cpu: number,
) {
  const { client } = await openMeasuredPage(browser, testInfo, variant, cpu, { fullName: 'Measured' });
  await waitForLayoutReady(client.page);
  const result: Record<string, number> = {};
  // the meeting commits on its own (clocks, subscriptions): the rate without any resize, for reference
  const idleStart = await perfSnapshot(client.page);
  await client.page.waitForTimeout(IDLE_WINDOW_MS);
  const idleEnd = await perfSnapshot(client.page);
  result.idleCommitsPerSecond = (between(idleEnd, idleStart.now, idleEnd.now).commits * 1000) / IDLE_WINDOW_MS;
  for (const [name, widths] of [
    ['within', WITHIN_BREAKPOINT],
    ['across', ACROSS_BREAKPOINT],
  ] as const) {
    // eslint-disable-next-line no-await-in-loop
    const before = await perfSnapshot(client.page);
    let lastResize = 0;
    const resizedAt: number[] = [];
    for (const width of widths) {
      // eslint-disable-next-line no-await-in-loop
      lastResize = await client.page.evaluate(() => performance.now());
      resizedAt.push(lastResize);
      // eslint-disable-next-line no-await-in-loop
      await client.page.setViewportSize({ width, height: 768 });
      // eslint-disable-next-line no-await-in-loop
      await client.page.waitForTimeout(100);
    }
    // eslint-disable-next-line no-await-in-loop
    const stable = await waitForLayoutReady(client.page);
    // eslint-disable-next-line no-await-in-loop
    const after = await perfSnapshot(client.page);
    const window = between(after, before.now, after.now);
    // commits in the 100 ms after each resize, and the time those windows add up to
    const stepCommits = resizedAt.map((at) => between(after, at, at + STEP_WINDOW_MS).commits);
    result[`${name}StepCommitsMax`] = Math.max(...stepCommits);
    result[`${name}StepCommitsTotal`] = stepCommits.reduce((sum, n) => sum + n, 0);
    result[`${name}Commits`] = window.commits;
    result[`${name}LongFrameMs`] = window.longFrameMs;
    result[`${name}StableAfterMs`] = Math.max(0, stable - lastResize);
    // eslint-disable-next-line no-await-in-loop
    await client.page.setViewportSize({ width: 1366, height: 768 });
    // eslint-disable-next-line no-await-in-loop
    await waitForLayoutReady(client.page);
  }
  return result;
}

function bundleMetrics(dist: string) {
  const main = path.join(dist, bundleNameOf(dist));
  const gz = fs.existsSync(`${main}.gz`) ? fs.statSync(`${main}.gz`).size : zlib.gzipSync(fs.readFileSync(main)).length;
  let total = 0;
  const walk = (dir: string) =>
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else total += fs.statSync(p).size;
    });
  walk(dist);
  return { mainBundleBytes: fs.statSync(main).size, mainBundleGzipBytes: gz, distBytes: total };
}

test.describe('Layout performance', { tag: '@perf' }, () => {
  test.skip(VARIANTS.length === 0, 'PERF_VARIANTS is not set');

  for (const variant of VARIANTS) {
    test(`bundle ${variant.label}`, async () => {
      save({ scenario: 'bundle', variant: variant.label, cpu: 1, run: 1, metrics: bundleMetrics(variant.dist) });
    });
  }

  for (let run = 1; run <= RUNS; run += 1) {
    for (const cpu of CPU_RATES) {
      // interleaved: every variant once per run and profile, in the same order
      for (const variant of VARIANTS) {
        const tag = `cpu${cpu} run${run} ${variant.label}`;

        test(`cold join, presentation open, no cameras: ${tag}`, async ({ browser }, testInfo) => {
          test.setTimeout(3 * 60_000);
          const { metrics } = await coldJoin(browser, testInfo, variant, cpu);
          save({ scenario: 'cold-join', variant: variant.label, cpu, run, metrics });
        });

        test(`cold join with 2 webcams in the meeting: ${tag}`, async ({ browser }, testInfo) => {
          test.setTimeout(4 * 60_000);
          // the two webcam users run unthrottled, on the same build
          const first = await openClient(browser, testInfo, { fullName: 'Cam1', clientDist: variant.dist });
          await shareWebcam(first);
          const second = await openClient(browser, testInfo, {
            fullName: 'Cam2',
            meetingId: first.meetingId,
            isModerator: false,
            clientDist: variant.dist,
          });
          await shareWebcam(second);
          const { metrics } = await coldJoin(browser, testInfo, variant, cpu, first.meetingId);
          save({ scenario: 'cold-join-2-webcams', variant: variant.label, cpu, run, metrics });
        });

        test(`dock resize, 300 px over 1 s: ${tag}`, async ({ browser }, testInfo) => {
          test.setTimeout(3 * 60_000);
          const metrics = await dockResize(browser, testInfo, variant, cpu);
          save({ scenario: 'dock-resize', variant: variant.label, cpu, run, metrics });
        });

        test(`window resize sequence: ${tag}`, async ({ browser }, testInfo) => {
          test.setTimeout(3 * 60_000);
          const metrics = await windowResize(browser, testInfo, variant, cpu);
          save({ scenario: 'window-resize', variant: variant.label, cpu, run, metrics });
        });
      }
    }
  }
});

import type { BrowserContext, CDPSession, Page as PlaywrightPage } from '@playwright/test';

import { REGIONS } from '../geometry/regions';

// In-page instrumentation for the layout perf harness, installed with addInitScript before load:
// - React commits, through a minimal __REACT_DEVTOOLS_GLOBAL_HOOK__ stub (production React calls it)
// - long animation frames (falling back to long tasks) and their blocking time
// - layout shifts (CLS)
// - the last time any visible layout region's box changed, sampled every animation frame
// - animation frames delivered

export interface PerfSnapshot {
  now: number;
  commits: number[];
  longFrames: { start: number; duration: number; blocking: number }[];
  layoutShifts: { start: number; value: number }[];
  lastRegionChange: number;
  frames: number;
  hookInjected: boolean;
}

declare global {
  interface Window {
    layoutPerf?: {
      commits: number[];
      longFrames: { start: number; duration: number; blocking: number }[];
      layoutShifts: { start: number; value: number }[];
      lastRegionChange: number;
      frames: number;
      hookInjected: boolean;
    };
  }
}

function installInPage(selectors: string[]) {
  const perf = {
    commits: [] as number[],
    longFrames: [] as { start: number; duration: number; blocking: number }[],
    layoutShifts: [] as { start: number; value: number }[],
    lastRegionChange: 0,
    frames: 0,
    hookInjected: false,
  };
  window.layoutPerf = perf;

  let rendererId = 0;
  const hookFunctions: Record<string, (...args: unknown[]) => unknown> = {
    inject() {
      perf.hookInjected = true;
      rendererId += 1;
      return rendererId;
    },
    onCommitFiberRoot() {
      perf.commits.push(performance.now());
    },
    onCommitFiberUnmount() {},
    onPostCommitFiberRoot() {},
    checkDCE() {},
  };
  const hook: Record<string, unknown> = { supportsFiber: true, isDisabled: false, renderers: new Map() };
  // The production client neutralizes the hook at startup (client/main.tsx replaces every function with a
  // no-op, after React has injected itself), so the functions are accessors that ignore those writes.
  Object.entries(hookFunctions).forEach(([name, fn]) => {
    Object.defineProperty(hook, name, { enumerable: true, get: () => fn, set: () => {} });
  });
  // the global React looks up to report its commits
  // eslint-disable-next-line no-underscore-dangle
  (window as unknown as { __REACT_DEVTOOLS_GLOBAL_HOOK__: unknown }).__REACT_DEVTOOLS_GLOBAL_HOOK__ = hook;

  const supported = PerformanceObserver.supportedEntryTypes || [];
  if (supported.includes('long-animation-frame')) {
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const { blockingDuration } = entry as PerformanceEntry & { blockingDuration: number };
        perf.longFrames.push({ start: entry.startTime, duration: entry.duration, blocking: blockingDuration });
      });
    }).observe({ type: 'long-animation-frame', buffered: true });
  } else {
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        perf.longFrames.push({
          start: entry.startTime,
          duration: entry.duration,
          blocking: Math.max(0, entry.duration - 50),
        });
      });
    }).observe({ type: 'longtask', buffered: true });
  }
  new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
      if (!shift.hadRecentInput) perf.layoutShifts.push({ start: entry.startTime, value: shift.value });
    });
  }).observe({ type: 'layout-shift', buffered: true });

  let last = '';
  const sample = () => {
    perf.frames += 1;
    const snapshot = selectors
      .map((selector) => {
        const element = document.querySelector(selector);
        if (!element) return '-';
        const r = element.getBoundingClientRect();
        return r.width > 0 && r.height > 0 ? [r.x, r.y, r.width, r.height].map(Math.round).join(',') : '0';
      })
      .join('|');
    if (snapshot !== last) {
      last = snapshot;
      perf.lastRegionChange = performance.now();
    }
    requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);
}

export async function installPerfInstrumentation(context: BrowserContext): Promise<void> {
  await context.addInitScript(installInPage, Object.values(REGIONS));
}

export async function perfSnapshot(page: PlaywrightPage): Promise<PerfSnapshot> {
  return page.evaluate(() => {
    const perf = window.layoutPerf!;
    return {
      now: performance.now(),
      commits: [...perf.commits],
      longFrames: [...perf.longFrames],
      layoutShifts: [...perf.layoutShifts],
      lastRegionChange: perf.lastRegionChange,
      frames: perf.frames,
      hookInjected: perf.hookInjected,
    };
  });
}

/** Waits until no visible region box has changed for `quietMs`, and answers the time of the last change. */
export async function waitForLayoutReady(page: PlaywrightPage, quietMs = 500, timeout = 60_000): Promise<number> {
  await page.waitForFunction(
    (quiet) => {
      const perf = window.layoutPerf;
      return !!perf && perf.lastRegionChange > 0 && performance.now() - perf.lastRegionChange >= quiet;
    },
    quietMs,
    { timeout, polling: 50 },
  );
  return page.evaluate(() => window.layoutPerf!.lastRegionChange);
}

const CDP_METRICS = ['ScriptDuration', 'LayoutDuration', 'RecalcStyleDuration', 'TaskDuration', 'JSHeapUsedSize'];

export async function cdpMetrics(session: CDPSession): Promise<Record<string, number>> {
  const { metrics } = (await session.send('Performance.getMetrics')) as { metrics: { name: string; value: number }[] };
  return Object.fromEntries(metrics.filter((m) => CDP_METRICS.includes(m.name)).map((m) => [m.name, m.value]));
}

/** Sums a window of the snapshot: commits, long-frame time and total blocking time between two instants. */
export function between(snapshot: PerfSnapshot, from: number, to: number) {
  const inWindow = (t: number) => t >= from && t <= to;
  const frames = snapshot.longFrames.filter((f) => inWindow(f.start));
  return {
    commits: snapshot.commits.filter(inWindow).length,
    longFrameMs: frames.reduce((sum, f) => sum + f.duration, 0),
    blockingMs: frames.reduce((sum, f) => sum + f.blocking, 0),
    cls: snapshot.layoutShifts.filter((s) => inWindow(s.start)).reduce((sum, s) => sum + s.value, 0),
  };
}

import { pluginForUrl } from '../plugins';
import { recordTelemetry, toEpochMs } from '../recorder';
import { InteractionEntry } from '../types';
import { annotatedAncestor } from '../scrub';

// Jank the React Profiler cannot attribute: long tasks (Chromium only) and slow interactions

// Smallest threshold the Event Timing API accepts
const MIN_EVENT_DURATION_MS = 16;

const supports = (type: string): boolean => (
  typeof PerformanceObserver !== 'undefined'
  && (PerformanceObserver.supportedEntryTypes ?? []).includes(type)
);

const dataTestOf = (target: Node | null): string => {
  if (!(target instanceof Element)) return '';
  return annotatedAncestor(target)?.getAttribute('data-test') ?? '';
};

const startLongTaskObserver = (): void => {
  if (!supports('longtask')) return;
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      recordTelemetry({
        kind: 'longtask',
        ts: toEpochMs(entry.startTime),
        duration: entry.duration,
        name: entry.name,
      });
    });
  });
  observer.observe({ type: 'longtask', buffered: true });
};

// Long Animation Frames (Chromium 123+). Not in this TypeScript lib.dom yet.
interface ScriptTiming {
  startTime: number;
  duration: number;
  sourceURL: string;
}
interface LongAnimationFrameEntry extends PerformanceEntry {
  scripts: ScriptTiming[];
}

// A long task only says "self"; a long animation frame lists the scripts that ran in it, with
// their URL. Script time from a plugin bundle is recorded against that plugin. Work the core does
// for a plugin (hook managers, extensible area renders) still counts as core.
const startPluginScriptObserver = (): void => {
  if (!supports('long-animation-frame')) return;
  const observer = new PerformanceObserver((list) => {
    (list.getEntries() as LongAnimationFrameEntry[]).forEach((frame) => {
      frame.scripts?.forEach((script) => {
        const plugin = pluginForUrl(script.sourceURL);
        if (!plugin) return;
        recordTelemetry({
          kind: 'plugin',
          ts: toEpochMs(script.startTime),
          duration: script.duration,
          plugin,
          phase: 'script',
          failed: false,
        });
      });
    });
  });
  // No buffered replay: plugins load after the observers start, and earlier frames are core only
  observer.observe({ type: 'long-animation-frame' });
};

type EventTimingEntry = PerformanceEventTiming & { interactionId?: number };

const startInteractionObserver = (): void => {
  if (!supports('event')) return;
  const observer = new PerformanceObserver((list) => {
    // One click yields pointerdown, pointerup and click with the same interactionId; keep the slowest
    const byInteraction = new Map<number, InteractionEntry>();
    (list.getEntries() as EventTimingEntry[]).forEach((entry) => {
      if (!entry.interactionId) return;
      const previous = byInteraction.get(entry.interactionId);
      if (previous && previous.duration >= entry.duration) return;
      byInteraction.set(entry.interactionId, {
        kind: 'interaction',
        ts: toEpochMs(entry.startTime),
        duration: entry.duration,
        eventType: entry.name,
        dataTest: dataTestOf(entry.target),
      });
    });
    byInteraction.forEach((entry) => recordTelemetry(entry));
  });
  // durationThreshold is part of the Event Timing spec but missing from this TypeScript lib.dom
  const init: PerformanceObserverInit & { durationThreshold: number } = {
    type: 'event',
    buffered: true,
    durationThreshold: MIN_EVENT_DURATION_MS,
  };
  observer.observe(init);
};

const startMainThreadObservers = (): void => {
  startLongTaskObserver();
  startInteractionObserver();
  startPluginScriptObserver();
};

export default startMainThreadObservers;

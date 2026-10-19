import { recordTelemetry, toEpochMs } from '../recorder';
import { InteractionEntry } from '../types';

// Jank the React Profiler cannot attribute: long tasks (Chromium only) and slow interactions

// Smallest threshold the Event Timing API accepts
const MIN_EVENT_DURATION_MS = 16;

const supports = (type: string): boolean => (
  typeof PerformanceObserver !== 'undefined'
  && (PerformanceObserver.supportedEntryTypes ?? []).includes(type)
);

const dataTestOf = (target: Node | null): string => {
  if (!(target instanceof Element)) return '';
  return target.closest('[data-test]')?.getAttribute('data-test') ?? '';
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
};

export default startMainThreadObservers;

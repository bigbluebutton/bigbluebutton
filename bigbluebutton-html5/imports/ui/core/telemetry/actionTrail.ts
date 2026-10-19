import scrubUrl from './scrub';

// Repro trail: the last user actions before a problem, to turn "cannot reproduce" into a test.
// One rule: record the identity of the control, never its content. No value, textContent or
// aria-label (it can carry user names), no typed characters, no mutation variables.

const TRAIL_SIZE = 50;

// Keys that name an action rather than type text
const NAMED_KEYS = new Set([
  'Enter', 'Escape', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown',
]);

const EDITABLE = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]';
const INTERACTIVE = 'button, a, input, select, textarea, [role]';

export interface TrailAction {
  ts: number;
  // Time since the previous action, for timing-sensitive bugs
  deltaMs: number;
  type: 'click' | 'keydown' | 'mutation';
  dataTest: string;
  // false when dataTest comes from a container above the control (e.g. a text field without its own)
  ownDataTest?: boolean;
  tag: string;
  role?: string;
  key?: string;
  operationName?: string;
  // Consecutive identical mutations (cursor moves, keep-alives) are folded into one entry
  count?: number;
}

export interface ReproTrail {
  version: 1;
  capturedAt: string;
  context: Record<string, string>;
  actions: TrailAction[];
}

let actions: TrailAction[] = [];
let lastTs = 0;
let started = false;

const push = (action: Omit<TrailAction, 'ts' | 'deltaMs'>) => {
  const ts = Date.now();
  actions.push({ ...action, ts, deltaMs: lastTs ? ts - lastTs : 0 });
  lastTs = ts;
  if (actions.length > TRAIL_SIZE) actions.shift();
};

type TargetFields = Pick<TrailAction, 'dataTest' | 'ownDataTest' | 'tag' | 'role'>;

const describeTarget = (target: EventTarget | null): TargetFields => {
  if (!(target instanceof Element)) return { dataTest: '', tag: '' };
  const interactive = target.closest(INTERACTIVE) ?? target;
  const annotated = target.closest('[data-test]');
  const role = interactive.getAttribute('role');
  return {
    dataTest: annotated?.getAttribute('data-test') ?? '',
    // Both are ancestors of the target: the data-test names the control when it sits on or inside it
    ...(annotated ? { ownDataTest: interactive.contains(annotated) } : {}),
    tag: interactive.tagName.toLowerCase(),
    ...(role ? { role } : {}),
  };
};

const keyLabel = (event: KeyboardEvent): string | null => {
  if (NAMED_KEYS.has(event.key)) return event.key;
  const editable = event.target instanceof Element && event.target.closest(EDITABLE) !== null;
  // Shortcuts outside text fields; event.code names the physical key, never a typed character
  if (!editable && (event.altKey || event.ctrlKey || event.metaKey)) {
    const modifiers = [event.ctrlKey && 'Ctrl', event.altKey && 'Alt', event.metaKey && 'Meta', event.shiftKey && 'Shift'];
    return [...modifiers.filter(Boolean), event.code].join('+');
  }
  return null;
};

export const startActionTrail = (): void => {
  if (started) return;
  started = true;
  const options = { capture: true, passive: true };
  document.addEventListener('click', (event) => push({ type: 'click', ...describeTarget(event.target) }), options);
  document.addEventListener('keydown', (event) => {
    const key = keyLabel(event);
    if (key) push({ type: 'keydown', key, ...describeTarget(event.target) });
  }, options);
};

// Called by the GraphQL timing link with the operation name only
export const recordMutationAction = (operationName: string): void => {
  if (!started) return;
  const last = actions[actions.length - 1];
  if (last?.type === 'mutation' && last.operationName === operationName) {
    last.count = (last.count ?? 1) + 1;
    return;
  }
  push({
    type: 'mutation',
    operationName,
    dataTest: '',
    tag: '',
  });
};

export const reproTrail = (): ReproTrail => ({
  version: 1,
  capturedAt: new Date().toISOString(),
  context: {
    clientBuild: String(window.meetingClientSettings?.public?.app?.html5ClientBuild ?? 'unknown'),
    sessionId: sessionStorage.getItem('clientSessionUUID') ?? 'unknown',
    page: scrubUrl(window.location.href),
    userAgent: navigator.userAgent,
    language: navigator.language,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
  },
  actions: actions.map((action) => ({ ...action })),
});

export const clearActionTrail = (): void => {
  actions = [];
  lastTs = 0;
};

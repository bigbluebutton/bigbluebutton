import { DocumentNode } from 'graphql';
import { gql } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';
import { HookEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { isTelemetryActive } from './config';
import { recordTelemetry } from './recorder';
import { addToCounter } from './store';
import { PluginPhase } from './types';

// Plugins run outside the client's React tree: each one mounts its own root with its own copy of
// React, react-dom and the SDK. The client cannot profile them from inside, so it measures them at
// the points where it hands control over: script load, the pluginApi setters, content functions,
// GraphQL operations it runs for them and the data channel. Nothing here needs a plugin change.

// Operation sent by some plugin, without a way to tell which one: SDKs older than the telemetry
// API do not say which plugin sent a custom subscription, query or mutation
export const PLUGIN_UNKNOWN = '(unknown)';
// Operation sent by more than one plugin: the client deduplicates them into one
export const PLUGIN_SHARED = '(shared)';

const PANEL_TIMEOUT_MS = 10_000;
// A plugin that adds its first UI item only on some later event (a button that appears when a poll
// starts, say) is not slow to start; without a cap its "ready" ran up to 75 min in a real meeting
const READY_MAX_MS = 60_000;
// A push whose entry never comes back (e.g. a lost update) must not pair with a later entry
const PUSH_MAX_AGE_MS = 30_000;

interface PluginRecord {
  url: string;
  directory: string;
  loadStartedAt: number;
  ready: boolean;
}

const plugins = new Map<string, PluginRecord>();
const contentOwners = new WeakMap<object, string>();
// Operation name -> plugins that sent it (empty when no event named the sender)
const pluginOperations = new Map<string, Set<string>>();
const pendingPushes = new Map<string, number[]>();
let seenEntryIds: Set<string> | null = null;

const recordPlugin = (
  plugin: string,
  phase: PluginPhase,
  startedAt: number,
  failed = false,
  name?: string,
): number => {
  const duration = performance.now() - startedAt;
  recordTelemetry({
    kind: 'plugin',
    ts: Date.now() - duration,
    duration,
    plugin,
    phase,
    failed,
    ...(name ? { name } : {}),
  });
  return duration;
};

// A duration the plugin measured through pluginApi.telemetry (name already validated)
export const recordPluginMeasure = (plugin: string, name: string, startedAt: number, failed: boolean): number => (
  recordPlugin(plugin, 'measure', startedAt, failed, name)
);

// --- Load ---

export const pluginLoadStarted = (plugin: string, url: string): void => {
  if (!isTelemetryActive()) return;
  let absolute = url;
  try {
    absolute = new URL(url, window.location.href).href;
  } catch {
    // Keep the raw value; it only feeds URL matching
  }
  plugins.set(plugin, {
    url: absolute,
    directory: absolute.slice(0, absolute.lastIndexOf('/') + 1),
    loadStartedAt: performance.now(),
    ready: false,
  });
};

export const pluginLoadFinished = (plugin: string, failed: boolean): void => {
  const record = plugins.get(plugin);
  if (!isTelemetryActive() || !record) return;
  recordPlugin(plugin, 'load', record.loadStartedAt, failed);
  if (failed) addToCounter('bbb.client.plugin.load_failures', { 'bbb.plugin.name': plugin, 'bbb.failure.source': 'client' });
};

// Plugins the server refused (manifest, SDK version) never reach the loader
export const pluginRejectedByServer = (plugin: string, source: string): void => {
  if (!isTelemetryActive()) return;
  addToCounter('bbb.client.plugin.load_failures', { 'bbb.plugin.name': plugin, 'bbb.failure.source': source || 'server' });
};

// Script URL -> plugin. Exact entry point first; then the entry point's directory, which also
// covers chunks the plugin loads later, but only when no other plugin is served from it.
export const pluginForUrl = (url: string | undefined): string | undefined => {
  if (!url || plugins.size === 0) return undefined;
  let byDirectory: string | undefined;
  let directoryMatches = 0;
  // eslint-disable-next-line no-restricted-syntax
  for (const [plugin, record] of plugins) {
    if (record.url === url) return plugin;
    if (url.startsWith(record.directory)) {
      byDirectory = plugin;
      directoryMatches += 1;
    }
  }
  return directoryMatches === 1 ? byDirectory : undefined;
};

// --- Ready and content ---

interface ItemWithContent {
  contentFunction?: unknown;
}

const noteItems = (plugin: string, items: unknown): void => {
  if (!Array.isArray(items) || items.length === 0) return;
  const record = plugins.get(plugin);
  if (record && !record.ready) {
    record.ready = true;
    if (performance.now() - record.loadStartedAt <= READY_MAX_MS) recordPlugin(plugin, 'ready', record.loadStartedAt);
  }
  items.forEach((item: ItemWithContent) => {
    if (typeof item?.contentFunction === 'function') contentOwners.set(item.contentFunction, plugin);
  });
};

type PluginApiLike = { pluginName?: string };

const instrumented = new WeakMap<object, object>();

// The extensible area managers assign pluginApi.set*Items on every render. Through this proxy each
// assigned setter is wrapped, so the first non-empty call marks the plugin ready and content
// functions are mapped to their plugin. The plugin object itself is never changed otherwise.
export const instrumentPluginApi = <T extends PluginApiLike>(pluginApi: T): T => {
  if (!isTelemetryActive() || !pluginApi.pluginName) return pluginApi;
  const cached = instrumented.get(pluginApi);
  if (cached) return cached as T;
  const plugin = pluginApi.pluginName;
  const proxy = new Proxy(pluginApi, {
    set(target, property, value) {
      const isSetter = typeof property === 'string' && /^set[A-Z]/.test(property) && typeof value === 'function';
      const stored = isSetter
        ? (items: unknown) => {
          noteItems(plugin, items);
          return value(items);
        }
        : value;
      return Reflect.set(target, property, stored);
    },
  });
  instrumented.set(pluginApi, proxy);
  return proxy;
};

// Called right before the client hands an element to a plugin content function. Measures until
// the plugin puts something in it: the time a panel, floating window or main content takes to show.
export const observePluginContent = (renderFunction: unknown, element: HTMLElement): void => {
  if (!isTelemetryActive() || typeof renderFunction !== 'function') return;
  const plugin = contentOwners.get(renderFunction);
  if (!plugin) return;
  const startedAt = performance.now();
  const observer = new MutationObserver(() => {
    observer.disconnect();
    window.clearTimeout(timeout);
    recordPlugin(plugin, 'panel', startedAt);
  });
  const timeout = window.setTimeout(() => observer.disconnect(), PANEL_TIMEOUT_MS);
  observer.observe(element, { childList: true, subtree: true });
};

// --- GraphQL ---

// Custom subscriptions, queries and mutations run by the plugins engine register their operation
// name here, so the timing link can tell plugin traffic from core traffic
export const markPluginOperation = (document: DocumentNode): void => {
  if (!isTelemetryActive()) return;
  const name = getOperationName(document);
  if (name && !pluginOperations.has(name)) pluginOperations.set(name, new Set());
};

export const pluginOfOperation = (operationName: string, fromContext: unknown): string | undefined => {
  if (typeof fromContext === 'string' && fromContext) return fromContext;
  const senders = pluginOperations.get(operationName);
  if (!senders) return undefined;
  if (senders.size === 1) return senders.values().next().value;
  return senders.size > 1 ? PLUGIN_SHARED : PLUGIN_UNKNOWN;
};

interface SenderEventDetail {
  pluginName?: unknown;
  hookArguments?: { query?: unknown; mutation?: unknown };
}

// The SDK telemetry API adds pluginName to the subscribe events of custom subscriptions, queries
// and mutations, next to the arguments the client deduplicates by. Only plugins from the meeting's
// manifests are accepted, so any script dispatching these events cannot create new label values.
const notePluginSender = (event: Event): void => {
  const { detail } = event as CustomEvent<SenderEventDetail>;
  const plugin = detail?.pluginName;
  const source = detail?.hookArguments?.query ?? detail?.hookArguments?.mutation;
  if (typeof plugin !== 'string' || typeof source !== 'string' || !plugins.has(plugin)) return;
  let name: string | null = null;
  try {
    name = getOperationName(gql(source));
  } catch {
    return;
  }
  if (!name) return;
  const senders = pluginOperations.get(name) ?? new Set<string>();
  senders.add(plugin);
  pluginOperations.set(name, senders);
};

export const startPluginOperationAttribution = (): void => {
  window.addEventListener(HookEvents.PLUGIN_SUBSCRIBED_TO_BBB_CORE, notePluginSender);
};

// Apollo context for operations the client runs on behalf of a known plugin
export const pluginOperationContext = (plugin: string) => ({ telemetry: { plugin } });

// --- Data channel ---

const channelKey = (plugin: string, channel: string, subChannel: string) => `${plugin}::${channel}::${subChannel}`;

// Only pushes to everyone: an entry for other roles or users never comes back to the sender
export const pluginDataChannelPushed = (plugin: string, channel: string, subChannel: string): void => {
  if (!isTelemetryActive()) return;
  const key = channelKey(plugin, channel, subChannel);
  const now = performance.now();
  const queue = (pendingPushes.get(key) ?? []).filter((sentAt) => now - sentAt < PUSH_MAX_AGE_MS);
  queue.push(now);
  pendingPushes.set(key, queue);
};

interface DataChannelEntryLike {
  entryId: string;
  pluginName: string;
  channelName: string;
  subChannelName: string;
  createdBy: string;
}

// Called with every data channel snapshot (both subscriptions loaded). New entries are counted per
// plugin; the sender's own new entries close the push -> entry round trip.
export const pluginDataChannelEntries = (entries: DataChannelEntryLike[], userId: string): void => {
  if (!isTelemetryActive()) return;
  const firstSnapshot = seenEntryIds === null;
  const seen = seenEntryIds ?? new Set<string>();
  const now = performance.now();
  entries.forEach((entry) => {
    if (seen.has(entry.entryId)) return;
    seen.add(entry.entryId);
    if (firstSnapshot) return;
    addToCounter('bbb.client.plugin.data_channel.entries', { 'bbb.plugin.name': entry.pluginName });
    if (entry.createdBy !== userId) return;
    const queue = pendingPushes.get(channelKey(entry.pluginName, entry.channelName, entry.subChannelName));
    while (queue?.length && now - queue[0] >= PUSH_MAX_AGE_MS) queue.shift();
    const sentAt = queue?.shift();
    if (sentAt !== undefined) recordPlugin(entry.pluginName, 'data-channel', sentAt);
  });
  seenEntryIds = seen;
};

// --- Usage and errors ---

const USAGE_EVENTS: Record<string, string> = { plg_started: 'started', plg_stopped: 'stopped' };

// Extra stream on each plugin logger: the mandatory plg_started / plg_stopped usage logs become
// a counter. Only the logCode is read, never the message.
export const pluginUsageStream = (plugin: string) => ({
  level: 'info',
  stream: {
    write: (record: { logCode?: unknown }) => {
      const event = typeof record?.logCode === 'string' ? USAGE_EVENTS[record.logCode] : undefined;
      if (event) addToCounter('bbb.client.plugin.activations', { 'bbb.plugin.name': plugin, 'bbb.plugin.event': event });
    },
  },
});

// Uncaught errors thrown from a plugin script. Scripts from another origin without CORS reach
// window as "Script error." with no file name, so those stay unattributed.
export const pluginOfError = (event: ErrorEvent): string | undefined => pluginForUrl(event.filename);

export const countPluginError = (plugin: string): void => {
  if (!isTelemetryActive()) return;
  addToCounter('bbb.client.plugin.errors', { 'bbb.plugin.name': plugin });
};

export const startPluginErrorCounter = (): void => {
  window.addEventListener('error', (event) => {
    const plugin = pluginOfError(event);
    if (plugin) countPluginError(plugin);
  });
};

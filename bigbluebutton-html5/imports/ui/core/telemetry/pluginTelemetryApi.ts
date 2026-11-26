import { recordPluginAction } from './actionTrail';
import { isTelemetryActive } from './config';
import { reportIncident } from './incident';
import { countPluginError, recordPluginMeasure } from './plugins';
import { addToCounter, setGauge } from './store';

// What the client injects into pluginApi.telemetry. The SDK's pluginTelemetry (SDK
// src/telemetry) reads it and falls back to a no-op without it; keep both shapes in sync.
// Plugins only reach the client through these calls, and every name they pass becomes a metric
// attribute, so names are validated and bounded per plugin here.

export interface PluginTelemetrySpan {
  end: (options?: { failed?: boolean }) => number;
}

export interface PluginTelemetryApi {
  isEnabled: () => boolean;
  start: (name: string) => PluginTelemetrySpan;
  gauge: (name: string, value: number) => void;
  mark: (action: string) => void;
  reportError: (error: unknown) => void;
}

const NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_.-]{0,39}$/;
// Distinct measure + gauge names per plugin: each measure name is up to two series (ok, failed)
const MAX_NAMES_PER_PLUGIN = 8;
// Marks go to the repro trail (50 actions); a chatty plugin must not push the user's actions out
const MIN_MARK_INTERVAL_MS = 100;
const DROPPED_METRIC = 'bbb.client.plugin.telemetry.dropped';
const GAUGE_METRIC = 'bbb.client.plugin.gauge';

const NOOP_SPAN: PluginTelemetrySpan = { end: () => 0 };

type DropReason = 'invalid_name' | 'too_many_names' | 'invalid_value' | 'rate';

export const createPluginTelemetry = (plugin: string): PluginTelemetryApi => {
  const names = new Set<string>();
  let lastMarkAt = -Infinity;

  const drop = (reason: DropReason) => {
    addToCounter(DROPPED_METRIC, { 'bbb.plugin.name': plugin, 'bbb.drop.reason': reason });
  };

  const validName = (name: unknown): name is string => {
    if (typeof name === 'string' && NAME_PATTERN.test(name)) return true;
    drop('invalid_name');
    return false;
  };

  // Measures and gauges: the name becomes a series, so it also counts against the plugin's names
  const acceptSeriesName = (name: unknown): name is string => {
    if (!validName(name)) return false;
    if (names.has(name)) return true;
    if (names.size >= MAX_NAMES_PER_PLUGIN) {
      drop('too_many_names');
      return false;
    }
    names.add(name);
    return true;
  };

  return {
    isEnabled: isTelemetryActive,
    start: (name) => {
      if (!isTelemetryActive() || !acceptSeriesName(name)) return NOOP_SPAN;
      const startedAt = performance.now();
      let ended = false;
      return {
        end: (options) => {
          if (ended || !isTelemetryActive()) return 0;
          ended = true;
          return recordPluginMeasure(plugin, name, startedAt, !!options?.failed);
        },
      };
    },
    gauge: (name, value) => {
      if (!isTelemetryActive()) return;
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        drop('invalid_value');
        return;
      }
      if (!acceptSeriesName(name)) return;
      setGauge(GAUGE_METRIC, '{value}', { 'bbb.plugin.name': plugin, 'bbb.plugin.gauge': name }, value);
    },
    mark: (action) => {
      if (!isTelemetryActive() || !validName(action)) return;
      const now = performance.now();
      if (now - lastMarkAt < MIN_MARK_INTERVAL_MS) {
        drop('rate');
        return;
      }
      lastMarkAt = now;
      recordPluginAction(plugin, action);
    },
    reportError: (error) => {
      if (!isTelemetryActive()) return;
      countPluginError(plugin);
      reportIncident('plugin_error', error, plugin);
    },
  };
};

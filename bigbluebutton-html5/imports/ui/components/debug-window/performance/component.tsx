import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import logger from '/imports/startup/client/logger';
import {
  clearTelemetry,
  reproTrail,
  telemetryDump,
  TelemetryDump,
} from '/imports/ui/core/telemetry';
import { TrailAction } from '/imports/ui/core/telemetry/actionTrail';
import {
  GraphqlEntry,
  RenderEntry,
  RequestEntry,
  TELEMETRY_KINDS,
  TelemetryEntry,
} from '/imports/ui/core/telemetry/types';
import Styled from './styles';

const REFRESH_INTERVAL_MS = 2000;
const TOP_N = 10;
const RECENT_ACTIONS = 10;
const REQUEST_METRIC = 'bbb.client.request.duration';
const PLUGIN_METRIC = 'bbb.client.plugin.duration';
const PLUGIN_ERRORS_METRIC = 'bbb.client.plugin.errors';
const GRAPHQL_METRIC_PREFIX = 'bbb.client.graphql.';
const NO_VALUE = '–';

const intlMessages = defineMessages({
  title: { id: 'app.debugWindow.performance.title', description: 'Performance section title' },
  summary: { id: 'app.debugWindow.performance.summary', description: 'Caption of the per-kind summary table' },
  protocols: { id: 'app.debugWindow.performance.protocols', description: 'Caption of the requests-by-protocol table' },
  slowComponents: { id: 'app.debugWindow.performance.slowComponents', description: 'Caption of the slow renders table' },
  slowRequests: { id: 'app.debugWindow.performance.slowRequests', description: 'Caption of the slow requests table' },
  slowGraphql: { id: 'app.debugWindow.performance.slowGraphql', description: 'Caption of the slow GraphQL table' },
  plugins: { id: 'app.debugWindow.performance.plugins', description: 'Caption of the per-plugin table' },
  plugin: { id: 'app.debugWindow.performance.column.plugin', description: 'Column: plugin name' },
  load: { id: 'app.debugWindow.performance.column.load', description: 'Column: plugin script load time' },
  ready: { id: 'app.debugWindow.performance.column.ready', description: 'Column: time until the plugin showed its first UI item' },
  panel: { id: 'app.debugWindow.performance.column.panel', description: 'Column: slowest plugin panel opening' },
  script: { id: 'app.debugWindow.performance.column.script', description: 'Column: plugin script time in long frames' },
  graphql: { id: 'app.debugWindow.performance.column.graphql', description: 'Column: GraphQL operations sent for the plugin' },
  dataChannel: { id: 'app.debugWindow.performance.column.dataChannel', description: 'Column: average data channel round trip' },
  errors: { id: 'app.debugWindow.performance.column.errors', description: 'Column: uncaught errors from the plugin script' },
  measures: { id: 'app.debugWindow.performance.column.measures', description: 'Column: durations the plugin measured itself' },
  refreshLabel: { id: 'app.debugWindow.performance.refreshLabel', description: 'Button that reloads the tables' },
  copyLabel: { id: 'app.debugWindow.performance.copyLabel', description: 'Button that copies all data as JSON' },
  clearLabel: { id: 'app.debugWindow.performance.clearLabel', description: 'Button that discards the measurements' },
  copyTrailLabel: { id: 'app.debugWindow.performance.copyTrailLabel', description: 'Button that copies the repro trail' },
  recentActions: { id: 'app.debugWindow.performance.recentActions', description: 'Caption of the recent actions table' },
  action: { id: 'app.debugWindow.performance.column.action', description: 'Column: click, key or mutation' },
  control: { id: 'app.debugWindow.performance.column.control', description: 'Column: data-test of the control' },
  detail: { id: 'app.debugWindow.performance.column.detail', description: 'Column: key or operation name' },
  delta: { id: 'app.debugWindow.performance.column.delta', description: 'Column: ms since the previous action' },
  empty: { id: 'app.debugWindow.performance.empty', description: 'Shown when a table has no rows' },
  kind: { id: 'app.debugWindow.performance.column.kind', description: 'Column: measurement kind' },
  count: { id: 'app.debugWindow.performance.column.count', description: 'Column: number of measurements' },
  max: { id: 'app.debugWindow.performance.column.max', description: 'Column: slowest measurement' },
  average: { id: 'app.debugWindow.performance.column.average', description: 'Column: average duration' },
  name: { id: 'app.debugWindow.performance.column.name', description: 'Column: component, URL or operation' },
  phase: { id: 'app.debugWindow.performance.column.phase', description: 'Column: render or GraphQL phase' },
  protocol: { id: 'app.debugWindow.performance.column.protocol', description: 'Column: HTTP protocol' },
  ttfb: { id: 'app.debugWindow.performance.column.ttfb', description: 'Column: time to first byte' },
  duration: { id: 'app.debugWindow.performance.column.duration', description: 'Column: duration in ms' },
});

interface Column {
  id: string;
  label: string;
}

interface Row {
  key: string;
  cells: Record<string, string | number>;
}

interface DataTableProps {
  caption: string;
  dataTest: string;
  columns: Column[];
  rows: Row[];
  emptyLabel: string;
}

const DataTable: React.FC<DataTableProps> = ({
  caption,
  dataTest,
  columns,
  rows,
  emptyLabel,
}) => (
  <Styled.DataTable data-test={dataTest}>
    <caption>{caption}</caption>
    <thead>
      <tr>
        {columns.map((column) => <th key={column.id} scope="col">{column.label}</th>)}
      </tr>
    </thead>
    <tbody>
      {rows.length === 0 ? (
        <tr>
          <td colSpan={columns.length}>{emptyLabel}</td>
        </tr>
      ) : rows.map((row) => (
        <tr key={row.key}>
          {columns.map((column) => <td key={column.id}>{row.cells[column.id]}</td>)}
        </tr>
      ))}
    </tbody>
  </Styled.DataTable>
);

const ms = (value: number) => Math.round(value);

const entryKey = (entry: TelemetryEntry, name: string) => `${entry.ts}-${name}-${entry.duration}`;

const isRender = (entry: TelemetryEntry): entry is RenderEntry => entry.kind === 'render';
const isRequest = (entry: TelemetryEntry): entry is RequestEntry => entry.kind === 'request';
const isGraphql = (entry: TelemetryEntry): entry is GraphqlEntry => entry.kind === 'graphql';

const protocolLabel = (attributes: Record<string, string>) => {
  const version = attributes['network.protocol.version'];
  return version ? `HTTP/${version}` : attributes['network.protocol.name'];
};

// Requests grouped by protocol: the h2 vs http/1.1 question, answered per session
const protocolRows = (dump: TelemetryDump): Row[] => {
  const totals = new Map<string, { count: number; sum: number }>();
  dump.series.filter((item) => item.metric === REQUEST_METRIC).forEach((item) => {
    const label = protocolLabel(item.attributes);
    const total = totals.get(label) ?? { count: 0, sum: 0 };
    totals.set(label, { count: total.count + item.count, sum: total.sum + item.sum });
  });
  return Array.from(totals.entries()).map(([label, total]) => ({
    key: label,
    cells: { protocol: label, count: total.count, average: ms(total.sum / total.count) },
  }));
};

interface PluginTotals {
  load?: number;
  loadFailed?: boolean;
  ready?: number;
  panel?: number;
  script: number;
  graphql: number;
  dataChannelSum: number;
  dataChannelCount: number;
  measures: number;
  errors: number;
}

// One row per plugin, from the metric series and counters already in the dump
const pluginRows = (dump: TelemetryDump): Row[] => {
  const totals = new Map<string, PluginTotals>();
  const totalsOf = (plugin: string): PluginTotals => {
    const existing = totals.get(plugin);
    if (existing) return existing;
    const created: PluginTotals = {
      script: 0, graphql: 0, dataChannelSum: 0, dataChannelCount: 0, measures: 0, errors: 0,
    };
    totals.set(plugin, created);
    return created;
  };

  dump.series.forEach((item) => {
    const plugin = item.attributes['bbb.plugin.name'];
    if (!plugin) return;
    const total = totalsOf(plugin);
    if (item.metric.startsWith(GRAPHQL_METRIC_PREFIX)) {
      total.graphql += item.count;
      return;
    }
    if (item.metric !== PLUGIN_METRIC) return;
    switch (item.attributes['bbb.plugin.phase']) {
      case 'load':
        total.load = Math.max(total.load ?? 0, item.max);
        total.loadFailed = total.loadFailed || item.attributes['bbb.plugin.failed'] === 'true';
        break;
      case 'ready': total.ready = Math.max(total.ready ?? 0, item.max); break;
      case 'panel': total.panel = Math.max(total.panel ?? 0, item.max); break;
      case 'script': total.script += item.sum; break;
      case 'data-channel':
        total.dataChannelSum += item.sum;
        total.dataChannelCount += item.count;
        break;
      case 'measure': total.measures += item.count; break;
      default: break;
    }
  });
  dump.counters.filter((item) => item.metric === PLUGIN_ERRORS_METRIC).forEach((item) => {
    const plugin = item.attributes['bbb.plugin.name'];
    if (plugin) totalsOf(plugin).errors += item.value;
  });

  const optional = (value?: number) => (value === undefined ? NO_VALUE : ms(value));
  return Array.from(totals.entries()).map(([plugin, total]) => ({
    key: plugin,
    cells: {
      plugin,
      load: `${optional(total.load)}${total.loadFailed ? ' ✗' : ''}`,
      ready: optional(total.ready),
      panel: optional(total.panel),
      script: ms(total.script),
      graphql: total.graphql,
      dataChannel: total.dataChannelCount ? ms(total.dataChannelSum / total.dataChannelCount) : NO_VALUE,
      measures: total.measures,
      errors: total.errors,
    },
  }));
};

const actionRow = (action: TrailAction): Row => ({
  key: `${action.ts}-${action.type}-${action.plugin ?? action.dataTest}-${action.operationName ?? action.key ?? action.action ?? ''}`,
  cells: {
    action: action.type,
    control: action.plugin ?? (action.dataTest || action.tag),
    detail: `${action.key ?? action.operationName ?? action.action ?? ''}${action.count ? ` ×${action.count}` : ''}`,
    delta: action.deltaMs,
  },
});

const PerformancePanel: React.FC = () => {
  const intl = useIntl();
  const [dump, setDump] = useState<TelemetryDump>(telemetryDump);
  const [actions, setActions] = useState<TrailAction[]>(() => reproTrail().actions);
  const refresh = () => {
    setDump(telemetryDump());
    setActions(reproTrail().actions);
  };

  useEffect(() => {
    const interval = window.setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, []);

  const copyJson = (data: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).catch((error: Error) => {
      logger.warn({
        logCode: 'telemetry_copy_error',
        extraInfo: { errorMessage: error.message },
      }, 'Could not copy client telemetry to the clipboard');
    });
  };
  const copy = () => copyJson(telemetryDump());
  const copyTrail = () => copyJson(reproTrail());

  const clear = () => {
    clearTelemetry();
    refresh();
  };

  const label = (message: keyof typeof intlMessages) => intl.formatMessage(intlMessages[message]);
  // Column ids double as message keys, except the percentile ones, which read the same in every locale
  const column = (id: keyof typeof intlMessages): Column => ({ id, label: label(id) });
  const percentile = (id: 'p50' | 'p95'): Column => ({ id, label: id });
  const emptyLabel = label('empty');

  const summaryRows: Row[] = TELEMETRY_KINDS.map((kind) => ({
    key: kind,
    cells: { kind, ...dump.stats[kind] },
  }));

  const renderRows: Row[] = dump.slowest.render.filter(isRender).slice(0, TOP_N).map((entry) => ({
    key: entryKey(entry, entry.id),
    cells: { name: entry.id, phase: entry.phase, duration: ms(entry.duration) },
  }));

  const requestRows: Row[] = dump.slowest.request.filter(isRequest).slice(0, TOP_N).map((entry) => ({
    key: entryKey(entry, entry.path),
    cells: {
      name: entry.path,
      protocol: entry.protocol || '?',
      ttfb: ms(entry.ttfb),
      duration: ms(entry.duration),
    },
  }));

  const graphqlRows: Row[] = dump.slowest.graphql.filter(isGraphql).slice(0, TOP_N).map((entry) => ({
    key: entryKey(entry, entry.operationName),
    cells: {
      name: entry.plugin ? `[${entry.plugin}] ${entry.operationName}` : entry.operationName,
      phase: `${entry.operationType} · ${entry.phase}${entry.failed ? ' ✗' : ''}`,
      duration: ms(entry.duration),
    },
  }));

  return (
    <Styled.Section data-test="debugWindowPerformance" aria-labelledby="debugWindowPerformanceTitle">
      <Styled.SectionHeader>
        <Styled.SectionTitle id="debugWindowPerformanceTitle">{label('title')}</Styled.SectionTitle>
        <Styled.Actions>
          <button type="button" data-test="debugWindowPerformanceRefresh" onClick={refresh}>
            {label('refreshLabel')}
          </button>
          <button type="button" data-test="debugWindowPerformanceCopy" onClick={copy}>
            {label('copyLabel')}
          </button>
          <button type="button" data-test="debugWindowPerformanceCopyTrail" onClick={copyTrail}>
            {label('copyTrailLabel')}
          </button>
          <button type="button" data-test="debugWindowPerformanceClear" onClick={clear}>
            {label('clearLabel')}
          </button>
        </Styled.Actions>
      </Styled.SectionHeader>
      <Styled.Scroll>
        <DataTable
          caption={label('summary')}
          dataTest="debugWindowPerformanceSummary"
          columns={[column('kind'), column('count'), percentile('p50'), percentile('p95'), column('max')]}
          rows={summaryRows}
          emptyLabel={emptyLabel}
        />
        <DataTable
          caption={label('protocols')}
          dataTest="debugWindowPerformanceProtocols"
          columns={[column('protocol'), column('count'), column('average')]}
          rows={protocolRows(dump)}
          emptyLabel={emptyLabel}
        />
        <DataTable
          caption={label('slowComponents')}
          dataTest="debugWindowSlowComponents"
          columns={[column('name'), column('phase'), column('duration')]}
          rows={renderRows}
          emptyLabel={emptyLabel}
        />
        <DataTable
          caption={label('slowRequests')}
          dataTest="debugWindowSlowRequests"
          columns={[column('name'), column('protocol'), column('ttfb'), column('duration')]}
          rows={requestRows}
          emptyLabel={emptyLabel}
        />
        <DataTable
          caption={label('slowGraphql')}
          dataTest="debugWindowSlowGraphql"
          columns={[column('name'), column('phase'), column('duration')]}
          rows={graphqlRows}
          emptyLabel={emptyLabel}
        />
        <DataTable
          caption={label('plugins')}
          dataTest="debugWindowPlugins"
          columns={[
            column('plugin'), column('load'), column('ready'), column('panel'),
            column('script'), column('graphql'), column('dataChannel'), column('measures'), column('errors'),
          ]}
          rows={pluginRows(dump)}
          emptyLabel={emptyLabel}
        />
        <DataTable
          caption={label('recentActions')}
          dataTest="debugWindowRecentActions"
          columns={[column('action'), column('control'), column('detail'), column('delta')]}
          rows={actions.slice(-RECENT_ACTIONS).reverse().map(actionRow)}
          emptyLabel={emptyLabel}
        />
      </Styled.Scroll>
    </Styled.Section>
  );
};

export default PerformancePanel;

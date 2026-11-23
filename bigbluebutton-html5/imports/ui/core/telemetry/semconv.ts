import { SeriesAttributes, TelemetryEntry } from './types';

// OpenTelemetry names: dots and a declared unit, so the collector turns
// bbb.client.render.duration into bbb_client_render_duration_milliseconds for Prometheus.
// Attributes must stay bounded (subtree, operation, protocol, control), never URLs or ids.

// nextHopProtocol -> network.protocol.name / network.protocol.version
const protocolAttributes = (protocol: string): SeriesAttributes => {
  switch (protocol) {
    case 'h2': return { 'network.protocol.name': 'http', 'network.protocol.version': '2' };
    case 'h3': return { 'network.protocol.name': 'http', 'network.protocol.version': '3' };
    case 'http/1.1': return { 'network.protocol.name': 'http', 'network.protocol.version': '1.1' };
    case 'http/1.0': return { 'network.protocol.name': 'http', 'network.protocol.version': '1.0' };
    case '': return { 'network.protocol.name': 'unknown' };
    default: return { 'network.protocol.name': protocol };
  }
};

export interface SeriesKey {
  metric: string;
  attributes: SeriesAttributes;
}

// Plugin names come from the meeting's plugin manifests, so they stay bounded
const pluginAttributes = (plugin?: string): SeriesAttributes => (plugin ? { 'bbb.plugin.name': plugin } : {});

const seriesFor = (entry: TelemetryEntry): SeriesKey => {
  switch (entry.kind) {
    case 'render':
      return {
        metric: 'bbb.client.render.duration',
        attributes: { 'bbb.subtree.id': entry.id, 'bbb.render.phase': entry.phase },
      };
    case 'request':
      return {
        metric: 'bbb.client.request.duration',
        attributes: { 'bbb.request.initiator_type': entry.initiatorType, ...protocolAttributes(entry.protocol) },
      };
    case 'graphql':
      if (entry.operationType === 'websocket') {
        return {
          metric: 'bbb.client.websocket.connect.duration',
          attributes: { 'bbb.connect.phase': entry.phase },
        };
      }
      if (entry.phase === 'first-data') {
        return {
          metric: 'bbb.client.graphql.first_data.duration',
          attributes: {
            'bbb.operation.name': entry.operationName,
            'bbb.operation.failed': String(entry.failed),
            ...pluginAttributes(entry.plugin),
          },
        };
      }
      return {
        metric: 'bbb.client.graphql.round_trip.duration',
        attributes: {
          'bbb.operation.name': entry.operationName,
          'bbb.operation.type': entry.operationType,
          'bbb.operation.failed': String(entry.failed),
          ...pluginAttributes(entry.plugin),
        },
      };
    case 'longtask':
      return { metric: 'bbb.client.long_task.duration', attributes: { 'bbb.long_task.attribution': entry.name } };
    case 'interaction':
      return {
        metric: 'bbb.client.interaction.duration',
        attributes: { 'bbb.event.type': entry.eventType, 'bbb.action.data_test': entry.dataTest },
      };
    case 'plugin':
      return {
        metric: 'bbb.client.plugin.duration',
        attributes: {
          ...pluginAttributes(entry.plugin),
          'bbb.plugin.phase': entry.phase,
          'bbb.plugin.failed': String(entry.failed),
          ...(entry.name ? { 'bbb.plugin.measure': entry.name } : {}),
        },
      };
    default:
      return { metric: 'bbb.client.unknown.duration', attributes: {} };
  }
};

export default seriesFor;

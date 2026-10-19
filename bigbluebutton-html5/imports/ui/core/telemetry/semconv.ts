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
          attributes: { 'bbb.operation.name': entry.operationName, 'bbb.operation.failed': String(entry.failed) },
        };
      }
      return {
        metric: 'bbb.client.graphql.round_trip.duration',
        attributes: {
          'bbb.operation.name': entry.operationName,
          'bbb.operation.type': entry.operationType,
          'bbb.operation.failed': String(entry.failed),
        },
      };
    case 'longtask':
      return { metric: 'bbb.client.long_task.duration', attributes: { 'bbb.long_task.attribution': entry.name } };
    case 'interaction':
      return {
        metric: 'bbb.client.interaction.duration',
        attributes: { 'bbb.event.type': entry.eventType, 'bbb.action.data_test': entry.dataTest },
      };
    default:
      return { metric: 'bbb.client.unknown.duration', attributes: {} };
  }
};

export default seriesFor;

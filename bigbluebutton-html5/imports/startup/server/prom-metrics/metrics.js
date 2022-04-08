const {
  Counter,
  Gauge,
  Histogram
} = require('prom-client');

const METRICS_PREFIX = 'html5_'
const METRIC_NAMES = {
  METEOR_METHODS: 'meteorMethods',
  METEOR_ERRORS_TOTAL: 'meteorErrorsTotal',
  METEOR_RTT: 'meteorRtt',
  REDIS_MESSAGE_QUEUE: 'redisMessageQueue',
  REDIS_PAYLOAD_SIZE: 'redisPayloadSize',
  REDIS_PROCESSING_TIME: 'redisProcessingTime'
}

let METRICS;
const buildMetrics = () => {
  if (METRICS == null) {
    METRICS = {
      [METRIC_NAMES.METEOR_METHODS]: new Counter({
        name: `${METRICS_PREFIX}meteor_methods`,
        help: 'Total number of meteor methods processed in html5',
        labelNames: ['methodName', 'role', 'instanceId'],
      }),

      [METRIC_NAMES.METEOR_ERRORS_TOTAL]: new Counter({
        name: `${METRICS_PREFIX}meteor_errors_total`,
        help: 'Total number of errors logs in meteor',
        labelNames: ['errorMessage', 'role', 'instanceId'],
      }),

      [METRIC_NAMES.METEOR_RTT]: new Histogram({
        name: `${METRICS_PREFIX}meteor_rtt_seconds`,
        help: 'Round-trip time of meteor client-server connections in seconds',
        buckets: [0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.75, 1, 1.5, 2, 2.5, 5],
        labelNames: ['role', 'instanceId'],
      }),

      [METRIC_NAMES.REDIS_MESSAGE_QUEUE]: new Gauge({
        name: `${METRICS_PREFIX}redis_message_queue`,
        help: 'Message queue size in redis',
        labelNames: ['meetingId', 'role', 'instanceId'],
      }),

      [METRIC_NAMES.REDIS_PAYLOAD_SIZE]: new Histogram({
        name: `${METRICS_PREFIX}redis_payload_size`,
        help: 'Redis events payload size',
        labelNames: ['eventName', 'role', 'instanceId'],
      }),

      [METRIC_NAMES.REDIS_PROCESSING_TIME]: new Histogram({
        name: `${METRICS_PREFIX}redis_processing_time`,
        help: 'Redis events processing time in milliseconds',
        labelNames: ['eventName', 'role', 'instanceId'],
      }),
    }
  }

  return METRICS;
};

export {
  METRICS_PREFIX,
  METRIC_NAMES,
  METRICS,
  buildMetrics,
};

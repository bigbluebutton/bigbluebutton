const {
  Counter,
  Gauge,
  Histogram
} = require('prom-client');

const METRICS_PREFIX = 'html5_'
const METRIC_NAMES = {
  METEOR_METHODS: 'meteorMethods',
  METEOR_ERRORS_TOTAL: 'meteorErrorsTotal',
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

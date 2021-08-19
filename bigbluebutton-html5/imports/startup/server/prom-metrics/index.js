const Agent = require('./promAgent.js');

const METRICS_PREFIX = "html5_"

const {
    enabled: METRICS_ENABLED,
    host: METRICS_HOST,
    port: METRICS_PORT,
    path: METRICS_PATH,
    collectDefaultMetrics: COLLECT_DEFAULT_METRICS,
  } = Meteor.settings.private.prometheus
      ? Meteor.settings.private.prometheus
      : { enabled: false };

const PrometheusAgent = new Agent(METRICS_HOST, METRICS_PORT, {
  path: METRICS_PATH,
  prefix: METRICS_PREFIX,
  collectDefaultMetrics: COLLECT_DEFAULT_METRICS,
});

if (METRICS_ENABLED) {
  PrometheusAgent.start();
}

module.exports = {
  METRICS_PREFIX,
  Agent,
  PrometheusAgent,
};
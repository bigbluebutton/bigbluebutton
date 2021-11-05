import Agent from './promAgent.js';

import {
  METRICS_PREFIX,
  METRIC_NAMES,
  buildMetrics
} from './metrics.js';

const {
    enabled: METRICS_ENABLED,
    path: METRICS_PATH,
    collectDefaultMetrics: COLLECT_DEFAULT_METRICS,
  } = Meteor.settings.private.prometheus
      ? Meteor.settings.private.prometheus
      : { enabled: false };

const PrometheusAgent = new Agent({
  path: METRICS_PATH,
  prefix: METRICS_PREFIX,
  collectDefaultMetrics: COLLECT_DEFAULT_METRICS,
  role: process.env.BBB_HTML5_ROLE,
  instanceId: parseInt(process.env.INSTANCE_ID, 10) || 1,
});

if (METRICS_ENABLED) {
  PrometheusAgent.injectMetrics(buildMetrics());
  PrometheusAgent.start();
}

export {
  METRIC_NAMES,
  METRICS_PREFIX,
  Agent,
  PrometheusAgent,
};

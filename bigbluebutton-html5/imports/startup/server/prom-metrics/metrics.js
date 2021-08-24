const {
  Counter,
} = require('prom-client');

const METRICS_PREFIX = 'html5_'
const METRIC_NAMES = {
  METEOR_METHODS: 'meteorMethods',
}

let METRICS;
const buildMetrics = () => {
  if (METRICS == null) {
    METRICS = {
      [METRIC_NAMES.METEOR_METHODS]: new Counter({
        name: `${METRICS_PREFIX}meteor_methods`,
        help: 'Total number of meteor methods processed in html5',
        labelNames: ['methodName'],
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

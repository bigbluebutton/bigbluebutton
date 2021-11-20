const {
  Counter,
} = require('prom-client');

const METRICS_PREFIX = 'html5_'
const METRIC_NAMES = {
  METEOR_METHODS: 'meteorMethods',
}

const buildFrontendMetrics = () => {
  return {
    [METRIC_NAMES.METEOR_METHODS]: new Counter({
      name: `${METRICS_PREFIX}meteor_methods`,
      help: 'Total number of meteor methods processed in html5',
      labelNames: ['methodName', 'role', 'instanceId'],
    }),
  }
}

const buildBackendMetrics = () => {
  // TODO add relevant backend metrics
  return {}
}  

let METRICS;
const buildMetrics = () => {
  if (METRICS == null) {
    const isFrontend = (!process.env.BBB_HTML5_ROLE || process.env.BBB_HTML5_ROLE === 'frontend');
    const isBackend = (!process.env.BBB_HTML5_ROLE || process.env.BBB_HTML5_ROLE === 'backend');
    if (isFrontend) METRICS = buildFrontendMetrics();
    if (isBackend) METRICS = { ...METRICS, ...buildBackendMetrics()} 
  }

  return METRICS;
};

export {
  METRICS_PREFIX,
  METRIC_NAMES,
  METRICS,
  buildMetrics,
};

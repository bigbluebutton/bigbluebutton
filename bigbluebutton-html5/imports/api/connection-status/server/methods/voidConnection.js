import { PrometheusAgent, METRIC_NAMES } from '/imports/startup/server/prom-metrics/index.js'

// Round-trip time helper
export default function voidConnection(previousRtt) {
  if (previousRtt) {
    PrometheusAgent.observe(METRIC_NAMES.METEOR_RTT, previousRtt/1000);
  }
  return 0;
}

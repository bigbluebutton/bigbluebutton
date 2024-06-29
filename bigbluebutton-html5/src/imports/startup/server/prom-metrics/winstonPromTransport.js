const Transport = require('winston-transport');
import { PrometheusAgent, METRIC_NAMES } from './index.js'

module.exports = class WinstonPromTransport extends Transport {
  constructor(opts) {
    super(opts);
    
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    PrometheusAgent.increment(METRIC_NAMES.METEOR_ERRORS_TOTAL, { errorMessage: info.message });

    callback();
  }
};

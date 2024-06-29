import {
  register,
  collectDefaultMetrics,
} from 'prom-client';

import Logger from '../logger';
const LOG_PREFIX = '[prom-scrape-agt]';

class PrometheusScrapeAgent {
  constructor(options) {
    this.metrics = {};
    this.started = false;

    this.path = options.path || '/metrics';
    this.collectDefaultMetrics = options.collectDefaultMetrics || false;
    this.metricsPrefix = options.prefix || '';
    this.collectionTimeout = options.collectionTimeout || 10000;
    this.roleAndInstanceLabels = 
      options.role
        ? { role: options.role, instanceId: options.instanceId }
        : {};
  }

  async collect(response) {
    try {
      response.writeHead(200, { 'Content-Type': register.contentType });
      const content = await register.metrics();
      response.end(content);
      Logger.debug(`${LOG_PREFIX} Collected prometheus metrics:\n${content}`);
    } catch (error) {
      response.writeHead(500)
      response.end(error.message);
      Logger.error(`${LOG_PREFIX} Collecting prometheus metrics: ${error.message}`);
    }
  }

  start() {
    if (this.collectDefaultMetrics) collectDefaultMetrics({
      prefix: this.metricsPrefix,
      timeout: this.collectionTimeout,
      labels: this.roleAndInstanceLabels,
    });

    WebApp.connectHandlers.use(this.path, (req, res) => {
      return this.collect(res);
    });

    this.started = true;
  };

  injectMetrics(metricsDictionary) {
    this.metrics = { ...this.metrics, ...metricsDictionary }
  }

  increment(metricName, labelsObject) {
    if (!this.started) return;

    const metric = this.metrics[metricName];
    if (metric) {
      labelsObject = { ...labelsObject, ...this.roleAndInstanceLabels };
      metric.inc(labelsObject)
    }
  }

  decrement(metricName, labelsObject) {
    if (!this.started) return;

    const metric = this.metrics[metricName];
    if (metric) {
      labelsObject = { ...labelsObject, ...this.roleAndInstanceLabels };
      metric.dec(labelsObject)
    }
  }

  set(metricName, value, labelsObject) {
    if (!this.started) return;

    const metric = this.metrics[metricName];
    if (metric) {
      labelsObject = { ...labelsObject, ...this.roleAndInstanceLabels };
      metric.set(labelsObject, value)
    }
  }

  observe(metricName, value, labelsObject) {
    if (!this.started) return;

    const metric = this.metrics[metricName];
    if (metric) {
      labelsObject = { ...labelsObject, ...this.roleAndInstanceLabels };
      metric.observe(labelsObject, value)
    }
  }
}

export default PrometheusScrapeAgent;

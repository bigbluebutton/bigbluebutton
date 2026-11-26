// Settings come from default.json and the production.json files in both
// NODE_CONFIG_DIR directories (the /etc one last, so it wins), then from the
// env vars mapped in custom-environment-variables.json.

// Kubernetes sets REDIS_PORT=tcp://<address>:6379 for a Service named redis; a
// value that is not a port number is ignored, so the one from the files stays.
const redisPort = process.env.REDIS_PORT;
if (redisPort && !/^\d+$/.test(redisPort)) {
  console.warn(`REDIS_PORT=${redisPort} is not a port number, ignoring it`);
  delete process.env.REDIS_PORT;
}

const {default: config} = await import('config');

export default config;

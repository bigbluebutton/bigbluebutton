// Settings come from default.json and the production.json files in both
// NODE_CONFIG_DIR directories (the /etc one last, so it wins), then from the
// env vars mapped in custom-environment-variables.json.
import config from 'config';

export default config;

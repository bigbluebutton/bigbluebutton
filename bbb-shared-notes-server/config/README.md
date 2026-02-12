# Configuration

This project uses the [config](https://www.npmjs.com/package/config) npm package for configuration management.

## Files

### `default.json`
- Base configuration with all settings
- Used in all environments
- Committed to git

### `custom-environment-variables.json`
- Maps environment variables to config keys
- Allows overriding secrets via environment variables
- Example: `POSTGRES_PASSWORD` → `config.postgres.password`

## Overriding Configuration

### Option 1: Environment Variables (Recommended for secrets)
```bash
POSTGRES_PASSWORD=mysecret npm start
REDIS_PASSWORD=secret123 npm start
```

### Option 2: Create Additional Config Files (Optional)
The config package automatically loads these files if they exist:

- `production.json` - Loaded when `NODE_ENV=production`
- `local.json` - Loaded in development (gitignored)
- `{hostname}.json` - Loaded based on server hostname
- And more... see [config docs](https://github.com/node-config/node-config/wiki/Configuration-Files)

Example `local.json` for development:
```json
{
  "log": {
    "level": "debug"
  },
  "postgres": {
    "password": "my_dev_password"
  }
}
```

## Deployment

The `deploy.sh` script copies this entire `config/` directory to `/usr/share/bbb-shared-notes-server/`.

The systemd service sets `NODE_ENV=production` automatically.

# Configuration

This project uses the [config](https://www.npmjs.com/package/config) npm package for configuration management.

## Files

### `default.yml`
- Base configuration with all settings
- Used in all environments
- Committed to git

## Overriding Configuration - Create Additional Config Files (Optional)
- /etc/bigbluebutton/bbb-shared-notes-server.yml


## Deployment

The `deploy.sh` script copies this entire `config/` directory to `/usr/share/bbb-shared-notes-server/`.

The systemd service sets `NODE_ENV=production` automatically.

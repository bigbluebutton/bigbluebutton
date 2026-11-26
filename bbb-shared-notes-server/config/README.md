# Configuration

The settings are read when the server starts (`src/config/index.ts`), in this order, each one
winning over the one before:

1. `default.yml`: all settings with their defaults. Installed at
   `/usr/share/bbb-shared-notes-server/config/default.yml`; without it (in a checkout), the one in
   this directory is used.
2. `/etc/bigbluebutton/bbb-shared-notes-server.yml`, if it exists: the admin's overrides. Maps are
   merged key by key; any other value, arrays included, replaces the default. An empty file
   changes nothing.
3. Environment variables, if set to a non-empty value:

   | Variable | Setting |
   |---|---|
   | `SERVER_HOST` | `expressServer.host` |
   | `BBB_WEB_URL` | `bbbWeb.host` and `bbbWeb.port`, from bbb-web's base URL, e.g. `http://web:8090` |
   | `REDIS_HOST` | `redis.host` |
   | `REDIS_PORT` | `redis.port` (a value that is not a number is ignored, with a warning) |
   | `REDIS_PASSWORD` | `redis.password` |
   | `POSTGRES_HOST` | `postgres.host` |
   | `POSTGRES_PASSWORD` | `postgres.password` |

The systemd unit also reads `/etc/bigbluebutton/bbb-shared-notes-server.env` for these variables.

## Deployment

The `deploy.sh` script copies this entire `config/` directory to `/usr/share/bbb-shared-notes-server/`.

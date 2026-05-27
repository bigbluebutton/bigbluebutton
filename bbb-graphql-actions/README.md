# bbb-graphql-actions

BigBlueButton GraphQL Actions is the adapter service that receives Hasura action
requests and publishes corresponding messages to Redis (consumed by
`akka-bbb-apps`).

## Configuration

All configuration is done through environment variables. When a variable is not
set, the default value shown below is used.

| Variable | Default | Description |
| --- | --- | --- |
| `BBB_REDIS_HOST` | `127.0.0.1` | Redis server hostname or IP address |
| `BBB_REDIS_PORT` | `6379` | Redis server port |
| `BBB_REDIS_PASSWORD` | *(empty)* | Redis server password (optional) |
| `SERVER_HOST` | `127.0.0.1` | Host the HTTP server listens on |
| `SERVER_PORT` | `8093` | Port the HTTP server listens on |
| `MAX_BODY_SIZE` | `10485760` | Maximum request body size in bytes (10 MB) |

### Setting environment variables for the systemd service

The systemd unit ships with an `EnvironmentFile` directive that loads
`/etc/bigbluebutton/bbb-graphql-actions.env` when the file exists. To configure
a Redis password (or any other variable), create or edit that file:

```bash
# Use a text editor to create/edit the file (avoids leaking secrets in shell history)
sudo editor /etc/bigbluebutton/bbb-graphql-actions.env

# Add the following line (replace the value with your actual password):
# BBB_REDIS_PASSWORD=<your-redis-password>

# Then restart the service
sudo systemctl restart bbb-graphql-actions
```

The file uses the standard `KEY=VALUE` format (one variable per line). It is
optional — the service starts normally without it.

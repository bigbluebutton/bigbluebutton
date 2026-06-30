# bbb-graphql-actions

Adapter service that receives Hasura action requests and publishes
corresponding messages to Redis (consumed by `akka-bbb-apps`).

## Configuration

The service is configured through environment variables. See
[`src/config.ts`](src/config.ts) for the full list of supported variables and
their defaults.

The systemd unit includes an `EnvironmentFile=-/etc/bigbluebutton/bbb-graphql-actions.env`
directive, so you can place overrides there using the standard `KEY=VALUE`
format. The file is optional — the service starts normally without it.

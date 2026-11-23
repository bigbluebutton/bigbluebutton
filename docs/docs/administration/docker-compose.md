---
id: docker-compose
slug: /administration/docker-compose
title: Install with Docker Compose
sidebar_position: 12
description: Install BigBlueButton on one server with Docker Compose
keywords:
- docker
- docker compose
- install
---

BigBlueButton 4.1 can run on one server with Docker Compose, as an alternative to the package install with `bbb-install.sh`. `docker-compose.yml` in the repository root runs the BigBlueButton images built in this repository, official images for Redis, PostgreSQL, LiveKit, coturn, haproxy and certbot, and the configuration in `docker/compose/`, mounted at the bare-metal paths. Files that need values from `.env` are inline in `docker-compose.yml` (`configs:`). The images themselves are described in [docker/README.md](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-release/docker/README.md).

Not covered yet: office document conversion (bbb-web expects `/usr/share/bbb-libreoffice-conversion/convert.sh`, which no image provides yet), FreeSWITCH and dial-in, more than one server, Kubernetes, and running behind an existing reverse proxy or TLS terminator.

## Requirements

- one Linux server with Docker Engine 28 or later and the compose plugin 2.35 or later (`init` mounts the database schemas from the images as image volumes);
- a DNS name for it and a public IPv4 address;
- open ports: 80/tcp and 443/tcp (web, Let's Encrypt, TURN over TLS), 3478/tcp and 3478/udp (TURN), 7882/udp (LiveKit media);
- LiveKit wants larger UDP buffers than most hosts have (it warns `UDP receive buffer is too small` at start): set `net.core.rmem_max` and `net.core.wmem_max` on the host, e.g. to 5000000 (the value LiveKit suggests in that warning) in `/etc/sysctl.d/`;
- the subnet `172.30.82.0/24` free on the host (the compose network; LiveKit has a fixed address in it, the only address coturn relays to).

## Install

```bash
curl -fsSL https://raw.githubusercontent.com/bigbluebutton/bigbluebutton/v4.1.x-develop/docker/compose/install.sh | sh -s -- <domain> [email]
cd bigbluebutton && docker compose up -d
```

`docker/compose/install.sh` checks the Docker versions, downloads `docker-compose.yml`, `.env.sample` and `docker/compose/` into `./bigbluebutton` and writes `.env` with the domain, its IPv4 address, the email and new secrets; an existing `.env` is kept. Without the script: copy these files from the repository, `cp .env.sample .env` and set every value.

The images come from the registry (`docker compose pull`, or the first `up`); no local build is needed. `BBB_IMAGE_TAG` is a branch tag such as `v4.1.x-develop`, or `v4.1.x-develop-<commit>` to pin a set of images built together.

`COMPOSE_PROFILES` in `.env` selects the optional parts: `recording` (on by default, as in a bare-metal install: the recorder, the processing and the player) and `webhooks`. Without `recording`, meetings are not recorded, even when they are created with `record=true`.

### What happens on the first start

- `init` creates the directories under `./data` that the packages create on install, and the databases and roles, as the packages' after-install scripts do. It runs again on every `up`, and recreates `bbb_graphql` or `blocknote_app` only when its schema in the image changed.
- `certbot` gets a Let's Encrypt certificate through nginx on port 80 and checks twice a day whether it is due for renewal. It writes the certificate for haproxy and reloads haproxy through haproxy's master socket. Until the first certificate is issued, haproxy serves a self-signed one. To use your own certificate instead, put the chain and the key in `./data/certs` as `fullchain.pem` and `privkey.pem` (the names bbb-install uses in `/local/certs`); `ACME_EMAIL` can then stay empty. certbot uses them when it starts and reads them again every hour.
- haproxy terminates TLS on 443. HTTP goes to nginx; TURN goes to coturn. TURN is recognised by the ALPN `stun.turn`, or, without ALPN, by a first byte that is not a letter.

## Upgrade

Set `BBB_IMAGE_TAG` (or keep a branch tag), then

```bash
docker compose pull
docker compose up -d --force-recreate
```

Every service restarts, as in a package upgrade. When a schema changed, its database is recreated, so meetings that are running end.

## Data and backup

Data, in `./data` next to `docker-compose.yml`:

- `bigbluebutton`: `/var/bigbluebutton` (presentations, recordings, learning dashboard data);
- `recordings`: `/var/lib/bbb-webrtc-recorder` (raw media until a recording is processed);
- `letsencrypt`: `/etc/letsencrypt` (certificate and ACME account);
- `certs`: your own certificate, if you use one.

Backup: `./data` and `.env`. PostgreSQL (a volume) holds only the state of running meetings, and `init` recreates its databases, so it is not part of a backup. `docker compose down -v` removes it and the other volumes, but not `./data`.

## Configuration

- `.env` holds the values per server.
- bbb-web and bbb-apps-akka get their settings from environment variables in `docker-compose.yml` (see [Environment variables](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-release/docker/README.md#environment-variables)); bbb-web takes any key of `bigbluebutton.properties` this way.
- Other bare-metal settings go in the inline files (`livekit.yaml`, `recording.yml`, `bbb-shared-notes-server.yml`) or in `docker/compose/`. Or mount further files at their bare-metal paths (see [Images](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-release/docker/README.md#images)), e.g. `/etc/bigbluebutton/bbb-apps-akka.conf`.
- To use your own version of an inline file without editing `docker-compose.yml`, replace it in a `docker-compose.override.yml` next to it (compose reads that file automatically). `!override` is needed: without it compose merges both definitions and rejects `content` and `file` together.

  ```yaml
  configs:
    livekit.yaml: !override
      file: ./my-livekit.yaml
  ```

  A file is used as it is; `${…}` from `.env` is only filled in under `content:`.
- Shared notes run the PDF converter through `commandExecution.runnerScript` in `bbb-shared-notes-server.yml`; the compose file sets it to `timeout`.
- nginx uses the image's location files and upstreams, which use the default service names. The compose file mounts only its site (port 80 and haproxy's 8081) and `playback.nginx`, because `playback` runs only with the `recording` profile.
- More Hasura instances: `docker compose up -d --scale graphql-server=2`, then `docker compose exec nginx nginx -s reload`. nginx balances them as on bare metal and looks up the instances only when it starts or reloads, so reload it again after scaling down.
- Logs: `docker compose logs <service>`; the logs per recording are in the `recording-logs` volume. The compose file sets the `local` logging driver, which rotates the logs; it overrides the host's Docker default (`daemon.json`). Remove it from `x-bbb` to use that default.

## Differences from a package install

- Media: LiveKit receives all media on one port, 7882/udp, instead of the range 16384-32768 a package install opens.
- TURN: coturn relays only to LiveKit, inside the compose network, so its relay ports are not opened on the host.
- There is no FreeSWITCH, so there is no dial-in.
- The domain, the IP address and the secrets are set in `.env` instead of with `bbb-conf --setip` and `bbb-conf --setsecret`. There is no `bbb-conf` and no `apply-config.sh`.

## Common bbb-conf tasks

| Package install | Docker Compose |
|---|---|
| `bbb-conf --status` | `docker compose ps` |
| `bbb-conf --stop` / `--start` | `docker compose stop` / `docker compose up -d` |
| `bbb-conf --restart` | `docker compose restart` |
| `bbb-conf --secret` | the URL is `https://<BBB_DOMAIN>/bigbluebutton/`, the secret is `BBB_SHARED_SECRET` in `.env` |
| `bbb-conf --setsecret <secret>` | set `BBB_SHARED_SECRET` in `.env`, then `docker compose up -d --force-recreate` |
| `bbb-conf --setip <hostname>` | set `BBB_DOMAIN` and `BBB_PUBLIC_IP` in `.env`, then `docker compose up -d --force-recreate` |
| `bbb-conf --debug` / `--watch` | `docker compose logs <service>` / `docker compose logs -f` |
| `bbb-conf --version` | `docker compose images` (the image tags) |

## Greenlight and other front ends

A front end such as [Greenlight](/greenlight/v3/install) needs the API URL and the shared secret: the API URL is `https://<BBB_DOMAIN>/bigbluebutton/api`, the shared secret is `BBB_SHARED_SECRET` in `.env`.

## Troubleshooting

### init fails with "password authentication failed for user postgres"

`.env` was written again after the first start: the postgres volume keeps the `POSTGRES_PASSWORD` it was created with. Run `docker compose down -v` and start again.

### Meetings start without the default slides

bbb-web downloads the default slides from `https://<domain>` through the host (`extra_hosts: host-gateway`), so port 443 must be published on the host's addresses (the default). The download needs the real certificate; it fails while haproxy serves the self-signed one.

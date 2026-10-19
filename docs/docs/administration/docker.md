---
id: docker
slug: /administration/docker
title: Install with Docker Compose
sidebar_position: 11.5
description: Install, upgrade, back up and restore BigBlueButton with Docker Compose
keywords:
- docker
- compose
- install
- upgrade
- backup
---

:::note

The container setup is new and still a **draft**. This page covers only what the compose file
in the repository runs today. Greenlight and monitoring are not part of the container stack
yet.

:::

BigBlueButton can run as a set of containers with Docker Compose instead of the packages
installed by `bbb-install.sh`. One static `docker-compose.yml` at the root of the repository
starts all services. The images configure themselves at start from the variables in `.env`,
so you never edit files inside the containers. Why the stack is built this way is explained in
[Docker Compose design](/administration/docker-design).

## Before you install

### Server requirements

- A Linux server with Docker Engine and the Docker Compose plugin **2.24.4 or later**. Check
  with `docker compose version`. The stack is tested with Docker Engine running as root.
- An x86-64 (amd64) server. The graphql-server image is built and published for amd64 only
  (its engine binary is x86-64 only; see `docker/bake/graphql-server.hcl`); the other images
  built here are also published for arm64.
- For building the images yourself: the Docker Buildx plugin. A build is for the platform of
  the host it runs on, except for the amd64-only images above.
- A fully qualified domain name, for example `bbb.example.com`, with an A record that points to
  the public IPv4 address of the server. If you add an AAAA record, it must point to the same
  server, as Let's Encrypt may use it to validate the certificate.
- A public IPv4 address on the server, or one that is forwarded to it (1:1 NAT).

### Ports

The stack publishes only these ports. Open them in your firewall or security group:

| Port | Service | Purpose |
|---|---|---|
| 80/tcp | nginx | Let's Encrypt HTTP-01 challenge, redirect to HTTPS |
| 443/tcp | haproxy | HTTPS, WebSocket signaling, TURN over TLS |
| 7882/udp | livekit | all WebRTC media (one UDP port; `LIVEKIT_RTC_UDP_PORT`) |
| 3478/udp, 3478/tcp | coturn | TURN |

No UDP port range is needed. The TURN relay ports stay inside the Docker network.

:::warning

Ports published by Docker bypass the rules of `ufw` and `firewalld`: Docker routes the packets
before those rules apply. Filter traffic in front of the server, for example with a security
group or an external firewall.

:::

### Low ports

haproxy and nginx run as non-root users. They bind ports 443, 80 and 81 inside their containers
with the per-container sysctl `net.ipv4.ip_unprivileged_port_start=0`, which
`docker-compose.yml` sets for both. You do not need to change the host's sysctl. If the
container runtime cannot apply this sysctl, the container exits at start with a message like

```
nginx: ERROR: cannot bind ports 80 and 81 as UID <uid>: set the sysctl net.ipv4.ip_unprivileged_port_start=0 for this container (compose: sysctls; Kubernetes: securityContext.sysctls)
```

## Install

Run all `docker compose` commands in the directory that contains `docker-compose.yml`.

### 1. Get the compose file

Check out the BigBlueButton repository at the release you want to run. The compose file
belongs to that release: its default image tag (`BBB_IMAGE_TAG`) is the release version.

```bash
git clone https://github.com/bigbluebutton/bigbluebutton.git
cd bigbluebutton
git checkout <release>
```

### 2. Create `.env`

Let the setup container write `.env`. It starts from `.env.sample`, generates every secret,
asks for the server's name, its public IPv4 address and the e-mail address for Let's Encrypt, and
never overwrites a value that is already set, so you can run it again after an upgrade:

```bash
docker compose run --rm setup
```

It runs without network access. To fill `.env` by hand instead, copy `.env.sample`
(`install -m 600 .env.sample .env`), fill in every value marked **Required** and generate each
secret separately, for example with `openssl rand -hex 32`.

`LIVEKIT_API_KEY` takes 8 to 64 letters and digits (`openssl rand -hex 8`). Every variable, its
format and its default is listed in the
[Container Configuration Reference](/administration/docker-configuration). Keep `.env`
readable only by its owner (`chmod 600 .env`): it holds all secrets of the server.

`BBB_FEATURES` selects optional features. Today the stack has `webhooks` (bbb-webhooks) and
`recording` (bbb-web offers the record button, bbb-webrtc-recorder records the meetings' media,
and recordings are processed, published and played back). Empty, the default of
`.env.sample`, runs without optional features. Leave the line
`COMPOSE_PROFILES=${BBB_FEATURES}` as it is.

### 3. Get the images

The compose file runs `${BBB_IMAGE_REGISTRY}/bbb-<image>:${BBB_IMAGE_TAG}`, by default
`ghcr.io/bigbluebutton/bigbluebutton/bbb-<image>:<release>`. Pull them:

```bash
docker compose pull
```

To build the images yourself instead, use Docker Buildx Bake and run the stack on the local
images:

```bash
docker buildx bake -f docker-bake.hcl $(printf -- '-f %s ' docker/bake/*.hcl) --load
echo 'BBB_IMAGE_REGISTRY=localhost' >> .env
```

See `docker/README.md` in the repository for the build details.

### 4. Start BigBlueButton

```bash
docker compose up -d
```

The first start takes a few minutes: graphql-server alone is given 200 seconds to become
healthy. Check that every service is `running` and `healthy`:

```bash
docker compose ps -a
```

`db-init` is a job: it sets up the databases and then shows `Exited (0)`.

On the first start, haproxy serves a temporary self-signed certificate. The `certbot` service
obtains a Let's Encrypt certificate for `BBB_DOMAIN` through port 80 within a few minutes, and
haproxy switches to it by itself. certbot renews it automatically.

### 5. Check the API

The repository contains an API smoke test. It verifies the TLS certificate, so run it once
`certbot` has obtained the real certificate (`docker compose logs certbot`), or add `--insecure`
before that. It reads the shared secret from the environment only, so type it in instead of
putting it on the command line:

```bash
read -rs BBB_SHARED_SECRET && export BBB_SHARED_SECRET
docker/tests/smoke/api-smoke.sh --api-url https://bbb.example.com/bigbluebutton/api
```

It creates a meeting, joins it, lists it and ends it, and ends with `SMOKE PASS`.

## Configuration

All settings are variables in `.env`. The
[Container Configuration Reference](/administration/docker-configuration) lists them, with the
optional advanced settings and the derived values the images compute themselves.

For settings that have no variable, mount an override file at the same path as on a
package-based server (the reference lists the supported files). The rest of this
documentation then applies unchanged. Put the mounts into `docker-compose.override.yml` next to
`docker-compose.yml`, which Docker Compose reads automatically:

```yaml
services:
  bbb-web:
    volumes:
      - /etc/bigbluebutton/bbb-web.properties:/etc/bigbluebutton/bbb-web.properties:ro
```

Then apply it with `docker compose up -d`.

### Recordings

With `recording` in `BBB_FEATURES`, the services `recording` (the processing workers),
`recording-starter`, `recording-caption-inbox` and `recording-cleanup` run from the
`bbb-record-and-playback` image. `RECORDING_WORKERS` sets how many recordings are processed at the
same time (default 1), and `RECORDING_RAW_RETENTION_DAYS` after how many days the raw data of a
published recording is removed (default 14, `0` keeps it); published recordings are never removed
automatically. The workers are limited to 2 CPUs and 4 GB of memory together; change
`deploy.resources.limits` of `recording` in `docker-compose.override.yml`. Settings of the
recording scripts go into `/etc/bigbluebutton/recording/recording.yml` and
`/etc/bigbluebutton/recording/presentation.yml`, mounted into the recording services. Their
messages are in the service logs (`docker compose logs recording`). `bbb-record` works in the
container: `docker compose exec recording bbb-record --list`, and as root for the options that
need it, for example `docker compose exec -u 0 recording bbb-record --rebuild <record id>`.

## Upgrade

Check out the new release (its compose file names the new image tag), then pull the images and
recreate the containers:

```bash
git fetch
git checkout <new release>
docker compose pull
docker compose up -d
```

If you set `BBB_IMAGE_TAG` in `.env`, change it to the new version as well. If you build the
images yourself (`BBB_IMAGE_REGISTRY=localhost`), rebuild them with `docker buildx bake` instead
of `docker compose pull`.

What to expect:

- All meetings in progress end, because their services are recreated.
- When the image version changes, the `db-init` job drops and recreates the databases
  `bbb_graphql`, `hasura_app` and `blocknote_app`, as the packages do on every upgrade. Shared
  notes therefore do not survive an upgrade. On a plain restart, `db-init` keeps them.
- The certificate is kept: certbot's state is in the `letsencrypt` volume, so no new
  certificate is requested.

## Backup and restore

The state of the server is in `.env` and in these Docker volumes (Docker Compose prefixes their
names with the project name, `bigbluebutton_`):

| Volume | Contents | Needed for a restore |
|---|---|---|
| `bbb-data` | `/var/bigbluebutton`: presentations, learning dashboard data | yes |
| `postgres-data` | the PostgreSQL databases (meeting state, shared notes) | optional |
| `recorder-raw` | `/var/lib/bbb-webrtc-recorder`: raw media of recorded meetings (`recording`), the input of the recording processing, which moves it into `bbb-data` | only for recordings not archived yet |
| `letsencrypt` | certbot's account, certificate and renewal settings | recommended |
| `certs` | the certificate bundle haproxy reads | no |
| `acme-webroot` | temporary challenge files | no |

`.env` holds every secret of the server. Store its copy as carefully as the original.

### Back up

Stop the stack for the backup. A copy of PostgreSQL's data directory is only consistent while
PostgreSQL is stopped, and a stopped stack also writes nothing to `bbb-data`. An online
`pg_dump` would not keep more: the BigBlueButton databases hold only the state of meetings and
their shared notes, which `db-init` recreates on the next upgrade anyway. Meetings in progress
end.

Keep the backup outside the repository checkout: it contains `.env` with all secrets.

```bash
mkdir -p ../bbb-backup
docker compose stop
for v in bbb-data postgres-data letsencrypt; do
  docker run --rm -v bigbluebutton_$v:/volume:ro -v "$PWD/../bbb-backup":/backup ubuntu:24.04 \
    tar -C /volume --numeric-owner -czf /backup/$v.tar.gz .
done
install -m 600 .env ../bbb-backup/env
docker compose up -d
```

### Restore

On the new server, check out the same release as on the old one, then:

```bash
install -m 600 ../bbb-backup/env .env
docker compose create
for v in bbb-data postgres-data letsencrypt; do
  docker run --rm -v bigbluebutton_$v:/volume -v "$PWD/../bbb-backup":/backup:ro ubuntu:24.04 \
    tar -C /volume --numeric-owner -xzpf /backup/$v.tar.gz
done
docker compose up -d
```

Restore `postgres-data` only together with the `.env` it was backed up with: PostgreSQL sets
its superuser password (`POSTGRES_PASSWORD`) only when it creates a new data directory.

What you can leave out:

- `certs`: certbot writes the bundle again from the `letsencrypt` volume.
- `letsencrypt`: without it, certbot requests a new certificate. That counts against the Let's
  Encrypt rate limits, so keep it if you restore often.
- `postgres-data`: without it, PostgreSQL starts with an empty data directory and `db-init`
  creates the databases and roles again. Shared notes of past meetings are lost.

If the server name or IP address changes, update `BBB_DOMAIN` and `BBB_PUBLIC_IPV4` in `.env`
before `docker compose up -d`.

## Troubleshooting

Show the state and health of every service, and the log of one service:

```bash
docker compose ps -a
docker compose logs --tail 100 <service>
```

The service names are those of `docker-compose.yml`, for example `bbb-web`, `akka-apps` or
`graphql-server`. Every image checks its variables at start and logs the name of a missing or
malformed variable, never its value.

### haproxy or nginx exits at start

The log says `cannot bind port 443` (haproxy) or `cannot bind ports 80 and 81` (nginx). The
container did not get the sysctl `net.ipv4.ip_unprivileged_port_start=0`. Make sure the
`sysctls` entries of `docker-compose.yml` are not removed by an override file, and that your
container runtime allows per-container sysctls. See [Low ports](#low-ports).

### No Let's Encrypt certificate

The browser shows a certificate warning for a self-signed certificate, and `docker compose ps`
shows `certbot` as `unhealthy`. Look at its log:

```bash
docker compose logs certbot
```

`Certbot failed to authenticate some domains` with `Type:` and `Detail:` lines explains the
reason. Common causes: port 80 is not reachable from the internet, the A record does not point
to this server or has not propagated yet, an AAAA record points elsewhere, or a Let's Encrypt
rate limit was hit (`too many certificates`). certbot retries every 15 minutes by itself. Do not
restart it repeatedly and do not delete the `letsencrypt` volume: every attempt counts against
the Let's Encrypt limits for failed validations and new certificates.

### db-init fails and other services do not start

`docker compose ps -a` shows `db-init` with `Exited (1)`, and akka-apps, graphql-server and
shared-notes are not started. Its log names the cause:

```bash
docker compose logs db-init
```

- `required variable POSTGRES_BBB_CORE_PASSWORD is not set or empty` (or one of the other
  role passwords): run `docker compose run --rm setup` again, which appends the missing role
  passwords to `.env` (see [Create `.env`](#2-create-env)), then run `docker compose up -d`
  again.
- `value of ... does not have the expected format`: the value must be at least 32 letters and
  digits.
- An authentication error for the user `postgres`: `POSTGRES_PASSWORD` in `.env` differs from
  the password the `postgres-data` volume was created with. Use the original `.env`.

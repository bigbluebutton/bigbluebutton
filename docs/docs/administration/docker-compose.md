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

BigBlueButton 4.1 can run on one server with Docker Compose, as an alternative to the package install with `bbb-install.sh`. `docker-compose.yml` in the repository root runs the BigBlueButton images built in this repository, official images for Redis, PostgreSQL, LiveKit, coturn, haproxy, certbot and Collabora Online, and the configuration in `docker/compose/`, mounted at the bare-metal paths. Files that need values from `.env` are inline in `docker-compose.yml` (`configs:`). The images themselves are described in [docker/README.md](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/docker/README.md).

Not covered yet: FreeSWITCH and dial-in, more than one server, Kubernetes, and running behind an existing reverse proxy or TLS terminator.

## Requirements

- one Linux server with Docker Engine 28 or later and the compose plugin 2.35 or later;
- a DNS name for it and a public IPv4 address;
- IPv6 not turned off in the kernel (no `ipv6.disable=1` on the kernel command line): nginx also listens on `[::]` and does not start without it. The server needs no IPv6 address;
- open ports: 80/tcp and 443/tcp (web, Let's Encrypt, TURN over TLS), 3478/tcp and 3478/udp (TURN), 7882/udp (LiveKit media);
- LiveKit wants larger UDP buffers than most hosts have (it warns `UDP receive buffer is too small` at start): set `net.core.rmem_max` and `net.core.wmem_max` on the host, e.g. to 5000000 (the value LiveKit suggests in that warning) in `/etc/sysctl.d/`;
- the subnets `172.30.82.0/24` and `172.30.83.0/24` free on the host (the compose network, where LiveKit has a fixed address, the only address coturn relays to; and the network of the office conversion);
- landlock enabled in the host kernel, for the office conversion (see [Office documents](#office-documents)).

## Install

```bash
curl -fsSL https://raw.githubusercontent.com/bigbluebutton/bigbluebutton/v4.1.x-develop/docker/compose/install.sh | sh -s -- <domain> [email]
cd bigbluebutton && docker compose up -d
```

`docker/compose/install.sh` checks the Docker versions, downloads `docker-compose.yml`, `.env.sample` and `docker/compose/` into `./bigbluebutton` and writes `.env` with the domain, its IPv4 address, the email and new secrets; an existing `.env` is kept. `BBB_REPO` and `BBB_BRANCH` choose the GitHub repository and the branch, tag or commit to download from (default `bigbluebutton/bigbluebutton` and `v4.1.x-develop`), `BBB_DIR` the target directory (default `bigbluebutton`), e.g. `curl ... | BBB_DIR=bbb sh -s -- <domain>`. Without the script: copy these files from the repository, `cp .env.sample .env` and set every value.

The images come from the registry (`docker compose pull`, or the first `up`); no local build is needed. `BBB_IMAGE_TAG` is a branch tag such as `v4.1.x-develop`, or `v4.1.x-develop-<commit>` to pin a set of images built together. `BBB_IMAGE_REGISTRY` (default `ghcr.io/bigbluebutton/bigbluebutton`) points to another registry with the same image names, e.g. a mirror.

`COMPOSE_PROFILES` in `.env` selects the optional parts: `recording` (on by default, as in a bare-metal install: the recorder, the processing and the player) and `webhooks`. Without `recording`, meetings are not recorded, even when they are created with `record=true`. To turn a profile off, remove it from `COMPOSE_PROFILES` and remove its containers, which `up -d` leaves running, e.g. for webhooks `docker compose rm -sf webhooks`, for recording `docker compose rm -sf webrtc-recorder recording-workers recording-starter recording-caption-inbox recording-cleanup playback`.

### What happens on the first start

- `init` creates the directories under `./data` that the packages create on install, and the databases and roles, as the packages' after-install scripts do. It runs again on every `up`, and recreates `bbb_graphql` or `blocknote_app` only when its schema in the image changed.
- `certbot` gets a Let's Encrypt certificate through nginx on port 80 and checks twice a day whether it is due for renewal. It writes the certificate for haproxy and reloads haproxy through haproxy's master socket. Until the first certificate is issued, haproxy serves a self-signed one. To use your own certificate instead, put the chain and the key in `./data/certs` as `fullchain.pem` and `privkey.pem` (the names bbb-install uses in `/local/certs`); `ACME_EMAIL` can then stay empty. certbot uses them when it starts and reads them again every hour.
- haproxy terminates TLS on 443. HTTP goes to nginx; TURN goes to coturn. TURN is recognised by the ALPN `stun.turn`, or, without ALPN, by a first byte that is not a letter.

## Upgrade

The compose files go with the images: a newer image can need a change in `docker-compose.yml` or `docker/compose/`, so upgrade them together, with the files of the commit the images were built from. Each image carries that commit in its label `org.opencontainers.image.revision`, also for a tag without a commit such as `v4.1.x-develop`. Set `BBB_IMAGE_TAG` in `.env` to the new tag (or keep a branch tag), pull, read the commit, and run `install.sh` of that commit again in the directory that contains `bigbluebutton`; it downloads the files again and keeps `.env` and `docker-compose.override.yml`. Then recreate:

```bash
cd bigbluebutton
docker compose pull
commit=$(docker image inspect --format '{{index .Config.Labels "org.opencontainers.image.revision"}}' "$(docker compose config --images web | grep /bbb-web:)")
cd ..
repo=bigbluebutton/bigbluebutton  # or the BBB_REPO you installed from
curl -fsSL "https://raw.githubusercontent.com/$repo/$commit/docker/compose/install.sh" | BBB_REPO=$repo BBB_BRANCH=$commit sh -s -- <domain>
cd bigbluebutton
docker compose up -d --force-recreate
```

Every service restarts, as in a package upgrade. When a schema changed, its database is recreated, so meetings that are running end.

A newer `docker-compose.yml` can need a new value in `.env`; compose then stops and names the variable. `BBB_PAGE_TOKEN_SECRET` (bbb-web's `pageTokenSecret`, separate from `BBB_SHARED_SECRET`) is such a value for installs from before it was added. Add it with

```bash
echo "BBB_PAGE_TOKEN_SECRET=$(openssl rand -hex 32)" >> .env
```

## Run another version of one component

`BBB_IMAGE_TAG` selects the version of all images. To run another image for one component, set its variable in `.env` to a full image reference: `BBB_<IMAGE>_IMAGE`, the image name in upper case with `_` for `-`. Examples:

```bash
# a pull request build
BBB_WEB_IMAGE=ghcr.io/bigbluebutton/bigbluebutton/bbb-web:pr-12345
# a local build (docker buildx bake, see the development guide)
BBB_SHARED_NOTES_SERVER_IMAGE=localhost/bbb-shared-notes-server:dev
# a fixed image by digest
BBB_HTML5_CLIENT_IMAGE=ghcr.io/bigbluebutton/bigbluebutton/bbb-html5-client@sha256:<digest>
```

then `docker compose up -d`. A variable applies to every service that runs its image.

| Services | Variable |
| --- | --- |
| `nginx` | `BBB_NGINX_IMAGE` |
| `apps-akka` | `BBB_APPS_AKKA_IMAGE` |
| `init` (with the database schemas) | `BBB_INIT_IMAGE` |
| `web` | `BBB_WEB_IMAGE` |
| `graphql-server` | `BBB_GRAPHQL_SERVER_IMAGE` |
| `graphql-actions` | `BBB_GRAPHQL_ACTIONS_IMAGE` |
| `graphql-middleware` | `BBB_GRAPHQL_MIDDLEWARE_IMAGE` |
| `shared-notes-server`, `shared-notes-conversion` | `BBB_SHARED_NOTES_SERVER_IMAGE` |
| `export-annotations` | `BBB_EXPORT_ANNOTATIONS_IMAGE` |
| `webrtc-sfu` | `BBB_WEBRTC_SFU_IMAGE` |
| `html5-client` | `BBB_HTML5_CLIENT_IMAGE` |
| `learning-dashboard` | `BBB_LEARNING_DASHBOARD_IMAGE` |
| `webrtc-recorder` | `BBB_WEBRTC_RECORDER_IMAGE` |
| `recording-workers`, `recording-starter`, `recording-caption-inbox`, `recording-cleanup` | `BBB_RECORD_AND_PLAYBACK_IMAGE` |
| `playback` | `BBB_PLAYBACK_IMAGE` |
| `webhooks` | `BBB_WEBHOOKS_IMAGE` |

`docker compose pull` tries to pull a local image too and reports an error for it. To skip it, set `pull_policy: never` for that service in a `docker-compose.override.yml` (see `docker-compose.override.sample.yml`), or run `docker compose pull --ignore-pull-failures`.

## Data and backup

Data, in `./data` next to `docker-compose.yml`:

- `bigbluebutton`: `/var/bigbluebutton` (presentations, recordings, learning dashboard data);
- `recordings`: `/var/lib/bbb-webrtc-recorder` (raw media until a recording is processed);
- `letsencrypt`: `/etc/letsencrypt` (certificate and ACME account);
- `certs`: your own certificate, if you use one.

Backup: `./data`, `.env` and `docker-compose.override.yml`. PostgreSQL (a volume) holds only the state of running meetings, and `init` recreates its databases, so it is not part of a backup. Redis (the `redis` volume) holds the events of recorded meetings until they are archived and the queue of recordings to process; `docker compose down` keeps it. `docker compose down -v` removes it and the other volumes, but not `./data`. To restore on another server, set `BBB_PUBLIC_IP` (and `BBB_DOMAIN` if it changes) in the restored `.env` before the first `up`.

## Configuration

- `.env` holds the values per server.
- Local changes go in `docker-compose.override.yml` next to `docker-compose.yml` (compose reads it automatically), not in `docker-compose.yml` or `docker/compose/`: `install.sh` replaces those on an upgrade and never touches the override.
- bbb-web and bbb-apps-akka get their settings from environment variables in `docker-compose.yml` (see [Environment variables](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/docker/README.md#environment-variables)); bbb-web takes any key of `bigbluebutton.properties` this way.
- bbb-graphql-middleware, bbb-shared-notes-server and bbb-export-annotations get the addresses of the other services (and the notes' database password) from environment variables as well.
- Other bare-metal settings are in the inline `livekit.yaml` and in `docker/compose/`. To change one, use your own version in `docker-compose.override.yml`: mount your file at the same path as a file of `docker/compose/` (further files can be mounted there at their bare-metal paths, see [Images](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/docker/README.md#images), e.g. `/etc/bigbluebutton/bbb-apps-akka.conf` or `/etc/bigbluebutton/recording/recording.yml`), or replace an inline file, which needs `!override` (without it compose merges both definitions and rejects `content` and `file` together):

  ```yaml
  configs:
    livekit.yaml: !override
      file: ./my-livekit.yaml
  ```

  A file is used as it is; `${…}` from `.env` is only filled in under `content:`. After changing an inline file, run `docker compose up -d --force-recreate <service>`: a plain `up -d` does not recreate a service when only the content of its config changed.
- Recording formats: as on a package install, recordings are processed as `presentation` only. The recording image also has `video`, `notes`, `screenshare` and `podcast`. To enable them, add the `steps` to your own `recording.yml` and mount it at `/etc/bigbluebutton/recording/recording.yml` in the recording services in `docker-compose.override.yml`. It holds only your changes, e.g. for notes and podcast:

  ```yaml
  steps:
    archive: 'sanity'
    sanity: 'captions'
    captions:
      - 'process:presentation'
      - 'process:notes'
      - 'process:podcast'
    'process:presentation': 'publish:presentation'
    'process:notes': 'publish:notes'
    'process:podcast': 'publish:podcast'
  ```

  Then `docker compose up -d --force-recreate recording-workers recording-starter recording-caption-inbox recording-cleanup`. New recordings get the extra formats; `getRecordings` lists them and nginx serves them. An override written for the earlier inline file (`configs:` with `recording.yml: !override`) is no longer read, and compose does not report it: move its `steps` to a mounted file as above, or recordings go back to `presentation` only.
- To customize bbb-graphql-middleware, bbb-shared-notes-server or bbb-export-annotations, mount your file at the bare-metal path (`/etc/bigbluebutton/bbb-graphql-middleware.yml`, `/etc/bigbluebutton/bbb-shared-notes-server.yml`, `/etc/bigbluebutton/bbb-export-annotations/production.json`) in `docker-compose.override.yml`. Put only your changes in it: the addresses of the other services come from the environment and win over the file.
- nginx uses the image's location files and upstreams, which use the default service names. The compose file mounts only its site (port 80 and haproxy's 8081) and `playback.nginx`, because `playback` runs only with the `recording` profile.
- More Hasura instances: `docker compose up -d --scale graphql-server=2`. nginx balances them as on bare metal and looks up the instances every 30 s, so it follows scaling up and down within about 30 s, without a reload.
- Logs: `docker compose logs <service>`; the logs per recording are in the `recording-logs` volume. The compose file sets the `local` logging driver, which rotates the logs; it overrides the host's Docker default (`daemon.json`). Remove it from `x-bbb` to use that default.

## Office documents

bbb-web converts office documents (Word, Excel, PowerPoint, OpenDocument and similar) to PDF by calling the script in its property `presOfficeConversionExec`. The bbb-web image has the sample client for Collabora Online, `/usr/share/bbb-libreoffice-conversion/convert-cool.sh`, and the compose file selects it with the environment variable `PRESOFFICECONVERSIONEXEC`. It sends the document to the `office-conversion` service with `POST /cool/convert-to/pdf`.

- `office-conversion` runs Collabora Online Development Edition (CODE, image `collabora/code`, about 500 MB to download, for amd64, arm64 and ppc64le). It converts with Collabora's LibreOffice build, not with the `bbb-libreoffice` image of a package install, so results can differ.
- It is one long-running container for all documents. Collabora starts a process per document in a landlock jail. This jail needs landlock in the host kernel. The container has no capabilities, a read-only file system and a 2 GB memory limit.
- Its network is shared with `web` only and has no route out, so documents cannot fetch remote content. Collabora accepts conversions only from that network, and its admin console is off. It can still reach bbb-web's port 8090.
- Collabora describes CODE as "perfect for testing, home use or small teams, but not recommended for production environments" ([collaboraonline.com/code](https://www.collaboraonline.com/code/)). For production, use a supported Collabora Online server, as below.

To use your own Collabora Online server instead, set its URL in `docker-compose.override.yml` and leave `office-conversion` off by giving it a profile that is not in `COMPOSE_PROFILES`:

```yaml
services:
  web:
    environment:
      COOL_URL: https://cool.example.com:9980
  office-conversion:
    profiles:
      - office-conversion
```

That server must allow `convert-to` from your BigBlueButton server's address (`net.post_allow` in its `coolwsd.xml`).

To use your own conversion script, mount it into `web` and point `PRESOFFICECONVERSIONEXEC` at it. bbb-web runs it as `<script> <input file> <output file> pdf <timeout in seconds>`, so it must be executable by UID 998:

```yaml
services:
  web:
    environment:
      PRESOFFICECONVERSIONEXEC: /usr/local/bin/convert.sh
    volumes:
      - ./convert.sh:/usr/local/bin/convert.sh:ro
```

## Differences from a package install

- Media: LiveKit receives all media on one port, 7882/udp, instead of the range 16384-32768 a package install opens.
- TURN: coturn relays only to LiveKit, inside the compose network, so its relay ports are not opened on the host.
- There is no FreeSWITCH, so there is no dial-in.
- Office documents are converted by Collabora Online in `office-conversion` instead of a `bbb-soffice` container per document (`bbb-libreoffice`).
- The PDF export of the shared notes runs in the `shared-notes-conversion` service instead of the systemd units `bbb-shared-notes-conversion.socket` and `bbb-shared-notes-conversion@.service`: the same wkhtmltopdf command and 30 s limit, in a container without network that shares the socket with `shared-notes-server`. In the container all conversions run as one user and share one `/tmp`; the unit gives each conversion a user and a `/tmp` of its own.
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
| `bbb-conf --version` | `docker compose images` (the image tags); the dated version of an image is its label `org.opencontainers.image.version` (`docker image inspect --format '{{index .Config.Labels "org.opencontainers.image.version"}}' <image>`) |

## Greenlight and other front ends

A front end such as [Greenlight](/greenlight/v3/install) needs the API URL and the shared secret: the API URL is `https://<BBB_DOMAIN>/bigbluebutton/api`, the shared secret is `BBB_SHARED_SECRET` in `.env`.

## Troubleshooting

### init fails with "password authentication failed for user postgres"

`.env` was written again after the first start: the postgres volume keeps the `POSTGRES_PASSWORD` it was created with. Remove the postgres volume and start again: `docker compose down && docker volume rm bigbluebutton_postgres && docker compose up -d`.

### Meetings start without the default slides

bbb-web downloads the default slides from `https://<domain>` through the host (`extra_hosts: host-gateway`), so port 443 must be published on the host's addresses (the default). The download needs the real certificate; it fails while haproxy serves the self-signed one.

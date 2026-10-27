# Docker images for BigBlueButton

Container images of the BigBlueButton components, one per package. Each image installs what
its package (`build/packages-template/<package>/`) installs, at the same paths, and ships the
package's default configuration. `docker-compose.yml` in the repository root runs them on one
server (see "Running with docker compose"); other deployments (Kubernetes, clusters) are not part
of this repository.

## Building

`docker-bake.hcl` in the repository root has one target per image:

```sh
docker buildx bake -f docker-bake.hcl --load --set '*.platform=linux/amd64'   # all images, into the local image store
docker buildx bake -f docker-bake.hcl web --load --set '*.platform=linux/amd64'
BBB_IMAGE_REGISTRY=registry.example.com/bbb BBB_IMAGE_TAG=dev docker buildx bake -f docker-bake.hcl --push
```

Images are named `${BBB_IMAGE_REGISTRY}/bbb-<target>:${BBB_IMAGE_TAG}` (defaults
`ghcr.io/bigbluebutton/bigbluebutton` and `latest`). `CLIENT_BUILD` sets the build id of the
HTML5 client. `bbb-webrtc-sfu`, `bbb-webrtc-recorder`, `bbb-webhooks`, `bbb-playback` and
`bbb-presentation-video` (in `bbb-record-and-playback`) are fetched by running their
`*.placeholder.sh` at the repository root, the same scripts the package build runs, so the images
and the packages build the version pinned in one place.

CI (`.github/workflows/build-all-images.yml`) builds every image for amd64 on pull requests. On
pushes to the develop and release branches and on tags, it builds amd64 and arm64 and pushes
`ghcr.io/bigbluebutton/bigbluebutton/bbb-<target>:<branch or tag>`, and the same image as
`:<branch or tag>-<commit>` and `:<branch or tag>-<commit date>-<commit>` (e.g.
`v4.1.x-develop-2a1b3c4` and `v4.1.x-develop-20261027T145204-2a1b3c4`). The date is the HTML5
client's build id, in the committer's time zone, so these tags usually but not always sort by
date. The labels `org.opencontainers.image.revision` and `org.opencontainers.image.version` of each
image hold the commit and the dated version, `org.opencontainers.image.title` its name.
`bbb-record-and-playback` is amd64 only: mkclean, which it needs, has no 64-bit ARM build.

## Images

| Image | Source | Port | Configuration (bare-metal path) |
|---|---|---|---|
| bbb-apps-akka | `akka-bbb-apps/` | 8901 | `/etc/bigbluebutton/bbb-apps-akka.conf`, `bbb-html5.yml` |
| bbb-web | `bigbluebutton-web/` | 8090 | `/etc/bigbluebutton/bbb-web.properties`, `turn-stun-servers.xml` |
| bbb-html5-client | `bigbluebutton-html5/` | 8080 | none (client settings come from bbb-apps-akka) |
| bbb-learning-dashboard | `bbb-learning-dashboard/` | 8080 | none |
| bbb-graphql-actions | `bbb-graphql-actions/` | 8093 | environment only |
| bbb-graphql-middleware | `bbb-graphql-middleware/` | 8378 | `/etc/bigbluebutton/bbb-graphql-middleware.yml` |
| bbb-graphql-server | `bbb-graphql-server/` | 8085 | environment (`HASURA_GRAPHQL_*`) |
| bbb-export-annotations | `bbb-export-annotations/` | none | `/etc/bigbluebutton/bbb-export-annotations.json` |
| bbb-shared-notes-server | `bbb-shared-notes-server/` | 8787 | `/etc/bigbluebutton/bbb-shared-notes-server.yml` |
| bbb-record-and-playback | `record-and-playback/` | none | `/etc/bigbluebutton/recording/recording.yml`, `presentation.yml`, `/etc/bigbluebutton/bbb-web.properties` |
| bbb-nginx | `docker/nginx/` | 8080, 8185 | `/etc/nginx/sites-available/`, `/usr/share/bigbluebutton/nginx/` |
| bbb-webrtc-sfu | `docker/bbb-webrtc-sfu/` | 3008 | `/etc/bigbluebutton/bbb-webrtc-sfu/production.yml` |
| bbb-webrtc-recorder | `docker/bbb-webrtc-recorder/` | none | `/etc/bigbluebutton/bbb-webrtc-recorder.yml` (replaces the default) |
| bbb-webhooks | `docker/bbb-webhooks/` | 3005 | `/etc/bigbluebutton/bbb-webhooks/production.yml` |
| bbb-playback | `docker/bbb-playback/` | 8080 | none |

Third-party services (Redis, PostgreSQL, LiveKit, TURN, document conversion) are not built here;
deployments use their official images.

## Image contract

- Processes run as `bigbluebutton` (UID/GID 998, as in the packages). The nginx-based images
  (html5-client, learning-dashboard, playback, nginx) run as the base image's `nginx` (UID 101).
- Logs go to stdout (record-and-playback: per-recording logs to `/var/log/bigbluebutton`).
  Services listen on all interfaces, on the bare-metal ports.
- Configuration is mounted at the bare-metal path. bbb-apps-akka reads the variables below in
  upstream's `application.conf`, which a mounted `bbb-apps-akka.conf` includes; keys set in that
  file win. bbb-web's environment variables override its mounted files.
- The entrypoint is the process, started as in its systemd unit (nginx images: the base image's).
  graphql-server uses Hasura's entrypoint, which applies the metadata before the engine starts.
- `/var/bigbluebutton` is shared between bbb-web, record-and-playback and nginx (presentations,
  recordings, captions, learning-dashboard reports). `/var/lib/bbb-webrtc-recorder` (recorder and
  record-and-playback) holds the recorded media; `/var/log/bigbluebutton` the recording logs.
- bbb-web converts office documents by calling `/usr/share/bbb-libreoffice-conversion/convert.sh`
  (`presOfficeConversionExec`); the deployment provides that script.
- Shared-notes' PDF export calls a runner script (`commandExecution.runnerScript`). The default is
  upstream's systemd wrapper, which needs systemd, so a deployment configures the runner in its
  mounted `/etc/bigbluebutton/bbb-shared-notes-server.yml`.
- bbb-graphql-middleware opens 8378 only once its Redis subscription is confirmed and exits when
  it loses it, so a deployment restarts it (restart policy).
- record-and-playback runs the resque workers by default. The same image runs
  `/usr/local/bigbluebutton/core/scripts/rap-starter.rb`, `rap-caption-inbox.rb` and the daily
  cleanup `/etc/cron.daily/bigbluebutton`, which the deployment schedules. Deleting published
  recordings by age is the recipe in `docs/docs/administration/customize.md`, not part of the images.

### Edge nginx

`bbb-nginx` is the server's nginx with the site and location files of the packages. It proxies the
static apps by their default service names on port 8080: `html5-client`, `learning-dashboard` and
`playback`. nginx resolves these names when it starts, so a deployment either runs those images
under these service names or mounts its own fragments at `/usr/share/bigbluebutton/nginx/`.
Content from volumes (slides, recordings, captions, learning-dashboard reports) it serves itself
from `/var/bigbluebutton`. The backends are the upstreams in `/etc/nginx/conf.d/bbb-upstreams.conf`,
by their default service names: `web`, `graphql-middleware`, `livekit`, `webrtc-sfu` and
`shared-notes-server`; Hasura is `graphql-server` in `sites-available/hasura-loadbalancer.conf`.
A deployment uses these names or mounts its own two files. nginx resolves every host name in these
files when it starts, so all of them must resolve then. The optional `webhooks` is not an upstream:
its location (`/usr/share/bigbluebutton/nginx/webhooks.nginx`) resolves the name per request through
the container's DNS server, so without it nginx starts and answers `/bigbluebutton/api/hooks` with
502. The base image's entrypoint renders that resolver at start into `/tmp/bbb-resolver.conf`, so the
image must be started with its entrypoint (a Kubernetes `command:` replaces it; without it the hooks
API fails), and `/tmp` must be writable, as it already must be for nginx's pid and temp files. With
several nameservers in `/etc/resolv.conf` nginx rotates between
them, so all of them must know the name; on Kubernetes `webhooks` needs its full service name,
because nginx's resolver ignores search domains. TLS and `server_name` are deployment config.

## Environment variables

Only these are read; everything else is set in the mounted configuration.

- **bbb-apps-akka** (HOCON `${?VAR}` in upstream's `application.conf`): `SHARED_SECRET`,
  `BBB_WEB_API`, `GRAPHQL_MIDDLEWARE_API`, `REDIS_HOST`, `REDIS_PASSWORD`, `POSTGRES_HOST`,
  `POSTGRES_PASSWORD`; upstream's `INTERFACE` (set to `0.0.0.0`) and `PORT`; `JAVA_OPTS`;
  `BBB_LOG_FILE_APPENDER` (set to `STDOUT`).
- **bbb-web**: any key of `bigbluebutton.properties`, upper case with `.` as `_` (or the key
  itself), e.g. `BIGBLUEBUTTON_WEB_SERVERURL`, `SECURITYSALT`, `REDISHOST`; they override
  `bbb-web.properties`. Also `JDK_JAVA_OPTIONS` (heap), `MALLOC_ARENA_MAX` and
  `BBB_LOG_FILE_APPENDER` (set to `STDOUT`).
- **bbb-graphql-actions**: `BBB_REDIS_HOST`, `BBB_REDIS_PORT`, `BBB_REDIS_PASSWORD`,
  `SERVER_HOST` (`0.0.0.0`), `SERVER_PORT`, `MAX_BODY_SIZE`.
- **bbb-graphql-server**: Hasura's `HASURA_GRAPHQL_*`, with the package's defaults set in the image.
  Usually set: `HASURA_GRAPHQL_DATABASE_URL`, `HASURA_GRAPHQL_BBB_DATABASE_URL`,
  `HASURA_GRAPHQL_AUTH_HOOK`, `HASURA_BBB_GRAPHQL_ACTIONS_ADAPTER_URL`. The image ships no admin
  secret: `HASURA_GRAPHQL_ADMIN_SECRET` is required, and Hasura refuses to start without it
  because the image sets the auth hook.
- **bbb-export-annotations**: none; a deployment mounts
  `/etc/bigbluebutton/bbb-export-annotations.json`.
- **bbb-record-and-playback**: resque's `QUEUE` and `COUNT` (preset as in the systemd unit).
- **bbb-webrtc-sfu**, **bbb-webhooks**: the variables in the component's
  `config/custom-environment-variables.yml` (node-config), e.g. `REDIS_HOST`, `REDIS_PASSWORD`;
  for the SFU also `LIVEKIT_HOST`, `LIVEKIT_KEY`, `LIVEKIT_SECRET`; for webhooks `SERVER_DOMAIN`,
  `SHARED_SECRET`. Environment variables take precedence over `production.yml`.
- **bbb-webrtc-recorder**: `BBBRECORDER_*`, e.g. `BBBRECORDER_LIVEKIT_HOST`,
  `BBBRECORDER_LIVEKIT_APIKEY`, `BBBRECORDER_LIVEKIT_APISECRET`. A Redis address in
  `BBBRECORDER_PUBSUB_ADAPTERS_REDIS_ADDRESS` needs `BBBRECORDER_PUBSUB_ADAPTERS_REDIS_NETWORK=tcp`
  as well.
- **bbb-graphql-middleware**, **bbb-shared-notes-server**: `SERVER_HOST`, the listen address (the
  image sets `0.0.0.0`); an override file cannot change it, as the environment wins.
- **bbb-html5-client**, **bbb-learning-dashboard**, **bbb-playback**: none.
- **bbb-nginx**: the base image's `NGINX_ENTRYPOINT_LOCAL_RESOLVERS`, which the image sets.

## Running with docker compose

`docker-compose.yml` runs BigBlueButton on one server with these images, official images for
Redis, PostgreSQL, LiveKit, coturn, haproxy and certbot, and the configuration in
`docker/compose/`, mounted at the bare-metal paths. Files that need values from `.env` are inline
in `docker-compose.yml` (`configs:`).

Requirements:

- one Linux server with Docker Engine 28 or later and the compose plugin 2.35 or later (`init`
  mounts the database schemas from the images as image volumes);
- a DNS name for it and a public IPv4 address;
- open ports: 80/tcp and 443/tcp (web, Let's Encrypt, TURN over TLS), 3478/tcp and 3478/udp
  (TURN), 7882/udp (LiveKit media);
- the subnet `172.30.82.0/24` free on the host (the compose network; LiveKit has a fixed address
  in it, the only address coturn relays to).

Install and start:

```sh
curl -fsSL https://raw.githubusercontent.com/bigbluebutton/bigbluebutton/v4.1.x-develop/docker/compose/install.sh | sh -s -- <domain> [email]
cd bigbluebutton && docker compose up -d
```

`docker/compose/install.sh` checks the Docker versions, downloads `docker-compose.yml`, `.env.sample`
and `docker/compose/` into `./bigbluebutton` and writes `.env` with the domain, its IPv4 address, the
email and new secrets; an existing `.env` is kept. Without the script: copy these files from the
repository, `cp .env.sample .env` and set every value.

The images come from the registry (`docker compose pull`, or the first `up`); no local build is
needed. `BBB_IMAGE_TAG` is a branch tag such as `v4.1.x-develop`, or `v4.1.x-develop-<commit>` to
pin a set of images built together.

`COMPOSE_PROFILES` in `.env` selects the optional parts: `recording` (on by default, as in a
bare-metal install: the recorder, the processing and the player) and `webhooks`. Without
`recording`, meetings are not recorded, even when they are created with `record=true`.

What happens on the first start:

- `init` creates the directories under `./data` that the packages create on install, and the
  databases and roles, as the packages' after-install scripts do. It runs again on every `up`,
  and recreates `bbb_graphql` or `blocknote_app` only when its schema in the image changed.
- `certbot` gets a Let's Encrypt certificate through nginx on port 80 and checks twice a day
  whether it is due for renewal. It writes the certificate for haproxy and reloads haproxy
  through haproxy's master socket. Until the first certificate is issued, haproxy serves a
  self-signed one. To use your own certificate instead, put the chain and the key in
  `./data/certs` as `fullchain.pem` and `privkey.pem` (the names bbb-install uses in
  `/local/certs`); `ACME_EMAIL` can then stay empty. certbot uses them when it starts and reads
  them again every hour.
- haproxy terminates TLS on 443. HTTP goes to nginx; TURN goes to coturn. TURN is recognised by
  the ALPN `stun.turn`, or, without ALPN, by a first byte that is not a letter.

Upgrade: set `BBB_IMAGE_TAG` (or keep a branch tag), then

```sh
docker compose pull
docker compose up -d --force-recreate
```

Every service restarts, as in a package upgrade. When a schema changed, its database is
recreated, so meetings that are running end.

Data, in `./data` next to `docker-compose.yml`:

- `bigbluebutton`: `/var/bigbluebutton` (presentations, recordings, learning dashboard data);
- `recordings`: `/var/lib/bbb-webrtc-recorder` (raw media until a recording is processed);
- `letsencrypt`: `/etc/letsencrypt` (certificate and ACME account);
- `certs`: your own certificate, if you use one.

Backup: `./data` and `.env`. PostgreSQL (a volume) holds only the state of running meetings, and
`init` recreates its databases, so it is not part of a backup. `docker compose down -v` removes
it and the other volumes, but not `./data`.

If `init` fails with "password authentication failed for user postgres", `.env` was written
again after the first start: the postgres volume keeps the `POSTGRES_PASSWORD` it was created
with. Run `docker compose down -v` and start again.

Configuration:

- `.env` holds the values per server.
- bbb-web and bbb-apps-akka get their settings from environment variables in
  `docker-compose.yml` (see "Environment variables"); bbb-web takes any key of
  `bigbluebutton.properties` this way.
- Other bare-metal settings go in the inline files (`livekit.yaml`, `recording.yml`,
  `bbb-shared-notes-server.yml`) or in `docker/compose/`. Or mount further files at their
  bare-metal paths (see "Images"), e.g. `/etc/bigbluebutton/bbb-apps-akka.conf`.
- To use your own version of an inline file without editing `docker-compose.yml`, replace it in
  a `docker-compose.override.yml` next to it (compose reads that file automatically). `!override`
  is needed: without it compose merges both definitions and rejects `content` and `file` together.

  ```yaml
  configs:
    livekit.yaml: !override
      file: ./my-livekit.yaml
  ```

  A file is used as it is; `${…}` from `.env` is only filled in under `content:`.
- Shared notes run the PDF converter through `commandExecution.runnerScript` in
  `bbb-shared-notes-server.yml`; the compose file sets it to `timeout`.
- nginx uses the image's location files and upstreams, which use the default service names. The
  compose file mounts only its site (port 80 and haproxy's 8081) and `playback.nginx`, because
  `playback` runs only with the `recording` profile.
- More Hasura instances: `docker compose up -d --scale graphql-server=2`, then
  `docker compose exec nginx nginx -s reload`. nginx balances them as on bare metal and looks up
  the instances only when it starts or reloads, so reload it again after scaling down.
- bbb-web downloads the default slides from `https://<domain>` through the host
  (`extra_hosts: host-gateway`), so port 443 must be published on the host's addresses (the
  default). The download needs the real certificate; it fails while haproxy serves the
  self-signed one.
- Logs: `docker compose logs <service>`; the logs per recording are in the `recording-logs` volume.

Not covered: office document conversion (bbb-web expects
`/usr/share/bbb-libreoffice-conversion/convert.sh`, which no image provides yet), FreeSWITCH and
dial-in, more than one server, Kubernetes, and running behind an existing reverse proxy or TLS
terminator.

### On your own machine

For development: a certificate from a local CA such as [mkcert](https://github.com/FiloSottile/mkcert),
and in `.env` `BBB_DOMAIN=bbb.localhost` (browsers resolve `*.localhost` to the loopback address),
`BBB_PUBLIC_IP=127.0.0.1` and an empty `ACME_EMAIL`. Then open `https://bbb.localhost`.

```sh
mkcert -install
mkdir -p data/certs && cp "$(mkcert -CAROOT)/rootCA.pem" data/certs/
mkcert -cert-file data/certs/fullchain.pem -key-file data/certs/privkey.pem bbb.localhost
```

bbb-web loads the default slides from `https://bbb.localhost`, so it must trust the CA (otherwise
meetings start without them): create a Java truststore with it once, and use it in a
`docker-compose.override.yml`.

```sh
docker compose run --rm --no-deps --user 0 -v ./data/certs:/certs --entrypoint sh web -c 'cp "$JAVA_HOME/lib/security/cacerts" /certs/cacerts && keytool -importcert -noprompt -alias local-ca -file /certs/rootCA.pem -keystore /certs/cacerts -storepass changeit'
```

```yaml
services:
  web:
    environment:
      JAVA_TOOL_OPTIONS: -Djavax.net.ssl.trustStore=/etc/ssl/local/cacerts
    volumes:
      - ./data/certs/cacerts:/etc/ssl/local/cacerts:ro
```

### Development

In a checkout of this repository, build the image of the component you changed and run it in
place of the published one, e.g. for bbb-web:

```sh
BBB_IMAGE_REGISTRY=localhost BBB_IMAGE_TAG=dev docker buildx bake -f docker-bake.hcl --load --set '*.platform=linux/amd64' web
```

```yaml
# docker-compose.override.yml
services:
  web:
    image: localhost/bbb-web:dev
```

Then `docker compose up -d web`.

For the HTML5 client, run the webpack dev server on your machine (Node 24), as
`bigbluebutton-html5/run-dev.sh` does: a changed source file is recompiled and reloaded in the
browser without a restart.

```sh
cd bigbluebutton-html5 && npm ci && npm start
```

`docker/compose/dev/html5.yml` makes nginx proxy `/html5client/` to port 3000 of your machine.
Add it in `.env`:

```sh
COMPOSE_FILE=docker-compose.yml:docker/compose/dev/html5.yml:docker-compose.override.yml
```

With `COMPOSE_FILE` set, compose reads `docker-compose.override.yml` only when it is listed (and
then it must exist). The dev server listens on all interfaces, so it is reachable from your
network. If a firewall denies incoming connections, allow port 3000 from the compose network
(172.30.82.0/24), e.g. `ufw allow from 172.30.82.0/24 to any port 3000 proto tcp`.

Without Node on your machine, use `docker/compose/dev/html5-container.yml` instead: it runs the dev
server in a container. The first start runs `npm ci` into a volume and compiles (about two minutes;
until then `/html5client` answers 502).

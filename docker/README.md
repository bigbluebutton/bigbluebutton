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
client's build id, the commit date in UTC, so these tags sort by date. A release tag `vX.Y.Z`
is also pushed as `:vX.Y` if it is the newest `vX.Y.Z` (pre-releases like `v4.1.0-rc.1` are
not), so `v4.1` always points to the latest `v4.1` release. The labels
`org.opencontainers.image.revision` and `org.opencontainers.image.version` of each image hold the
commit and the dated version, `org.opencontainers.image.title` its name.

## Images

| Image | Source | Port | Configuration (bare-metal path) |
|---|---|---|---|
| bbb-apps-akka | `akka-bbb-apps/` | 8901 | `/etc/bigbluebutton/bbb-apps-akka.conf`, `bbb-html5.yml` |
| bbb-web | `bigbluebutton-web/` | 8090 | `/etc/bigbluebutton/bbb-web.properties`, `turn-stun-servers.xml` |
| bbb-html5-client | `bigbluebutton-html5/` | 8080 | none (client settings come from bbb-apps-akka) |
| bbb-learning-dashboard | `bbb-learning-dashboard/` | 8080 | none |
| bbb-graphql-actions | `bbb-graphql-actions/` | 8093 | environment only |
| bbb-graphql-middleware | `bbb-graphql-middleware/` | 8378 | environment (`SERVER_HOST`, `REDIS_*`, `*_URL`), `/etc/bigbluebutton/bbb-graphql-middleware.yml` |
| bbb-graphql-server | `bbb-graphql-server/` | 8085 | environment (`HASURA_GRAPHQL_*`) |
| bbb-export-annotations | `bbb-export-annotations/` | none | environment (`REDIS_*`, `BBB_WEB_URL`, `BBB_EXPORT_ANNOTATIONS_*`), `/etc/bigbluebutton/bbb-export-annotations/production.json` |
| bbb-shared-notes-server | `bbb-shared-notes-server/` | 8787 | environment (`SERVER_HOST`, `BBB_WEB_URL`, `REDIS_*`, `POSTGRES_*`), `/etc/bigbluebutton/bbb-shared-notes-server.yml` |
| bbb-record-and-playback | `record-and-playback/` | none | environment (`REDIS_*`, `PLAYBACK_HOST`, `BN_NOTES_ENDPOINT`, `SHARED_SECRET`), `/etc/bigbluebutton/recording/recording.yml`, `presentation.yml`, `/etc/bigbluebutton/bbb-web.properties` |
| bbb-nginx | `docker/nginx/` | 8080, 8185 | `/etc/nginx/sites-available/`, `/usr/share/bigbluebutton/nginx/` |
| bbb-webrtc-sfu | `docker/bbb-webrtc-sfu/` | 3008 | `/etc/bigbluebutton/bbb-webrtc-sfu/production.yml` |
| bbb-webrtc-recorder | `docker/bbb-webrtc-recorder/` | none | `/etc/bigbluebutton/bbb-webrtc-recorder.yml` (replaces the default) |
| bbb-webhooks | `docker/bbb-webhooks/` | 3005 | `/etc/bigbluebutton/bbb-webhooks/production.yml` |
| bbb-playback | `docker/bbb-playback/` | 8080 | none |
| bbb-init | `docker/bbb-init/` | none | environment only |

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
- bbb-init runs once before the other services, on every start or upgrade (a Kubernetes Job), as
  root. It creates the directories in these three volumes as the packages do, the roles and the
  databases as the packages' after-install scripts do, and recreates `bbb_graphql` or
  `blocknote_app` when its schema in the image changed, so it must come from the same commit as
  bbb-graphql-server and bbb-shared-notes-server.
- bbb-web converts office documents by calling the script in `presOfficeConversionExec`
  (default `/usr/share/bbb-libreoffice-conversion/convert.sh`, which the image does not have). The
  image has the sample client for Collabora Online at
  `/usr/share/bbb-libreoffice-conversion/convert-cool.sh`, which sends the document to the server
  at `COOL_URL`; `docker-compose.yml` selects it with `PRESOFFICECONVERSIONEXEC`.
- Shared-notes' PDF export sends the HTML to `/run/bbb-shared-notes-conversion.sock`
  (`commandExecution.conversionSocket`), which systemd units serve in a package install. The image
  has a listener for it, `node bbb-shared-notes-conversion.js`; a deployment runs it as a second
  container of the image, with the socket's directory shared between both.
- bbb-graphql-middleware opens 8378 only once its Redis subscription is confirmed and exits when
  it loses it, so a deployment restarts it (restart policy).
- record-and-playback runs the resque workers by default. The same image runs
  `/usr/local/bigbluebutton/core/scripts/rap-starter.rb`, `rap-caption-inbox.rb` and the daily
  cleanup `/etc/cron.daily/bigbluebutton`, which the deployment schedules. Deleting published
  recordings by age is the recipe in `docs/docs/administration/customize.md`, not part of the images.

### Edge nginx

`bbb-nginx` is the server's nginx with the site and location files of the packages. Content from
volumes (slides, recordings, captions, learning-dashboard reports) it serves itself from
`/var/bigbluebutton`. It proxies to the other images by their default service names:
- the upstreams in `/etc/nginx/conf.d/bbb-upstreams.conf`: the backends `web`,
  `graphql-middleware`, `livekit`, `webrtc-sfu` and `shared-notes-server`, and the static apps
  `html5-client` and `learning-dashboard` (port 8080);
- Hasura, `graphql-server`, in `sites-available/hasura-loadbalancer.conf`;
- `playback` in `/usr/share/bigbluebutton/nginx/playback.nginx` (the compose file mounts one that
  resolves the name per request, as playback runs only with the recording profile), and the
  optional `webhooks`, whose location there resolves it per request, so without it nginx starts
  and answers `/bigbluebutton/api/hooks` with 502.

A deployment uses these names or mounts its own files. Its own `bbb-upstreams.conf` must define
all seven upstreams: the image's `bbb-html5.nginx` and `learning-dashboard.nginx` proxy to
`bbb-html5-client` and `bbb-learning-dashboard`, and without them nginx does not start (`host not
found in upstream "bbb-html5-client"`).

Except `livekit`, which has a fixed address in the compose network, the upstreams resolve their
names at run time through the container's DNS server, every 30 s: a service recreated alone with
a new address, and Hasura scaled up or down, are found in about 30 s without reloading nginx, and
nginx starts before they resolve.

The base image's entrypoint renders that resolver at start into `/tmp/bbb-resolver.conf`, so the
image must be started with its entrypoint (a Kubernetes `command:` replaces it, and nginx then does
not start), and `/tmp` must be writable, as it already must be for nginx's pid and temp files. With
several nameservers in `/etc/resolv.conf` nginx rotates between them, so all of them must know the
names. On Kubernetes the short names do not resolve, because nginx's resolver ignores search
domains: mount your own `bbb-upstreams.conf`, `hasura-loadbalancer.conf` and locations with the full
service names. Resolving a name spreads the load over several pods only with a headless Service,
whose name resolves to the pods; a ClusterIP Service resolves to one address. TLS and
`server_name` are deployment config.

## Environment variables

Only these are read; everything else is set in the mounted configuration. Where a component also
has a configuration file, the variable wins over the file, and a variable set to an empty value
counts as not set.

- **bbb-apps-akka** (HOCON `${?VAR}` in upstream's `application.conf`): `SHARED_SECRET`,
  `BBB_WEB_API` (bbb-web's public API URL, e.g. `https://<domain>/bigbluebutton/api`: the
  breakout rooms' join links are built on it and opened by the browser),
  `GRAPHQL_MIDDLEWARE_API`, `REDIS_HOST`, `REDIS_PASSWORD`, `POSTGRES_HOST`,
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
- **bbb-export-annotations**: the variables in `config/custom-environment-variables.json`:
  `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `BBB_WEB_URL` (bbb-web's base URL, e.g.
  `http://web:8090`, without a trailing slash; bbb-apps-akka's `BBB_WEB_API` is the API URL) and
  `BBB_EXPORT_ANNOTATIONS_*` for the log level, the shared paths and the rasterize timeout.
  Environment variables take precedence over a mounted
  `/etc/bigbluebutton/bbb-export-annotations/production.json`.
- **bbb-record-and-playback**: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `PLAYBACK_HOST` (the
  public domain in the playback URLs), `BN_NOTES_ENDPOINT` (the notes export of
  bbb-shared-notes-server) and `SHARED_SECRET`, which signs the callbacks and wins over
  `securitySalt` in `bbb-web.properties`. The resque queue uses `redis_workers_*` from the files
  when they are set. Also resque's `QUEUE` and `COUNT` (preset as in the systemd unit).
- **bbb-webrtc-sfu**, **bbb-webhooks**: the variables in the component's
  `config/custom-environment-variables.yml` (node-config), e.g. `REDIS_HOST`, `REDIS_PASSWORD`;
  for the SFU also `LIVEKIT_HOST`, `LIVEKIT_KEY`, `LIVEKIT_SECRET`; for webhooks `SERVER_DOMAIN`,
  `SHARED_SECRET`. Environment variables take precedence over `production.yml`.
- **bbb-webrtc-recorder**: `BBBRECORDER_*`, e.g. `BBBRECORDER_LIVEKIT_HOST`,
  `BBBRECORDER_LIVEKIT_APIKEY`, `BBBRECORDER_LIVEKIT_APISECRET`. A Redis address in
  `BBBRECORDER_PUBSUB_ADAPTERS_REDIS_ADDRESS` needs `BBBRECORDER_PUBSUB_ADAPTERS_REDIS_NETWORK=tcp`
  as well.
- **bbb-graphql-middleware**: `SERVER_HOST`, the listen address (the image sets `0.0.0.0`),
  `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `HASURA_URL`,
  `HASURA_BBB_GRAPHQL_ACTIONS_ADAPTER_URL` (the graphql-actions URL, the name bbb-graphql-server
  reads for the same address), `AUTH_HOOK_URL` and `SESSION_VARS_HOOK_URL`.
- **bbb-shared-notes-server**: `SERVER_HOST`, the listen address (the image sets `0.0.0.0`),
  `BBB_WEB_URL` (bbb-web's base URL, e.g. `http://web:8090`), `REDIS_HOST`, `REDIS_PORT`,
  `REDIS_PASSWORD`, `POSTGRES_HOST` and `POSTGRES_PASSWORD`.
- **bbb-html5-client**, **bbb-learning-dashboard**, **bbb-playback**: none.
- **bbb-nginx**: the base image's `NGINX_ENTRYPOINT_LOCAL_RESOLVERS`, which the image sets.
- **bbb-init**: psql's `PGHOST`, `PGUSER` and `PGPASSWORD` (a PostgreSQL superuser), and the
  passwords it sets for the roles: `BBB_CORE_PASSWORD`, `BBB_HASURA_PASSWORD`,
  `HASURA_APP_PASSWORD`, `BLOCKNOTE_PASSWORD`.

On Kubernetes, a Service named `redis` makes Kubernetes set `REDIS_PORT=tcp://<address>:6379` in
the pods of the namespace. The recording, bbb-export-annotations, bbb-shared-notes-server and
bbb-graphql-middleware ignore a `REDIS_PORT` that is not a number, with a warning;
`enableServiceLinks: false` in the pod spec avoids the variable.

## Running with docker compose

`docker-compose.yml` runs these images on one server. Installing, configuring and upgrading it
is described in [Install with Docker Compose](../docs/docs/administration/docker-compose.md), a
page of the administration documentation.

To run it on your own machine and replace an image with your own build (and the HTML5 client
with the Vite dev server), see "Develop with Docker Compose" in the
[development guide](../docs/docs/development/dev-guide.md).

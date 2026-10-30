# Docker images for BigBlueButton

Container images of the BigBlueButton components, one per package. Each image installs what
its package (`build/packages-template/<package>/`) installs, at the same paths, and ships the
package's default configuration. Running them together (compose, Kubernetes, TLS, setup) is
deployment work and not part of this repository.

## Building

`docker-bake.hcl` in the repository root has one target per image:

```sh
docker buildx bake --load --set '*.platform=linux/amd64'   # all images, into the local image store
docker buildx bake web --load --set '*.platform=linux/amd64'
BBB_IMAGE_REGISTRY=registry.example.com/bbb BBB_IMAGE_TAG=dev docker buildx bake --push
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
client's build id, the commit date in UTC, so these tags sort by date. The labels
`org.opencontainers.image.revision` and `org.opencontainers.image.version` of each image hold the
commit and the dated version, `org.opencontainers.image.title` its name.
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

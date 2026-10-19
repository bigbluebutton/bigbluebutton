# Container images for BigBlueButton

Images are built from this repository. A component with its own source directory has its
`Dockerfile` there (`<component>/Dockerfile`, image files in `<component>/docker/`). Images
without a source directory live in `docker/<name>/`.

| Path | Contents |
|---|---|
| `docker-bake.hcl` | shared bake definitions: metadata target, `entrypoint-lib` context, Java base, `default` group |
| `docker/bake/<image>.hcl` | the bake target(s) of one image |
| `docker/java-base/` | Java 21 runtime base for the JVM images |
| `docker/lib/` | shared entrypoint helper (`entrypoint-lib.sh`, see `docker/lib/README.md`) |
| `docker/tests/` | tests: helper, UID/GID check, directory modes, BuildKit build, lint, golden files, compose, smoke |
| `docker/.hadolint.yaml` | hadolint rules for all Dockerfiles |

## Building

Each image's targets are in their own file, `docker/bake/<image>.hcl`. `docker-bake.hcl` holds
only what images share. Bake reads several files when `-f` is repeated and combines them into one
definition ([`docker buildx bake --file`](https://docs.docker.com/reference/cli/docker/buildx/bake/#file)),
so always pass the root file and every per-image file:

```bash
docker buildx bake -f docker-bake.hcl $(printf -- '-f %s ' docker/bake/*.hcl) web
docker buildx bake -f docker-bake.hcl $(printf -- '-f %s ' docker/bake/*.hcl) --print   # all targets
```

or, equivalently, with [`BUILDX_BAKE_FILE`](https://docs.docker.com/build/building/variables/#buildx_bake_file)
(paths separated by `:`; ignored when `-f` is given):

```bash
export BUILDX_BAKE_FILE="$(printf '%s\n' docker-bake.hcl docker/bake/*.hcl | paste -sd:)"
docker buildx bake web
```

Do not rely on bake's default file lookup: it also loads `docker-compose.yml` from the
repository root and merges its services into the definition
([file lookup](https://docs.docker.com/build/bake/reference/#file-format)).

The bake variable `COMMIT_DATE` is the html5 client's build identifier: `html5ClientBuild` in
its `settings.yml` and the `?v=` cache buster of `index.html` and `fonts.css`, as upstream's
package build sets it (`build/packages-template/bbb-html5/build.sh`). The html5 client image,
akka-apps and bbb-web all ship the client build's `settings.yml`, so they carry the same value. CI sets the
commit date in upstream's form; empty (the default) gives `0`, the value of the golden tests.
For a build that you deploy, set it, so that browsers load the new client after an upgrade:

```bash
COMMIT_DATE="$(git log -1 --format=%cd --date=format:%Y%m%dT%H%M%S)" \
    docker buildx bake -f docker-bake.hcl $(printf -- '-f %s ' docker/bake/*.hcl) --load
```

Adding an image means adding its bake file (with `platforms`, see [CI](#ci)) and one line in
the `default` group in `docker-bake.hcl` (bake does not merge a group defined in several files:
the last definition wins). CI picks it up from there.

### Image names

`docker-compose.yml` runs `${BBB_IMAGE_REGISTRY}/bbb-<image>:${BBB_IMAGE_TAG}` (defaults
`ghcr.io/bigbluebutton/bigbluebutton` and `4.0.1`, see `docker/config-contract.yaml`). Bake tags local builds
the same way, with the bake variables `BBB_IMAGE_REGISTRY` (default `localhost`) and
`BBB_IMAGE_TAG` (default `4.0.1`). In CI the tags of docker/metadata-action replace them.

| Bake target | Image | Compose service |
|---|---|---|
| `apps-akka` | `bbb-apps-akka` | `akka-apps` |
| `bbb-webrtc-sfu` | `bbb-webrtc-sfu` | `bbb-webrtc-sfu` |
| `bbb-webrtc-recorder` | `bbb-webrtc-recorder` | `bbb-webrtc-recorder` (profile `recording`) |
| `certbot` | `bbb-certbot` | `certbot` |
| `coturn` | `bbb-coturn` | `coturn` |
| `db-init` | `bbb-db-init` | `db-init` |
| `export-annotations` | `bbb-export-annotations` | `export-annotations` |
| `graphql-actions` | `bbb-graphql-actions` | `graphql-actions` |
| `graphql-middleware` | `bbb-graphql-middleware` | `graphql-middleware` |
| `graphql-server` | `bbb-graphql-server` | `graphql-server` |
| `haproxy` | `bbb-haproxy` | `haproxy` |
| `livekit` | `bbb-livekit` | `livekit` |
| `nginx` | `bbb-nginx` | `nginx` |
| `postgres` | `bbb-postgres` | `postgres` |
| `shared-notes` | `bbb-shared-notes` | `shared-notes` |
| `web` | `bbb-web` | `bbb-web` |
| `setup` | `bbb-setup` | `setup` (profile `setup`, run-only: `docker compose run --rm setup`) |
| `record-and-playback` | `bbb-record-and-playback` | `recording`, `recording-starter`, `recording-caption-inbox`, `recording-cleanup` (profile `recording`) |
| `html5-client` | `bbb-html5-client` | `html5` (also a build stage of `apps-akka` and `web`: its `settings.yml`) |
| `learning-dashboard` | `bbb-learning-dashboard` | `learning-dashboard` |
| `playback` | `bbb-playback` | `playback` (profile `recording`) |

`bbb-common-message`, `bbb-common-web` and `_java-base` are build stages and get no tag.
Third-party images (redis) are pinned by tag and digest in `docker-compose.yml`.

**Upstream's images.** A component whose code lives outside this repository and whose own
repository publishes an image runs from that image, pinned by tag and digest in
`docker-compose.yml` to the version BigBlueButton pins (`<component>.placeholder.sh`; the
image's `org.opencontainers.image.revision` label is that commit):

- **webhooks** runs `ghcr.io/bigbluebutton/bbb-webhooks` unchanged, configured in
  `docker-compose.yml` only, through node-config: the environment variables of its
  `config/custom-environment-variables.yml` and `NODE_CONFIG`, JSON that node-config merges
  over the configuration files ([node-config: Environment Variables](https://github.com/node-config/node-config/wiki/Environment-Variables#node_config)).
- **bbb-webrtc-sfu** is a thin layer over `ghcr.io/bigbluebutton/bbb-webrtc-sfu`
  (`docker/bbb-webrtc-sfu/`): the bare-metal package's changes to upstream's configuration as
  one file between upstream's configuration and the Tier 3 override, the entrypoint (validation)
  and a healthcheck. `NODE_CONFIG` would not do: it is merged after every file, so a Tier 3
  `production.yml` could no longer change those settings.
- **bbb-webrtc-recorder** is a thin layer over `ghcr.io/bigbluebutton/bbb-webrtc-recorder`
  (`docker/bbb-webrtc-recorder/`): upstream's image and packaged default unchanged, plus yq, an
  entrypoint and a healthcheck. The recorder loads exactly one configuration file (the first it
  finds), so a Tier 3 `/etc/bigbluebutton/bbb-webrtc-recorder.yml` mounted into upstream's image
  would replace the whole default. The entrypoint merges the container wiring (redis and
  livekit-server by service name) and the Tier 3 file over the default into
  `/run/bbb-webrtc-recorder/bbb-webrtc-recorder.yml` and starts the recorder on it; the LiveKit
  key pair reaches it as `BBBRECORDER_LIVEKIT_APIKEY`/`APISECRET`, as on bare metal. It has no
  listener: it is healthy while it holds its redis connection and can write
  `/var/lib/bbb-webrtc-recorder` (the volume `recorder-raw`).

These upstream images are published for amd64 and arm64. bbb-webrtc-sfu and webhooks keep
upstream's Node version, Node 22 (`node:22-bookworm-slim` and `node:22-alpine`), not the Node
24 of the bare-metal packages and of our Node images; bbb-webrtc-recorder is a Go binary on
`debian:bookworm-slim`. Supply chain: we trust upstream's images as its CI publishes
them. The digest pin is the integrity anchor; the `org.opencontainers.image.revision` label is
upstream's claim of the commit, not something we verify by building it.

To run the stack on local builds:

```bash
docker buildx bake -f docker-bake.hcl $(printf -- '-f %s ' docker/bake/*.hcl) --load
BBB_IMAGE_REGISTRY=localhost docker compose up -d     # or set it in .env
```

### Shared entrypoint helper

Every image gets `docker/lib/entrypoint-lib.sh` the same way: its bake target inherits
`_entrypoint-lib`, which defines the named context `entrypoint-lib` (`./docker/lib`), and its
Dockerfile copies the helper from that context:

```hcl
target "web" {
    inherits = ["docker-metadata-action", "_entrypoint-lib"]
    context  = "./bigbluebutton-web"
}
```

```dockerfile
RUN install -d -m 0755 /usr/local/lib/bbb
# hadolint ignore=DL3022
COPY --from=entrypoint-lib --chmod=0644 entrypoint-lib.sh /usr/local/lib/bbb/entrypoint-lib.sh
```

Create every directory that a `COPY --chmod` writes into before the `COPY`, with
`install -d -m 0755`: BuildKit gives the directories it creates for the `COPY` the `--chmod`
mode too, so with `0644` no other user can enter them (podman/buildah creates them with
`0755`). `docker/tests/dirmodes/check.sh IMAGE` finds such directories, and
`docker/tests/buildkit/build.sh TARGET` builds with BuildKit on a host that has only podman.

Images built on the Java base already contain the helper at that path. Without bake, pass the
context directly: `podman build --build-context entrypoint-lib=docker/lib ...` (or
`docker buildx build --build-context entrypoint-lib=docker/lib ...`).

### Java base

`docker/java-base/` is `ubuntu:24.04` (pinned by digest) with Ubuntu's `openjdk-21-jre-headless`,
the OpenJDK that bare-metal installs use, plus the entrypoint helper. `JAVA_HOME` is
`/usr/lib/jvm/java-21` on every architecture. It contains nothing that only one image needs:
such tools (ImageMagick, poppler, ...) go into that image. JVM images use it as a named context:

```hcl
contexts = { java-base = "target:_java-base" }
```

```dockerfile
# hadolint ignore=DL3006
FROM java-base
```

### Package versions

Base images are pinned by digest, with the tag in a comment. apt/apk packages are not pinned
individually: the digest-pinned base is the reproducibility anchor, and each image's installed
package versions are recorded at build time (SBOM). hadolint DL3008/DL3018 are therefore ignored
in `docker/.hadolint.yaml`.

## Running the stack

Operators: installing, upgrading, backing up and restoring the stack is described in
[`docs/docs/administration/docker.md`](../docs/docs/administration/docker.md). The design
decisions and their reasons are summarized in
[`docs/docs/administration/docker-design.md`](../docs/docs/administration/docker-design.md).

`docker-compose.yml` at the repository root is the only compose file. It is static: settings
come from `.env` (template: `.env.sample`, generated from `docker/config-contract.yaml`) and
each service receives only the variables it reads. The images validate them at start and exit
with a message naming a missing or malformed variable.

- **Services.** The file has these services: haproxy, certbot, nginx, html5 (the html5 client),
  learning-dashboard, bbb-web, akka-apps, graphql-server, graphql-middleware, graphql-actions,
  shared-notes, export-annotations, redis, postgres, db-init (a job that exits after setting up
  the databases), livekit, bbb-webrtc-sfu, coturn and the office document conversion
  (`conversion`, below), the optional webhooks (profile `webhooks`, below), bbb-webrtc-recorder,
  recording processing and playback (profile `recording`, below), and the run-only `setup` that
  writes `.env` (below). Greenlight, monitoring and preflight follow. Until then `BBB_FEATURES`
  may be `webhooks`, `recording` (bbb-webrtc-recorder writes the raw media into `recorder-raw`,
  the recording services process and publish the recordings, and playback serves them), both,
  or empty; the default is `recording`, as on a default bare-metal install (unset in the
  images' environment means the same).
- **Recording processing** (profile `recording`) runs the processes of bbb-record-core's systemd
  units from one image (`record-and-playback/Dockerfile`), each as a service, as bare metal runs
  them: `recording` the resque workers (the unit `bbb-rap-resque-worker`, `RECORDING_WORKERS` of
  them, its `COUNT`) with CPU and memory limits, `recording-starter` (`bbb-rap-starter`) and
  `recording-caption-inbox` (`bbb-rap-caption-inbox`); `recording-cleanup` runs bbb-config's
  `/etc/cron.daily/bigbluebutton` at start and then once a day, with `published_days` from
  `RECORDING_RAW_RETENTION_DAYS` (`0` comments out the call that removes raw data, as the
  documentation says to do on bare metal). All of them write `bbb-data` as `BBB_UID`/`BBB_GID`; the
  workers and the cleanup also delete the recorder's files in `recorder-raw` once archived or
  stale, so they mount it read-write; bbb-webrtc-recorder stays the only service that writes
  files there. The workers reach the shared notes server's loopback API on
  the `notes` network. The entrypoint renders upstream's `bigbluebutton.yml` with the host name as
  the package scripts set it and the services' names for redis and the shared notes server,
  `/etc/bigbluebutton/bbb-web.properties` with the shared secret that the callbacks read, and the
  cleanup's settings; the Tier 3 files `/etc/bigbluebutton/recording/recording.yml` and
  `presentation.yml` are read by the scripts themselves. The scripts log to the systemd journal
  and to files below `/var/log/bigbluebutton` on bare metal; here a Ruby file loaded through
  `RUBYOPT` (`record-and-playback/docker/journald-stdout.rb`) sends the journal messages and every
  `Logger` on a file below `/var/log/bigbluebutton` (opened by path or as a `File`) to stdout;
  anything written there in another way stays in that directory, a tmpfs (the scripts write no
  such logs; the analytics callback's log file is created, but stays empty). rap-starter and
  rap-caption-inbox use inotify, which sees only writes made on the same host.
  `docker/tests/stack/recording-check.sh` (`dind.sh recording`) records a meeting without media
  and follows it through archive, sanity, process and publish to `getRecordings`.
- **Writing `.env`: `docker compose run --rm setup`.** The setup image writes `.env` next to
  `docker-compose.yml` from the configuration contract: it starts from the existing `.env`, else
  from `.env.sample` (built into the image from the same contract), keeps every value that is
  already set and prints the names it kept, generates every secret and role password from
  `/dev/urandom` to its contract pattern, asks for the domain, the ACME e-mail and the features,
  and proposes the public addresses, validating each answer against its pattern. Variables
  missing from `.env` (the PostgreSQL role passwords, or new ones after an upgrade) are appended
  at its end. It writes the file atomically with mode `0600`; when nothing is missing it changes
  nothing, so it can be run again after an upgrade. Values are never printed, only names. For
  scripts, `--non-interactive` asks nothing and reads the asked values from the environment
  (`docker compose run --rm -e BBB_DOMAIN=bbb.example.org -e ACME_EMAIL=admin@example.org -e
  BBB_PUBLIC_IPV4=203.0.113.10 setup --non-interactive`); a missing required value is an error
  that names it. Before `.env` exists, Docker Compose warns that the stack's variables are not
  set; setup does not need them. An optional value that is set but empty (`BBB_FEATURES=`) counts as set. The
  service has no network (`network_mode: none`) and contacts nothing, so it cannot see the
  server's address: type it. With the host's network it proposes the address of the default
  route's interface when that address is public (behind NAT, a floating IP, type the public one):
  `docker run --rm -it --network host -v "$PWD:/project" <registry>/bbb-setup:<tag>`. It runs as
  root with only the capabilities `CHOWN` and `DAC_OVERRIDE` and gives `.env` the owner of the
  old `.env` (else of the directory); with `--user "$(id -u):$(id -g)"` it runs as you. The bind
  mount of the compose directory is compose-only; on Kubernetes these values are Secrets.
- **Webhooks** (bbb-webhooks, optional as on bare metal) run when `BBB_FEATURES` contains
  `webhooks`: `.env` derives `COMPOSE_PROFILES` from it, which starts the service, and nginx
  then proxies `/bigbluebutton/api/hooks` to it. `WEBHOOKS_BEARER_AUTH` (default `true`) selects
  how callbacks are authenticated: the shared secret as a Bearer token, or (`false`) a checksum
  in the callback URL. It must be exactly `true` or `false`: compose writes it into
  `NODE_CONFIG` as a JSON boolean. With any other value node-config reports the malformed JSON
  and ignores all of `NODE_CONFIG`; the service's healthcheck (in `docker-compose.yml`, as
  upstream's image has none; a Kubernetes probe repeats it) then fails, so `docker compose up
  --wait` fails too (`docker compose run --rm setup` also validates it). A Tier 3
  `/etc/bigbluebutton/bbb-webhooks/production.yml` is merged over the image's configuration.
  The shared secret, the domain, redis and the listen address come from the environment, and
  Bearer auth (`bbb.auth2_0`) and `getRaw` (`modules."../out/webhooks/index.js".config.getRaw`)
  from `NODE_CONFIG`, which node-config merges after all files: none of them can be changed
  there (on bare metal `getRaw` can, as the postinst writes it into `default.yml`). Upstream's
  image does not check the values: bbb-web and akka-apps reject a malformed `BBB_DOMAIN` or
  `BBB_SHARED_SECRET` at start.
- **Office documents** (Word, PowerPoint, Excel, OpenDocument and the other formats LibreOffice
  reads) are converted to PDF by the `conversion` service, for bbb-web's presentation upload.
  On bare metal, bbb-web runs LibreOffice in a new `docker run --network none bbb-soffice`
  container per document (`bbb-libreoffice/assets/convert-local.sh`), which needs the Docker
  socket; upstream's alternative is a Collabora Online server, which
  `bbb-libreoffice/assets/convert-cool.sh` calls (`POST /cool/convert-to/<format>` with the
  document in the form field `data`). The `conversion` service is that server: Collabora's
  `collabora/code` image (CODE, the Collabora Online Development Edition), pinned by digest and
  unchanged, with TLS off on its internal network and the update check off (`extra_params`).
  bbb-web calls it with its `convert-remote.sh` at `BBB_WEB_CONVERSION_URL` (default
  `http://conversion:9980/cool/convert-to`); point that variable at another Collabora Online
  server (`https://<host>:9980/cool/convert-to`), or set it empty to turn office conversion off
  (PDF and image uploads still work). The service is attached only to the internal `conversion`
  network, which it shares with bbb-web alone and which has no route out; bbb-web's port 8090 is
  the only one it can reach. Collabora loads data that a document links to (an HTML stylesheet,
  for example) from the hosts its `coolwsd.xml` allows as data sources: `net.lok_allow` and,
  while the `allow` attribute of `net.post_allow` is true, `net.post_allow`. Both list the
  private address ranges by default, which include bbb-web's address. `extra_params` therefore
  sets `--o:net.post_allow[@allow]=false` (the post_allow hosts are no data sources any more)
  and replaces the private ranges in `net.lok_allow` (entries 0, 3 and 4) by `127.0.0.1/32`, so
  only loopback remains. `docker/tests/stack/conversion-check.sh` checks with a listener on that
  network that no linked resource is fetched, and that an instance with Collabora's defaults
  does fetch one. On Kubernetes, add a NetworkPolicy with ingress from bbb-web only and no
  egress as a second layer.
  `net.post_allow` still filters the clients of convert-to: Collabora accepts the request only
  from 192.168.0.0/16, 172.16.0.0/12, 10.0.0.0/8 and loopback (`coolwsd.xml`). Docker's default
  address pools and podman's lie inside these ranges. Where the `conversion` network or the pod
  network does not (a Docker `default-address-pools` or a Kubernetes pod CIDR such as
  100.64.0.0/10), conversions fail with HTTP 403; add the range to `extra_params`, for example
  `--o:net.post_allow.host[5]=100.64.0.0/10`.
  Collabora runs as its image's user (`cool`, UID 1001; it refuses to start its document
  processes under another user, so `BBB_UID` does not apply) and isolates each document in a
  jail: with the capabilities `CHOWN`, `FOWNER` and `SYS_CHROOT` (the only ones the service
  keeps) its `coolforkit-caps` helper builds chroot jails through file capabilities, so the
  container must not run with `no-new-privileges`; its jail directories (`/opt/cool/child-roots`,
  `/opt/cool/cache`) are tmpfs mounts that allow `exec`. Collabora's own limits apply
  (`coolwsd.xml`, for example `per_document.limit_convert_secs`, 100 s); bbb-web gives up after
  `officeToPdfConversionTimeout` (60 s) and accepts no upload above `maxFileSizeUpload`
  (30000000 bytes). Collabora's settings can be changed through `extra_params`
  (`--o:<key>=<value>`) in a compose override. It needs about 0.5 to 0.9 GB of memory when idle
  (it keeps document processes ready), and its image is about 1.3 GB.
- **nginx follows restarted services.** The services nginx proxies to (bbb-web, shared-notes,
  graphql-server, graphql-middleware, livekit, bbb-webrtc-sfu, html5, learning-dashboard) are
  upstream groups with `server <service>:<port> resolve` in `/etc/nginx/conf.d/bbb-upstreams.conf`,
  resolved through Docker's embedded DNS server (`127.0.0.11`) every 10 seconds. The group of an
  optional feature comes with its locations: with `webhooks` in `BBB_FEATURES`, the entrypoint
  writes the webhooks group (`/usr/local/share/bbb/nginx/upstreams/webhooks.conf`), with
  `recording` the playback group (`playback.conf` there), to
  `/etc/nginx/sites-available/bbb-feature-upstreams`, which `sites-enabled/` includes at http
  level; otherwise that file holds only a comment. A service that was restarted or recreated
  with a new address is reached again without restarting nginx, and nginx starts even when a
  service is missing (one that crashed, or webhooks while its feature is on but it is stopped):
  its locations answer 502 until it is back, and nginx logs `<service> could not be resolved`
  about every 15 seconds meanwhile. nginx still waits for its upstreams to be healthy on `docker
  compose up` (`depends_on`), so a fresh start answers no 502s. On Kubernetes, replace both
  `/etc/nginx/conf.d/bbb-upstreams.conf` and `/usr/local/share/bbb/nginx/upstreams/webhooks.conf`
  with mounted files that name the cluster DNS server (`resolver` with the address of kube-dns)
  and the Services by their fully qualified names (`bbb-web.<namespace>.svc.cluster.local`):
  nginx's resolver does not use the DNS search domains, so short names do not resolve there.
- **redis has a fixed address** in the `bbb` network (`BBB_REDIS_IP`, default `172.30.82.21`; it
  must lie inside `BBB_NETWORK_SUBNET`), as bare metal's redis is always at 127.0.0.1. akka-apps
  and bbb-web keep the address they resolved for `redis` for the TTL of Docker's DNS answers
  (600 s) and reconnect to it; Docker gives a restarted or recreated container a new address
  unless it is fixed, and the two would not reach redis until that time had passed.
- **The server's own name.** Inside the stack, `BBB_DOMAIN` resolves to haproxy (a network
  alias), as the server's name resolves to the server itself on bare metal. bbb-web loads the
  default presentation from `https://BBB_DOMAIN/default.pdf` at every create, so this works
  without public DNS and behind NAT without hairpin routing. bbb-web verifies the certificate:
  meetings created while haproxy still serves its temporary self-signed certificate (before
  certbot's first certificate) start without the default presentation. URLs on `BBB_DOMAIN`
  are allowed for bbb-web's URL fetches (`fetchUrlAllowedLocalHosts`), as on bare metal, where
  the name resolves to a public address; a Tier 3 `bbb-web.properties` that sets this key
  replaces that list.
- **Ports.** Only nginx 80/tcp, haproxy 443/tcp, livekit 7882/udp and coturn 3478/udp+tcp are
  published. haproxy and nginx run as non-root users and bind 443, 80 and 81 through the
  per-container sysctl `net.ipv4.ip_unprivileged_port_start=0`. Published ports bypass ufw and
  firewalld.
- **Read-only root filesystems.** Every service runs with `read_only: true`. Each writes only to
  its volumes and to tmpfs mounts at `/tmp` and the directories its entrypoint renders into
  (Kubernetes: `emptyDir`).

### Override files (Tier 3)

Tier 3 files keep their bare-metal paths (`docker/config-contract.yaml`, `overrides`). Mount
them in `docker-compose.override.yml` next to `docker-compose.yml`, which Docker Compose reads
automatically, for example:

```yaml
services:
  bbb-web:
    volumes:
      - /etc/bigbluebutton/bbb-web.properties:/etc/bigbluebutton/bbb-web.properties:ro
```

The akka-apps image ships `/etc/bigbluebutton/bbb-html5.yml`, the html5 client settings
override, with the content `{}` (bare metal always has this file; without it akka-apps logs an
error at every start). To use your own file, mount it over the shipped one:

```yaml
services:
  akka-apps:
    volumes:
      - /etc/bigbluebutton/bbb-html5.yml:/etc/bigbluebutton/bbb-html5.yml:ro
```

Compose `configs:` with inline `content:` cannot be used here: Docker Compose writes such a config
into the container at start, which fails on the read-only root filesystem.

## Fixed addresses on the `bbb` network

LiveKit (`BBB_LIVEKIT_IP`, coturn relays only to it) and redis (`BBB_REDIS_IP`) have fixed
addresses. akka-apps and bbb-web cache redis's resolved address for the DNS record's TTL (600 s
from Docker's embedded DNS), so a redis container recreated with a new address would break joins
for up to ten minutes. Docker assigns all other addresses from `BBB_NETWORK_IP_RANGE`
(compose `ip_range`, default the upper half of `BBB_NETWORK_SUBNET`); keep the fixed addresses
inside the subnet and outside that range. Kubernetes Services have stable addresses, so nothing
corresponds to this there.

## Testing the stack with Docker Engine

Docker and podman differ in details that break images at run time (the embedded DNS server,
tmpfs mounted `noexec`, `configs:`, what `docker compose restart` does). `docker/tests/stack/`
runs the stack with Docker Engine 29.9.1 on a host that has only podman, and tests the join path
of a browser:

```bash
# build the images with BuildKit, a few at a time (memory), tag 4.0.1
docker/tests/buildkit/build.sh --tag 4.0.1 haproxy certbot coturn livekit
docker/tests/buildkit/build.sh --tag 4.0.1 postgres db-init graphql-middleware graphql-actions
docker/tests/buildkit/build.sh --tag 4.0.1 graphql-server        # then apps-akka, web,
                                                                 # shared-notes, export-annotations,
                                                                 # bbb-webrtc-sfu, nginx,
                                                                 # (webhooks: upstream's image, pulled)
                                                                 # html5-client, learning-dashboard,
                                                                 # playback
docker/tests/stack/dind.sh start     # Docker Engine in a privileged podman container
docker/tests/stack/dind.sh load      # copies the images of docker-compose.yml from podman
docker/tests/stack/dind.sh up        # test certificate, docker compose up -d --wait, no certbot
docker/tests/stack/dind.sh test      # join-path.sh, including four restart cycles
docker/tests/stack/dind.sh conversion   # conversion-check.sh against the stack's conversion service
docker/tests/stack/dind.sh config    # effective configuration of bbb-webrtc-sfu and webhooks
docker/tests/stack/dind.sh recording # a recorded meeting through the recording services (feature recording)
docker/tests/stack/dind.sh webhooks run --auth bearer   # callbacks of a registered hook
docker/tests/stack/dind.sh playback  # player and recording locations (feature recording)
docker/tests/stack/dind.sh recording-e2e   # a recorded meeting with microphone and webcam (Chromium), to the published recording
docker/tests/stack/dind.sh compose logs akka-apps   # any docker compose command
docker/tests/stack/dind.sh diagnostics DIR   # compose ps and every service's log, secrets redacted
docker/tests/stack/dind.sh stop      # removes the Engine container and all its data
```

On a host with Docker Engine, `dind.sh --host COMMAND` runs the same commands against that
Engine (the `docker` CLI, `DOCKER_HOST` if set), with the repository where it is; the images
must already be there (`load` is not available), and `stop` removes the stack, its volumes and
the test certificate. The stack's ports (80/tcp, 443/tcp, 7882/udp, 3478/udp and tcp) are
then published on that host, so they must be free there. CI runs it this way ([CI](#ci)). To run those steps on a podman-only host,
start the Engine container with `DIND_SOCKET_DIR=<short private absolute directory>`: the Engine then
also serves its API on `<dir>/docker.sock`, and a `docker` CLI on the host uses it with
`DOCKER_HOST=unix://<dir>/docker.sock`.

The stack runs with `docker/tests/stack/fixture.env` (fixture values, `bbb.example.com`;
certbot is scaled to 0, so no ACME request is made). In its place, `up` issues a certificate for
`bbb.example.com` from a throwaway test CA and puts it into the `certs` volume as certbot would;
`docker/tests/stack/compose.test.yml` makes bbb-web trust that CA, as a deployment's JVM trusts
the CA of its certificate, and makes bbb-webrtc-recorder join LiveKit once at start and exit if
that fails (its LiveKit health check, off as packaged), so that a healthy recorder shows that
its key pair and the LiveKit address work. Its ports are published inside the Engine container
only.
`join-path.sh` does what the html5 client does when a user joins: API create and join, the
redirect to the client with the session token, `/api/rest/meetingStaticData` (Hasura,
authenticated through akka-apps), the client's `index.html` and bundle (precompressed, with the
build identifier of the settings as cache buster), the GraphQL WebSocket through
graphql-middleware, the join mutation, the shared notes exported as PDF as the notes menu does
(`/hocuspocus/api/documents/<padId>/export/pdf`, authorized through bbb-web), the learning
dashboard (the app, the meeting's data file from `bbb-data`, and 404 for other paths below it),
the default presentation converted (bbb-web loads it from
`https://bbb.example.com/default.pdf` through haproxy), a two-page PDF and a two-page Word
document (`.docx`, converted by the `conversion` service) uploaded as the
presentation uploader does and converted, and the LiveKit signaling URL. Then it runs `docker
compose restart`, as a second cycle recreates the redis container alone (with a fixed address,
`BBB_REDIS_IP`, it keeps its address; see below), and as a third cycle restarts every service while
redis is stopped, and as a fourth cycle recreates graphql-middleware alone while its old address
is kept taken, so that it comes back with a new one; after each cycle it waits until all
services are healthy and repeats the join path, without restarting nginx (see above). It prints
`STEP <name>: OK|FAIL` and exits non-zero on failure. On a Docker host, run it directly in the directory of `docker-compose.yml`:
`BBB_SHARED_SECRET=... docker/tests/stack/join-path.sh --domain <domain> --connect-ip ''`
(add `--insecure` for a self-signed certificate; `--help` lists the options).

`playback-check.sh` (`dind.sh playback`, feature `recording`, which the fixture enables) checks
the recording locations through haproxy and nginx: `/playback/presentation/2.3/<recordId>` is
the player's `index.html` (from the `playback` service) and its bundle loads, the 2.0 URL
redirects to it, and a file it writes below `published/presentation/<recordId>/` in `bbb-data`
is served at `/presentation/<recordId>/` (other paths there give 404); it removes the file again.

`recording-e2e.sh` (`dind.sh recording-e2e`, feature `recording`) records a meeting with media:
upstream's Playwright helpers (`bigbluebutton-tests/playwright`, with its fake microphone and
webcam) drive the html5 client in headless Chromium, in the official Playwright image on the
stack's network; the moderator joins a meeting created with `record=true` and
`autoStartRecording=true`, joins the microphone, shares the webcam, stays 20 s, and the meeting
is ended. The test then waits until the recording is published and checks the recorder's webcam
and audio files in the raw archive, the audio and video streams of the published
`video/webcams.webm`, `getRecordings`, and that nginx serves the player page, `metadata.xml` and
the video. The recorder's camera and microphone files must each hold media (packets) for at
least half of the 20 s. A run takes about a minute once the Playwright image is pulled.

`config-check.sh` (`dind.sh config`) prints and checks what node-config merged in the running
bbb-webrtc-sfu and webhooks containers (`node -e` in each): the package's settings, the adapter
list without FreeSWITCH, the webhook receiver, Bearer auth as `--bearer-auth` says, and that
the secrets come from the environment (compared there, never printed). For webhooks, which has
no image of ours and so no golden-file case, it is the configuration test. The golden case
`bbb-webrtc-sfu` pins only the image's partial file (`--render-only` writes
`/usr/local/share/bbb/bbb-webrtc-sfu/production.yml`); the effective configuration merged with
upstream's is covered by `config-check.sh`.

`docker/tests/stack/notes-pdf-check.sh` checks the PDF converter of the shared-notes image on
its own: like the bare-metal unit (`PrivateNetwork=true`, `IPAddressDeny=any`), wkhtmltopdf runs
without network access (`no-network`, a seccomp filter that needs no privileges), no address is
reachable from the page it converts, the server's own port included; where the kernel offers
Landlock, it writes only to its work directory and cannot open the memory of other processes;
and an export still produces a PDF:
`docker/tests/stack/notes-pdf-check.sh --docker "podman exec -i bbb-dind docker" localhost/bbb-shared-notes:4.0.1`
(or `--docker podman`).

`docker/tests/stack/conversion-check.sh` tests the `conversion` service as
`docker-compose.yml` defines it, on an internal network of its own (needs Docker Compose:
`conversion-check.sh --docker "podman exec -i bbb-dind docker" --client-image
localhost/bbb-web:4.0.1 --listener-image localhost/bbb-graphql-actions:4.0.1`), or, with
`dind.sh conversion`, the stack's service with bbb-web as the client: Word, OpenDocument,
PowerPoint and Excel documents (made by the service from the flat ODF files in
`docker/tests/stack/conversion-samples/`) converted through bbb-web's `convert-remote.sh` with
the expected page counts, documents with linked images converted without any request reaching
a listener on the service's network, and the service attached to its internal network only.

## Running under an arbitrary UID/GID

Every image must run under any UID/GID chosen at deploy time: Docker Compose sets
`user: "${BBB_UID}:${BBB_GID}"` for the services that write the shared data volume, and
Kubernetes may set any `runAsUser`/`runAsGroup`. The UID usually has no entry in `/etc/passwd`.

Rules for every image:

1. **No fixed user at runtime.** Do not require a named user or a particular UID. Images may set
   a numeric non-root default (`USER 998:998`), never a user name (hadolint DL3066). No `gosu`,
   `su` or `chown` at start.
2. **Writable paths are declared.** A process writes only to `/tmp`, to declared volumes, and to
   the directories its entrypoint renders into. Create each of those directories in the
   Dockerfile, writable for any UID: `install -d -m 1777 DIR` (sticky, like `/tmp`). This also
   covers volume mount points: a new named volume copies the owner and mode of the image
   directory it is mounted on. Everything else stays root-owned and read-only for the service.
3. **Files the service reads are world-readable** (`0644`, directories and scripts `0755`).
   Secrets rendered at start are written by the service's own UID with `--mode 0600`/`0640`
   (`docker/lib/README.md`).
4. **No reliance on `$HOME`.** Without a passwd entry, `HOME` is `/` (Docker) or empty
   (podman), and the JVM's `user.home` is `?` unless `HOME` is set. A component that needs a
   writable home gets `HOME=/tmp` in its image, as upstream does for its LibreOffice container
   (`bbb-libreoffice/assets/convert-local.sh`).
5. **All writers of the shared data volume** (`/var/bigbluebutton`) and the recorder volume
   (`/var/lib/bbb-webrtc-recorder`) run with the same `BBB_UID`/`BBB_GID`, so files keep one
   owner, as with the single `bigbluebutton` user on bare metal.

Check an image with `docker/tests/uid/check.sh` (docker if installed, else podman). It runs the
image as `12345:12345` without a passwd entry, with a read-only root filesystem and a tmpfs
`/tmp`, and fails on a non-zero exit or a permission error:

```bash
# entrypoint in render-only mode, plus the directories it renders into and its volumes
docker/tests/uid/check.sh --env-file docker/tests/golden/<image>/fixture.env \
    --writable /etc/bigbluebutton --volume /var/bigbluebutton <image>
# an image without an entrypoint: run a command instead
docker/tests/uid/check.sh --writable /tmp bbb-java-base:local -- java -version
```

`docker/tests/uid/sample/` is a minimal image that follows these rules; built with
`--build-arg BROKEN=1` it breaks them and the check fails.

## Lint

```bash
docker/tests/lint/run.sh                                  # every Dockerfile in the repository
docker/tests/lint/run.sh bigbluebutton-web/Dockerfile     # selected files
```

runs hadolint (pinned image) with `docker/.hadolint.yaml`. Named build contexts look like
undefined stages or untagged images to hadolint: silence DL3022 (`COPY --from=<context>`) and
DL3006 (`FROM <context>`) on those lines only, with `# hadolint ignore=...`, not globally.

## CI

Two GitHub Actions workflows build the images with BuildKit (`docker/bake-action`), as
`docker buildx bake` does for users. Both take the image list from bake: every target of the
`default` group in `docker-bake.hcl`, named after its tag (`bbb-<image>`). The BuildKit layer
cache is kept per target and platform (`type=gha`) and shared by both workflows.

**`build-all-images.yml`** builds every image for each of its platforms on a native runner
(`ubuntu-24.04`, `ubuntu-24.04-arm`) through the reusable `build-docker-image.yml`, and merges
the platform images into one multi-arch image. On pushes (branches and `v*.*.*` tags) and manual
runs it pushes `ghcr.io/<owner>/<repository>/bbb-<image>`, which is
`ghcr.io/bigbluebutton/bigbluebutton/bbb-<image>`, the default of `docker-compose.yml`, for the
upstream repository; a fork pushes to its own namespace and runs the stack with
`BBB_IMAGE_REGISTRY=ghcr.io/<owner>/<repository>`. Tags: the branch name (also with
a `dev-` prefix), `sha-<short sha>` and, for release tags, `<version>`, `<major>.<minor>` and
`<major>`. Pull requests that change image files build everything without pushing.

**Platforms** are set per image in `docker/bake/<image>.hcl`. An image that builds only for
amd64 sets `platforms = ["linux/amd64"]` with the reason in a comment (today graphql-server
and record-and-playback); every other image sets `platforms = compact(split(",", BBB_PLATFORMS))`.
The bake variable `BBB_PLATFORMS`
is empty by default, so local builds are for the host's platform; CI sets it to
`linux/amd64,linux/arm64` to read the list:

```bash
BBB_PLATFORMS=linux/amd64,linux/arm64 \
    docker buildx bake -f docker-bake.hcl $(printf -- '-f %s ' docker/bake/*.hcl) --print default
```

A target in the `default` group without a `bbb-<image>` tag or without platforms fails the
workflow.

**`COMMIT_DATE`** ([Building](#building)) is the commit date in `build-docker-image.yml`, so each
published build has its own client build identifier. `docker-checks.yml` leaves it empty, as the
golden expected trees hold `0`; only the last step of the client build depends on it, so the
npm build still comes from the shared cache.

**`docker-checks.yml`** runs on pull requests that change files below `docker/`, `*/docker/`,
Dockerfiles, `docker-bake.hcl`, `docker-compose.yml` or the contract outputs, in parallel jobs:

| Job | Runs |
|---|---|
| Configuration contract | `docker/tests/contract/run.sh` with `docker/contract/validate.sh`, `docker/contract/generate.sh --check` and `docker/tests/contract/test-contract.sh` |
| Golden runner tests | `docker/tests/golden/run.sh` |
| Compose file | `docker/tests/compose/run.sh`, then `assert-compose.sh` on `docker-compose.yml` for every feature combination |
| Lint | `docker/tests/lint/run.sh` on the Dockerfiles the pull request changes (all of them when `docker/.hadolint.yaml` changes or on manual runs); shellcheck at severity warning on the scripts below `docker/` and `*/docker/`, including those without a `.sh` suffix |
| Image `bbb-<image>` (one per bake target, amd64) | build with BuildKit, tagged `localhost/bbb-<image>:golden` and loaded into Docker; `docker/tests/dirmodes/check.sh`; `docker/tests/golden/run-golden.sh --engine docker --parity` for the golden cases of that image; `docker/tests/uid/check.sh` with the fixture env of its golden case, a write probe for each tmpfs and each writable named volume of its service in `docker-compose.yml` (`--no-render` for images without a golden case); the image saved for the stack job |
| Stack (after all image jobs) | the stack of `docker-compose.yml` on the runner's Docker Engine with the images of the image jobs (`docker save` there, uploaded as artifacts `stack-image-bbb-<image>` kept for one day, loaded here), as in [Testing the stack](#testing-the-stack-with-docker-engine) with `dind.sh --host`: `up`, `test` (join path and the four restart cycles), `config`, `webhooks run --auth bearer`, `conversion`, `notes-pdf-check.sh`, `playback` and `recording-e2e`. On failure, Playwright's screenshots and trace and the `dind.sh --host diagnostics` output (`docker compose ps -a`, the log of every service, fixture secrets redacted) is uploaded as the artifact `stack-diagnostics` |

The stack job loads the images the image jobs built and checked rather than building them
again: the BuildKit cache is read-only for pull requests, so a rebuild would repeat the build of
every image the pull request changes. The archives are about 2 GB (gzip, deleted once loaded);
the loaded images, collabora/code, redis and webhooks included, about 9 GB (`docker system df`,
Docker Engine 29.9.1 with its default image store). So the job first removes preinstalled
toolchains it does not use (.NET, Android, GHC, CodeQL). The fixture secrets are
masked in the job's log.

`shellcheck.yml` (upstream) also checks every `*.sh` file of the repository at severity error.
Images that are neither in `docker-compose.yml` nor in a golden case get the directory-mode
check only.

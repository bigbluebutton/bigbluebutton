---
id: docker-design
slug: /administration/docker-design
title: Docker Compose design
sidebar_position: 11.6
description: How the BigBlueButton container stack is built and why, for reviewers and maintainers
keywords:
- docker
- compose
- design
- containers
---

:::note

This page explains the design of the container stack for reviewers and maintainers. To install
and run it, see [Install with Docker Compose](/administration/docker). Every variable is listed
in the [Container Configuration Reference](/administration/docker-configuration).

:::

The container stack runs BigBlueButton 4.0 on a single server with Docker Compose. The images
are built from this repository and configure themselves at start; the compose file only wires
them together. Each section below states a decision and the reason for it. The details live in
`docker/README.md`, `docker/lib/README.md` and the comments of `docker-compose.yml`.

## Scope

- **BigBlueButton 4.0 only.** LiveKit is the only media server, and shared notes are the
  BlockNote server (`bbb-shared-notes-server`). There is no FreeSWITCH: bbb-webrtc-sfu runs as
  LiveKit's controller with its FreeSWITCH adapter removed.
- **One static compose file.** `docker-compose.yml` at the repository root is committed and
  never generated. Optional parts are Compose profiles, selected through `BBB_FEATURES`.
- **Not part of the stack yet:** recording processing (with `recording`, bbb-web offers the
  record button, but no recordings are processed yet), a development setup with source
  mounts, running behind an existing reverse proxy, Greenlight, monitoring, a preflight check,
  phone dial-in and Kubernetes manifests.

### Services

| Service | Image | Built from |
|---|---|---|
| `haproxy` | `bbb-haproxy` | `docker/haproxy/` |
| `certbot` | `bbb-certbot` | `docker/certbot/` |
| `nginx` | `bbb-nginx` | `docker/nginx/` (with the packages' location fragments) |
| `html5` | `bbb-html5-client` | `bigbluebutton-html5/` |
| `learning-dashboard` | `bbb-learning-dashboard` | `bbb-learning-dashboard/` |
| `bbb-web` | `bbb-web` | `bigbluebutton-web/` (with `bbb-common-web/`, `bbb-common-message/`) |
| `akka-apps` | `bbb-apps-akka` | `akka-bbb-apps/` (with `bbb-common-message/`) |
| `graphql-server` | `bbb-graphql-server` | `bbb-graphql-server/` |
| `graphql-middleware` | `bbb-graphql-middleware` | `bbb-graphql-middleware/` |
| `graphql-actions` | `bbb-graphql-actions` | `bbb-graphql-actions/` |
| `shared-notes` | `bbb-shared-notes` | `bbb-shared-notes-server/` |
| `export-annotations` | `bbb-export-annotations` | `bbb-export-annotations/` |
| `postgres` | `bbb-postgres` | `docker/postgres/` (official `postgres:16` image plus BBB's server settings) |
| `db-init` | `bbb-db-init` | `docker/db-init/` (job) |
| `livekit` | `bbb-livekit` | `docker/livekit/` (LiveKit built from source as `bbb-livekit` builds it) |
| `bbb-webrtc-sfu` | `bbb-webrtc-sfu` | `docker/bbb-webrtc-sfu/` (thin layer over upstream's image) |
| `coturn` | `bbb-coturn` | `docker/coturn/` (official `coturn/coturn` image plus configuration) |
| `setup` | `bbb-setup` | `docker/setup/` (run-only, profile `setup`) |
| `redis` | `redis:7.0.15-alpine` | used as it is |
| `conversion` | `collabora/code` | used as it is |
| `webhooks` | `ghcr.io/bigbluebutton/bbb-webhooks` | used as it is (profile `webhooks`) |

The `bbb-` images are published as `ghcr.io/bigbluebutton/bigbluebutton/bbb-<image>` (the
repository's own namespace, so they never collide with the images of the component
repositories). Components whose code lives in another repository and which publish their own
image run from that image, pinned by tag and digest to the version BigBlueButton pins
(`<component>.placeholder.sh`): bbb-webhooks unchanged, configured in the compose file through
node-config; bbb-webrtc-sfu with one added configuration file, an entrypoint and a healthcheck.
That file sits between upstream's configuration and the Tier 3 override; `NODE_CONFIG` would
have been merged after the override and made those settings impossible to change there. Both
upstream images keep their own base (Node 22).

## Images

- **Layout.** A component with a source directory has its `Dockerfile` there and its image files
  in `<component>/docker/` (entrypoint, healthcheck, helper scripts). Images without a source
  directory (haproxy, nginx, certbot, coturn, livekit, postgres, db-init, setup, the SFU layer and
  the Java base) live in `docker/<name>/`. This keeps an image next to the code it packages.
- **Bases pinned by digest.** Every `FROM` of the stack's images names a digest, with the tag
  in a comment. Node builds and Node services use `node:24-slim` (Node 24, as the packages), the
  JVM services a shared Java 21 base (`docker/java-base/`: `ubuntu:24.04` with Ubuntu's
  `openjdk-21-jre-headless`, the OpenJDK of bare-metal installs). Components that shell out to
  document tools run on `ubuntu:24.04`: bbb-web adds poppler, ImageMagick (with the policy
  `bbb-install.sh` writes) and ghostscript to the Java base, export-annotations ghostscript and
  cairosvg. Third-party servers start from their official images (haproxy, nginx, postgres,
  coturn). apt and apk packages are not pinned one by one: the digest-pinned base is the
  reproducibility anchor.
- **Multi-stage builds.** Compilers and build tools stay in build stages; runtime images get
  only what the service runs.
- **Non-root.** Every image built here runs as a numeric non-root user and under any UID/GID
  (`docker/tests/uid/check.sh`), with two exceptions: `setup` runs as root with two capabilities
  to give `.env` the owner of the directory, and `postgres` runs as the official image's
  `postgres` user (999), because PostgreSQL only starts on a data directory owned by its user.
  Services that write the shared data volume run as `BBB_UID:BBB_GID` (default `998`), so files
  keep one owner, as with the `bigbluebutton` user on bare metal, and existing trees or NFS
  exports keep working.
- **Read-only root filesystems.** Every service runs with `read_only: true` and writes only to its
  volumes and to tmpfs mounts (`/tmp` and the directories its entrypoint renders into).
- **Healthchecks.** Every long-running image has a `HEALTHCHECK`, repeated in the compose file,
  which uses them for `depends_on` conditions; upstream's webhooks image has none, so its check is
  in the compose file. The run-only `db-init` and `setup` have none.
- **One bake definition.** `docker-bake.hcl` holds what images share (tags, the `entrypoint-lib`
  named context, the Java base, the `default` group); each image's target is in
  `docker/bake/<image>.hcl`. CI and users build the same targets with BuildKit. Shared inputs
  (the entrypoint helper, package files in `build/packages-template/`) reach the builds as named
  contexts, so upstream's packaging files are used rather than copied.

## Configuration

### Three tiers

| Tier | What | Where |
|---|---|---|
| 1 | Essential values: domain, public address, secrets, ACME e-mail, features | `.env` |
| 2 | Advanced values with defaults | `.env`, optional |
| 3 | Override files | mounted at the same paths as on a package-based server |

Tier 3 keeps the bare-metal paths (`/etc/bigbluebutton/bbb-web.properties`,
`/etc/bigbluebutton/bbb-html5.yml`, `/etc/bigbluebutton/livekit.yaml` and so on), so the
existing documentation applies unchanged to a container installation.

### The contract

`docker/config-contract.yaml` declares every variable: tier, format, default, consumers,
whether it is a secret, and the upstream sources it rests on. It also lists the derived values,
the internal wiring and the supported override files. Generated from it, and checked in CI to be
up to date: `.env.sample` and the
[Container Configuration Reference](/administration/docker-configuration). A drift check reports
variables that are used but not declared, or declared but not used. One file is the public
interface of the images, so compose and any other orchestrator pass the same variables.

### Native mechanisms first

Images use each component's own configuration mechanism where it has one: HOCON `${?VAR}`
references, node-config environment variables, Hasura's and LiveKit's environment variables.
Rendered files keep upstream's names, paths, key order and comments; the images change only what
containers need (service names instead of `127.0.0.1`, listen addresses, values from the
contract, secrets kept out of files).

Where a file has to be rendered, one tool does it: `envsubst`, wrapped by the shared helper
`docker/lib/entrypoint-lib.sh` (`bbb_render`). Templates only substitute; any logic is bash in
the entrypoint, and optional parts are separate fragment files. YAML is set and merged with yq,
the same tool and merge expression as upstream's packaging (`bbb_merge_yaml`).

### Entrypoint order

Every entrypoint sources the helper and runs the same steps:

1. **validate**: required variables are present and match their contract format; known upstream
   placeholder secrets are refused. A failure exits non-zero and names the variable, never the
   value.
2. **derive**: URLs and feature flags from `BBB_FEATURES`.
3. **render**: configuration files at their bare-metal paths.
4. **merge**: a mounted Tier 3 override file over the rendered default.
5. **exec**: the service replaces the entrypoint as PID 1, so signals reach it.

`--render-only DIR` runs steps 1 to 4 and writes the files below `DIR` instead. The golden tests
use this mode.

## Networking

### Published ports

Only these ports are published, and a compose test fails on any other:

| Port | Service | Purpose |
|---|---|---|
| 80/tcp | nginx | ACME HTTP-01 challenge, redirect to HTTPS |
| 443/tcp | haproxy | HTTPS, WebSocket signaling, TURN over TLS |
| 7882/udp | livekit | all WebRTC media |
| 3478/udp, 3478/tcp | coturn | TURN |

haproxy and nginx bind their low ports as non-root users through the per-container sysctl
`net.ipv4.ip_unprivileged_port_start=0`; the host's setting is not touched.

### TLS edge and TURN on 443

As `bbb-install.sh` sets it up, haproxy terminates TLS on 443 with one certificate for
`BBB_DOMAIN` and decides by ALPN: `http/1.1` goes to nginx (PROXY protocol, port 81),
`stun.turn` to coturn's plain TCP port 3478. Without ALPN, the first byte decides: an ASCII
letter (an HTTP request) goes to nginx, anything else to coturn. Browsers send TURN over TLS
without ALPN, so this rule carries it. Clients behind restrictive firewalls therefore reach TURN
on 443 without a separate name or certificate.

### One UDP port for LiveKit

LiveKit runs on the bridge network with a single multiplexed UDP port (`rtc.udp_port`,
`LIVEKIT_RTC_UDP_PORT`, default 7882), published 1:1. The packaged port range is set to 0,
because LiveKit ignores `udp_port` while a range is configured. `rtc.tcp_port` stays 0, as
packaged: clients without UDP use TURN. LiveKit announces `BBB_PUBLIC_IPV4` and, with
`advertise_internal_ip`, also its bridge address, so coturn reaches it on the bridge. No host
networking and no large UDP range are needed. Signaling goes through nginx (`/livekit/`).

### Fixed addresses

The `bbb` network has a fixed subnet (`BBB_NETWORK_SUBNET`) and two fixed addresses outside the
range Docker assigns from (`BBB_NETWORK_IP_RANGE`):

- **LiveKit** (`BBB_LIVEKIT_IP`): coturn relays only to that address (`allowed-peer-ip`, after
  denying all others, plus `no-tcp-relay`), so TURN credentials cannot be used to reach other
  services in the network. coturn's relay ports (`TURN_RELAY_PORT_MIN`/`MAX`) stay internal.
- **redis** (`BBB_REDIS_IP`): akka-apps and bbb-web keep the address they resolved for redis for
  the TTL of Docker's DNS answers (600 s) and reconnect to it. A recreated redis with a new
  address would break joins for up to ten minutes; on bare metal redis is always `127.0.0.1`.

Inside the stack, `BBB_DOMAIN` is a network alias of haproxy, as the server's own name resolves
to the server on bare metal. bbb-web loads `https://BBB_DOMAIN/default.pdf` at every create, and
this works without public DNS and without hairpin NAT.

### Internal networks

- **`notes`** (`internal: true`) holds `shared-notes` and only the services it talks to: nginx,
  bbb-web, redis and postgres. shared-notes is on no other network. Its loopback API is meant
  for local callers, and its public API relies on the headers nginx sets after bbb-web has
  authorized the request (`build/packages-template/bbb-shared-notes-server/bbb-shared-notes-server.nginx`),
  so nothing else may reach it.
- **`conversion`** (`internal: true`) holds only bbb-web and the `conversion` service. It has no
  route out.

### nginx follows restarted services

nginx proxies to upstream groups with `server <service>:<port> resolve`
(`docker/nginx/bbb-upstreams.conf`), resolved through Docker's DNS every 10 seconds. A service
recreated with a new address is reached again without restarting nginx, and nginx starts even
when a service is missing (its locations answer 502 until it is back). haproxy resolves nginx
and coturn the same way. Location fragments and upstream groups of optional features
(webhooks, recording) are written by the entrypoint only when the feature is enabled.

## Certificates

The `certbot` service obtains the Let's Encrypt certificate for `BBB_DOMAIN` with the webroot
plugin through nginx on port 80, then checks twice a day for renewal, like `certbot.timer`.
After a failure it waits 15 minutes, so it makes at most four failed validation attempts an
hour. It writes the haproxy bundle into the `certs` volume; its account and renewal state
are in `letsencrypt`, so a recreated container requests no new certificate. It refuses example
and test names (RFC 2606, RFC 6761) before it contacts the ACME server.

haproxy only reads `certs`. It starts on a temporary self-signed certificate, checks every 30
seconds for a new bundle and reloads itself after `haproxy -c` accepted it (SIGUSR2 to its
master, the packaged unit's reload). No container needs to signal another.

## Setup, databases and upgrades

- **`setup`** (`docker compose run --rm setup`) writes `.env` from the contract: it generates
  every secret, asks for the domain, the ACME e-mail, the features and the public address, and
  validates each answer against its format. It keeps values that are already set and appends
  new ones, so it can be run again after an upgrade. It has no network and changes only `.env`;
  the compose file stays as committed.
- **`postgres`** is the official PostgreSQL 16 image with BBB's server settings in `conf.d` at the
  bare-metal path. It has no BBB initialization scripts.
- **`db-init`** is a job that runs before the services using the databases. It (re)creates
  `bbb_graphql`, `hasura_app` and `blocknote_app` when the image version (release plus a checksum
  of its SQL) differs from the one recorded in the database, as the packages do on every
  upgrade, and keeps them on a plain restart. It sets the role passwords, which are generated per
  installation instead of upstream's fixed ones. A database lock makes concurrent runs wait for
  each other. Shared notes therefore do not survive an upgrade, as on bare metal.
- **Upgrades** are a new checkout, `docker compose pull` and `docker compose up -d`.

The volumes and how to back them up and restore them are described in
[Backup and restore](/administration/docker#backup-and-restore).

## Document conversion

### Office documents

On bare metal, bbb-web runs LibreOffice in a new `docker run --network none` container for each
document, which needs the Docker socket. Upstream also supports a Collabora Online server
(`bbb-libreoffice/assets/convert-cool.sh`). The stack uses that path: the `conversion` service is
Collabora's `collabora/code` image, pinned by digest and unchanged, and bbb-web posts each
document to it (`BBB_WEB_CONVERSION_URL`; empty turns office conversion off).

Restrictions applied in `docker-compose.yml`:

- attached only to the internal `conversion` network, shared with bbb-web alone;
- TLS and the update check off (`extra_params`);
- Collabora's data sources limited to loopback: `net.post_allow` is no data source any more and
  the private ranges of `net.lok_allow` are replaced by `127.0.0.1/32`, so a document that
  links to a resource cannot make it fetch anything from bbb-web or elsewhere;
- read-only root filesystem, all capabilities dropped except the three below.

Accepted exceptions, because Collabora's document isolation needs them:

- it runs as its image's user `cool` (UID 1001), not `BBB_UID`: it refuses to start its document
  processes under another user;
- it keeps `CHOWN`, `FOWNER` and `SYS_CHROOT`, and runs without `no-new-privileges`: its
  `coolforkit-caps` helper builds a chroot jail per document through file capabilities;
- its jail directories (`/opt/cool/child-roots`, `/opt/cool/cache`) are tmpfs mounts that allow
  `exec`.

### Shared notes PDF export

The shared-notes server exports notes as PDF with wkhtmltopdf through the script named in its
configuration (`run-in-systemd.sh`). The image replaces that script at the same path and with the
same arguments (`bbb-shared-notes-server/docker/run-in-systemd.sh`). The replacement applies a
timeout and runs the converter through `no-network` (`bbb-shared-notes-server/docker/no-network.c`):

- a seccomp filter denies `socket()` for every address family, `io_uring_setup()` and the calls
  that take a socket from or run code in another process, so the converter and everything it
  starts cannot connect to any address, loopback included;
- where the kernel offers Landlock, the converter writes only below its work directory and
  cannot trace or open the memory of other processes;
- it needs no privileges and no capabilities, and works with the default seccomp profiles of
  Docker and Kubernetes. If a restriction cannot be set up, the converter does not run.

bbb-web's own `run-in-systemd.sh` has a container replacement too
(`bigbluebutton-web/docker/run-in-systemd.sh`), with a timeout and a 640 MB address-space limit
for the presentation tools.

## Kubernetes readiness

No Kubernetes manifests are part of this work, but every part is built so that a later chart is
another thin wiring layer over the same images and the same contract:

- no host paths except the declared volumes; the only bind mount is the compose directory for
  `setup`, which on Kubernetes becomes Secrets;
- no generated compose files and no configuration logic outside the images;
- every long-running service has a healthcheck, and dependencies are expressed through them; haproxy and nginx
  resolve their backends at run time, and db-init tolerates concurrent runs (a Job retry);
- every setting is reachable through environment variables or mounted override files; one main
  process per container.

What a chart needs beyond the images: `emptyDir` volumes for the tmpfs mounts,
`securityContext.sysctls` for the low ports of haproxy and nginx, NetworkPolicies for the
`notes` and `conversion` networks (for `conversion`: ingress from bbb-web only, no egress), and
nginx upstream files that name the cluster DNS server and fully qualified Service names, since
nginx's resolver does not use DNS search domains. Fixed addresses are not needed: Services have
stable addresses. Collabora accepts convert requests only from private address ranges, so a pod
network outside them must be added to its `net.post_allow`.

## Tests and CI

| Test | Checks |
|---|---|
| Golden files (`docker/tests/golden/`) | each image's `--render-only` output for a fixture environment against a committed tree; expected values and failures (`expectations.yaml`); differences from a bare-metal reference, each with a reason (`parity.yaml`) |
| Contract (`docker/tests/contract/`) | schema of `docker/config-contract.yaml`, fixtures against their formats, generated files up to date |
| Compose assertions (`docker/tests/compose/`) | `docker-compose.yml` for every feature combination: tags or digests, healthchecks, restart policy, the published-port allowlist, `depends_on` conditions, the `notes` network members |
| Images | hadolint, shellcheck, directory modes of BuildKit builds, running under an arbitrary UID with a read-only root filesystem |
| Stack (`docker/tests/stack/`) | the whole stack on Docker Engine: a browser's join path (API, client, GraphQL WebSocket, shared notes PDF, learning dashboard, presentation and office conversion, LiveKit signaling), repeated after four restart and recreate cycles without restarting nginx; the effective SFU and webhooks configuration; webhook callbacks; the conversion restrictions; the notes PDF converter's network isolation |

Two workflows run them:

- **`docker-checks.yml`** runs on pull requests that change container files: the contract,
  golden runner, compose and lint jobs, then one job per image (BuildKit build, directory modes,
  golden cases with parity, UID check), then the stack test on the images those jobs built.
- **`build-all-images.yml`** builds every image of the bake `default` group for each of its
  platforms on native amd64 and arm64 runners and merges them into multi-arch images. On pushes
  (branches and release tags) it pushes them to `ghcr.io`.

## Deviations from bare metal

Each difference from the bare-metal configuration is listed with its reason in the `parity.yaml`
of the image's golden case, and the list is kept short. The kinds of differences:

- service names instead of `127.0.0.1`/`localhost`, and listening on all interfaces where
  another container connects;
- secrets read from the environment instead of written into files, and generated PostgreSQL role
  passwords instead of upstream's fixed ones;
- services run as non-root from the start (no chroot or user switch in haproxy and nginx) and log
  to stdout;
- LiveKit's single UDP port and bridge address; coturn without `relay-ip`, with a small internal
  relay range and LiveKit as its only peer;
- nginx with `server_name _` behind haproxy, trusting the PROXY protocol from the `bbb` subnet;
  no HTTP/2 path in haproxy;
- bbb-web allows URL fetches from `BBB_DOMAIN`, which inside the stack resolves to a private
  address, and turns recording off without the `recording` feature;
- office conversion through Collabora Online instead of a container per document, and
  `run-in-systemd.sh` replaced as described above;
- one Hasura instance, without the nginx load balancer in front of it.

## Known limits and follow-ups

- Recording processing, playback of new recordings, a development setup, running behind an
  existing reverse proxy, Greenlight, monitoring, a preflight check and phone dial-in follow.
  The `record-and-playback` image is not yet in the bake `default` group; its Dockerfile is
  still the earlier one and is not pinned by digest.
- Some images build for amd64 only: graphql-server (its engine binary is x86-64 only) and the
  images that need upstream's yq checksums, which cover amd64 only (livekit, shared-notes,
  export-annotations, graphql-middleware in CI).
- The upstream images of bbb-webrtc-sfu and bbb-webhooks run Node 22, not Node 24. They are
  trusted as upstream's CI publishes them; the digest pin is the integrity anchor.
- Meetings created while haproxy still serves its self-signed certificate start without the
  default presentation, because bbb-web verifies the certificate.
- Collabora needs about 0.5 to 0.9 GB of memory when idle, and its image is about 1.3 GB.
- Ports published by Docker bypass `ufw` and `firewalld`.
- Docker Compose 2.24.4 or later is required.

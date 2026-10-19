# Compose assertions

`assert-compose.sh` checks that `docker-compose.yml` follows the compose rules of the container
setup. It runs `docker compose config --format json` once per feature combination and checks the
resolved config. Nothing is started, no image is pulled.

```
assert-compose.sh [--compose FILE] [--features LIST|--all-feature-combinations]
  --compose FILE              compose file (default: docker-compose.yml at the repository root)
  --features LIST             check one comma-separated BBB_FEATURES value ("" = no feature)
  --all-feature-combinations  check every subset of the profiles named in FILE (default)
  COMPOSE_CMD                 compose CLI (default: `docker compose`), split on spaces
```

Output: one line per finding on stdout, `VIOLATION <rule>: <service or network>: <detail>`, and a
summary line on stderr. Exit 0 if there is no finding, 1 if there is at least one, 2 on a usage
error or a missing tool (`yq` v4, the compose CLI).

## Feature combinations

The features are the profile names used in the file's `profiles:` keys (read from the file as
written, with yq). By default every subset is checked, including the empty set: n profiles give
2^n combinations (the test fixture has 3 profiles, so 8). For more than 10 profiles the script
refuses and asks for `--features`. For each combination both `COMPOSE_PROFILES` and
`BBB_FEATURES` are set to the comma-separated list, as `.env` does
(`COMPOSE_PROFILES=${BBB_FEATURES}`).

A finding that occurs in several combinations is printed once. `config-invalid` names the
combinations in which `config` failed; the other rules are not checked for a combination whose
config is invalid.

## Rules

| Rule | Fails when | Why |
|---|---|---|
| `config-invalid` | `config` fails for a feature combination, e.g. a service depends on a service of a disabled profile ("depends on undefined service"). The subject is the service named in the error, else `compose`. | optional parts are Compose profiles selected through `BBB_FEATURES` |
| `image-tag` | a service has no `image:`, an image without a tag, or tag `latest` (also when `latest` comes from interpolation such as `${TAG:-latest}`). A digest (`name@sha256:...`, with or without tag) is accepted. A registry port (`host:5000/name`) is not a tag. | images are pinned, never `latest` |
| `healthcheck` | no `healthcheck:`, `disable: true`, or `test: ["NONE"]`. Only the compose file counts: a `HEALTHCHECK` in the image is not visible to `config`. | dependencies are expressed through healthchecks (design page, "Kubernetes readiness") |
| `restart` | `restart:` missing or other than `unless-stopped` | services restart by themselves (run-only services exempt) |
| `published-port` | a published host port that is not allowed for that service: nginx 80/tcp, haproxy 443/tcp, livekit 7882/udp, coturn 3478/udp and 3478/tcp. Also a container port on an ephemeral host port (`ports: ["6379"]`), a port bound to a single address (`127.0.0.1:8080:80`), and `network_mode: host`. The host side counts (`443:8443` on haproxy is allowed). Ranges are expanded by compose and shown collapsed. | design page, "Published ports": no ICE-TCP 7881, no UDP range, the TURN relay range internal only, no host networking |
| `depends-on` | a `depends_on` entry whose condition is not `service_healthy` or `service_completed_successfully` (the short list form resolves to `service_started`) | no startup order without healthchecks (design page, "Kubernetes readiness") |
| `notes-network` | network `notes` missing from the resolved config or not `internal: true`; `shared-notes` attached to any other network (including `default`) or using `network_mode`; a service other than nginx, recording, redis, postgres, bbb-web, shared-notes attached to `notes`; a service with `network_mode: service:shared-notes` | shared-notes relies on not being reachable by other services (design page, "Internal networks") |
| `resource-limits` | service `recording` (when it is in the resolved config) without `deploy.resources.limits.cpus` and `memory` | recording processing runs with resource limits |

The allowlist is per service, as in the table of published ports, so an allowed port on another service
(80/tcp on livekit) is a finding.

Compose drops networks that no service uses, so a defined but unused `notes` network shows up as
"network not defined".

### Run-only services

A service with the label `org.bigbluebutton.run-only=true` is exempt from `healthcheck` and
`restart`: it is started with `docker compose run --rm` (setup, preflight, db-init) and exits.
All other rules still apply to it (tag, ports, dependencies, networks). The label value must be
the string `true`.

```yaml
  setup:
    image: ...
    labels: {org.bigbluebutton.run-only: "true"}
    restart: "no"
```

## Running

The test image (`Dockerfile`) is ubuntu:24.04 pinned by digest, with yq as upstream packages it
(version from `build/packages-template/bbb-yq-go/build.sh`, checked against
`bbb-yq-go.sha256sum`) and the Docker Compose standalone binary v2.40.3 (checked against the
release's `checksums.txt`; only `config` is used). The image runs as nobody.

```bash
docker/tests/compose/run.sh                      # docker if installed, else podman
CONTAINER_ENGINE=podman docker/tests/compose/run.sh
```

`run.sh` builds the image and runs:
- `test-assert-compose.sh`: the interface contract. Do not change it to make the script pass.
- `test-assert-compose-extra.sh`: additional cases (usage errors, rule edge cases, output format).

Check the repository's compose file with the test image:

```bash
docker run --rm -v "$PWD:/repo:ro" bbb-compose-assert-test:local \
    /src/docker/tests/compose/assert-compose.sh --compose /repo/docker-compose.yml
```

With podman on an SELinux host, use `-v "$PWD:/repo:ro,z"`. Without the image, the script needs
bash, yq v4 and a compose CLI in `PATH`:

```bash
docker/tests/compose/assert-compose.sh                         # docker compose
COMPOSE_CMD=docker-compose docker/tests/compose/assert-compose.sh
```

Services with `env_file:` need those files to exist for `config` to succeed. The script reads
`.env` next to the compose file like compose does; `COMPOSE_ENV_FILES` and variables set in the
environment are passed through to compose.

### CI

The fast-tier workflow (`docker-checks.yml`, upstream-layout P7) runs on `pull_request`:

```bash
docker/tests/compose/run.sh
docker run --rm -v "$PWD:/repo:ro" bbb-compose-assert-test:local \
    /src/docker/tests/compose/assert-compose.sh --compose /repo/docker-compose.yml
```

The first step tests the script, the second checks the committed compose file for every feature
combination. Both fail the job with a non-zero exit.

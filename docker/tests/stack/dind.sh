#!/usr/bin/env bash
# Run the stack of docker-compose.yml with a real Docker Engine on a host that has only podman.
# Docker differs from podman/podman-compose in details that break images at run time (embedded
# DNS, tmpfs mounted noexec, `configs:`, restart behaviour), so the stack is tested with the
# Engine the deployment uses.
#
# Usage: docker/tests/stack/dind.sh [--host] COMMAND [ARG...]
#
#   --host             use the Docker Engine of this host (the `docker` CLI, DOCKER_HOST if
#                      set) instead of the Engine container, for example in CI
#                      (docker-checks.yml, job "Stack"); the repository is used where it is.
#                      `start` only checks the Engine, `load` is not available (load or pull
#                      the images yourself), `stop` runs `docker compose down -v` and removes
#                      the test certificate's volumes. podman is not needed. The stack's ports
#                      (80/tcp, 443/tcp, 7882/udp, 3478/udp and tcp) are published on this host.
#
#   start              start the Docker Engine container (idempotent)
#   load [IMAGE...]    copy images from podman into the Engine; default: every image of the
#                      compose file (localhost/bbb-<image>:TAG, built with
#                      docker/tests/buildkit/build.sh --tag TAG). Images pinned by digest
#                      (redis) are pulled by the Engine instead.
#   up [ARG...]        issue the test certificate (see below), then docker compose up -d
#                      --wait with certbot scaled to 0 (ARGs passed on, e.g. --scale
#                      webhooks=0)
#   test [ARG...]      docker/tests/stack/join-path.sh against the stack (ARGs passed on)
#   webhooks ARG...    docker/tests/stack/webhooks-check.sh against the stack (ARGs passed on)
#   conversion [ARG...] docker/tests/stack/conversion-check.sh against the stack's conversion
#                      service, with bbb-web as the client (ARGs passed on)
#   config [ARG...]    docker/tests/stack/config-check.sh against the stack (ARGs passed on)
#   recording [ARG...] docker/tests/stack/recording-check.sh against the stack (feature
#                      recording; ARGs passed on)
#   playback [ARG...]  docker/tests/stack/playback-check.sh against the stack (feature
#                      `recording`; ARGs passed on)
#   diagnostics DIR    write `docker compose ps -a` and the logs of every service of the
#                      stack to DIR (created), with the values of the secrets of fixture.env
#                      replaced by `[redacted NAME]`
#   compose ARG...     docker compose ARG... for the stack
#   docker ARG...      docker ARG... in the Engine
#   stop               remove the Engine container and its volume (the stack with it)
#
# Environment:
#   DIND_NAME          name of the podman container (default bbb-dind); its image store and
#                      volumes are in the podman volume DIND_NAME-data
#   BBB_IMAGE_TAG      tag of the BBB images (default 4.0.1)
#   DIND_SOCKET_DIR    `start` only: an existing directory of this host (absolute path, no `:`;
#                      applies when the Engine container is started) where the Engine also
#                      serves its API (DIR/docker.sock), so that the `docker` CLI of this host
#                      can use it (DOCKER_HOST=unix://DIR/docker.sock, with --host). Keep the
#                      path short (a socket path has at most 107 bytes) and the directory
#                      private (mode 0700): the socket gives full control of the Engine.
#
# The Engine runs in a privileged podman container (rootless podman: privileged within the user
# namespace only) with the repository mounted read-only at /src. The stack uses
# docker/tests/stack/fixture.env (fixture values only, docs: docker/README.md "Testing"):
# images from `localhost`, certbot scaled to 0, so no ACME request is ever made. In its place,
# `up` issues a certificate for BBB_DOMAIN from a throwaway test CA (created in the Engine, its
# key discarded after signing) and writes it into the `certs` volume as certbot would;
# docker/tests/stack/compose.test.yml makes bbb-web's JVM trust that CA, as a deployment's JVM
# trusts the public CA of its certificate. Ports are published inside the Engine container's
# network namespace only; nothing is published on the host.
#
# Exit status: that of the command; 2 on usage or engine errors.

set -euo pipefail

# docker:29.9.1-dind (multi-arch index). Docker Engine 29.9.1 is the Engine the stack was tested
# with on a VM (2026-10-18); docker/tests/buildkit/build.sh uses the CLI of the same release.
DIND_IMAGE="docker.io/library/docker@sha256:3e5756e2b6dad6a5f1f5deacf0a19f9eaa2581b76ae092b2d4a118162e1d4d4e"

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../../.." && pwd)"
NAME="${DIND_NAME:-bbb-dind}"
TAG="${BBB_IMAGE_TAG:-4.0.1}"

usage() { sed -n '2,/^$/{s/^# \{0,1\}//;p}' "$0" >&2; exit 2; }
die() { echo "dind.sh: $*" >&2; exit 2; }

host=0
if [ "${1:-}" = --host ]; then host=1; shift; fi

[[ "$NAME" =~ ^[A-Za-z0-9][A-Za-z0-9_.-]*$ ]] || die "invalid DIND_NAME: $NAME"
[[ "$TAG" =~ ^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$ ]] || die "invalid BBB_IMAGE_TAG: $TAG"

if [ "$host" -eq 1 ]; then
    command -v docker >/dev/null 2>&1 || die "docker not found"
    # The commands below are passed to the test scripts as strings and split at blanks.
    [[ "$REPO" =~ ^[A-Za-z0-9_./-]+$ ]] || die "--host: the repository path has unsupported characters: $REPO"
    SRC="$REPO"
    running() { docker info >/dev/null 2>&1; }
    require_running() { running || die "the Docker Engine of this host is not reachable (docker info)"; }
    # in_engine ARG...: run ARG... on this host, with the image tag of the stack.
    in_engine() { BBB_IMAGE_TAG="$TAG" "$@"; }
    DOCKER_CMD="docker"
    COMPOSE_PREFIX="env BBB_IMAGE_TAG=$TAG docker compose"
else
    command -v podman >/dev/null 2>&1 || die "podman not found"
    SRC=/src
    running() { [ "$(podman inspect -f '{{.State.Running}}' "$NAME" 2>/dev/null || true)" = true ]; }
    require_running() { running || die "the Engine container $NAME is not running (dind.sh start)"; }
    # in_engine ARG...: run ARG... in the Engine container, stdin attached.
    in_engine() { podman exec -i -e BBB_IMAGE_TAG="$TAG" "$NAME" "$@"; }
    DOCKER_CMD="podman exec -i $NAME docker"
    COMPOSE_PREFIX="podman exec -i -e BBB_IMAGE_TAG=$TAG $NAME docker compose"
fi

COMPOSE_ARGS="--project-directory $SRC -f $SRC/docker-compose.yml -f $SRC/docker/tests/stack/compose.test.yml --env-file $SRC/docker/tests/stack/fixture.env"

compose() {
    # shellcheck disable=SC2086 # COMPOSE_ARGS is a fixed list of words without spaces
    in_engine docker compose $COMPOSE_ARGS "$@"
}

# Volumes of the test certificate (Engine-local; removed with the Engine by `stop`).
PKI_VOLUME=bbb-test-pki
TRUSTSTORE_VOLUME=bbb-test-truststore

# test_pki: a test CA and a certificate for BBB_DOMAIN signed by it (kept in PKI_VOLUME: the CA
# certificate and the haproxy bundle, certificate and key, as bbb-certbot-deploy-hook writes it);
# a copy of bbb-web's Java truststore with the CA added (TRUSTSTORE_VOLUME). Idempotent.
test_pki() {
    local domain
    domain="$(sed -n 's/^BBB_DOMAIN=//p' "$HERE/fixture.env")"
    [ -n "$domain" ] || die "BBB_DOMAIN is not set in fixture.env"
    in_engine docker volume create "$PKI_VOLUME" >/dev/null
    in_engine docker volume create "$TRUSTSTORE_VOLUME" >/dev/null
    # shellcheck disable=SC2016 # expanded by the shell in the container
    in_engine docker run --rm --user 0 --entrypoint sh -v "$PKI_VOLUME:/pki" "localhost/bbb-haproxy:$TAG" -ec '
        cd /pki
        [ -s certbundle.pem ] && [ -s ca.pem ] && exit 0
        umask 077
        openssl req -x509 -newkey rsa:2048 -sha256 -days 30 -nodes -subj "/CN=BBB stack test CA" \
            -addext "basicConstraints=critical,CA:TRUE" -addext "keyUsage=critical,keyCertSign,cRLSign" \
            -keyout ca.key -out ca.pem 2>/dev/null
        openssl req -newkey rsa:2048 -nodes -subj "/CN=$1" -keyout server.key -out server.csr 2>/dev/null
        printf "subjectAltName=DNS:%s\nextendedKeyUsage=serverAuth\nbasicConstraints=CA:FALSE\n" "$1" >ext.cnf
        openssl x509 -req -in server.csr -CA ca.pem -CAkey ca.key -CAcreateserial -days 30 -sha256 \
            -extfile ext.cnf -out server.pem 2>/dev/null
        { cat server.pem; echo; cat server.key; } >certbundle.pem
        rm -f ca.key ca.srl server.csr server.key server.pem ext.cnf
        chmod 0644 ca.pem
        echo "issued a test certificate for $1"
    ' sh "$domain"
    # shellcheck disable=SC2016 # expanded by the shell in the container
    in_engine docker run --rm --user 0 --entrypoint bash -v "$PKI_VOLUME:/pki:ro" -v "$TRUSTSTORE_VOLUME:/out" \
        "localhost/bbb-web:$TAG" -ec '
        [ -s /out/cacerts ] && keytool -list -keystore /out/cacerts -storepass changeit -alias bbb-stack-test-ca >/dev/null 2>&1 && exit 0
        cp /etc/ssl/certs/java/cacerts /out/cacerts.tmp
        keytool -importcert -noprompt -alias bbb-stack-test-ca -file /pki/ca.pem -keystore /out/cacerts.tmp -storepass changeit >/dev/null
        chmod 0644 /out/cacerts.tmp
        mv -f /out/cacerts.tmp /out/cacerts
        echo "added the test CA to a copy of the Java truststore"
    '
}

# install_certificate: the bundle into the stack's `certs` volume (created by `up --no-start`),
# with the mode and owner bbb-certbot-deploy-hook gives it (haproxy's UID/GID 99).
install_certificate() {
    in_engine docker run --rm --user 0 --entrypoint sh -v "$PKI_VOLUME:/pki:ro" -v bigbluebutton_certs:/certs \
        "localhost/bbb-haproxy:$TAG" -ec 'install -o 99 -g 99 -m 0640 /pki/certbundle.pem /certs/certbundle.pem'
}

start() {
    if [ "$host" -eq 1 ]; then
        require_running
        docker version
        return
    fi
    if [ -n "${DIND_SOCKET_DIR:-}" ]; then
        [[ "$DIND_SOCKET_DIR" == /* && "$DIND_SOCKET_DIR" != *:* ]] \
            || die "DIND_SOCKET_DIR must be an absolute path without ':': $DIND_SOCKET_DIR"
    fi
    if running; then
        echo "Engine container $NAME is running"
        [ -z "${DIND_SOCKET_DIR:-}" ] || echo "dind.sh: DIND_SOCKET_DIR ignored: $NAME is already running (stop it first to serve the socket)" >&2
    else
        podman rm -f "$NAME" >/dev/null 2>&1 || true
        local socket_args=() dockerd_args=()
        if [ -n "${DIND_SOCKET_DIR:-}" ]; then
            [ -d "$DIND_SOCKET_DIR" ] || die "DIND_SOCKET_DIR is not a directory: $DIND_SOCKET_DIR"
            socket_args=(-v "$DIND_SOCKET_DIR:/run/dind-host")
            # added to the entrypoint's default --host options
            dockerd_args=(--host=unix:///run/dind-host/docker.sock)
        fi
        echo "starting Docker Engine container $NAME"
        # label=disable: SELinux hosts let the Engine read the repository unrelabelled.
        podman run -d --name "$NAME" --privileged --security-opt label=disable \
            -v "$NAME-data:/var/lib/docker" -v "$REPO:/src:ro" "${socket_args[@]}" \
            "$DIND_IMAGE" "${dockerd_args[@]}" >/dev/null
    fi
    for _ in $(seq 60); do
        in_engine docker info >/dev/null 2>&1 && break
        sleep 1
    done
    in_engine docker info >/dev/null 2>&1 || { podman logs "$NAME" >&2; die "dockerd did not start"; }
    in_engine docker version
}

# diagnostics DIR: `docker compose ps -a` and the logs of each service into DIR, with the values
# of the secrets of fixture.env (names ending in SECRET, PASSWORD or KEY) replaced. Fixture values
# only, but they are still not published as they are.
diagnostics() {
    local dir="$1" scrub=() name value svc
    mkdir -p "$dir"
    while IFS='=' read -r name value; do
        [[ "$name" =~ (SECRET|PASSWORD|KEY)$ ]] && [ -n "$value" ] || continue
        # sed pattern: the value with the characters special in a basic regular expression escaped
        scrub+=(-e "s/$(printf '%s' "$value" | sed 's/[][\\/.*^$]/\\&/g')/[redacted $name]/g")
    done < <(grep -E '^[A-Z0-9_]+=' "$HERE/fixture.env")
    [ "${#scrub[@]}" -gt 0 ] || die "no secret found in fixture.env"
    compose ps -a 2>&1 | sed "${scrub[@]}" >"$dir/ps.txt" || true
    while IFS= read -r svc; do
        compose logs --no-color --timestamps "$svc" 2>&1 | sed "${scrub[@]}" >"$dir/$svc.log" || true
    done < <(compose config --services)
    ls -l "$dir"
}

load() {
    require_running
    local images=("$@") image
    if [ "${#images[@]}" -eq 0 ]; then
        mapfile -t images < <(compose config --images | sort -u)
    fi
    for image in "${images[@]}"; do
        # A reference pinned by digest (redis) keeps its digest only when pulled: an image
        # loaded from an archive has no repository digest, and compose would pull it anyway.
        if [[ "$image" == *@sha256:* ]]; then
            echo "pulling $image"
            in_engine docker pull -q "$image" >/dev/null || die "pulling $image failed"
            continue
        fi
        podman image exists "$image" || podman pull -q "$image" >/dev/null \
            || die "image $image is neither in podman nor pullable"
        echo "loading $image"
        podman save --format docker-archive "$image" | in_engine docker load -q >/dev/null \
            || die "loading $image failed"
    done
}

up() {
    require_running
    test_pki
    compose up --no-start --quiet-pull --scale certbot=0
    install_certificate
    # --wait: returns once every service is running and healthy (db-init: exited 0). nginx
    # follows recreated upstreams by itself (docker/README.md, "nginx follows restarted services").
    compose up -d --wait --wait-timeout 600 --scale certbot=0 "$@"
}

[ $# -ge 1 ] || usage
cmd="$1"; shift
case "$cmd" in
    start) start ;;
    load) [ "$host" -eq 0 ] || die "load: not available with --host"; load "$@" ;;
    up) up "$@" ;;
    test)
        require_running
        BBB_SHARED_SECRET="$(sed -n 's/^BBB_SHARED_SECRET=//p' "$HERE/fixture.env")" \
            "$HERE/join-path.sh" --insecure --docker "$DOCKER_CMD" \
            --compose "$COMPOSE_PREFIX $COMPOSE_ARGS" \
            --client-image "localhost/bbb-graphql-actions:$TAG" "$@"
        ;;
    webhooks)
        require_running
        BBB_SHARED_SECRET="$(sed -n 's/^BBB_SHARED_SECRET=//p' "$HERE/fixture.env")" \
            "$HERE/webhooks-check.sh" "$@" --docker "$DOCKER_CMD" \
            --image "localhost/bbb-graphql-actions:$TAG"
        ;;
    config)
        require_running
        "$HERE/config-check.sh" \
            --compose "$COMPOSE_PREFIX $COMPOSE_ARGS" "$@"
        ;;
    playback)
        require_running
        "$HERE/playback-check.sh" --docker "$DOCKER_CMD" --image "localhost/bbb-nginx:$TAG" "$@"
        ;;
    conversion)
        require_running
        "$HERE/conversion-check.sh" --docker "$DOCKER_CMD" \
            --listener-image "localhost/bbb-graphql-actions:$TAG" --client-image "localhost/bbb-web:$TAG" \
            --stack "$COMPOSE_PREFIX $COMPOSE_ARGS" "$@"
        ;;
    recording)
        require_running
        BBB_SHARED_SECRET="$(sed -n 's/^BBB_SHARED_SECRET=//p' "$HERE/fixture.env")" \
            "$HERE/recording-check.sh" --insecure --docker "$DOCKER_CMD" \
            --compose "$COMPOSE_PREFIX $COMPOSE_ARGS" \
            --client-image "localhost/bbb-graphql-actions:$TAG" "$@"
        ;;
    diagnostics) [ $# -eq 1 ] || usage; require_running; diagnostics "$1" ;;
    compose) require_running; compose "$@" ;;
    docker) require_running; in_engine docker "$@" ;;
    stop)
        if [ "$host" -eq 1 ]; then
            require_running
            compose --profile '*' down -v --remove-orphans
            docker volume rm -f "$PKI_VOLUME" "$TRUSTSTORE_VOLUME" >/dev/null
            echo "removed the stack, its volumes and $PKI_VOLUME $TRUSTSTORE_VOLUME"
            exit 0
        fi
        podman rm -f "$NAME" >/dev/null 2>&1 || true
        podman volume rm -f "$NAME-data" >/dev/null 2>&1 || true
        echo "removed $NAME and its volume $NAME-data"
        ;;
    -h | --help) usage ;;
    *) echo "unknown command: $cmd" >&2; usage ;;
esac

#!/usr/bin/env bash
# The setup service with a real Docker Engine: `docker compose run --rm setup` writes .env in an
# empty project directory, a second run changes nothing, and the stack started with that .env
# passes the join path. Uses the Engine container of docker/tests/stack/dind.sh.
#
# Usage: docker/tests/setup/stack.sh run|stop
#
#   run    start the Engine (dind.sh start), load the images of docker-compose.yml and the setup
#          image (localhost/bbb-<image>:BBB_IMAGE_TAG, built with docker/tests/buildkit/build.sh),
#          run setup --non-interactive in /work of the Engine container (the fixture domain,
#          e-mail and address of the test fixtures as input; every secret generated),
#          issue a test certificate as dind.sh `up` does, start the stack with that .env
#          (certbot scaled to 0, so no ACME request is made) and run join-path.sh --no-restart
#   stop   remove the Engine container and its data (dind.sh stop)
#
# Environment: DIND_NAME (default bbb-dind-setup), BBB_IMAGE_TAG (default 4.0.1).
# Generated values are never printed; the shared secret goes to join-path.sh in its
# environment, as dind.sh `test` passes the fixture secret.
#
# Exit: 0 pass, 1 fail, 2 usage or engine error.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../../.." && pwd)"
export DIND_NAME="${DIND_NAME:-bbb-dind-setup}"
export BBB_IMAGE_TAG="${BBB_IMAGE_TAG:-4.0.1}"
NAME="$DIND_NAME"
TAG="$BBB_IMAGE_TAG"
DIND="$REPO/docker/tests/stack/dind.sh"

usage() { sed -n '2,/^$/{s/^# \{0,1\}//;p}' "$0" >&2; exit 2; }
die() { echo "stack.sh: $*" >&2; exit 2; }
[ $# -eq 1 ] || usage

DOMAIN=bbb.example.com
COMPOSE_ARGS="--project-directory /work -f /src/docker-compose.yml -f /src/docker/tests/stack/compose.test.yml"
in_engine() { podman exec -i "$NAME" "$@"; }
compose() {
    # shellcheck disable=SC2086 # COMPOSE_ARGS is a fixed list of words without spaces
    podman exec -i -e BBB_IMAGE_REGISTRY=localhost -e BBB_IMAGE_TAG="$TAG" "$NAME" docker compose $COMPOSE_ARGS "$@"
}
result() { echo "STEP $1: $2"; [ "$2" = OK ] || { echo "SETUP STACK: FAIL"; exit 1; }; }

# The test certificate for DOMAIN and bbb-web's truststore with its CA, as dind.sh `up` does
# (docker/tests/stack/dind.sh test_pki and install_certificate).
test_pki() {
    in_engine docker volume create bbb-test-pki >/dev/null
    in_engine docker volume create bbb-test-truststore >/dev/null
    # shellcheck disable=SC2016 # expanded by the shell in the container
    in_engine docker run --rm --user 0 --entrypoint sh -v bbb-test-pki:/pki "localhost/bbb-haproxy:$TAG" -ec '
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
    ' sh "$DOMAIN"
    # shellcheck disable=SC2016 # expanded by the shell in the container
    in_engine docker run --rm --user 0 --entrypoint bash -v bbb-test-pki:/pki:ro -v bbb-test-truststore:/out \
        "localhost/bbb-web:$TAG" -ec '
        [ -s /out/cacerts ] && exit 0
        cp /etc/ssl/certs/java/cacerts /out/cacerts.tmp
        keytool -importcert -noprompt -alias bbb-stack-test-ca -file /pki/ca.pem -keystore /out/cacerts.tmp -storepass changeit >/dev/null
        chmod 0644 /out/cacerts.tmp
        mv -f /out/cacerts.tmp /out/cacerts
    '
}

case "$1" in
    stop) exec "$DIND" stop ;;
    run) ;;
    *) usage ;;
esac

"$DIND" start >/dev/null
"$DIND" load
"$DIND" load "localhost/bbb-setup:$TAG"
in_engine sh -c 'rm -rf /work && mkdir /work'

# 1. setup in an empty project directory (no .env, no .env.sample)
if compose run --rm -T -e BBB_DOMAIN="$DOMAIN" -e ACME_EMAIL=admin@example.com \
    -e BBB_PUBLIC_IPV4=203.0.113.10 setup --non-interactive; then
    result setup OK
else
    result setup "FAIL docker compose run --rm setup exited non-zero"
fi
mode="$(in_engine stat -c '%a' /work/.env)"
if [ "$mode" = 600 ]; then result env-mode OK; else result env-mode "FAIL mode $mode"; fi
names="$(in_engine sh -c "grep -oE '^[A-Z_0-9]+=' /work/.env | tr -d '=' | tr '\n' ' '")"
echo "variables in .env: $names"

# 2. a second run changes nothing
before="$(in_engine sh -c 'stat -c "%i %Y" /work/.env; sha256sum /work/.env')"
sleep 1
out="$(compose run --rm -T setup --non-interactive 2>&1)" || result setup-rerun "FAIL exit non-zero"
after="$(in_engine sh -c 'stat -c "%i %Y" /work/.env; sha256sum /work/.env')"
if [ "$before" = "$after" ] && grep -q 'nothing changed' <<<"$out"; then result setup-rerun OK
else result setup-rerun "FAIL .env changed"; fi

# 3. the stack with that .env
test_pki
compose up --no-start --scale certbot=0
in_engine docker run --rm --user 0 --entrypoint sh -v bbb-test-pki:/pki:ro -v bigbluebutton_certs:/certs \
    "localhost/bbb-haproxy:$TAG" -ec 'install -o 99 -g 99 -m 0640 /pki/certbundle.pem /certs/certbundle.pem'
if compose up -d --wait --wait-timeout 600 --scale certbot=0; then result stack-up OK
else compose ps -a; result stack-up "FAIL docker compose up --wait"; fi

secret="$(in_engine sed -n 's/^BBB_SHARED_SECRET=//p' /work/.env)"
[ -n "$secret" ] || result join-path "FAIL no BBB_SHARED_SECRET in .env"
if BBB_SHARED_SECRET="$secret" "$REPO/docker/tests/stack/join-path.sh" --insecure --no-restart \
    --docker "podman exec -i $NAME docker" \
    --compose "podman exec -i -e BBB_IMAGE_REGISTRY=localhost -e BBB_IMAGE_TAG=$TAG $NAME docker compose $COMPOSE_ARGS" \
    --client-image "localhost/bbb-graphql-actions:$TAG"; then
    result join-path OK
else
    result join-path FAIL
fi
echo "SETUP STACK: PASS"

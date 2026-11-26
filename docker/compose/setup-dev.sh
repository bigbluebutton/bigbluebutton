#!/usr/bin/env bash
# Sets up a local Docker Compose development environment: .env, a local CA with a certificate
# for the domain, a Java truststore for bbb-web, and docker-compose.override.yml.
set -euo pipefail

DEFAULT_DOMAIN=bbb.localhost
DOMAIN=$DEFAULT_DOMAIN
CERTS=data/certs
# The CA stays out of data/certs, which is mounted into the certbot container
CA=data/dev-ca
OVERRIDE=docker-compose.override.yml

fail() {
  echo "$*" >&2
  exit 1
}

usage() {
  cat <<EOF
Usage: ${0##*/} [-h|--help] [DOMAIN]

Sets up a local Docker Compose development environment: .env, a local CA with a certificate
for DOMAIN, a Java truststore for bbb-web, and docker-compose.override.yml.

Arguments:
  DOMAIN        domain to serve BigBlueButton on (default: BBB_DOMAIN in .env, else $DEFAULT_DOMAIN)

Options:
  -h, --help    show this help and exit
EOF
}

parse_args() {
  local positional=()
  while (($#)); do
    case "$1" in
      -h | --help)
        usage
        exit 0
        ;;
      --)
        shift
        positional+=("$@")
        break
        ;;
      -*)
        usage >&2
        fail "Unknown option: $1"
        ;;
      *) positional+=("$1") ;;
    esac
    shift
  done

  if ((${#positional[@]} > 1)); then
    usage >&2
    fail "Too many arguments."
  fi
  DOMAIN=${positional[0]:-$DEFAULT_DOMAIN}
}

check_tools() {
  local tool
  for tool in docker openssl; do
    command -v "$tool" >/dev/null || fail "$tool is not installed."
  done
}

# Without an argument, a domain already set in .env is the one to set up.
use_env_domain() {
  local env_domain=
  [[ ! -e .env ]] || env_domain=$(sed -n 's/^BBB_DOMAIN=//p' .env | tail -n 1)
  if (($# == 0)) && [[ -n $env_domain ]]; then DOMAIN=$env_domain; fi
  [[ -z $env_domain || $env_domain == "$DOMAIN" ]] ||
    fail ".env is set up for $env_domain, not $DOMAIN. Change BBB_DOMAIN in .env first."
}

# Fills the empty settings of .env (created from .env.sample if missing); keeps values already set.
configure_env() {
  [[ -e .env ]] || cp .env.sample .env
  chmod 600 .env

  local tmp line
  tmp=$(mktemp .env.XXXXXX)
  trap 'rm -f "$tmp"' EXIT
  while IFS= read -r line || [[ -n $line ]]; do
    case "$line" in
      BBB_DOMAIN=) line="BBB_DOMAIN=$DOMAIN" ;;
      BBB_PUBLIC_IP=) line="BBB_PUBLIC_IP=127.0.0.1" ;;
      *_SECRET= | *_PASSWORD= | LIVEKIT_API_KEY=) line+=$(openssl rand -hex 32) ;;
    esac
    printf '%s\n' "$line"
  done < .env > "$tmp"
  mv "$tmp" .env
  trap - EXIT
}

# The CA is kept between runs so that browsers only need to trust it once. Its name constraint
# limits it to DOMAIN, so the trusted CA can't issue certificates for other sites.
create_ca() {
  if [[ -e $CA/rootCA.pem && -e $CA/rootCA.key ]]; then
    openssl x509 -in "$CA/rootCA.pem" -noout -ext nameConstraints | grep -qF "DNS:$DOMAIN" ||
      fail "The CA in $CA is not for $DOMAIN. Remove $CA (and the CA from your browser) and run again."
    return
  fi
  mkdir -p "$CA"
  openssl req -x509 -newkey rsa:2048 -nodes -days 3650 \
    -subj "/CN=BigBlueButton local development CA for $DOMAIN" \
    -addext "basicConstraints=critical,CA:TRUE" \
    -addext "keyUsage=critical,keyCertSign,cRLSign" \
    -addext "nameConstraints=critical,permitted;DNS:$DOMAIN" \
    -keyout "$CA/rootCA.key" -out "$CA/rootCA.pem"
  chmod 600 "$CA/rootCA.key"
}

create_server_cert() {
  openssl req -new -newkey rsa:2048 -nodes -subj "/CN=$DOMAIN" \
    -keyout "$CERTS/privkey.pem" -out "$CERTS/server.csr"
  printf 'subjectAltName=DNS:%s\nbasicConstraints=CA:FALSE\nextendedKeyUsage=serverAuth\n' \
    "$DOMAIN" > "$CERTS/server.ext"
  openssl x509 -req -days 365 -in "$CERTS/server.csr" -extfile "$CERTS/server.ext" \
    -CA "$CA/rootCA.pem" -CAkey "$CA/rootCA.key" -CAcreateserial -out "$CERTS/fullchain.pem"
  rm -f "$CERTS/server.csr" "$CERTS/server.ext"
  chmod 600 "$CERTS/privkey.pem"
}

create_certs() {
  mkdir -p "$CERTS"
  create_ca
  create_server_cert
}

# bbb-web loads the default slides from https://$DOMAIN, so it has to trust the CA.
# Only docker-compose.yml is read here: an override that already mounts the truststore would
# make Docker create data/certs/cacerts as a directory while the file is not there yet.
# It runs as root, so that it can replace a cacerts left by an earlier run and write to data/certs
# with rootless Docker or Podman too. The file then gets the owner of data/certs, which this script
# created as the caller (rootless, the container's root is already the caller).
create_truststore() {
  docker compose -f docker-compose.yml run --rm --no-deps --user 0 -v "$PWD/$CERTS:/certs" -v "$PWD/$CA/rootCA.pem:/ca.pem:ro" \
    --entrypoint sh web -c \
    'cp "$JAVA_HOME/lib/security/cacerts" /certs/cacerts &&
     keytool -importcert -noprompt -alias local-ca -file /ca.pem -keystore /certs/cacerts -storepass changeit &&
     chown --reference=/certs /certs/cacerts'
}

# Makes web use the truststore. A new override file gets only that; an existing one is left
# alone, with a note if it doesn't use the truststore yet.
configure_override() {
  if [[ ! -e $OVERRIDE ]]; then
    cat > "$OVERRIDE" <<'YAML'
# Written by docker/compose/setup-dev.sh. More settings: docker-compose.override.sample.yml
services:
  web:
    # the Java truststore with the local CA, so bbb-web can load the default slides
    environment:
      JAVA_TOOL_OPTIONS: -Djavax.net.ssl.trustStore=/etc/ssl/local/cacerts
    volumes:
      - ./data/certs/cacerts:/etc/ssl/local/cacerts:ro
YAML
  elif ! grep -q '/etc/ssl/local/cacerts' "$OVERRIDE"; then
    echo "Note: $OVERRIDE exists and was left unchanged. For bbb-web to trust the local CA, add to web:"
    echo "  environment: { JAVA_TOOL_OPTIONS: -Djavax.net.ssl.trustStore=/etc/ssl/local/cacerts }"
    echo "  volumes: [ ./data/certs/cacerts:/etc/ssl/local/cacerts:ro ]"
  fi
}

print_final_instructions() (
  # shellcheck source=/dev/null
  . .env
  echo "Configured the Docker Compose development environment for https://$BBB_DOMAIN"
  echo "Trust the presented server certificate or import $CA/rootCA.pem in your browser or system, then run:"
  echo ""
  echo "  docker compose up -d"
  echo ""
  echo "Test with"
  echo ""
  echo "  https://bigbluebutton.org/api-mate/#server=https://$BBB_DOMAIN/bigbluebutton/&sharedSecret=$BBB_SHARED_SECRET"
  echo ""
)

parse_args "$@"
check_tools
cd "$(dirname "${BASH_SOURCE[0]}")/../.."
use_env_domain "$@"
configure_env
create_certs
create_truststore
configure_override
print_final_instructions

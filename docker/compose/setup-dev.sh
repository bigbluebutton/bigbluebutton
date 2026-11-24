#!/usr/bin/env bash
# Sets up a local Docker Compose development environment: .env, a local CA with a certificate
# for the domain, a Java truststore for bbb-web, and docker-compose.override.yml.
set -euo pipefail

DEFAULT_DOMAIN=bbb.localhost
DOMAIN=$DEFAULT_DOMAIN
CERTS=data/certs
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
  DOMAIN        domain to serve BigBlueButton on (default: $DEFAULT_DOMAIN)

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
  for tool in docker openssl yq; do
    command -v "$tool" >/dev/null || fail "$tool is not installed."
  done
  yq --version | grep -q mikefarah || fail "yq is not mikefarah/yq (https://github.com/mikefarah/yq)."
}

# Fills the empty settings of .env (created from .env.sample if missing); keeps values already set.
configure_env() {
  [[ -e .env ]] || cp .env.sample .env
  chmod 600 .env

  local tmp line
  tmp=$(mktemp .env.XXXXXX)
  trap 'rm -f "$tmp"' EXIT
  while IFS= read -r line; do
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

# The CA is kept between runs so that browsers only need to trust it once.
create_ca() {
  [[ -e $CERTS/rootCA.pem && -e $CERTS/rootCA.key ]] && return
  openssl req -x509 -newkey rsa:2048 -nodes -days 3650 \
    -subj "/CN=BigBlueButton local development CA" \
    -addext "basicConstraints=critical,CA:TRUE" \
    -addext "keyUsage=critical,keyCertSign,cRLSign" \
    -keyout "$CERTS/rootCA.key" -out "$CERTS/rootCA.pem"
}

create_server_cert() {
  openssl req -new -newkey rsa:2048 -nodes -subj "/CN=$DOMAIN" \
    -keyout "$CERTS/privkey.pem" -out "$CERTS/server.csr"
  printf 'subjectAltName=DNS:%s\nbasicConstraints=CA:FALSE\nextendedKeyUsage=serverAuth\n' \
    "$DOMAIN" > "$CERTS/server.ext"
  openssl x509 -req -days 365 -in "$CERTS/server.csr" -extfile "$CERTS/server.ext" \
    -CA "$CERTS/rootCA.pem" -CAkey "$CERTS/rootCA.key" -CAcreateserial -out "$CERTS/fullchain.pem"
  rm -f "$CERTS/server.csr" "$CERTS/server.ext"
  chmod 600 "$CERTS/privkey.pem" "$CERTS/rootCA.key"
}

create_certs() {
  mkdir -p "$CERTS"
  create_ca
  create_server_cert
}

# bbb-web loads the default slides from https://$DOMAIN, so it has to trust the CA.
create_truststore() {
  pwd
  docker compose run --rm --no-deps --user 0 -v "$PWD/$CERTS:/certs" --entrypoint sh web -c \
    'cp "$JAVA_HOME/lib/security/cacerts" /certs/cacerts &&
     keytool -importcert -noprompt -alias local-ca -file /certs/rootCA.pem \
       -keystore /certs/cacerts -storepass changeit'
}

# Makes web use the truststore; safe to run again.
configure_override() {
  [[ -e $OVERRIDE ]] || cp docker-compose.override.sample.yml "$OVERRIDE"

  yq -i '
    .services.web.environment.JAVA_TOOL_OPTIONS = "-Djavax.net.ssl.trustStore=/etc/ssl/local/cacerts" |
    .services.web.volumes = ((.services.web.volumes // []) + ["./data/certs/cacerts:/etc/ssl/local/cacerts:ro"] | unique)
  ' "$OVERRIDE"
}

print_final_instructions() ( 
  . .env
  echo "Configured the Docker Compose development environment for https://$BBB_DOMAIN"
  echo "Trust the presented server certicate or import $CERTS/rootCA.pem in your browser or system, then run:"
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
cd "${BASH_SOURCE[0]%/*}/../.."
configure_env
create_certs
create_truststore
configure_override
print_final_instructions

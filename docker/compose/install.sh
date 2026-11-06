#!/bin/sh
# Downloads the docker compose files of BigBlueButton and writes a .env for one server:
#
#   curl -fsSL https://raw.githubusercontent.com/bigbluebutton/bigbluebutton/v4.0.x-develop/docker/compose/install.sh | sh -s -- <domain> [email]
#
# Without the email (for Let's Encrypt), put your own certificate in data/certs.
# BBB_REPO and BBB_BRANCH select the GitHub repository and the branch or tag to download from,
# BBB_DIR the target directory.
# Docker is not installed by this script.
set -eu

BBB_REPO="${BBB_REPO:-bigbluebutton/bigbluebutton}"
BBB_BRANCH="${BBB_BRANCH:-v4.0.x-develop}"
BBB_DIR="${BBB_DIR:-bigbluebutton}"
URL="https://raw.githubusercontent.com/$BBB_REPO/$BBB_BRANCH"

fail() {
  echo "$*" >&2
  exit 1
}

[ $# -eq 1 ] || [ $# -eq 2 ] || fail "Usage: install.sh <domain> [email]"
domain="$1"
email="${2:-}"

# Docker Engine 28 or later, the compose plugin 2.35 or later
command -v docker >/dev/null || fail "Docker is not installed. Install Docker Engine 28 or later first."
engine=$(docker version --format '{{.Server.Version}}') || fail "Cannot reach the Docker Engine. Is it running, and may this user use it?"
[ "${engine%%.*}" -ge 28 ] || fail "Docker Engine $engine is too old: 28 or later is needed."
compose=$(docker compose version --short 2>/dev/null) || fail "The docker compose plugin is not installed: 2.35 or later is needed."
compose="${compose#v}"
compose_major="${compose%%.*}"
compose_minor="${compose#*.}"
compose_minor="${compose_minor%%.*}"
if [ "$compose_major" -lt 2 ] || { [ "$compose_major" -eq 2 ] && [ "$compose_minor" -lt 35 ]; }; then
  fail "docker compose $compose is too old: 2.35 or later is needed."
fi

# The other tools this script uses
for tool in curl openssl getent; do
  command -v "$tool" >/dev/null || fail "$tool is not installed."
done

# Download the compose file and its configuration
echo "Downloading $URL to $BBB_DIR"
mkdir -p "$BBB_DIR/docker/compose/nginx"
cd "$BBB_DIR"
for file in docker-compose.yml .env.sample \
  docker/compose/bbb-export-annotations.json docker/compose/bbb-graphql-middleware.yml \
  docker/compose/certbot.sh docker/compose/haproxy.cfg docker/compose/init.sh \
  docker/compose/nginx/bigbluebutton docker/compose/nginx/playback.nginx; do
  curl -fsSL -o "$file" "$URL/$file"
done

# Keep an existing .env
if [ -e .env ]; then
  echo "$BBB_DIR/.env exists, left unchanged."
else
  # The public IPv4 address is the one the domain resolves to
  public_ip=$(getent ahostsv4 "$domain" | head -n 1 | cut -d ' ' -f 1)
  [ -n "$public_ip" ] || fail "$domain does not resolve to an IPv4 address. Create its DNS record first."
  if ! ip -4 -o address show 2>/dev/null | grep -qF " $public_ip/"; then
    echo "Note: $public_ip is not an address of this host. That is fine behind NAT or with a floating IP."
  fi

  # Write .env from .env.sample: domain, address, email, and a new random value for each secret
  touch .env
  chmod 600 .env
  while IFS= read -r line; do
    case "$line" in
      BBB_DOMAIN=) line="BBB_DOMAIN=$domain" ;;
      BBB_PUBLIC_IP=) line="BBB_PUBLIC_IP=$public_ip" ;;
      ACME_EMAIL=) line="ACME_EMAIL=$email" ;;
      *_SECRET= | *_PASSWORD= | LIVEKIT_API_KEY=) line="$line$(openssl rand -hex 32)" ;;
    esac
    printf '%s\n' "$line"
  done < .env.sample > .env
  echo "Wrote $BBB_DIR/.env"
fi

# What to do next
echo
if [ -z "$email" ]; then
  echo "Put your certificate in $BBB_DIR/data/certs as fullchain.pem and privkey.pem."
fi
echo "Next: review $BBB_DIR/.env, then start BigBlueButton with"
echo "  cd $BBB_DIR && docker compose up -d"

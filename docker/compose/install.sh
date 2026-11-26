#!/bin/sh
# Downloads the docker compose files of BigBlueButton and writes a .env for one server:
#
#   curl -fsSL https://raw.githubusercontent.com/bigbluebutton/bigbluebutton/v4.1.x-develop/docker/compose/install.sh | sh -s -- <domain> [email]
#
# Without the email (for Let's Encrypt), put your own certificate in data/certs.
# BBB_REPO and BBB_BRANCH select the GitHub repository and the branch or tag to download from,
# BBB_DIR the target directory.
# Docker is not installed by this script.
set -eu

BBB_REPO="${BBB_REPO:-bigbluebutton/bigbluebutton}"
BBB_BRANCH="${BBB_BRANCH:-v4.1.x-develop}"
BBB_DIR="${BBB_DIR:-bigbluebutton}"
URL="https://raw.githubusercontent.com/$BBB_REPO/$BBB_BRANCH"

fail() {
  echo "$*" >&2
  exit 1
}

[ $# -eq 1 ] || [ $# -eq 2 ] || fail "Usage: install.sh <domain> [email]"
domain="$1"
[ -n "$domain" ] || fail "Usage: install.sh <domain> [email]"
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

# An existing .env is kept: it has to be for the same domain, and its email counts
if [ -e "$BBB_DIR/.env" ]; then
  env_domain=$(sed -n 's/^BBB_DOMAIN=//p' "$BBB_DIR/.env" | tail -n 1)
  [ -z "$env_domain" ] || [ "$env_domain" = "$domain" ] ||
    fail "$BBB_DIR/.env is set up for $env_domain, not $domain. Run install.sh with $env_domain, or change BBB_DOMAIN in .env first."
  email=$(sed -n 's/^ACME_EMAIL=//p' "$BBB_DIR/.env" | tail -n 1)
fi

# Download the compose file and its configuration
echo "Downloading $URL to $BBB_DIR"
mkdir -p "$BBB_DIR/docker/compose/nginx"
cd "$BBB_DIR"
for file in docker-compose.yml .env.sample \
  docker/compose/certbot.sh docker/compose/haproxy.cfg \
  docker/compose/nginx/bigbluebutton docker/compose/nginx/playback.nginx; do
  curl -fsSL -o "$file" "$URL/$file"
done

# Keep an existing .env
loopback_ip=
if [ -e .env ]; then
  echo "$BBB_DIR/.env exists, left unchanged (BBB_DOMAIN, BBB_PUBLIC_IP, ACME_EMAIL and the secrets stay as they are)."
else
  # The public IPv4 address is the first address of the domain that is not a loopback address
  # (e.g. from 127.0.1.1 in /etc/hosts). With only loopback addresses, .env gets an empty
  # BBB_PUBLIC_IP to fill in.
  public_ip=$(getent ahostsv4 "$domain" | awk '$1 !~ /^127\./ {print $1; exit}')
  if [ -z "$public_ip" ]; then
    loopback_ip=$(getent ahostsv4 "$domain" | awk '{print $1; exit}')
    [ -n "$loopback_ip" ] || fail "$domain does not resolve to an IPv4 address. Create its DNS record first."
  elif ! ip -4 -o address show 2>/dev/null | grep -qF " $public_ip/"; then
    echo "Note: $public_ip is not an address of this host. LiveKit announces it to the clients, so it must reach this host (as behind NAT or with a floating IP); if it does not, set BBB_PUBLIC_IP in .env."
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
  # created here, so that it belongs to this user and not to root when docker creates it
  mkdir -p data/certs
  echo "Put your certificate in $BBB_DIR/data/certs as fullchain.pem and privkey.pem."
fi
if [ -n "$loopback_ip" ]; then
  fail "On this host $domain resolves only to $loopback_ip, a loopback address (see /etc/hosts). Set BBB_PUBLIC_IP in $BBB_DIR/.env to the server's public IPv4 address, then start BigBlueButton with: cd $BBB_DIR && docker compose up -d"
fi
echo "Next: review $BBB_DIR/.env, then start BigBlueButton with"
echo "  cd $BBB_DIR && docker compose up -d"

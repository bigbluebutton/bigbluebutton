#!/bin/sh
# Copies the docker compose files of BigBlueButton out of the bbb-compose image and writes a .env
# for one server:
#
#   curl -fsSL https://raw.githubusercontent.com/bigbluebutton/bigbluebutton/v4.1.x-develop/docker/compose/install.sh | sh -s -- <domain> [email]
#
# Without the email (for Let's Encrypt), put your own certificate in data/certs.
# BBB_IMAGE_TAG selects the image tag (default: this branch), BBB_IMAGE_REGISTRY another registry
# (a mirror), BBB_COMPOSE_IMAGE another image with the files, BBB_DIR the target directory.
# Docker is not installed by this script.
set -eu

BBB_DIR="${BBB_DIR:-bigbluebutton}"

fail() {
  printf '%s\n' "$*" >&2
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
for tool in openssl getent; do
  command -v "$tool" >/dev/null || fail "$tool is not installed."
done

# The value of variable $1 in the .env of folder $env_dir, as docker compose reads it
env_dir=$BBB_DIR
env_value() {
  (cd "$env_dir" && printf 'services: {}\n' | docker compose -f - config --environment 2>/dev/null) |
    sed -n "s/^$1=//p" | tail -n 1
}

# An existing .env is kept: it has to be for the same domain, and its email and images count
env_tag='' env_registry='' env_image=''
if [ -e "$BBB_DIR/.env" ]; then
  env_domain=$(env_value BBB_DOMAIN)
  [ -z "$env_domain" ] || [ "$env_domain" = "$domain" ] ||
    fail "$BBB_DIR/.env is set up for $env_domain, not $domain. Run install.sh with $env_domain, or change BBB_DOMAIN in .env first."
  email=$(env_value ACME_EMAIL)
  env_tag=$(env_value BBB_IMAGE_TAG)
  env_registry=$(env_value BBB_IMAGE_REGISTRY)
  env_image=$(env_value BBB_COMPOSE_IMAGE)
fi
# the image as ./bbb-conf finds it: BBB_COMPOSE_IMAGE, else bbb-compose of the registry and tag
tag="${BBB_IMAGE_TAG:-${env_tag:-v4.1.x-develop}}"
registry="${BBB_IMAGE_REGISTRY:-${env_registry:-ghcr.io/bigbluebutton/bigbluebutton}}"
image="${BBB_COMPOSE_IMAGE:-${env_image:-$registry/bbb-compose:$tag}}"

# The compose file, its configuration and bbb-conf, from the image
echo "Copying the files of $image to $BBB_DIR"
docker pull -q "$image" >/dev/null || fail "Cannot pull $image."
mkdir -p "$BBB_DIR"
cd "$BBB_DIR"
container=$(docker create "$image" none)
for file in docker-compose.yml .env.sample bbb-conf docker; do
  docker cp -q "$container:/$file" . || {
    docker rm "$container" >/dev/null
    fail "Cannot copy $file out of $image."
  }
done
docker rm "$container" >/dev/null

# Keep an existing .env
setip_failed=
if [ -e .env ]; then
  echo "$BBB_DIR/.env exists, left unchanged (BBB_DOMAIN, BBB_PUBLIC_IP, ACME_EMAIL and the secrets stay as they are)."
  [ -n "$(env_dir=. && env_value BBB_PUBLIC_IP)" ] || setip_failed=1
else
  # Write .env from .env.sample: domain, email, images, and a new random value for each secret
  touch .env
  chmod 600 .env
  while IFS= read -r line; do
    case "$line" in
      BBB_DOMAIN=) line="BBB_DOMAIN=$domain" ;;
      ACME_EMAIL=) line="ACME_EMAIL=$email" ;;
      BBB_IMAGE_TAG=*) line="BBB_IMAGE_TAG=$tag" ;;
      '#BBB_IMAGE_REGISTRY='*) [ -z "${BBB_IMAGE_REGISTRY:-}" ] || line="BBB_IMAGE_REGISTRY=$BBB_IMAGE_REGISTRY" ;;
      '#BBB_COMPOSE_IMAGE='*) [ -z "${BBB_COMPOSE_IMAGE:-}" ] || line="BBB_COMPOSE_IMAGE=$BBB_COMPOSE_IMAGE" ;;
      *_SECRET= | *_PASSWORD= | LIVEKIT_API_KEY=) line="$line$(openssl rand -hex 32)" ;;
    esac
    printf '%s\n' "$line"
  done < .env.sample > .env
  echo "Wrote $BBB_DIR/.env"
  # BBB_PUBLIC_IP: the first address of the domain that is not a loopback address
  ./bbb-conf --setip "$domain" || setip_failed=1
fi

# What to do next
echo
if [ -z "$email" ]; then
  # created here, so that it belongs to this user and not to root when docker creates it
  mkdir -p data/certs
  echo "Put your certificate in $BBB_DIR/data/certs as fullchain.pem and privkey.pem."
fi
if [ -n "$setip_failed" ]; then
  fail "BBB_PUBLIC_IP in $BBB_DIR/.env is empty. Once $domain resolves, run: cd $BBB_DIR && ./bbb-conf --setip $domain (or set BBB_PUBLIC_IP by hand), then ./bbb-conf --start"
fi
echo "Next: review $BBB_DIR/.env, then start BigBlueButton with"
echo "  cd $BBB_DIR && ./bbb-conf --start"

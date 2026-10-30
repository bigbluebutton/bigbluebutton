#!/bin/sh
# Hands haproxy its certificate and reloads haproxy through its master socket when it changes.
# The certificate is either the operator's own, fullchain.pem and privkey.pem in /certs (the
# names bbb-install uses in /local/certs), read again every hour, or a Let's Encrypt certificate
# for BBB_DOMAIN, obtained and renewed with the webroot nginx serves on port 80, as bbb-install
# and certbot.timer do. Until the first Let's Encrypt certificate is issued, haproxy serves a
# self-signed one.
set -u
bundle=/etc/letsencrypt/certbundle.pem
live="/etc/letsencrypt/live/$BBB_DOMAIN"

# Writes chain $1 and key $2 as the bundle for haproxy and reloads haproxy, if they changed
use_certificate() {
  if ! cat "$1" "$2" | cmp -s - "$bundle"; then
    cat "$1" "$2" > "$bundle.new"
    chown 99 "$bundle.new" && chmod 0600 "$bundle.new" && mv "$bundle.new" "$bundle"
    python3 -c 'import socket; s = socket.socket(socket.AF_UNIX); s.connect("/var/lib/haproxy/master.sock"); s.sendall(b"reload\n"); print(s.recv(4096).decode())' 2>/dev/null \
      || echo "haproxy is not running yet; it reads the new certificate when it starts"
  fi
}

# haproxy (UID 99) puts its master socket here
chown 99 /var/lib/haproxy

if [ -s /certs/fullchain.pem ] && [ -s /certs/privkey.pem ]; then
  echo "Using the certificate in ./data/certs"
  while :; do
    use_certificate /certs/fullchain.pem /certs/privkey.pem
    sleep 1h
  done
fi

if [ -z "${ACME_EMAIL:-}" ]; then
  echo "certbot: set ACME_EMAIL in .env, or put fullchain.pem and privkey.pem in ./data/certs" >&2
  exit 1
fi
if [ ! -s "$bundle" ]; then
  openssl req -x509 -newkey rsa:2048 -nodes -days 30 -subj "/CN=$BBB_DOMAIN" \
    -keyout /tmp/key.pem -out /tmp/cert.pem 2>/dev/null
  use_certificate /tmp/cert.pem /tmp/key.pem
fi
while :; do
  delay=12h
  certbot certonly --webroot -w /var/www/bigbluebutton-default/assets -d "$BBB_DOMAIN" \
    --email "$ACME_EMAIL" --agree-tos --non-interactive --rsa-key-size 4096 --keep-until-expiring \
    || delay=15m
  if [ -s "$live/privkey.pem" ]; then
    use_certificate "$live/fullchain.pem" "$live/privkey.pem"
  fi
  sleep "$delay"
done

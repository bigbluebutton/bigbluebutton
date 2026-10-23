#!/bin/sh
# Makes the stack's CA, in CA_DIR, and nginx's certificate, in CERTS_DIR,
# once: it names localhost and 127.0.0.1, which the runner uses, and
# sink.test, kept for the callback sink. bundle.pem is the system roots
# plus the CA, for SSL_CERT_FILE. The services mount CERTS_DIR; the CA's
# key stays out of it.
#
#   certs.sh CERTS_DIR CA_DIR
set -eu
certs=$1
ca=$2
mkdir -p "$certs" "$ca"
if [ ! -f "$ca/ca.key" ] || [ ! -f "$certs/ca.crt" ]; then
	openssl req -x509 -newkey rsa:2048 -nodes -sha256 -days 3650 -subj "/CN=bbb-conform Tier 1 CA" \
		-addext basicConstraints=critical,CA:TRUE -addext keyUsage=critical,keyCertSign,cRLSign \
		-keyout "$ca/ca.key" -out "$certs/ca.crt" 2>/dev/null
	chmod 600 "$ca/ca.key"
	rm -f "$certs/server.crt"
fi
if [ ! -f "$certs/server.crt" ]; then
	openssl req -newkey rsa:2048 -nodes -sha256 -subj "/CN=localhost" \
		-keyout "$certs/server.key" -out "$ca/server.csr" 2>/dev/null
	printf 'subjectAltName=DNS:localhost,IP:127.0.0.1,DNS:sink.test\nextendedKeyUsage=serverAuth\n' > "$ca/server.ext"
	openssl x509 -req -sha256 -days 3650 -in "$ca/server.csr" -CA "$certs/ca.crt" -CAkey "$ca/ca.key" \
		-CAcreateserial -CAserial "$ca/ca.srl" -extfile "$ca/server.ext" -out "$certs/server.crt" 2>/dev/null
	rm -f "$ca/server.csr" "$ca/server.ext"
fi
# Readable in the containers whatever user they map root to; the key is for
# a localhost-only test certificate.
chmod 644 "$certs/ca.crt" "$certs/server.crt" "$certs/server.key"
roots=
for f in /etc/ssl/certs/ca-certificates.crt /etc/pki/tls/certs/ca-bundle.crt /etc/ssl/cert.pem; do
	if [ -f "$f" ]; then
		roots=$f
		break
	fi
done
if [ -n "$roots" ]; then
	cat "$roots" "$certs/ca.crt" > "$certs/bundle.pem"
else
	echo "certs.sh: no system CA bundle found; SSL_CERT_FILE trusts the stack's CA only" >&2
	cp "$certs/ca.crt" "$certs/bundle.pem"
fi

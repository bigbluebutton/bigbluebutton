#!/bin/sh
# Makes the stack's CA and nginx's certificate in DIR, once: names localhost
# and 127.0.0.1, which the runner uses, and sink.test, kept for the callback
# sink. bundle.pem is the system roots plus the CA, for SSL_CERT_FILE.
set -eu
dir=$1
mkdir -p "$dir"
cd "$dir"
if [ ! -f ca.crt ]; then
	openssl req -x509 -newkey rsa:2048 -nodes -sha256 -days 3650 -subj "/CN=bbb-conform Tier 1 CA" \
		-addext basicConstraints=critical,CA:TRUE -addext keyUsage=critical,keyCertSign,cRLSign \
		-keyout ca.key -out ca.crt 2>/dev/null
	rm -f server.crt
fi
if [ ! -f server.crt ]; then
	openssl req -newkey rsa:2048 -nodes -sha256 -subj "/CN=localhost" -keyout server.key -out server.csr 2>/dev/null
	printf 'subjectAltName=DNS:localhost,IP:127.0.0.1,DNS:sink.test\nextendedKeyUsage=serverAuth\n' > server.ext
	openssl x509 -req -sha256 -days 3650 -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
		-extfile server.ext -out server.crt 2>/dev/null
	rm -f server.csr server.ext
fi
# The certificates are read by the containers' users; nginx reads the key as
# root.
chmod 644 ca.crt server.crt
chmod 600 ca.key server.key
roots=
for f in /etc/ssl/certs/ca-certificates.crt /etc/pki/tls/certs/ca-bundle.crt /etc/ssl/cert.pem; do
	if [ -f "$f" ]; then
		roots=$f
		break
	fi
done
if [ -n "$roots" ]; then
	cat "$roots" ca.crt > bundle.pem
else
	echo "certs.sh: no system CA bundle found; SSL_CERT_FILE trusts the stack's CA only" >&2
	cp ca.crt bundle.pem
fi

# certbot: the certificate service of the TLS edge (haproxy). Obtains and renews the Let's
# Encrypt certificate for BBB_DOMAIN (HTTP-01 webroot, served by nginx on :80) and writes the
# haproxy bundle into the certificate volume.
#
# Build with bake (docker/bake/certbot.hcl) or with podman:
#   podman build --build-context entrypoint-lib=docker/lib docker/certbot
#
# Ubuntu's certbot package, the one bare metal installs (2.9.0 on 24.04), instead of the
# official certbot/certbot:v2.9.0 image: that image is built on Alpine 3.18, which no longer
# receives security fixes, runs as root and declares VOLUMEs for its state directories.

# ubuntu:24.04
FROM docker.io/library/ubuntu@sha256:534baea6a22c03a63003dbc8dbe78fe34bc0d7e595d9a9dc9834884ff530eb55

# No per-package version pin: the base image is pinned by digest, and the installed package
# versions are recorded at build time (docker/README.md, "Package versions").
# hadolint ignore=DL3008
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates certbot gettext-base \
    && rm -rf /var/lib/apt/lists/*

# Writable for any UID (docker/README.md, rule 2): the rendered configuration, and the mount
# points of the three volumes: letsencrypt at /etc/letsencrypt (certbot's state),
# certs at /etc/haproxy/certs (the haproxy bundle) and acme-webroot at the ACME challenge
# directory below the webroot (bbb-install: certbot -w /var/www/bigbluebutton-default/assets).
# The directories of the files copied below, traversable by any UID.
RUN install -d -m 1777 /etc/bbb-certbot /etc/letsencrypt /etc/haproxy/certs \
        /var/www/bigbluebutton-default/assets/.well-known/acme-challenge \
    && install -d -m 0755 /usr/local/lib/bbb /usr/local/share/bbb/certbot

# Shared entrypoint helper (P3). DL3022: entrypoint-lib is a named build context, not a stage.
# hadolint ignore=DL3022
COPY --from=entrypoint-lib --chmod=0644 entrypoint-lib.sh /usr/local/lib/bbb/entrypoint-lib.sh
COPY --chmod=0644 cli.ini /usr/local/share/bbb/certbot/cli.ini
COPY --chmod=0755 bbb-certbot-loop bbb-certbot-deploy-hook /usr/local/bin/
COPY --chmod=0755 entrypoint.sh /entrypoint.sh

# Same default UID/GID as the haproxy image: haproxy reads the bundle (mode 0640) by group.
USER 99:99
HEALTHCHECK --interval=60s --timeout=5s --start-period=120s --retries=3 \
    CMD ["grep", "-qx", "ok", "/tmp/bbb-certbot/status"]
ENTRYPOINT ["/entrypoint.sh"]
CMD ["bbb-certbot-loop"]

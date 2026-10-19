# coturn 4.16.0, the version the bbb-coturn package builds
# (build/packages-template/bbb-coturn/build.sh).
# coturn/coturn:4.16.0 (Debian 13)
FROM docker.io/coturn/coturn@sha256:01fc8655e7c262fa4ccfb8dca74ff80fb372b0ee021e80370a4d3e3dd01a951e

USER 0:0

# envsubst for the entrypoint helper; the directories of the files copied below, traversable
# by any UID (docker/README.md).
RUN apt-get update \
    && apt-get install -y --no-install-recommends gettext-base \
    && rm -rf /var/lib/apt/lists/* \
    && install -d -m 0755 /usr/local/lib/bbb /usr/local/share/bbb/templates

# hadolint ignore=DL3022
COPY --from=entrypoint-lib --chmod=0644 entrypoint-lib.sh /usr/local/lib/bbb/entrypoint-lib.sh
COPY --chmod=0644 turnserver.conf /usr/local/share/bbb/templates/turnserver.conf
COPY --chmod=0755 entrypoint.sh /entrypoint.sh

# The configuration holds the secret and is rendered at start by the service's own UID into
# /run/turnserver (the unit's RuntimeDirectory on bare metal), read at its bare-metal path.
RUN install -d -m 1777 /run/turnserver \
    && ln -s /run/turnserver/turnserver.conf /etc/turnserver.conf

USER 65534:65534

EXPOSE 3478/tcp 3478/udp

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
    CMD ["turnutils_stunclient", "-t", "2000", "127.0.0.1"]

ENTRYPOINT ["/entrypoint.sh"]
CMD []

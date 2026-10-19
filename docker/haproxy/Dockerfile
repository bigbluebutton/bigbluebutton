# haproxy: the TLS edge on 443, as bbb-install sets it up. Terminates TLS and routes by ALPN /
# first byte to nginx (PROXY protocol) or coturn.
#
# Build with bake (docker/bake/haproxy.hcl) or with podman:
#   podman build --build-context entrypoint-lib=docker/lib docker/haproxy
#
# Same LTS branch as bare metal (Ubuntu 24.04 ships haproxy 2.8). The official image runs
# as the numeric user 99; port 443 then needs the namespaced sysctl
# net.ipv4.ip_unprivileged_port_start=0 for the container (the entrypoint checks it).

# haproxy:2.8.31-alpine
FROM docker.io/library/haproxy@sha256:094401c230b9bf01a6a4dc96e455795e261483f3bd2f42f19d0e6f259bd43837

USER 0

# bash for the entrypoint helper, envsubst for bbb_render, openssl for the temporary
# self-signed certificate. socat (healthcheck) is part of the base image.
# Writable for any UID: /etc/haproxy (rendered config, certificate and error page symlinks),
# /run/haproxy (sockets, self-signed certificate) and /etc/haproxy/certs, the mount point of
# the volume with the issued bundle (read-only for haproxy). The directories of the files
# copied below, traversable by any UID (docker/README.md).
RUN apk add --no-cache bash gettext-envsubst openssl \
    && install -d -m 1777 /etc/haproxy /etc/haproxy/certs /run/haproxy \
    && install -d -m 0755 /usr/local/lib/bbb /usr/local/share/bbb/haproxy

# Shared entrypoint helper (P3). DL3022: entrypoint-lib is a named build context, not a stage.
# hadolint ignore=DL3022
COPY --from=entrypoint-lib --chmod=0644 entrypoint-lib.sh /usr/local/lib/bbb/entrypoint-lib.sh
COPY --chmod=0644 haproxy.cfg protocolmap /usr/local/share/bbb/haproxy/
COPY --chmod=0755 bbb-haproxy-cert /usr/local/bin/bbb-haproxy-cert
COPY --chmod=0755 entrypoint.sh /entrypoint.sh

USER 99:99
EXPOSE 443
# Hard stop, as the packaged systemd unit (no KillSignal: SIGTERM). The base image's SIGUSR1 is
# haproxy's soft stop, which waits for every open connection (websockets) until the engine kills it.
STOPSIGNAL SIGTERM
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD ["/bin/sh", "-c", "echo 'show info' | socat -t 2 stdio UNIX-CONNECT:/run/haproxy/admin.sock | grep -q '^Name: HAProxy'"]
ENTRYPOINT ["/entrypoint.sh"]
CMD ["haproxy", "-W", "-db", "-f", "/etc/haproxy/haproxy.cfg", "-S", "/run/haproxy/master.sock"]

#!/usr/bin/env bash
# haproxy entrypoint: the TLS edge on 443. Renders haproxy.cfg and protocolmap, selects
# the certificate (a temporary self-signed one until the certificate service has issued one),
# starts the certificate watcher and execs haproxy in master-worker mode.
set -euo pipefail
# shellcheck source=docker/lib/entrypoint-lib.sh
source /usr/local/lib/bbb/entrypoint-lib.sh
BBB_LOG_TAG=haproxy

bbb_init "$@"
set -- "${BBB_ARGS[@]}"
[ "$#" -gt 0 ] || set -- haproxy -W -db -f /etc/haproxy/haproxy.cfg -S /run/haproxy/master.sock

# 1. validate (pattern from docker/config-contract.yaml)
bbb_require_match BBB_DOMAIN '([A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?'

# 3. render (no project variables in either file; rendered so that render-only shows them)
dest="$(bbb_path /etc/haproxy/haproxy.cfg)"
bbb_render /usr/local/share/bbb/haproxy/haproxy.cfg "$dest"
dest="$(bbb_path /etc/haproxy/protocolmap)"
bbb_render /usr/local/share/bbb/haproxy/protocolmap "$dest"

# 5. exec
if ! bbb_is_render_only; then
    # Port 443 as a non-root user needs CAP_NET_BIND_SERVICE or the namespaced sysctl
    # net.ipv4.ip_unprivileged_port_start <= 443 for this container.
    if [ "$(id -u)" != 0 ]; then
        cap_eff="$(sed -n 's/^CapEff:[[:space:]]*//p' /proc/self/status)"
        port_start="$(cat /proc/sys/net/ipv4/ip_unprivileged_port_start 2>/dev/null || echo 1024)"
        if [ "$port_start" -gt 443 ] && (( (16#${cap_eff:-0} & 0x400) == 0 )); then
            bbb_die "cannot bind port 443 as UID $(id -u): set the sysctl net.ipv4.ip_unprivileged_port_start=0 for this container (compose: sysctls; Kubernetes: securityContext.sysctls)"
        fi
    fi
    # The error pages at their bare-metal path, linked at start so that an empty /etc/haproxy
    # (tmpfs or Kubernetes emptyDir for a read-only root filesystem) works too.
    [ -e /etc/haproxy/errors ] || ln -sfn /usr/local/etc/haproxy/errors /etc/haproxy/errors
    bbb-haproxy-cert select
    bbb-haproxy-cert watch "$$" &
fi
bbb_exec "$@"

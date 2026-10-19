#!/usr/bin/env bash
# certbot entrypoint: the certificate service of the TLS edge (haproxy). Renders certbot's
# configuration from BBB_DOMAIN and ACME_EMAIL and execs the obtain/renew loop. No network
# access before bbb_exec, so render-only mode never contacts an ACME server.
set -euo pipefail
# shellcheck source=docker/lib/entrypoint-lib.sh
source /usr/local/lib/bbb/entrypoint-lib.sh
BBB_LOG_TAG=certbot

bbb_init "$@"
set -- "${BBB_ARGS[@]}"
[ "$#" -gt 0 ] || set -- bbb-certbot-loop

# 1. validate (patterns from docker/config-contract.yaml)
bbb_require_match BBB_DOMAIN '([A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?'
bbb_require_match ACME_EMAIL '[A-Za-z0-9._%+-]+@([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}'
# The address from bbb-install's documentation, refused as bbb-install does.
if [ "${ACME_EMAIL,,}" = info@example.com ]; then
    bbb_die "ACME_EMAIL is the example address from the documentation; set your own contact address"
fi

# Names reserved for documentation and testing never get a certificate: refuse them before the
# loop contacts the ACME server, so test and example setups do not reach a public CA. Reserved:
# example.com, example.net, example.org and their subdomains (RFC 2606), and names below the
# example, test, invalid and localhost top-level domains (RFC 2606, RFC 6761). Not in render-only
# mode, which contacts no server (the golden fixture uses bbb.example.com).
is_reserved_name() {
    local name="${1,,}"
    name="${name%.}"
    case "$name" in
        example.com | *.example.com | example.net | *.example.net | example.org | *.example.org) return 0 ;;
        example | *.example | test | *.test | invalid | *.invalid | localhost | *.localhost) return 0 ;;
    esac
    return 1
}
if ! bbb_is_render_only; then
    if is_reserved_name "$BBB_DOMAIN"; then
        bbb_die "BBB_DOMAIN is a reserved example or test name (RFC 2606, RFC 6761); no certificate is requested for it"
    fi
    if is_reserved_name "${ACME_EMAIL##*@}"; then
        bbb_die "ACME_EMAIL is at a reserved example or test domain (RFC 2606, RFC 6761); set your own contact address"
    fi
fi

# 3. render
dest="$(bbb_path /etc/bbb-certbot/cli.ini)"
bbb_render /usr/local/share/bbb/certbot/cli.ini "$dest"

# 5. exec
bbb_exec "$@"

#!/usr/bin/env bash
# nginx entrypoint: renders the bare-metal site file (sites-available/bigbluebutton) and puts the
# location fragments of the enabled features into /usr/share/bigbluebutton/nginx/, then execs
# nginx in the foreground.
set -euo pipefail
# shellcheck source=docker/lib/entrypoint-lib.sh
source /usr/local/lib/bbb/entrypoint-lib.sh
BBB_LOG_TAG=nginx

bbb_init "$@"
set -- "${BBB_ARGS[@]}"
[ "$#" -gt 0 ] || set -- nginx -g 'daemon off;'

SRC=/usr/local/share/bbb/nginx
FRAGMENT_DIR=/usr/share/bigbluebutton/nginx

# Location fragments, under the names the packages install them with. Always on: the packages
# of a default install (build/packages-template/bigbluebutton/build.sh).
ALWAYS_FRAGMENTS=(
    bbb-html5.nginx bbb-html5.nginx.static bbb-shared-notes-server.nginx default-fe.nginx
    graphql.nginx learning-dashboard.nginx livekit.nginx loadbalancer.nginx
    plugins-assets-cors.nginx presentation-slides.nginx web webrtc-sfu.nginx
)
# Per feature (docker/config-contract.yaml `features`).
declare -A FEATURE_FRAGMENTS=(
    [recording]="playback.nginx presentation.nginx"
    [webhooks]="webhooks.nginx"
)
# Upstream groups per feature (/usr/local/share/bbb/nginx/upstreams/), written with the
# fragments that proxy to them: a group of a service that does not run would make nginx log a
# resolver error every few seconds.
declare -A FEATURE_UPSTREAMS=(
    [webhooks]="webhooks.conf"
)

# 1. validate (patterns from docker/config-contract.yaml). Unset or empty BBB_FEATURES means
# no optional feature.
[ -n "${BBB_FEATURES+set}" ] || BBB_FEATURES=
bbb_require_match BBB_FEATURES '((recording|greenlight|webhooks|monitoring|external-proxy)(,(recording|greenlight|webhooks|monitoring|external-proxy))*)?'
bbb_default BBB_NETWORK_SUBNET 172.30.82.0/24
bbb_require_match BBB_NETWORK_SUBNET '((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])/(1[6-9]|2[0-8])'

# 2. derive
fragments=("${ALWAYS_FRAGMENTS[@]}")
stale=()
upstreams=()
for feature in recording webhooks; do
    read -r -a names <<<"${FEATURE_FRAGMENTS[$feature]}"
    read -r -a groups <<<"${FEATURE_UPSTREAMS[$feature]:-}"
    if bbb_feature_enabled "$feature"; then
        fragments+=("${names[@]}")
        upstreams+=("${groups[@]}")
    else
        stale+=("${names[@]}")
    fi
done

# 3. render
dest="$(bbb_path /etc/nginx/sites-available/bigbluebutton)"
bbb_render "$SRC/bigbluebutton" "$dest"
# Tier 3: an include_default.nginx in the admin directory replaces the image's, as on bare
# metal (where that file is a symlink to /usr/share/bigbluebutton/include_default.nginx).
if [ -e /etc/bigbluebutton/nginx/include_default.nginx ]; then
    sed -i '\|^  include /usr/share/bigbluebutton/include_default\.nginx;$|d' "$dest"
    bbb_log "using /etc/bigbluebutton/nginx/include_default.nginx instead of the image's"
fi

for name in "${fragments[@]}"; do
    dest="$(bbb_path "$FRAGMENT_DIR/$name")"
    bbb_render "$SRC/fragments/$name" "$dest"
done
for name in "${stale[@]}"; do
    dest="$(bbb_path "$FRAGMENT_DIR/$name")"
    rm -f -- "$dest"
done
# The upstream groups of the enabled features, included at http level through the image's
# symlink sites-enabled/bbb-feature-upstreams. Always written: a dangling symlink there would
# stop nginx.
dest="$(bbb_path /etc/nginx/sites-available/bbb-feature-upstreams)"
{
    echo "# Upstream groups of the enabled optional features (BBB_FEATURES=${BBB_FEATURES}); written by the entrypoint."
    for name in "${upstreams[@]}"; do cat -- "$SRC/upstreams/$name"; done
} >"$dest"
# bbb-web installs its fragment as `web` and links web.nginx to it (after-install.sh).
dest="$(bbb_path "$FRAGMENT_DIR/web.nginx")"
ln -sfn "$FRAGMENT_DIR/web" "$dest"

# Files the image ships unchanged at their bare-metal paths. nginx reads them in place; in
# render-only mode a copy is written so that tests see the whole configuration.
if bbb_is_render_only; then
    for file in /etc/nginx/nginx.conf /etc/nginx/conf.d/bbb-graphql-client-settings-cache.conf \
        /etc/nginx/conf.d/bbb-upstreams.conf /usr/share/bigbluebutton/include_default.nginx; do
        dest="$(bbb_path "$file")"
        bbb_render "$file" "$dest"
    done
    for name in bigbluebutton bbb-feature-upstreams; do
        dest="$(bbb_path "/etc/nginx/sites-enabled/$name")"
        mkdir -p -- "$(dirname -- "$dest")"
        ln -sfn "/etc/nginx/sites-available/$name" "$dest"
    done
fi

# 5. exec
if ! bbb_is_render_only; then
    # Ports 80 and 81 as a non-root user need CAP_NET_BIND_SERVICE or the namespaced sysctl
    # net.ipv4.ip_unprivileged_port_start <= 80 for this container.
    if [ "$(id -u)" != 0 ]; then
        cap_eff="$(sed -n 's/^CapEff:[[:space:]]*//p' /proc/self/status)"
        port_start="$(cat /proc/sys/net/ipv4/ip_unprivileged_port_start 2>/dev/null || echo 1024)"
        if [ "$port_start" -gt 80 ] && (( (16#${cap_eff:-0} & 0x400) == 0 )); then
            bbb_die "cannot bind ports 80 and 81 as UID $(id -u): set the sysctl net.ipv4.ip_unprivileged_port_start=0 for this container (compose: sysctls; Kubernetes: securityContext.sysctls)"
        fi
    fi
fi
bbb_exec "$@"

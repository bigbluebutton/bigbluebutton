# nginx: BigBlueButton's web server. Serves the landing page and the ACME webroot, and carries
# the location fragments of the packages (/usr/share/bigbluebutton/nginx/), which proxy to the
# services, among them the html5 client and the learning dashboard (their own images, compose
# services `html5` and `learning-dashboard`). haproxy terminates TLS and sends HTTP to port 81
# with the PROXY protocol; port 80 is published for ACME and the redirect to HTTPS.
#
# Build with bake (docker/bake/nginx.hcl) or with podman:
#   podman build --build-context entrypoint-lib=docker/lib \
#     --build-context packages=build/packages-template \
#     --build-context bigbluebutton-web=bigbluebutton-web \
#     --build-context learning-dashboard=bbb-learning-dashboard \
#     --build-context rap-presentation=record-and-playback/presentation/scripts \
#     --build-context bigbluebutton-config=bigbluebutton-config docker/nginx
#
# The official image runs nginx as the numeric user 101; ports 80 and 81 then need the
# namespaced sysctl net.ipv4.ip_unprivileged_port_start=0 for the container (the entrypoint
# checks it).

# nginx:1.30.6-alpine (stable-alpine)
FROM docker.io/library/nginx@sha256:970364228b1e4f932abc22d321932816782cca8a20b85a77552a7cfe9acfb3b5

USER 0

# bash for the entrypoint helper, envsubst for bbb_render. curl (healthcheck) is part of the
# base image. The base image's default site would add a second server on port 80. The
# directories of the files copied below, traversable by any UID (docker/README.md).
RUN apk add --no-cache bash gettext-envsubst \
    && rm -f /etc/nginx/conf.d/default.conf \
    && install -d -m 0755 /usr/local/share/bbb/nginx/fragments /usr/local/share/bbb/nginx/upstreams \
        /usr/share/bigbluebutton \
        /usr/local/lib/bbb

# Location fragments, under the names the packages install them with (the build.sh of each
# package; bbb-web's fragment is `web`). default-fe.nginx is written by bbb-install.
# bbb-html5.nginx.static is this image's: the package's static locations are served by the html5
# client image, and this one proxies them there.
# DL3022: these are named build contexts, not stages.
# hadolint ignore=DL3022
COPY --from=packages --chmod=0644 \
     bbb-config/plugins-assets-cors.nginx \
     bbb-graphql-middleware/graphql.nginx \
     bbb-html5/bbb-html5.nginx \
     bbb-livekit/livekit.nginx \
     bbb-playback/playback.nginx \
     bbb-shared-notes-server/bbb-shared-notes-server.nginx \
     bbb-webhooks/webhooks.nginx \
     bbb-webrtc-sfu/webrtc-sfu.nginx \
     /usr/local/share/bbb/nginx/fragments/
# hadolint ignore=DL3022
COPY --from=bigbluebutton-web --chmod=0644 bbb-web.nginx /usr/local/share/bbb/nginx/fragments/web
# hadolint ignore=DL3022
COPY --from=bigbluebutton-web --chmod=0644 loadbalancer.nginx nginx-confs/presentation-slides.nginx \
     /usr/local/share/bbb/nginx/fragments/
# hadolint ignore=DL3022
COPY --from=learning-dashboard --chmod=0644 learning-dashboard.nginx /usr/local/share/bbb/nginx/fragments/
# hadolint ignore=DL3022
COPY --from=rap-presentation --chmod=0644 presentation.nginx /usr/local/share/bbb/nginx/fragments/
COPY --chmod=0644 default-fe.nginx bbb-html5.nginx.static /usr/local/share/bbb/nginx/fragments/

# The upstream groups of the services, one per compose service name, re-resolved at run time
# (bbb-upstreams.conf). Kubernetes mounts its own file here. The group of an optional feature
# comes with its location fragment: the entrypoint writes it to
# sites-enabled/bbb-feature-upstreams only when the feature is enabled.
COPY --chmod=0644 bbb-upstreams.conf /etc/nginx/conf.d/bbb-upstreams.conf
COPY --chmod=0644 webhooks.upstream.conf /usr/local/share/bbb/nginx/upstreams/webhooks.conf

# Containers: the services are reached through those upstream groups instead of 127.0.0.1:<port>
# (the service names of docker-compose.yml); `proxy_pass http://<group>` keeps the rest of each
# URI as before. Hasura's REST endpoints go to graphql-server directly, without the local load
# balancer on 127.0.0.1:8185 (hasura-loadbalancer.conf is not shipped: replicas sit behind one
# service name). The build fails if a local upstream is left or a proxy_pass names no group.
# The learning dashboard app comes from its own image (service learning-dashboard, port 8080),
# not from the bbb-data volume, which holds data only: the prefix location proxies to it, and a
# nested regex location serves only the JSON file bbb-web writes per meeting
# (<meetingId>/<token>/learning_dashboard_data.json) from the volume. The upstream file has CRLF
# line endings; the added lines keep them.
WORKDIR /usr/local/share/bbb/nginx/fragments
# SC2016: `$1` is nginx's regex capture, written literally.
# hadolint ignore=SC2016
RUN sed -i 's|http://127\.0\.0\.1:8090|http://bbb-web|g' web bbb-shared-notes-server.nginx \
    && sed -i 's|http://localhost:8787/|http://shared-notes/|g' bbb-shared-notes-server.nginx \
    && sed -i -e 's|http://127\.0\.0\.1:8378;|http://graphql-middleware;|g' \
              -e 's|http://127\.0\.0\.1:8185;|http://graphql-server;|g' graphql.nginx \
    && sed -i 's|http://127\.0\.0\.1:7880/;|http://livekit/;|g' livekit.nginx \
    && sed -i 's|http://127\.0\.0\.1:3008;|http://bbb-webrtc-sfu;|g' webrtc-sfu.nginx \
    && sed -i 's|http://127\.0\.0\.1:3005;|http://webhooks;|g' webhooks.nginx \
    && printf '%s\r\n' '' \
         '    location ~ "^/learning-analytics-dashboard/([^/]+/[^/]+/learning_dashboard_data\.json)$" {' \
         '        alias /var/bigbluebutton/learning-dashboard/$1;' \
         '    }' >/tmp/learning-dashboard-data.nginx \
    && sed -i -e 's|^    alias /var/bigbluebutton/learning-dashboard/;|    proxy_pass http://learning-dashboard;|' \
              -e '/^    autoindex off;/r /tmp/learning-dashboard-data.nginx' learning-dashboard.nginx \
    && rm /tmp/learning-dashboard-data.nginx \
    && if ! grep -q '^    proxy_pass http://learning-dashboard;' learning-dashboard.nginx \
         || ! grep -q 'learning_dashboard_data' learning-dashboard.nginx; then \
         echo "learning-dashboard.nginx: upstream fragment changed, edit not applied" >&2; exit 1; \
       fi \
    && if grep -nE '^[[:space:]]*proxy_pass[[:space:]]+https?://(127\.0\.0\.1|localhost)[:/]' ./*; then \
         echo "local upstream left in a fragment" >&2; exit 1; \
       fi \
    && sed -n 's/^upstream \([a-z0-9-]*\) {$/\1/p' /etc/nginx/conf.d/bbb-upstreams.conf \
         /usr/local/share/bbb/nginx/upstreams/*.conf >/tmp/groups \
    && sed -nE 's|^[[:space:]]*proxy_pass[[:space:]]+http://([^/;$]*).*|\1|p' ./* >/tmp/hosts \
    && if grep -vxF -f /tmp/groups /tmp/hosts; then \
         echo "proxy_pass to a host that is not an upstream group of the image" >&2; exit 1; \
       fi \
    && rm /tmp/groups /tmp/hosts
WORKDIR /

# Shipped unchanged at the bare-metal paths: include_default.nginx (bbb-config), the Hasura
# settings cache zone (bbb-graphql-middleware) and the landing page assets (bbb-config).
# hadolint ignore=DL3022
COPY --from=packages --chmod=0644 bbb-config/include_default.nginx /usr/share/bigbluebutton/include_default.nginx
# hadolint ignore=DL3022
COPY --from=packages --chmod=0644 bbb-graphql-middleware/bbb-graphql-client-settings-cache.conf /etc/nginx/conf.d/
# hadolint ignore=DL3022
COPY --from=bigbluebutton-config assets /var/www/bigbluebutton-default/assets
COPY --chmod=0644 nginx.conf /etc/nginx/nginx.conf
COPY --chmod=0644 bigbluebutton /usr/local/share/bbb/nginx/bigbluebutton

# Writable for any UID (1777): the directories the entrypoint renders into, the mount point of
# the acme-webroot volume (written by certbot, read-only here) and the mount point of the
# bbb-data volume (read-only here; a new volume takes this mode, so its writers can still
# write it). /etc/bigbluebutton/nginx/ is the admins' include directory and stays empty.
# Logs go to stdout like the base image's access.log.
# /etc/nginx/html: the default root (prefix /etc/nginx here, /usr/share/nginx on Ubuntu). The
# landing page's @bbb-fe location (`index` without a root) needs an index.html there to redirect
# / to /index.html, as Ubuntu's nginx-common provides in /usr/share/nginx/html.
RUN ln -s /usr/share/nginx/html /etc/nginx/html \
    && chmod -R a+rX,go-w /var/www/bigbluebutton-default \
    && install -d -m 0755 /var/www/bigbluebutton-default/assets/.well-known \
        /etc/nginx/sites-enabled /etc/bigbluebutton/nginx \
    && install -d -m 1777 /etc/nginx/sites-available /usr/share/bigbluebutton/nginx \
        /var/www/bigbluebutton-default/assets/.well-known/acme-challenge /var/bigbluebutton \
    && ln -s /etc/nginx/sites-available/bigbluebutton /etc/nginx/sites-enabled/bigbluebutton \
    && ln -s /etc/nginx/sites-available/bbb-feature-upstreams /etc/nginx/sites-enabled/bbb-feature-upstreams \
    && ln -s /dev/stdout /var/log/nginx/bigbluebutton.access.log

# Shared entrypoint helper (P3).
# hadolint ignore=DL3022
COPY --from=entrypoint-lib --chmod=0644 entrypoint-lib.sh /usr/local/lib/bbb/entrypoint-lib.sh
COPY --chmod=0755 entrypoint.sh /entrypoint.sh

USER 101:101
EXPOSE 80 81
# A request on the PROXY-protocol port that nginx answers itself (web fragment), so the check
# needs no other service.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD ["curl", "-fsS", "-o", "/dev/null", "--haproxy-protocol", "http://127.0.0.1:81/bigbluebutton/rtt-check"]
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

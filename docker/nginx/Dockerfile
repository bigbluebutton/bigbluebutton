# The nginx of a BigBlueButton server with the site and location files the packages install, at
# the same paths (build/packages-template/*/build.sh). Deployments mount their own files over them.
FROM nginxinc/nginx-unprivileged:1.30.6-alpine@sha256:f5116ed4606f3eb015dd4a8e28cb9b351476dc0ad4bc6e9f93b19cec130cdf03

USER 0

COPY bigbluebutton-config/assets /var/www/bigbluebutton-default/assets
COPY build/packages-template/bbb-html5/bigbluebutton.nginx /etc/nginx/sites-available/bigbluebutton
COPY build/packages-template/bbb-graphql-middleware/hasura-loadbalancer.nginx /etc/nginx/sites-available/hasura-loadbalancer.conf
COPY build/packages-template/bbb-graphql-middleware/bbb-graphql-client-settings-cache.conf /etc/nginx/conf.d/
COPY build/packages-template/bbb-config/include_default.nginx /usr/share/bigbluebutton/
COPY bigbluebutton-web/bbb-web.nginx /usr/share/bigbluebutton/nginx/web
COPY bigbluebutton-web/loadbalancer.nginx \
     bigbluebutton-web/nginx-confs/presentation-slides.nginx \
     build/packages-template/bbb-config/plugins-assets-cors.nginx \
     build/packages-template/bbb-graphql-middleware/graphql.nginx \
     build/packages-template/bbb-livekit/livekit.nginx \
     build/packages-template/bbb-shared-notes-server/bbb-shared-notes-server.nginx \
     build/packages-template/bbb-webhooks/webhooks.nginx \
     build/packages-template/bbb-webrtc-sfu/webrtc-sfu.nginx \
     record-and-playback/notes/scripts/notes-playback.nginx \
     record-and-playback/presentation/scripts/presentation.nginx \
     record-and-playback/screenshare/scripts/recording-screenshare.nginx \
     record-and-playback/video/scripts/playback-video.nginx \
     /usr/share/bigbluebutton/nginx/
# These three proxy to the static-app images (html5, dashboard, player) by their default service names.
COPY docker/nginx/bbb-html5.nginx docker/nginx/learning-dashboard.nginx docker/nginx/playback.nginx \
     /usr/share/bigbluebutton/nginx/

# Links and nginx.conf tuning as in the after-install scripts of bbb-config, bbb-html5,
# bbb-graphql-middleware and bbb-web. Container facts: an unprivileged port (8080), the Hasura
# balancer on all interfaces, the access log to stdout.
RUN rm /etc/nginx/conf.d/default.conf \
    && mkdir -p /etc/nginx/sites-enabled /etc/bigbluebutton/nginx \
    && ln -s /etc/nginx/sites-available/bigbluebutton /etc/nginx/sites-enabled/bigbluebutton \
    && ln -s /etc/nginx/sites-available/hasura-loadbalancer.conf /etc/nginx/sites-enabled/hasura-loadbalancer.conf \
    && ln -s /usr/share/bigbluebutton/include_default.nginx /etc/bigbluebutton/nginx/include_default.nginx \
    && ln -s /usr/share/bigbluebutton/nginx/web /usr/share/bigbluebutton/nginx/web.nginx \
    && sed -i -e '/include \/etc\/nginx\/conf.d\/\*.conf;/a\    include /etc/nginx/sites-enabled/*;' \
        -e 's/worker_connections  1024;/worker_connections 10000;/' \
        -e 's/^events {/worker_rlimit_nofile 10000;\n\nevents {/' /etc/nginx/nginx.conf \
    && sed -i -e 's/listen   80;/listen   8080;/' -e 's/listen \[::\]:80;/listen [::]:8080;/' \
        /etc/nginx/sites-available/bigbluebutton \
    && sed -i 's/listen 127.0.0.1:8185;/listen 8185;/' /etc/nginx/sites-available/hasura-loadbalancer.conf \
    && ln -s /dev/stdout /var/log/nginx/bigbluebutton.access.log

USER 101

EXPOSE 8080 8185
HEALTHCHECK CMD ["curl", "-fsS", "-o", "/dev/null", "http://127.0.0.1:8080/"]

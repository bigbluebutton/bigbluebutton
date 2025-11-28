FROM nginx:stable-alpine

# Create BBB specific directories
RUN mkdir -p /etc/bigbluebutton/nginx /var/www/bigbluebutton-default/assets /etc/nginx/vhosts.d
COPY ./bigbluebutton-config/assets /var/www/bigbluebutton-default/assets

# Modify nginx.conf
RUN sed -i 's/worker_connections\s\+1024/worker_connections 10000/g' /etc/nginx/nginx.conf && \
    sed -i '/^\s*include \/etc\/nginx\/conf\.d\/\*\.conf;/a\    include /etc/nginx/vhosts.d/*.nginx;' /etc/nginx/nginx.conf && \
    if grep -q "worker_rlimit_nofile" /etc/nginx/nginx.conf; then \
      num=$(grep worker_rlimit_nofile /etc/nginx/nginx.conf | grep -o '[0-9]*'); \
      if [[ "$num" -lt 10000 ]]; then \
        sed -i 's/worker_rlimit_nofile [0-9 ]*;/worker_rlimit_nofile 10000;/g' /etc/nginx/nginx.conf; \
      fi; \
    else \
      sed -i 's/events {/worker_rlimit_nofile 10000;\n\nevents {/g' /etc/nginx/nginx.conf; \
    fi

# Copy nginx config-files to /etc/nginx/conf.d/
COPY /build/packages-template/bbb-graphql-middleware/bbb-graphql-client-settings-cache.conf \
     /etc/nginx/conf.d/

# Copy nginx config-files to /etc/nginx/vhost.d/
COPY ./build/packages-template/bbb-html5/bigbluebutton.nginx \
     ./build/packages-template/bbb-graphql-middleware/hasura-loadbalancer.nginx \
     /etc/nginx/vhosts.d/

# Copy nginx config-files to /etc/bigbluebutton/nginx/
COPY ./bbb-learning-dashboard/learning-dashboard.nginx \
     ./bigbluebutton-web/loadbalancer.nginx \
     ./bigbluebutton-web/nginx-confs/presentation-slides.nginx \
     ./bigbluebutton-web/bbb-web.nginx \
     ./build/packages-template/bbb-config/include_default.nginx \
     ./build/packages-template/bbb-config/plugins-assets-cors.nginx \
     ./build/packages-template/bbb-etherpad/notes.nginx \
     ./build/packages-template/bbb-html5/sip.nginx \
     ./build/packages-template/bbb-playback/playback.nginx \
     ./build/packages-template/bbb-webhooks/webhooks.nginx \
     ./build/packages-template/bbb-webrtc-sfu/webrtc-sfu.nginx \
     ./build/packages-template/bbb-graphql-middleware/graphql.nginx \
     ./build/packages-template/bbb-livekit/livekit.nginx \
     ./record-and-playback/notes/scripts/notes-playback.nginx \
     ./record-and-playback/podcast/scripts/podcast.nginx \
     ./record-and-playback/presentation/scripts/presentation.nginx \
     ./record-and-playback/screenshare/scripts/recording-screenshare.nginx \
     ./record-and-playback/slides/scripts/slides.nginx \
     ./record-and-playback/video/scripts/playback-video.nginx \
     /etc/bigbluebutton/nginx/

# Copy bbb-html5.nginx.static to be bbb-html5.nginx
COPY ./docker/nginx/bbb-html5.nginx /etc/bigbluebutton/nginx/bbb-html5.nginx

# Change localhost occurrences to matching docker-compose service name
RUN sed -i 's|http://127.0.0.1:8090|http://web:8090|g' /etc/bigbluebutton/nginx/bbb-web.nginx && \
    sed -i 's|http://127.0.0.1:9001|http://etherpad:9001|g' /etc/bigbluebutton/nginx/notes.nginx && \
    sed -i 's|http://127.0.0.1:5066|http://html5-client:8080|g' /etc/bigbluebutton/nginx/sip.nginx && \
    sed -i 's|http://127.0.0.1:3005|http://webhooks:3005|g' /etc/bigbluebutton/nginx/webhooks.nginx && \
    sed -i 's|http://127.0.0.1:3008|http://webrtc-sfu:3008|g' /etc/bigbluebutton/nginx/webrtc-sfu.nginx && \
    sed -i 's|http://127.0.0.1:8378|http://graphql-middleware:8378|g' /etc/bigbluebutton/nginx/graphql.nginx && \
    sed -i 's|http://127.0.0.1:7880|http://livekit:7880|g' /etc/bigbluebutton/nginx/livekit.nginx && \
    sed -i 's|127.0.0.1:8085|graphql-server:8085|g' /etc/nginx/vhosts.d/hasura-loadbalancer.nginx && \
    sed -i 's|127.0.0.1:8185|0.0.0.0:8185|g' /etc/nginx/vhosts.d/hasura-loadbalancer.nginx

# Modify bigbluebutton.nginx
RUN sed -i 's|server_name\s\+[0-9.]*;|server_name _;|g' /etc/nginx/vhosts.d/bigbluebutton.nginx && \
    sed -i 's|listen\s\+80;|listen 8080;|g' /etc/nginx/vhosts.d/bigbluebutton.nginx && \
    sed -i 's|listen\s\+\[\:\:\]\:80;|listen [::]:8080;|g' /etc/nginx/vhosts.d/bigbluebutton.nginx

# Send logging to stdout/stderr
RUN sed -i 's|^\s*access_log  /var/log/nginx/bigbluebutton.access.log;|    access_log  /dev/stdout;|g' /etc/nginx/vhosts.d/bigbluebutton.nginx

# Port 8185 for hasura load balancer, 8080 for everything else
EXPOSE 8080 8185

ENTRYPOINT ["nginx", "-g", "daemon off;"]

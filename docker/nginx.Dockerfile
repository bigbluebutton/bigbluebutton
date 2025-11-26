FROM nginx:stable-alpine

RUN mkdir -p /etc/bigbluebutton/nginx

# nginx.conf
RUN sed -i 's/worker_connections 768/worker_connections 10000/g' /etc/nginx/nginx.conf && \
    if grep -q "worker_rlimit_nofile" /etc/nginx/nginx.conf; then \
      num=$(grep worker_rlimit_nofile /etc/nginx/nginx.conf | grep -o '[0-9]*'); \
      if [[ "$num" -lt 10000 ]]; then \
        sed -i 's/worker_rlimit_nofile [0-9 ]*;/worker_rlimit_nofile 10000;/g' /etc/nginx/nginx.conf; \
      fi; \
    else \
      sed -i 's/events {/worker_rlimit_nofile 10000;\n\nevents {/g' /etc/nginx/nginx.conf; \
    fi

# copy to /etc/nginx/conf.d/
COPY ./build/packages-template/bbb-html5/bigbluebutton.nginx /etc/nginx/conf.d/
COPY ./build/packages-template/bbb-graphql-middleware/hasura-loadbalancer.nginx /etc/nginx/conf.d/
COPY ./build/packages-template/bbb-graphql-middleware/bbb-graphql-client-settings-cache.conf /etc/nginx/conf.d/

# copy to /etc/bigbluebutton/nginx/
COPY ./bbb-learning-dashboard/learning-dashboard.nginx /etc/bigbluebutton/nginx/
COPY ./bigbluebutton-web/loadbalancer.nginx /etc/bigbluebutton/nginx/
COPY ./bigbluebutton-web/nginx-confs/presentation-slides.nginx /etc/bigbluebutton/nginx/
COPY ./bigbluebutton-web/bbb-web.nginx /etc/bigbluebutton/nginx/
COPY ./build/packages-template/bbb-config/include_default.nginx /etc/bigbluebutton/nginx/
COPY ./build/packages-template/bbb-config/plugins-assets-cors.nginx /etc/bigbluebutton/nginx/
COPY ./build/packages-template/bbb-etherpad/notes.nginx /etc/bigbluebutton/nginx/
COPY ./build/packages-template/bbb-html5/sip.nginx /etc/bigbluebutton/nginx/
COPY ./build/packages-template/bbb-html5/bbb-html5.nginx /etc/bigbluebutton/nginx/
COPY ./build/packages-template/bbb-playback/playback.nginx /etc/bigbluebutton/nginx/
COPY ./build/packages-template/bbb-webhooks/webhooks.nginx /etc/bigbluebutton/nginx/
COPY ./build/packages-template/bbb-webrtc-sfu/webrtc-sfu.nginx /etc/bigbluebutton/nginx/
COPY ./build/packages-template/bbb-graphql-middleware/graphql.nginx /etc/bigbluebutton/nginx/
COPY ./build/packages-template/bbb-livekit/livekit.nginx /etc/bigbluebutton/nginx/
COPY ./record-and-playback/notes/scripts/notes-playback.nginx /etc/bigbluebutton/nginx/
COPY ./record-and-playback/podcast/scripts/podcast.nginx /etc/bigbluebutton/nginx/
COPY ./record-and-playback/presentation/scripts/presentation.nginx /etc/bigbluebutton/nginx/
COPY ./record-and-playback/screenshare/scripts/recording-screenshare.nginx /etc/bigbluebutton/nginx/
COPY ./record-and-playback/slides/scripts/slides.nginx /etc/bigbluebutton/nginx/
COPY ./record-and-playback/video/scripts/playback-video.nginx /etc/bigbluebutton/nginx/
COPY ./bbb-playback/playback.nginx /etc/bigbluebutton/nginx/

ENTRYPOINT ["nginx", "-g", "daemon off;"]

# Stage 1: Build
FROM node:22 AS build

WORKDIR /app

COPY package*.json ./
RUN CI=true npm ci

COPY . .
RUN DISABLE_ESLINT_PLUGIN=true npm run build-safari && npm run build
#Rename all safari bundle with same hash of the last bundle
RUN cd /app/dist && \
    HASH=$(ls | grep -Eo 'bundle\.[a-f0-9]{20}\.js' | head -n 1 | grep -Eo '[a-f0-9]{20}') && \
    if [ -z "$HASH" ]; then \
      echo "Bundle hash not found."; \
    else \
      for FILE in *.safari.js *.safari.js.map; do \
        if [[ "$FILE" == *"$HASH"* ]]; then \
          continue; \
        fi; \
        PREFIX="${FILE%%.safari.js*}"; \
        SUFFIX="${FILE#*.safari.js}"; \
        NEW_NAME="${PREFIX}.${HASH}.safari.js${SUFFIX}"; \
        echo "Renaming $FILE → $NEW_NAME"; \
        mv "$FILE" "$NEW_NAME"; \
      done; \
    fi

# TODO: replace v=VERSION with build number in head and css files
# RUN if [ -f dist/index.html ] || [ -f dist/stylesheets/fonts.css ]; then \
#         sed -i "s/VERSION/$(($BUILD))/g" dist/index.html && \
#         sed -i "s/VERSION/$(($BUILD))/g" dist/stylesheets/fonts.css; \
#     fi

# Compress CSS, Javascript and tensorflow WASM binaries used for virtual backgrounds. Keep the
# uncompressed versions as well so it works with mismatched nginx location blocks
RUN find /app/dist -name '*.js' -exec gzip -k -f -9 '{}' \; \
    && find /app/dist -name '*.css' -exec gzip -k -f -9 '{}' \; \
    && find /app/dist -name '*.wasm' -exec gzip -k -f -9 '{}' \;

# Stage 2: Runtime
FROM nginx:stable-alpine

# Create non-root user early so we can use --chown on COPY
RUN addgroup -g 998 -S bigbluebutton \
 && adduser -u 998 -S -G bigbluebutton bigbluebutton

RUN mkdir -p /usr/share/bigbluebutton/html5-client
COPY --from=build /app/dist /usr/share/bigbluebutton/html5-client
RUN chown -R bigbluebutton:bigbluebutton /usr/share/bigbluebutton/html5-client

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

RUN sed -i 's|server_name\s\+[0-9.]*;|server_name _;|g' /etc/nginx/conf.d/default.conf && \
    sed -i 's|listen\s\+80;|listen 8080;|g' /etc/nginx/conf.d/default.conf && \
    sed -i 's|listen\s\+\[\:\:\]\:80;|listen [::]:8080;|g' /etc/nginx/conf.d/default.conf && \
    sed -i '/^}/i\    include /etc/nginx/conf.d/bbb-html5.nginx;' /etc/nginx/conf.d/default.conf


COPY ./docker/nginx.conf  /etc/nginx/nginx.conf

COPY --from=client-build bbb-html5.nginx.static /etc/nginx/conf.d/bbb-html5.nginx

RUN chown -R bigbluebutton:bigbluebutton /etc/nginx

EXPOSE 8080

USER bigbluebutton

# The number of nginx workers can be overwritten
# with the env variable BBB_HTML5_CLIENT_NGINX_WORKERS
ENTRYPOINT ["docker-entrypoint.sh", "nginx", "-g", "daemon off;"]

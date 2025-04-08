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

COPY --from=build /app/dist /usr/share/nginx/html
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 80

# The number of nginx workers can be overwritten
# with the env variable BBB_HTML5_CLIENT_NGINX_WORKERS
ENTRYPOINT ["docker-entrypoint.sh", "nginx", "-g", "daemon off;"]

FROM node:24@sha256:6449e19d8184d84062525b6a7524def03146c2cb04a7f08b076680d0e8e4240a AS build

SHELL ["/bin/bash", "-o", "pipefail", "-c"]
ARG CLIENT_BUILD=0
WORKDIR /app
COPY package.json package-lock.json ./
RUN CI=true npm ci
COPY . .

# Same steps as build/packages-template/bbb-html5/build.sh
RUN sed -i "s/HTML5_CLIENT_VERSION/${CLIENT_BUILD}/g" private/config/settings.yml \
 && DISABLE_ESLINT_PLUGIN=true npm run build-safari && npm run build
# Rename all safari bundles to the hash of the last bundle
WORKDIR /app/dist
RUN HASH=$(ls | grep -Eo 'bundle\.[a-f0-9]{20}\.js' | head -n 1 | grep -Eo '[a-f0-9]{20}'); \
    if [ -z "$HASH" ]; then echo "Bundle hash not found."; else \
      for FILE in *.safari.js *.safari.js.map; do \
        [[ "$FILE" == *"$HASH"* ]] && continue; \
        mv "$FILE" "${FILE%%.safari.js*}.${HASH}.safari.js${FILE#*.safari.js}"; \
      done; \
    fi \
 && sed -i "s/?v=VERSION/?v=${CLIENT_BUILD}/g" index.html stylesheets/fonts.css

FROM nginxinc/nginx-unprivileged:1.30-alpine@sha256:f5116ed4606f3eb015dd4a8e28cb9b351476dc0ad4bc6e9f93b19cec130cdf03

COPY --from=build /app/dist /usr/share/bigbluebutton/html5-client
COPY --from=client-build bbb-html5.nginx* /usr/share/bigbluebutton/nginx/
COPY docker/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
HEALTHCHECK CMD wget -q --spider http://127.0.0.1:8080/html5client/ || exit 1

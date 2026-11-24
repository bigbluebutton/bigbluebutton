FROM node:24.22.3@sha256:9d266751ca3d7fdbe651c878ffd5ad0a42fed49a18c283509267c97f025b7496 AS build

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

# Only the files, at the path of the bbb-html5 package (build/packages-template/bbb-html5/build.sh).
# The nginx image serves them with the package's location files; compose mounts this image there
# as an image volume.
FROM scratch

COPY --from=build /app/dist /usr/share/bigbluebutton/html5-client

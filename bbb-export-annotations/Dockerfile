FROM node:24.22.2-alpine@sha256:a34ab6d7f6f4813f4d0c5469d74685604b962fbdbf5793a7bc7b4998ecb867c8 AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-progress --omit=dev
COPY . .

FROM node:24.22.2-alpine@sha256:a34ab6d7f6f4813f4d0c5469d74685604b962fbdbf5793a7bc7b4998ecb867c8

# cairosvg and ghostscript as the package depends on; pdftocairo is set in config/default.json
RUN apk add --no-cache py3-cairosvg ghostscript poppler-utils \
 && addgroup -S -g 998 bigbluebutton && adduser -S -u 998 -G bigbluebutton bigbluebutton

COPY --from=fonts . /usr/local/share/fonts/
COPY --from=slides blank* /usr/share/bigbluebutton/blank/
WORKDIR /usr/local/bigbluebutton/bbb-export-annotations
COPY --from=build /app ./

# Overrides go to /etc/bigbluebutton/bbb-export-annotations/production.json, as on bare metal
ENV NODE_ENV=production \
    NODE_CONFIG_DIR=/usr/local/bigbluebutton/bbb-export-annotations/config/:/etc/bigbluebutton/bbb-export-annotations/
USER bigbluebutton
CMD ["node", "master.js"]

FROM node:24.22.3-alpine@sha256:116b800c3754b440ee0aa3ed2f20f5bf3d99a554bfd9adeea09ea8017f6e85f5 AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-progress --omit=dev
COPY . .

FROM node:24.22.3-alpine@sha256:116b800c3754b440ee0aa3ed2f20f5bf3d99a554bfd9adeea09ea8017f6e85f5

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

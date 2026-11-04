FROM node:24@sha256:e7add2a490bb17d97b485b8641bd88455fff7839ade0f5eba493c3508124d413 AS build

WORKDIR /app
COPY package.json package-lock.json ./
# postinstall downloads the emoji images used by the PDF export
COPY scripts scripts
RUN npm ci --no-progress
COPY . .
RUN npm run build && mv dist/index.js dist/bbb-shared-notes-server.js && npm prune --omit=dev

FROM node:24-slim@sha256:c86ecead9e55a5210ac1727de38a4ca840bf03dcaf34dc9749addbf383b1920c

# wkhtmltopdf is the PDF converter of the package (not available on Alpine)
RUN apt-get update && apt-get install -y --no-install-recommends wkhtmltopdf \
 && rm -rf /var/lib/apt/lists/* \
 && groupadd -g 998 bigbluebutton && useradd -u 998 -g 998 -m bigbluebutton

WORKDIR /usr/share/bbb-shared-notes-server
COPY --from=build /app/dist ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/assets ./assets
COPY package.json package-lock.json blocknote_schema.sql run-in-systemd.sh ./
COPY config/default.yml ./config/

# Listen on all interfaces; deployments mount /etc/bigbluebutton/bbb-shared-notes-server.yml
ENV NODE_ENV=production SERVER_HOST=0.0.0.0
USER bigbluebutton
EXPOSE 8787
CMD ["node", "bbb-shared-notes-server.js"]

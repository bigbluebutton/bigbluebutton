FROM node:24@sha256:6449e19d8184d84062525b6a7524def03146c2cb04a7f08b076680d0e8e4240a AS build

WORKDIR /app
COPY package.json package-lock.json ./
# postinstall downloads the emoji images used by the PDF export
COPY scripts scripts
RUN npm ci --no-progress
COPY . .
RUN npm run build && mv dist/index.js dist/bbb-shared-notes-server.js && npm prune --omit=dev

FROM node:24-slim@sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205

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
RUN sed -i '/^expressServer:/,/^[a-z]/ s/host: 127.0.0.1/host: 0.0.0.0/' config/default.yml

ENV NODE_ENV=production
USER bigbluebutton
EXPOSE 8787
CMD ["node", "bbb-shared-notes-server.js"]

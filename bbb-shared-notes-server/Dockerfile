FROM node:24.22.2@sha256:8fa96264f302f58bbb13aa7339c541547b56975766ce956c875da149452a3e40 AS build

WORKDIR /app
COPY package.json package-lock.json ./
# postinstall downloads the emoji images used by the PDF export
COPY scripts scripts
RUN npm ci --no-progress
COPY . .
RUN npm run build && mv dist/index.js dist/bbb-shared-notes-server.js && npm prune --omit=dev

FROM node:24.22.2-slim@sha256:01d566e8d94d8c619591d78652babfccd3c6992a3dffa9ed5ab39e11cf6c70e9

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

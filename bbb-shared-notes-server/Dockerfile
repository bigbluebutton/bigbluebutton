FROM node:24.22.3@sha256:9d266751ca3d7fdbe651c878ffd5ad0a42fed49a18c283509267c97f025b7496 AS build

WORKDIR /app
COPY package.json package-lock.json ./
# postinstall downloads the emoji images used by the PDF export
COPY scripts scripts
RUN npm ci --no-progress
COPY . .
RUN npm run build && mv dist/index.js dist/bbb-shared-notes-server.js && npm prune --omit=dev

FROM node:24.22.3-slim@sha256:dc26ae92c9fb15cf6b1d63e20f0944b2efe0f115b20e00be48fb23fceb061c54

# wkhtmltopdf is the PDF converter of the package (not available on Alpine). The Noto fonts are
# the ones a package install has through bbb-web (fonts-noto) and bbb-libreoffice-docker
# (fonts-noto-cjk); without them CJK, Indic and Thai text is missing from the PDF. fonts-liberation
# (a dependency of the package) gives Arial and Liberation Mono, which the notes' CSS asks for, the
# same metrics as on a package install.
RUN apt-get update && apt-get install -y --no-install-recommends wkhtmltopdf fonts-noto-core fonts-noto-cjk fonts-liberation \
 && rm -rf /var/lib/apt/lists/* \
 && groupadd -g 998 bigbluebutton && useradd -u 998 -g 998 -m bigbluebutton

WORKDIR /usr/share/bbb-shared-notes-server
COPY --from=build /app/dist ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/assets ./assets
COPY package.json package-lock.json blocknote_schema.sql ./
COPY config/default.yml ./config/
# PDF conversion for containers, in place of the bbb-shared-notes-conversion systemd units
COPY docker/bbb-shared-notes-conversion.js ./

# Listen on all interfaces; deployments mount /etc/bigbluebutton/bbb-shared-notes-server.yml
ENV NODE_ENV=production SERVER_HOST=0.0.0.0
USER bigbluebutton
EXPOSE 8787
CMD ["node", "bbb-shared-notes-server.js"]

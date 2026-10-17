# Stage 1: Build
FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
# Skip postinstall twemoji download (PDF export only; needs LibreOffice/systemd on host)
RUN npm ci --no-progress --ignore-scripts

COPY . .
RUN npm run build && \
    cd /app/dist && \
    mv index.js bbb-shared-notes-server.js && \
    cp ../package.json ../package-lock.json . && \
    npm ci --no-progress --omit=dev --ignore-scripts

# Stage 2: Runtime
FROM node:24-alpine

ENV NODE_ENV=production

RUN addgroup -g 2064 app && \
    adduser -u 2065 -G app -D app && \
    mkdir -p /usr/share/bbb-shared-notes-server/config \
             /etc/bigbluebutton \
             /tmp/shared-notes-dropbox && \
    chown -R app:app /usr/share/bbb-shared-notes-server /tmp/shared-notes-dropbox /etc/bigbluebutton

COPY --from=build --chown=app:app /app/dist /usr/share/bbb-shared-notes-server
COPY --from=build --chown=app:app /app/config/default.yml /usr/share/bbb-shared-notes-server/config/default.yml
COPY --chown=app:app config/docker-override.yml /etc/bigbluebutton/bbb-shared-notes-server.yml

WORKDIR /usr/share/bbb-shared-notes-server
USER app

EXPOSE 8787

CMD ["node", "/usr/share/bbb-shared-notes-server/bbb-shared-notes-server.js"]

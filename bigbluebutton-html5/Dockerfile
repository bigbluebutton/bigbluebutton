FROM node:24.22.3@sha256:9d266751ca3d7fdbe651c878ffd5ad0a42fed49a18c283509267c97f025b7496 AS build

SHELL ["/bin/bash", "-o", "pipefail", "-c"]
ARG CLIENT_BUILD=0
WORKDIR /app
COPY package.json package-lock.json ./
RUN CI=true npm ci
COPY . .

# Same steps as build/packages-template/bbb-html5/build.sh
RUN CLIENT_BUILD="${CLIENT_BUILD}" ./build-client.sh

FROM nginxinc/nginx-unprivileged:1.30.6-alpine@sha256:f5116ed4606f3eb015dd4a8e28cb9b351476dc0ad4bc6e9f93b19cec130cdf03

COPY --from=build /app/dist /usr/share/bigbluebutton/html5-client
COPY --from=client-build bbb-html5.nginx* /usr/share/bigbluebutton/nginx/
COPY docker/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
HEALTHCHECK CMD wget -q --spider http://127.0.0.1:8080/html5client/ || exit 1

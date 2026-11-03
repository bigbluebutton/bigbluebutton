FROM node:24.22.2-alpine@sha256:a34ab6d7f6f4813f4d0c5469d74685604b962fbdbf5793a7bc7b4998ecb867c8 AS build

WORKDIR /app
COPY package.json package-lock.json ./
# The bundler is a devDependency
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.31.7-alpine@sha256:b5047b9b76845eac124358373c6852377c52e4b05834a47647e955dd91cb8f1e

COPY --from=build /app/build /var/bigbluebutton/learning-dashboard
COPY learning-dashboard.nginx /usr/share/bigbluebutton/nginx/
COPY docker/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
HEALTHCHECK CMD wget -q --spider http://127.0.0.1:8080/learning-analytics-dashboard/ || exit 1

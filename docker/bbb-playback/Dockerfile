FROM node:24-alpine@sha256:44fce696f38ba8c987c4db89954051000bbd05ffd8d8659ba15ed4a8602e937f AS build

WORKDIR /app
COPY --from=src package.json package-lock.json ./
RUN npm ci
COPY --from=src . .
RUN npm run build && node -p "require('./package.json').version" > build/bbb-playback-version

FROM nginxinc/nginx-unprivileged:1.30-alpine@sha256:f5116ed4606f3eb015dd4a8e28cb9b351476dc0ad4bc6e9f93b19cec130cdf03

COPY --from=build /app/build /var/bigbluebutton/playback/presentation/2.3
COPY --from=src playback.nginx /usr/share/bigbluebutton/nginx/
COPY default.conf /etc/nginx/conf.d/default.conf

HEALTHCHECK CMD ["wget", "-q", "--spider", "http://127.0.0.1:8080/playback/presentation/2.3/"]

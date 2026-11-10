FROM node:24-alpine@sha256:8a32c8cf649a49915a66e81e7a609223c708d0adabf288ee3f4077d765542f85 AS build

WORKDIR /app
COPY package.json package-lock.json ./
# The bundler is a devDependency
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.31-alpine@sha256:b5047b9b76845eac124358373c6852377c52e4b05834a47647e955dd91cb8f1e

COPY --from=build /app/build /var/bigbluebutton/learning-dashboard
COPY learning-dashboard.nginx /usr/share/bigbluebutton/nginx/
COPY docker/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
HEALTHCHECK CMD wget -q --spider http://127.0.0.1:8080/learning-analytics-dashboard/ || exit 1

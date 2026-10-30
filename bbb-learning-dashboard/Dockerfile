FROM node:24-alpine@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53 AS build

WORKDIR /app
COPY package.json package-lock.json ./
# The bundler is a devDependency
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.30-alpine@sha256:f5116ed4606f3eb015dd4a8e28cb9b351476dc0ad4bc6e9f93b19cec130cdf03

COPY --from=build /app/build /var/bigbluebutton/learning-dashboard
COPY learning-dashboard.nginx /usr/share/bigbluebutton/nginx/
COPY docker/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
HEALTHCHECK CMD wget -q --spider http://127.0.0.1:8080/learning-analytics-dashboard/ || exit 1

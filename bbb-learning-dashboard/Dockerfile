# Stage 1: Build
FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./
# webpack and friends live in devDependencies (post-CRA); do not omit them
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Runtime
FROM nginx:stable-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 80

# The number of nginx workers can be overwritten
# with the env variable BBB_LEARNING_DASHBOARD_NGINX_WORKERS
ENTRYPOINT ["docker-entrypoint.sh", "nginx", "-g", "daemon off;"]

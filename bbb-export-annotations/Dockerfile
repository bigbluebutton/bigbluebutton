FROM node:22-alpine AS base

# Install sponge and jq
RUN apk add --no-cache moreutils jq

ENV NODE_ENV=production

WORKDIR /app

# Create non-root user early so we can use --chown on COPY
RUN addgroup -g 998 -S bigbluebutton \
 && adduser -u 998 -S -G bigbluebutton bigbluebutton

FROM base AS deps

# Copy only dependency manifests for better caching
COPY package.json package-lock.json* ./

# Use npm ci for reproducible & faster installs; omit devDependencies
RUN npm ci --omit=dev

FROM base AS runner

COPY --from=deps /app/node_modules ./node_modules

COPY --chown=bigbluebutton:bigbluebutton . .

# Coverwrite config with docker hosts
RUN sed -i 's|http://127.0.0.1:8090|http://web:8090|g' ./config/settings.json
RUN sed -i 's|http://127.0.0.1:9002|http://pads:9002|g' ./config/settings.json
RUN jq '.redis.host = "redis"' ./config/settings.json | sponge ./config/settings.json

USER bigbluebutton

CMD ["npm", "start"]

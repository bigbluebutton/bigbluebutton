FROM node:22-alpine AS base

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

USER bigbluebutton

CMD ["npm", "start"]

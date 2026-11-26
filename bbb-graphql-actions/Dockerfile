FROM node:24.22.3-alpine@sha256:116b800c3754b440ee0aa3ed2f20f5bf3d99a554bfd9adeea09ea8017f6e85f5 AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-progress
COPY . .
RUN npm run build && mv dist/index.js dist/bbb-graphql-actions.js && npm prune --omit=dev

FROM node:24.22.3-alpine@sha256:116b800c3754b440ee0aa3ed2f20f5bf3d99a554bfd9adeea09ea8017f6e85f5

RUN addgroup -S -g 998 bigbluebutton && adduser -S -u 998 -G bigbluebutton bigbluebutton

WORKDIR /usr/local/bigbluebutton/bbb-graphql-actions
COPY --from=build /app/dist ./
COPY --from=build /app/node_modules ./node_modules
COPY package.json package-lock.json ./

# Listen on all interfaces; other settings are read from env (src/config.ts)
ENV NODE_ENV=production SERVER_HOST=0.0.0.0
USER bigbluebutton
EXPOSE 8093
CMD ["node", "bbb-graphql-actions.js"]

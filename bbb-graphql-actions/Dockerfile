FROM node:24-alpine@sha256:44fce696f38ba8c987c4db89954051000bbd05ffd8d8659ba15ed4a8602e937f AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-progress
COPY . .
RUN npm run build && mv dist/index.js dist/bbb-graphql-actions.js && npm prune --omit=dev

FROM node:24-alpine@sha256:44fce696f38ba8c987c4db89954051000bbd05ffd8d8659ba15ed4a8602e937f

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

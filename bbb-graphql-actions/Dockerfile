# Stage 1: Build
FROM node:22-alpine AS build

WORKDIR /app

COPY . .
RUN npm ci --no-progress && npm run build

# delete node_modules (it should create a fresh one inside /src/dist/)
RUN rm -rf /src/node_modules

RUN cd /app/dist && \
    mv index.js bbb-graphql-actions.js && \
    cp ../package.json ../package-lock.json . && \
    npm ci --no-progress --omit=dev

# Stage 2: Runtime
FROM node:22-alpine

RUN addgroup -g 2062 app && \
    adduser -u 2063 -G app -D app

USER app

COPY --from=build /app/dist /app

EXPOSE 8093

CMD [ "node", "/app/bbb-graphql-actions.js" ]

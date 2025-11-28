# Build stage
FROM golang:1.24 AS build

WORKDIR /app

COPY go.* ./

RUN go mod tidy

COPY . .

RUN CGO_ENABLED=0 go build -o bbb-graphql-middleware cmd/bbb-graphql-middleware/main.go

# Config stage
FROM alpine:latest AS config
RUN apk --no-cache add yq

WORKDIR /config

COPY config/config.yml config.yml

# Coverwrite default config with docker hosts

# Listen to all interfaces
RUN yq e -i '.server.listen_host = "0.0.0.0"' config.yml

# Adjust redis host to point to redis container
RUN yq e -i '.redis.host = "redis"' config.yml

# Adjust Hasura URL to point to nginx for hasura load balancing
RUN sed -i 's|127.0.0.1:8185|nginx:8185|g' config.yml

# Adjust graphql-actions URL to point to graphql-actions container
RUN sed -i 's|127.0.0.1:8093|graphql-actions:8093|g' config.yml

# Adjust auth_hook to point to bbb-web container
RUN sed -i 's|127.0.0.1:8090|web:8090|g' config.yml

# Adjust akka-apps URL to point to akka-apps container
RUN sed -i 's|127.0.0.1:8901|apps-akka:8901|g' config.yml

# Running stage
FROM scratch

# Copy the binary to the production image from the builder stage.
COPY --from=build /app/bbb-graphql-middleware /bbb-graphql-middleware
COPY --from=config /config/config.yml /usr/share/bbb-graphql-middleware/config.yml

EXPOSE 8378

ENTRYPOINT ["/bbb-graphql-middleware"]

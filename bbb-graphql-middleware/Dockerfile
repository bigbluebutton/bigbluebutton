# Go version from go.mod
FROM golang:1.27-alpine@sha256:f2c872bcee949b7be9c490efd02b48a8a2fbf947cdf533f1c58525ec9d8170fd AS build

WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# Listen on all interfaces; deployments mount /etc/bigbluebutton/bbb-graphql-middleware.yml
RUN CGO_ENABLED=0 go build -o bbb-graphql-middleware cmd/bbb-graphql-middleware/main.go \
 && sed -i 's/listen_host: 127.0.0.1/listen_host: 0.0.0.0/' config/config.yml

FROM scratch

COPY --from=build /src/bbb-graphql-middleware /usr/bin/bbb-graphql-middleware
COPY --from=build /src/config/config.yml /usr/share/bbb-graphql-middleware/config.yml

USER 998:998
EXPOSE 8378
ENTRYPOINT ["/usr/bin/bbb-graphql-middleware"]

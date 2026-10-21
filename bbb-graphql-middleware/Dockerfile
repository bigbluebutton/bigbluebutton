# Go version from go.mod
FROM golang:1.27-alpine@sha256:f2c872bcee949b7be9c490efd02b48a8a2fbf947cdf533f1c58525ec9d8170fd AS build

WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o bbb-graphql-middleware cmd/bbb-graphql-middleware/main.go

FROM scratch

COPY --from=build /src/bbb-graphql-middleware /usr/bin/bbb-graphql-middleware
COPY --from=build /src/config/config.yml /usr/share/bbb-graphql-middleware/config.yml
# Static busybox for the healthcheck only: 8378 is open once the Redis subscription is confirmed
COPY --from=busybox:1.38.0-musl@sha256:ea2b9914a16a4ac1981994af97b318f7c7d4db76b580c56177f08bf76f4a0be8 /bin/busybox /usr/bin/busybox

# Listen on all interfaces; deployments mount /etc/bigbluebutton/bbb-graphql-middleware.yml
ENV SERVER_HOST=0.0.0.0
USER 998:998
EXPOSE 8378
HEALTHCHECK CMD ["/usr/bin/busybox", "nc", "-z", "127.0.0.1", "8378"]
ENTRYPOINT ["/usr/bin/bbb-graphql-middleware"]

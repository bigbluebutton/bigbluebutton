# Build stage
FROM golang:1.24 AS build

WORKDIR /app

COPY go.* ./

RUN go mod tidy

COPY . .

RUN CGO_ENABLED=0 go build -o bbb-graphql-middleware cmd/bbb-graphql-middleware/main.go

# Running stage
FROM scratch

# Copy the binary to the production image from the builder stage.
COPY --from=build /app/bbb-graphql-middleware /bbb-graphql-middleware
COPY config/config.yml /usr/share/bbb-graphql-middleware/config.yml

ENTRYPOINT ["/bbb-graphql-middleware"]

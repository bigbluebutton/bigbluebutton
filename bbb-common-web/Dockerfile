# Build stage only: publishes bbb-common-web to ~/.m2 for the bbb-web build.
FROM bbb-common-message

WORKDIR /bbb-common-web

COPY . .

RUN ./deploy.sh

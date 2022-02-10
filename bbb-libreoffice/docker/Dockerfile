FROM alpine:3

RUN apk add bash libreoffice

COPY build /opt/build
RUN find /opt/build -type f -name '*.sh' | sort -n | xargs -I{} /bin/bash {}
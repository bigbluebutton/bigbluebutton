# Test runner for docker/tests/compose/assert-compose.sh. Built by docker/tests/compose/run.sh,
# which stages a minimal build context:
#   bbb-yq-go/            build.sh and bbb-yq-go.sha256sum from build/packages-template/bbb-yq-go
#   compose/              docker/tests/compose

# ubuntu:24.04
FROM docker.io/library/ubuntu@sha256:534baea6a22c03a63003dbc8dbe78fe34bc0d7e595d9a9dc9834884ff530eb55 AS tools

# yq as upstream packages it: same version, verified against upstream's checksum file.
# run.sh passes the version from build/packages-template/bbb-yq-go/build.sh.
ARG YQ_VERSION=4.53.2
ADD https://github.com/mikefarah/yq/releases/download/v${YQ_VERSION}/yq_linux_amd64 /yq/yq_linux_amd64
COPY bbb-yq-go/bbb-yq-go.sha256sum /yq/

# Docker Compose standalone binary (only `config` is used). Last v2 release; the checksum is the
# docker-compose-linux-x86_64 line of the release's checksums.txt.
ARG COMPOSE_VERSION=2.40.3
ARG COMPOSE_SHA256=dba9d98e1ba5bfe11d88c99b9bd32fc4a0624a30fafe68eea34d61a3e42fd372
ADD https://github.com/docker/compose/releases/download/v${COMPOSE_VERSION}/docker-compose-linux-x86_64 /compose/docker-compose

SHELL ["/bin/bash", "-o", "pipefail", "-c"]
WORKDIR /yq
RUN arch="$(dpkg --print-architecture)" \
    && if [ "$arch" != "amd64" ]; then \
        echo "upstream bbb-yq-go.sha256sum only covers amd64, not $arch" >&2; exit 1; \
    fi \
    && sha256sum -c --ignore-missing --strict bbb-yq-go.sha256sum \
    && echo "${COMPOSE_SHA256}  /compose/docker-compose" | sha256sum -c --strict \
    && install -m 0755 /yq/yq_linux_amd64 /usr/local/bin/yq \
    && install -m 0755 /compose/docker-compose /usr/local/bin/docker-compose

# ubuntu:24.04
FROM docker.io/library/ubuntu@sha256:534baea6a22c03a63003dbc8dbe78fe34bc0d7e595d9a9dc9834884ff530eb55

COPY --from=tools /usr/local/bin/yq /usr/local/bin/docker-compose /usr/local/bin/
COPY compose/ /src/docker/tests/compose/

USER 65534:65534
WORKDIR /src
ENV TMPDIR=/tmp \
    HOME=/tmp \
    COMPOSE_CMD=docker-compose
CMD ["/src/docker/tests/compose/test-assert-compose.sh"]

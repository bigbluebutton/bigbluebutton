# Test runner for docker/tests/compose/assert-compose.sh. Built by docker/tests/compose/run.sh,
# which stages a minimal build context:
#   bbb-yq-go/            build.sh and bbb-yq-go.sha256sum from build/packages-template/bbb-yq-go
#   compose/              docker/tests/compose

# ubuntu:24.04
FROM docker.io/library/ubuntu@sha256:534baea6a22c03a63003dbc8dbe78fe34bc0d7e595d9a9dc9834884ff530eb55 AS tools

# yq as upstream packages it: same version, verified against upstream's checksum file.
# run.sh passes the version from build/packages-template/bbb-yq-go/build.sh.
ARG YQ_VERSION=4.53.2
ARG TARGETARCH
ADD https://github.com/mikefarah/yq/releases/download/v${YQ_VERSION}/yq_linux_${TARGETARCH} /yq/yq_linux_${TARGETARCH}
COPY bbb-yq-go/bbb-yq-go.sha256sum /yq/

# Docker Compose standalone binary (only `config` is used). Last v2 release; checksums are the
# docker-compose-linux-{x86_64,aarch64} lines of the release's checksums.txt. Both assets are
# ADDed so BuildKit can resolve the URL without a shell; only the matching one is installed.
ARG COMPOSE_VERSION=2.40.3
ARG COMPOSE_SHA256_AMD64=dba9d98e1ba5bfe11d88c99b9bd32fc4a0624a30fafe68eea34d61a3e42fd372
ARG COMPOSE_SHA256_ARM64=d26373b19e89160546d15407516cc59f453030d9bc5b43ba7faf16f7b4980137
ADD https://github.com/docker/compose/releases/download/v${COMPOSE_VERSION}/docker-compose-linux-x86_64 /compose/docker-compose-linux-x86_64
ADD https://github.com/docker/compose/releases/download/v${COMPOSE_VERSION}/docker-compose-linux-aarch64 /compose/docker-compose-linux-aarch64

SHELL ["/bin/bash", "-o", "pipefail", "-c"]
WORKDIR /yq
RUN case "$TARGETARCH" in \
        amd64) yq_asset="yq_linux_amd64"; compose_asset=docker-compose-linux-x86_64; compose_sha="$COMPOSE_SHA256_AMD64" ;; \
        arm64) yq_asset="yq_linux_arm64"; compose_asset=docker-compose-linux-aarch64; compose_sha="$COMPOSE_SHA256_ARM64" ;; \
        *) echo "unsupported TARGETARCH=$TARGETARCH" >&2; exit 1 ;; \
    esac \
    && sha256sum -c --ignore-missing --strict bbb-yq-go.sha256sum \
    && echo "${compose_sha}  /compose/${compose_asset}" | sha256sum -c --strict \
    && install -m 0755 "/yq/${yq_asset}" /usr/local/bin/yq \
    && install -m 0755 "/compose/${compose_asset}" /usr/local/bin/docker-compose

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

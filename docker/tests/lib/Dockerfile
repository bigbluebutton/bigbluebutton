# Test runner for docker/lib/entrypoint-lib.sh. Built by docker/tests/lib/run.sh, which
# stages a minimal build context:
#   bbb-yq-go/            build.sh and bbb-yq-go.sha256sum from build/packages-template/bbb-yq-go
#   lib/                  docker/lib
#   tests/                docker/tests/lib

# ubuntu:24.04
FROM docker.io/library/ubuntu@sha256:534baea6a22c03a63003dbc8dbe78fe34bc0d7e595d9a9dc9834884ff530eb55 AS yq

# yq as upstream packages it: same version, verified against upstream's checksum file.
# run.sh passes the version from build/packages-template/bbb-yq-go/build.sh.
ARG YQ_VERSION=4.53.2
ARG TARGETARCH
ADD https://github.com/mikefarah/yq/releases/download/v${YQ_VERSION}/yq_linux_${TARGETARCH} /yq/yq_linux_${TARGETARCH}
COPY bbb-yq-go/bbb-yq-go.sha256sum /yq/
WORKDIR /yq
RUN case "$TARGETARCH" in \
        amd64|arm64) asset="yq_linux_${TARGETARCH}" ;; \
        *) echo "bbb-yq-go.sha256sum has no entry for $TARGETARCH" >&2; exit 1 ;; \
    esac \
    && sha256sum -c --ignore-missing --strict bbb-yq-go.sha256sum \
    && install -m 0755 "$asset" /usr/local/bin/yq

# ubuntu:24.04
FROM docker.io/library/ubuntu@sha256:534baea6a22c03a63003dbc8dbe78fe34bc0d7e595d9a9dc9834884ff530eb55

# envsubst, the project templating tool, from the distribution (signed apt repository).
# No per-package version pin: the digest-pinned base is the reproducibility anchor, and the
# installed versions are recorded (run.sh prints them before the tests).
# hadolint ignore=DL3008
RUN apt-get update \
    && apt-get install -y --no-install-recommends gettext-base \
    && rm -rf /var/lib/apt/lists/*

COPY --from=yq /usr/local/bin/yq /usr/local/bin/yq
COPY lib/ /src/docker/lib/
COPY tests/ /src/docker/tests/lib/

USER 65534:65534
WORKDIR /src
ENV TMPDIR=/tmp
CMD ["/src/docker/tests/lib/test-entrypoint-lib.sh"]

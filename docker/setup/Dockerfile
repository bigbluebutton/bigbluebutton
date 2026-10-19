# setup: writes .env for docker-compose.yml (`docker compose run --rm setup`): generates the
# secrets, asks for the domain, the ACME e-mail and the features, proposes the public addresses,
# and never overwrites a value .env already has. See entrypoint.sh.
#
# Build with bake (docker/bake/setup.hcl) or with podman:
#   podman build --build-context entrypoint-lib=docker/lib --build-context contract=docker \
#       docker/setup
#
# The variable lists, patterns and defaults come from docker/config-contract.yaml at build time
# (named context `contract` = docker/): the contract tools validate it, generate .env.sample
# from it and compile what setup needs into spec.sh, so the runtime image needs no YAML tool.
# Base: Alpine with bash (the entrypoint helper needs it); busybox provides ip, tr, fold, cmp
# and stat. Multi-arch: nothing architecture-specific is installed.

# alpine:3.24.1 (the base of docker/livekit)
FROM docker.io/library/alpine@sha256:28bd5fe8b56d1bd048e5babf5b10710ebe0bae67db86916198a6eec434943f8b AS spec

# The contract tools need bash, coreutils, diffutils, grep, sed, awk and mikefarah/yq v4
# (docker/contract/README.md). Alpine's yq-go is mikefarah/yq; it runs at build time only.
RUN apk add --no-cache bash coreutils diffutils grep sed gawk yq-go

# DL3022 (here and below): named build contexts, not stages.
# hadolint ignore=DL3022
COPY --from=contract config-contract.yaml /build/docker/config-contract.yaml
# hadolint ignore=DL3022
COPY --from=contract contract/ /build/docker/contract/
COPY compile-spec.sh /build/compile-spec.sh
RUN /build/docker/contract/generate.sh --root /build \
    && bash /build/compile-spec.sh /build/docker/config-contract.yaml /build/spec.sh

# alpine:3.24.1
FROM docker.io/library/alpine@sha256:28bd5fe8b56d1bd048e5babf5b10710ebe0bae67db86916198a6eec434943f8b

# The directories of the files copied below, traversable by any UID (docker/README.md).
RUN apk add --no-cache bash \
    && install -d -m 0755 /usr/local/lib/bbb /usr/local/share/bbb/setup

# hadolint ignore=DL3022
COPY --from=entrypoint-lib --chmod=0644 entrypoint-lib.sh /usr/local/lib/bbb/entrypoint-lib.sh
COPY --from=spec --chmod=0644 /build/spec.sh /usr/local/share/bbb/setup/spec.sh
COPY --from=spec --chmod=0644 /build/.env.sample /usr/local/share/bbb/setup/env.sample
COPY --chmod=0755 entrypoint.sh /entrypoint.sh

# The project directory (the directory of docker-compose.yml) is mounted here.
WORKDIR /project

# No USER: the compose service runs as root with only CHOWN and DAC_OVERRIDE, so that it can
# write .env into a directory of any owner and give the file that owner (entrypoint.sh). Run
# with --user UID:GID instead and the file belongs to that user. No HEALTHCHECK: a run-only
# tool that exits (compose label org.bigbluebutton.run-only).
ENTRYPOINT ["/entrypoint.sh"]

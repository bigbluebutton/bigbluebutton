# Java 21 runtime base for the JVM images (akka-apps, bbb-web).
#
# Build with bake (the entrypoint-lib named context is defined in docker-bake.hcl):
#   docker buildx bake -f docker-bake.hcl _java-base
# or with podman:
#   podman build --build-context entrypoint-lib=docker/lib docker/java-base
#
# Contains only what every JVM image needs: Ubuntu's OpenJDK 21 runtime (the JDK bare metal
# installs, build/packages-template/bbb-web/opts-noble.sh) and the shared entrypoint helper.
# Image-specific tools (ImageMagick, poppler, ...) belong in the image that needs them.
#
# No user is created and no USER is set: images run under any UID/GID given at runtime
# (docker/README.md, "Running under an arbitrary UID/GID"). Derived images set their own
# numeric USER after their last root-only build step.

# ubuntu:24.04
FROM docker.io/library/ubuntu@sha256:534baea6a22c03a63003dbc8dbe78fe34bc0d7e595d9a9dc9834884ff530eb55

# No per-package version pin: the base image is pinned by digest, and the installed package
# versions are recorded at build time (docker/README.md, "Package versions").
# hadolint ignore=DL3008
RUN apt-get update \
    && apt-get install -y --no-install-recommends openjdk-21-jre-headless \
    && rm -rf /var/lib/apt/lists/* \
    && ln -s "java-21-openjdk-$(dpkg --print-architecture)" /usr/lib/jvm/java-21

ENV JAVA_HOME=/usr/lib/jvm/java-21 \
    LANG=C.UTF-8

# Shared entrypoint helper (P3): every image gets it the same way, from the bake named
# context `entrypoint-lib` (./docker/lib). Root-owned and world-readable, so any UID can
# source it. Its directory is created first, traversable by any UID (docker/README.md).
# DL3022: entrypoint-lib is a named build context, not a stage.
RUN install -d -m 0755 /usr/local/lib/bbb
# hadolint ignore=DL3022
COPY --from=entrypoint-lib --chmod=0644 entrypoint-lib.sh /usr/local/lib/bbb/entrypoint-lib.sh

# syntax=docker/dockerfile:1
# Recording processing as BigBlueButton packages it: bbb-record-core (the rap scripts and their
# gems in /usr/local/bigbluebutton/core, build/packages-template/bbb-record-core), the
# presentation format (bbb-playback-presentation: its scripts merged into core/scripts),
# bbb-presentation-video and bbb-record and the daily cleanup of bbb-config. One image for all
# recording services: docker/entrypoint.sh starts the process of each systemd unit
# (bbb-rap-resque-worker, bbb-rap-starter, bbb-rap-caption-inbox) or the cleanup.
#
# Build with bake (docker/bake/record-and-playback.hcl defines the named contexts):
#   docker buildx bake -f docker-bake.hcl $(printf -- '-f %s ' docker/bake/*.hcl) record-and-playback
# or with podman (--format docker keeps the HEALTHCHECK):
#   podman build --format docker \
#       --build-context entrypoint-lib=docker/lib \
#       --build-context bbb-yq-go=build/packages-template/bbb-yq-go \
#       --build-context bbb-mkclean=build/packages-template/bbb-mkclean \
#       --build-context bigbluebutton-config=bigbluebutton-config \
#       --build-context bbb-web-docker=bigbluebutton-web/docker \
#       --build-context bbb-web-conf=bigbluebutton-web/grails-app/conf \
#       -t bbb-record-and-playback record-and-playback

# ubuntu:24.04, the distribution of the bare-metal packages (Ruby, ffmpeg and Python from it)
ARG UBUNTU=docker.io/library/ubuntu@sha256:534baea6a22c03a63003dbc8dbe78fe34bc0d7e595d9a9dc9834884ff530eb55

# The rap scripts with their gems, as bbb-record-core's build.sh installs them: Ubuntu's ruby
# and bundler, `bundle install` in deployment mode (Gemfile.lock; the optional test group is not
# installed), the build leftovers removed. Build tools only in this stage.
FROM ${UBUNTU} AS core

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# ruby, ruby-bundler: package dependencies (opts-noble.sh). The rest builds the native gems:
# journald-native (libsystemd), ffi (libffi) and nokogiri (its own libxml2 and libxslt, which
# it downloads and verifies).
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential ca-certificates libffi-dev libsystemd-dev patch pkg-config ruby ruby-bundler \
        ruby-dev zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /staging/usr/local/bigbluebutton/core
COPY core/Gemfile core/Gemfile.lock ./
RUN bundle config set --local deployment true \
    && bundle install \
    && bundle clean \
    && rm -r vendor/bundle/ruby/*/cache \
    && find vendor/bundle -name '*.o' -delete

# bbb-record-core: scripts, lib, Rakefile; bbb-playback-presentation: its scripts copied over
# core/scripts (build.sh: `cp -r scripts staging/usr/local/bigbluebutton/core`), without the
# nginx location (served by the nginx image). Modes as both build.sh files set them.
COPY core/scripts scripts
COPY core/lib lib
COPY core/Rakefile Rakefile
COPY presentation/scripts scripts
RUN rm scripts/presentation.nginx \
    && chmod -R a+rX . \
    && find vendor/bundle/ruby/*/gems/resque-*/lib/resque/server/public -type f -name "*.png" -execdir chmod 0644 {} \; \
    && find vendor/bundle/ruby/*/gems/resque-*/bin -type f -execdir chmod 0755 {} \; \
    && chmod 755 scripts/*/*.rb


# Tools of other bare-metal packages, built or downloaded and verified as those packages do.
FROM ${UBUNTU} AS tools

ARG TARGETARCH

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential bzip2 ca-certificates curl unzip \
    && rm -rf /var/lib/apt/lists/*

# yq as upstream packages it (bbb-yq-go, a dependency of bbb-record-core): version from its
# build.sh, verified against its checksum file, installed as /usr/bin/yq-go (bbb-record and the
# package scripts call it by that name).
# DL3022: bbb-yq-go is a named build context, not a stage.
# hadolint ignore=DL3022
COPY --from=bbb-yq-go build.sh bbb-yq-go.sha256sum /build/yq/
WORKDIR /build/yq
RUN case "$TARGETARCH" in \
        amd64|arm64) asset="yq_linux_${TARGETARCH}" ;; \
        *) echo "bbb-yq-go.sha256sum has no entry for $TARGETARCH" >&2; exit 1 ;; \
    esac \
    && yq_version="$(sed -n 's/^YQ_VERSION=//p' build.sh)" \
    && curl -fsSLO "https://github.com/mikefarah/yq/releases/download/v${yq_version}/${asset}" \
    && grep " ${asset}$" bbb-yq-go.sha256sum | sha256sum -c - \
    && install -D -m 0755 "$asset" /staging/usr/bin/yq-go

# mkclean as bbb-mkclean builds it (a dependency of bbb-record-core): the source release named
# in its build.sh, verified against mkclean.sha256sum, built with coremake for x86_64 (the only
# 64-bit Linux configuration coremake has, the one build.sh installs; hence amd64 only).
# hadolint ignore=DL3022
COPY --from=bbb-mkclean build.sh mkclean.sha256sum /build/mkclean/
WORKDIR /build/mkclean
RUN tarball="$(sed -n 's/^if \[ ! -f \(mkclean-[0-9.]*\.tar\.bz2\) \]; then$/\1/p' build.sh)" \
    && [ -n "$tarball" ] \
    && curl -fsSL -o "$tarball" "https://sourceforge.net/projects/matroska/files/mkclean/${tarball}/download" \
    && sha256sum -c mkclean.sha256sum \
    && tar --no-same-owner --strip-components=1 -xjf "$tarball" \
    && make -C corec/tools/coremake \
    && corec/tools/coremake/coremake "$(corec/tools/coremake/system_output.sh)" \
    && make \
    && install -D -m 0755 release/gcc_linux_x64/mkclean /staging/usr/bin/mkclean

# bbb-presentation-video as bbb-presentation-video.placeholder.sh installs it: the prebuilt
# release package (architecture all) and its python3-perfect-freehand dependency. The release
# page lists the zip's sha256; perfect-freehand's release lists none, so its sha256 is the one of
# the file at the time this was written.
ARG BBB_PRESENTATION_VIDEO_RELEASE=5.1.0-rc.4
ARG BBB_PRESENTATION_VIDEO_SHA256=cd5636018f5de750a94a6dbbedbd1d620219beda392dfe70d9d9e6b238a4c4ee
ARG PERFECT_FREEHAND_VERSION=1.2.0
ARG PERFECT_FREEHAND_SHA256=35be7604c53b2cbfea0f5d19993378b7367e8241585707ba2d6c3fd3d2368419
WORKDIR /build/bbb-presentation-video
RUN curl -fsSL -o bbb-presentation-video.zip \
        "https://github.com/bigbluebutton/bbb-presentation-video/releases/download/${BBB_PRESENTATION_VIDEO_RELEASE}/ubuntu-22.04.zip" \
    && echo "${BBB_PRESENTATION_VIDEO_SHA256}  bbb-presentation-video.zip" | sha256sum -c - \
    && curl -fsSL -o "python3-perfect-freehand_${PERFECT_FREEHAND_VERSION}_all.deb" \
        "https://github.com/bigbluebutton/perfect-freehand-python/releases/download/${PERFECT_FREEHAND_VERSION}/python3-perfect-freehand_${PERFECT_FREEHAND_VERSION}_all.deb" \
    && echo "${PERFECT_FREEHAND_SHA256}  python3-perfect-freehand_${PERFECT_FREEHAND_VERSION}_all.deb" | sha256sum -c - \
    && unzip -q bbb-presentation-video.zip \
    && rm bbb-presentation-video.zip \
    && mkdir /debs \
    && mv ./*.deb /debs/


FROM ${UBUNTU}

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# bbb-record-core's dependencies (opts-noble.sh) without redis-server (its own service),
# bbb-mkclean and bbb-yq-go (built above); ca-certificates for the HTTPS callbacks of the
# post-publish scripts; gettext-base (envsubst) for the entrypoint helper; tini as PID 1 (signals
# reach the resque worker processes, which are children of rake). The two packages of
# bbb-presentation-video bring their own dependencies; GTK's need of a D-Bus session bus is met
# by dbus-x11, as the other provider, dbus-user-session, would install systemd. imagemagick: the
# presentation format runs `convert` (generators/presentation.rb, publish/presentation.rb); bare
# metal has it through bbb-web's dependencies (build/packages-template/bbb-web/opts-noble.sh).
RUN --mount=type=bind,from=tools,source=/debs,target=/debs \
    apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates dbus-x11 ffmpeg gettext-base gir1.2-pango-1.0 imagemagick libcurl4 libncurses6 libsystemd0 \
        poppler-utils python3 python3-attr python3-cairo python3-gi python3-gi-cairo python3-icu \
        python3-lxml rsync ruby ruby-bundler tini zlib1g \
        /debs/python3-perfect-freehand_*_all.deb /debs/bbb-presentation-video_*_all.deb \
    && rm -rf /var/lib/apt/lists/*

COPY --from=tools /staging/ /
COPY --from=core /staging/ /

# The ImageMagick policy that bbb-install writes on bare metal, which also applies to recording
# there; the bbb-web image ships the same file.
# DL3022: bbb-web-docker is a named build context, not a stage.
# hadolint ignore=DL3022
COPY --from=bbb-web-docker --chmod=0644 policy.xml /etc/ImageMagick-6/policy.xml

# bbb-web's default properties at the path of the bbb-web package (its war, unpacked into
# /usr/share/bbb-web), which the analytics callback (post_events_analytics_callback.rb) reads
# before merging /etc/bigbluebutton/bbb-web.properties over it. The package installs it next to
# recording on bare metal.
# DL3022: bbb-web-conf is a named build context, not a stage.
RUN install -d -m 0755 /usr/share/bbb-web /usr/share/bbb-web/WEB-INF /usr/share/bbb-web/WEB-INF/classes
# hadolint ignore=DL3022
COPY --from=bbb-web-conf --chmod=0644 bigbluebutton.properties /usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties

# bbb-config's files that recording uses: bbb-record (--delete, called by the cleanup, and the
# admin's tool), the release file it sources, and the daily cleanup script. The directory of the
# Tier 3 files (recording.yml, presentation.yml), for their mounts.
# DL3022: bigbluebutton-config is a named build context, not a stage.
RUN install -d -m 0755 /etc/bigbluebutton /etc/bigbluebutton/recording /usr/local/share/bbb/recording/cron.daily
# hadolint ignore=DL3022
COPY --from=bigbluebutton-config --chmod=0755 bin/bbb-record /usr/bin/bbb-record
# hadolint ignore=DL3022
COPY --from=bigbluebutton-config --chmod=0644 bigbluebutton-release /etc/bigbluebutton/bigbluebutton-release
# hadolint ignore=DL3022
COPY --from=bigbluebutton-config --chmod=0755 cron.daily/bigbluebutton /usr/local/share/bbb/recording/cron.daily/bigbluebutton

# Files the entrypoint renders at start (docker/entrypoint.sh) are links into /run/bbb-recording,
# writable for any UID: bigbluebutton.yml (upstream's file moves out as the entrypoint's base),
# bbb-web.properties (the shared secret for the callbacks), the cleanup's settings and script.
# Writable for any UID as well: the data volume, the recorder volume (archive deletes the
# recorder's files once copied) and the log directory (docker/README.md, "Running under an
# arbitrary UID/GID").
ARG SCRIPTS=/usr/local/bigbluebutton/core/scripts
RUN mv "$SCRIPTS/bigbluebutton.yml" /usr/local/share/bbb/recording/bigbluebutton.yml \
    && install -d -m 1777 /run/bbb-recording /etc/cron.daily /etc/default \
        /var/bigbluebutton /var/lib/bbb-webrtc-recorder /var/log/bigbluebutton \
    && ln -s /run/bbb-recording/bigbluebutton.yml "$SCRIPTS/bigbluebutton.yml" \
    && ln -s /run/bbb-recording/bbb-web.properties /etc/bigbluebutton/bbb-web.properties \
    && ln -s /run/bbb-recording/bigbluebutton-cron-config /etc/default/bigbluebutton-cron-config \
    && ln -s /run/bbb-recording/cron.daily-bigbluebutton /etc/cron.daily/bigbluebutton

# The helper's directory is created first, traversable by any UID (docker/README.md).
# DL3022: entrypoint-lib is a named build context, not a stage.
RUN install -d -m 0755 /usr/local/lib/bbb /usr/local/lib/bbb/recording
# hadolint ignore=DL3022
COPY --from=entrypoint-lib --chmod=0644 entrypoint-lib.sh /usr/local/lib/bbb/entrypoint-lib.sh
COPY --chmod=0644 docker/bbb-web.properties /usr/local/share/bbb/recording/bbb-web.properties
COPY --chmod=0644 docker/journald-stdout.rb /usr/local/lib/bbb/recording/journald-stdout.rb
COPY --chmod=0755 docker/logger /usr/local/bin/logger
COPY --chmod=0755 docker/cleanup.sh /usr/local/lib/bbb/recording/cleanup.sh
COPY --chmod=0755 docker/healthcheck.sh /usr/local/lib/bbb/recording-healthcheck.sh
COPY --chmod=0755 docker/entrypoint.sh /entrypoint.sh

# Without a passwd entry HOME would be / (Docker) or empty (podman); bundler and Ruby want one.
# USER as systemd sets it for the units (User=bigbluebutton): bbb-record --delete, which the
# cleanup runs, accepts that user besides root. RUBYOPT: the scripts' journal and log file
# messages go to stdout (docker/journald-stdout.rb).
ENV HOME=/tmp \
    USER=bigbluebutton \
    LANG=C.UTF-8 \
    RUBYOPT=-r/usr/local/lib/bbb/recording/journald-stdout.rb

# The units run as bigbluebutton; here any non-root UID works. Default BBB_UID/BBB_GID
# (docker/config-contract.yaml); compose sets the deployment's ids, as for the other writers of
# the data volume.
USER 998:998
WORKDIR /usr/local/bigbluebutton/core/scripts
# No port. The check is on the role's process and, where it uses redis, on redis
# (docker/healthcheck.sh); without an argument it checks the role the container was started with.
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD ["/usr/local/lib/bbb/recording-healthcheck.sh"]
ENTRYPOINT ["/usr/bin/tini", "-g", "--", "/entrypoint.sh"]
CMD ["bbb-rap-resque-worker"]

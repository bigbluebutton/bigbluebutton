# Recording processing: bbb-record-core with the presentation, video, notes and screenshare formats,
# as the packages install them (build/packages-template/bbb-record-core, bbb-playback-<format>).
# The default command runs the resque workers; the same image runs
#   /usr/local/bigbluebutton/core/scripts/rap-starter.rb
#   /usr/local/bigbluebutton/core/scripts/rap-caption-inbox.rb
#   /etc/cron.daily/bigbluebutton   (the daily cleanup of bbb-config; schedule it from outside)
FROM ubuntu:24.04@sha256:68ee22004a9109b44973313b02ff7b1de250f1de0f5ecb628d73f579aaff33ac AS build

# Versions come from the pinned base image's Ubuntu release.
# hadolint ignore=DL3008
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential bzip2 ca-certificates curl \
        libsystemd-dev ruby ruby-bundler ruby-dev unzip zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# As build/packages-template/bbb-mkclean/build.sh
WORKDIR /build/mkclean
COPY --from=bbb-mkclean mkclean.sha256sum .
RUN curl -fsSL -o mkclean-0.8.10.tar.bz2 https://sourceforge.net/projects/matroska/files/mkclean/mkclean-0.8.10.tar.bz2/download \
    && sha256sum -c mkclean.sha256sum \
    && tar --no-same-owner -xjf mkclean-0.8.10.tar.bz2  # rootless builds reject the tarball's UID
WORKDIR /build/mkclean/mkclean-0.8.10
RUN make -C corec/tools/coremake \
    && corec/tools/coremake/coremake "$(corec/tools/coremake/system_output.sh)" \
    && make \
    && install -m 0755 release/*/mkclean /usr/local/bin/mkclean

# bbb-presentation-video and its python3-perfect-freehand dependency, downloaded by the script the
# package build runs (build/get_external_dependencies.sh), so the image installs the package's release
WORKDIR /build
RUN --mount=type=bind,from=placeholders,source=bbb-presentation-video.placeholder.sh,target=/placeholder.sh \
    sh /placeholder.sh

# As build/packages-template/bbb-record-core/build.sh
WORKDIR /usr/local/bigbluebutton/core
COPY core/Gemfile core/Gemfile.lock ./
RUN bundle config set --local deployment true \
    && bundle install \
    && bundle clean \
    && rm -r vendor/bundle/ruby/*/cache \
    && find vendor/bundle -name '*.o' -delete

FROM ubuntu:24.04@sha256:68ee22004a9109b44973313b02ff7b1de250f1de0f5ecb628d73f579aaff33ac

# The user of bbb-record-core's before-install with the packages' UID 998, created first:
# systemd, pulled in by the GTK dependencies, would take 998 otherwise.
RUN groupadd -g 998 bigbluebutton \
    && useradd -u 998 -g bigbluebutton -m -d /home/bigbluebutton -s /bin/false bigbluebutton

# Dependencies of bbb-record-core (opts-noble.sh) except redis-server, which runs in its own
# container, and the two .deb files. imagemagick: the presentation format calls `convert`
# (on a server it comes with bbb-web).
# hadolint ignore=DL3008
RUN --mount=type=bind,from=build,source=/build/bbb-presentation-video,target=/tmp/debs \
    apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg gir1.2-pango-1.0 imagemagick libcurl4 \
        libncurses6 libsystemd0 poppler-utils python3 python3-attr python3-cairo python3-gi \
        python3-gi-cairo python3-icu python3-lxml rsync ruby ruby-bundler zlib1g /tmp/debs/*.deb \
    && rm -rf /var/lib/apt/lists/*

# yq-go at the version of build/packages-template/bbb-yq-go/build.sh
COPY --from=mikefarah/yq:4.53.2@sha256:0cb4a78491b6e62ee8a9bf4fbeacbd15b5013d19bc420591b05383a696315e60 /usr/bin/yq /usr/bin/yq-go
COPY --from=build /usr/local/bin/mkclean /usr/bin/mkclean
COPY --from=build /usr/local/bigbluebutton/core /usr/local/bigbluebutton/core
COPY core/Rakefile /usr/local/bigbluebutton/core/
COPY core/lib /usr/local/bigbluebutton/core/lib
COPY core/scripts /usr/local/bigbluebutton/core/scripts
COPY presentation/scripts video/scripts notes/scripts screenshare/scripts /usr/local/bigbluebutton/core/scripts/
COPY video/playback /usr/local/bigbluebutton/core/playback
COPY screenshare/playback /usr/local/bigbluebutton/core/playback/screenshare
COPY --from=bigbluebutton-config bigbluebutton-release /etc/bigbluebutton/
COPY --from=bigbluebutton-config bin/bbb-record /usr/bin/
COPY --from=bigbluebutton-config cron.daily/bigbluebutton /etc/cron.daily/

# Directories as in the after-install scripts of the packages
RUN mkdir -p /var/bigbluebutton/basic_stats /var/bigbluebutton/captions/inbox /var/bigbluebutton/deleted \
        /var/bigbluebutton/events /var/bigbluebutton/unpublished \
        /var/bigbluebutton/recording/raw /var/bigbluebutton/recording/process \
        /var/bigbluebutton/recording/status/ended /var/bigbluebutton/recording/status/recorded \
        /var/bigbluebutton/recording/status/archived /var/bigbluebutton/recording/status/processed \
        /var/bigbluebutton/recording/status/sanity /var/bigbluebutton/recording/status/published \
    && for f in presentation video notes screenshare; do \
        mkdir -p "/var/bigbluebutton/published/$f" "/var/bigbluebutton/recording/publish/$f" "/var/log/bigbluebutton/$f"; \
    done \
    && chown -R bigbluebutton:bigbluebutton /var/bigbluebutton /var/log/bigbluebutton

# Ruby reads events.xml and the yml files with the locale's encoding.
ENV LANG=C.UTF-8
# From bbb-rap-resque-worker.service
ENV QUEUE=rap:archive,rap:publish,rap:process,rap:sanity,rap:captions,rap:events COUNT=1

USER 998:998
WORKDIR /usr/local/bigbluebutton/core/scripts
CMD ["bundle", "exec", "rake", "-f", "Rakefile", "resque:workers"]

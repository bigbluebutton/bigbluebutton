FROM debian:bullseye AS bbb-presentation-video-builder

ARG TAG_BBB_PRESENTATION_VIDEO="5.0.0"

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    software-properties-common \
    debhelper \
    devscripts \
    equivs \
    git \
    git-buildpackage \
    pristine-tar

RUN git clone --depth 1 --branch ${TAG_BBB_PRESENTATION_VIDEO} https://github.com/bigbluebutton/bbb-presentation-video.git

WORKDIR /bbb-presentation-video

RUN DEBIAN_FRONTEND=noninteractive mk-build-deps -i -r -t 'apt-get -y -o Debug::pkgProblemResolver=yes --no-install-recommends'

RUN gbp buildpackage --git-ignore-new --git-ignore-branch --no-sign

FROM ruby:3.0-slim-bullseye

# install apt dependencies
RUN apt-get update && apt-get install -y \
    wget \
    subversion \
    rsync \
    build-essential \
    libsystemd-dev \
    python3 \
    python3-attr \
    python3-cairo \
    python3-gi \
    python3-gi-cairo \
    python3-lxml \
    python3-icu \
    python3-pyinotify \
    python3-sortedcollections \
    python3-packaging \
    gir1.2-pangocairo-1.0 \
    gir1.2-poppler-0.18 \
    gir1.2-gtk-3.0 \
    gir1.2-gdkpixbuf-2.0 \
    fonts-croscore \
    ffmpeg \
    poppler-utils \
    imagemagick \
    unzip \
    locales \
    locales-all \
    cmake
# TODO: missing packages

ENV LC_ALL=en_US.UTF-8
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US.UTF-8

# compile and install mkclean
RUN cd /tmp \
    && wget https://downloads.sourceforge.net/project/matroska/mkclean/mkclean-0.9.0.tar.bz2 \
    && tar -xf mkclean-0.9.0.tar.bz2 \
    && cd mkclean-0.9.0 \
    && cmake -S . -B build -DCMAKE_BUILD_TYPE=Release \
    && cmake --build build --target mkclean -- -j"$(nproc)" \
    && install -m 0755 build/mkclean/mkclean /usr/local/bin/mkclean \
    && cd / \
    && rm -rf /tmp/mkclean-0.9.0*

# add dockerize
ENV DOCKERIZE_VERSION=v0.6.1
RUN wget -q https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

# add yq for bbb-record
ENV YQ_VERSION=v4.49.2
RUN  wget -q https://github.com/mikefarah/yq/releases/download/${YQ_VERSION}/yq_linux_amd64 -O /usr/bin/yq \
    && chmod +x /usr/bin/yq

# create user
# the ID should match the one creating the files in `core`
RUN groupadd -g 998 bigbluebutton && useradd -m -u 998 -g bigbluebutton bigbluebutton

RUN mkdir -p \
    /usr/local/bigbluebutton \
    /usr/local/bigbluebutton/core \
    /etc/bigbluebutton \
    /etc/bigbluebutton/recording \
    /var/log/bigbluebutton \
    /var/bigbluebutton/captions/ \
    /var/bigbluebutton/events/ \
    /var/bigbluebutton/recording/raw \
    /var/bigbluebutton/recording/process \
    /var/bigbluebutton/recording/publish \
    /var/bigbluebutton/recording/status/recorded \
    /var/bigbluebutton/recording/status/archived \
    /var/bigbluebutton/recording/status/processed \
    /var/bigbluebutton/recording/status/ended \
    /var/bigbluebutton/recording/status/sanity \
    /var/bigbluebutton/recording/status/published \
    /var/bigbluebutton/captions/inbox

# Change ownership
RUN chown -R bigbluebutton:bigbluebutton /usr/local/bigbluebutton  \
    /etc/bigbluebutton \
    /var/log/bigbluebutton \
    /var/bigbluebutton

# dependency for bbb-presentation-video
ENV FREEHAND_VERSION=1.2.0
RUN wget -q -O /tmp/python3-perfect-freehand.deb https://github.com/bigbluebutton/perfect-freehand-python/releases/download/${FREEHAND_VERSION}/python3-perfect-freehand_${FREEHAND_VERSION}_all.deb && \
    dpkg -i /tmp/python3-perfect-freehand.deb && \
    rm /tmp/python3-perfect-freehand.deb

COPY ./core /usr/local/bigbluebutton/core

# add bbb-playback-presentation scripts
COPY ./presentation/scripts /usr/local/bigbluebutton/core/scripts/

# install ruby dependencies
RUN cd /usr/local/bigbluebutton/core \
    && gem install builder \
    && gem install bundler --no-document \
    && bundle config set --local deployment true \
    && bundle install \
    && bundle clean \
    && rm -r vendor/bundle/ruby/*/cache \
    && find vendor/bundle -name '*.o' -delete

# log to file instead of journald
RUN sed -i 's|Journald::Logger\.new.*|Logger.new("/var/log/bigbluebutton/recording.log")|g' /usr/local/bigbluebutton/core/lib/recordandplayback.rb && \
    sed -i 's|Journald::Logger\.new.*|Logger.new("/var/log/bigbluebutton/recording.log")|g' /usr/local/bigbluebutton/core/scripts/rap-caption-inbox.rb && \
    sed -i 's|Logger\.new.*|Logger.new("/var/log/bigbluebutton/recording.log")|g' /usr/local/bigbluebutton/core/scripts/rap-process-worker.rb && \
    sed -i 's|Logger\.new.*|Logger.new("/var/log/bigbluebutton/recording.log")|g' /usr/local/bigbluebutton/core/scripts/archive/archive.rb && \
    sed -i 's|Logger\.new.*|Logger.new("/var/log/bigbluebutton/recording.log")|g' /usr/local/bigbluebutton/core/scripts/publish/presentation.rb && \
    sed -i 's|Logger\.new.*|Logger.new("/var/log/bigbluebutton/recording.log")|g' /usr/local/bigbluebutton/core/scripts/utils/captions.rb && \
    sed -i 's|Logger\.new.*|Logger.new("/var/log/bigbluebutton/recording.log")|g' /usr/local/bigbluebutton/core/scripts/process/presentation.rb

# add bbb-record with some adjustments so bbb-record works in this environment
COPY --from=bigbluebutton-config /bin/bbb-record /usr/bin/bbb-record
RUN cd /usr/bin \
    && chmod +x /usr/bin/bbb-record \
    && sed -i 's/^BBB_WEB.*/BBB_WEB=""/' /usr/bin/bbb-record \
    && sed -i 's/systemctl.*//' /usr/bin/bbb-record

# add bbb-cleanup routine
COPY --chown=bigbluebutton:bigbluebutton ./cleanup/scripts/bbb-remove-old-recordings /usr/local/bigbluebutton/core/scripts/bbb-remove-old-recordings
RUN chmod +x /usr/local/bigbluebutton/core/scripts/bbb-remove-old-recordings
COPY --chown=bigbluebutton:bigbluebutton ./docker/cleanup.sh /cleanup.sh
RUN chmod +x /cleanup.sh

COPY --from=bbb-presentation-video-builder /bbb-presentation-video_*.deb /tmp/bbb-presentation-video.deb
RUN dpkg -i /tmp/bbb-presentation-video.deb && rm /tmp/bbb-presentation-video.deb

COPY --chown=bigbluebutton:bigbluebutton ./docker/bbb-web.properties /etc/bigbluebutton/bbb-web.properties.tmpl
COPY --chown=bigbluebutton:bigbluebutton ./docker/recording.yml /etc/bigbluebutton/recording/recording.yml.tmpl
COPY --chown=bigbluebutton:bigbluebutton ./docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER bigbluebutton

WORKDIR /usr/local/bigbluebutton/core/scripts

ENTRYPOINT ["/entrypoint.sh"]
CMD ["rasque_workers"]
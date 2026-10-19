# Sample image for docker/tests/uid/check.sh: a minimal service on the Java base that follows
# the UID/GID convention (docker/README.md). Build with BROKEN=1 for a sample that breaks it
# three times: its render directory and its volume mount point are root-owned 0755, and its
# entrypoint writes to $HOME.
#
#   podman build --build-context java-base=docker-image://localhost/bbb-java-base:local \
#       [--build-arg BROKEN=1] docker/tests/uid/sample
# DL3006: java-base is a named build context (pinned by its own Dockerfile), not a registry tag.
# hadolint ignore=DL3006
FROM java-base

ARG BROKEN=0
# The entrypoint renders into /etc/bigbluebutton at runtime, and /var/bigbluebutton is a volume
# mount point: create both writable for any UID (sticky, like /tmp), unless this is the broken
# sample.
RUN if [ "$BROKEN" = 1 ]; then mode=0755; else mode=1777; fi \
    && install -d -m "$mode" /etc/bigbluebutton /var/bigbluebutton
ENV BBB_UID_SAMPLE_BROKEN=$BROKEN

COPY --chmod=0755 entrypoint.sh /entrypoint.sh
USER 998:998
ENTRYPOINT ["/entrypoint.sh"]
CMD ["java", "-version"]

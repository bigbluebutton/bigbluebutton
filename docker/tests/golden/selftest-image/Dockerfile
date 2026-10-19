# Protected fixture for test-golden.sh: a tiny image whose entrypoint follows the
# project pattern (docker/lib/entrypoint-lib.sh), so the golden-file runner can be tested before
# any real image exists. Build context: the docker/ directory.
# ubuntu:24.04
FROM docker.io/library/ubuntu@sha256:534baea6a22c03a63003dbc8dbe78fe34bc0d7e595d9a9dc9834884ff530eb55
RUN apt-get update \
    && apt-get install -y --no-install-recommends gettext-base \
    && rm -rf /var/lib/apt/lists/*
COPY lib/entrypoint-lib.sh /usr/local/lib/bbb/entrypoint-lib.sh
COPY tests/golden/selftest-image/app.conf.tmpl /usr/local/share/selftest/app.conf.tmpl
COPY tests/golden/selftest-image/app.yaml.tmpl /usr/local/share/selftest/app.yaml.tmpl
COPY tests/golden/selftest-image/app.properties.tmpl /usr/local/share/selftest/app.properties.tmpl
COPY tests/golden/selftest-image/entrypoint.sh /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

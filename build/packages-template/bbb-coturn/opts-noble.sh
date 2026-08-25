#!/bin/bash

. ./opts-global.sh

# fpm's dir source does not compute shared library dependencies, so they are
# listed by hand (same as bbb-freeswitch-core). These match coturn's link line
# once the database backends are disabled in build.sh.
OPTS="$OPTS -t deb -d libssl3t64 -d libevent-core-2.1-7t64 -d libevent-extra-2.1-7t64 -d libevent-openssl-2.1-7t64 -d libevent-pthreads-2.1-7t64 -d libsystemd0"

#!/usr/bin/env bash
# Entrypoint of the golden-file selftest image (protected fixture).
set -euo pipefail
# shellcheck source=/dev/null
. /usr/local/lib/bbb/entrypoint-lib.sh
bbb_init "$@"
bbb_require BBB_DOMAIN
bbb_default SELFTEST_WORKERS 4
dest="$(bbb_path /etc/selftest/app.conf)"
bbb_render /usr/local/share/selftest/app.conf.tmpl "$dest"
if [ "${SELFTEST_FORMATS:-}" = 1 ]; then
    # Extra formats for the expectations tests; off by default so the golden-file cases are unchanged.
    bbb_require BBB_SHARED_SECRET
    bbb_render /usr/local/share/selftest/app.yaml.tmpl "$(bbb_path /etc/selftest/app.yaml)"
    bbb_render /usr/local/share/selftest/app.properties.tmpl "$(bbb_path /etc/selftest/app.properties)"
fi
if [ "${SELFTEST_RANDOM:-}" = 1 ]; then
    # Deliberately non-deterministic output, for the runner's determinism check.
    rnd="$(bbb_path /etc/selftest/random.txt)"
    mkdir -p "$(dirname "$rnd")"
    printf '%s%s\n' "$RANDOM" "$RANDOM" >"$rnd"
fi
bbb_exec sleep infinity

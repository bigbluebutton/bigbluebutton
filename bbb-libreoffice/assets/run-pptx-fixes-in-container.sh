#!/bin/sh
set -eu

pipeName="bbb_uno_$$"
profileDir="/tmp/lo-profile-$$"
logFile="/tmp/soffice-$$.log"
sofficePid=""

cleanup() {
  if [ -n "${sofficePid}" ]; then
    kill "${sofficePid}" 2>/dev/null || true
    wait "${sofficePid}" 2>/dev/null || true
  fi

  rm -rf "${profileDir}"
  rm -f "${logFile}"
}

trap cleanup EXIT
trap 'exit 124' HUP INT TERM

mkdir -p "${profileDir}"

/usr/bin/soffice \
  "-env:UserInstallation=file://${profileDir}" \
  --headless \
  --nologo \
  --nodefault \
  --nofirststartwizard \
  --norestore \
  "--accept=pipe,name=${pipeName};urp;StarOffice.ComponentContext" \
  >"${logFile}" 2>&1 &

sofficePid=$!

if ! /opt/libreoffice25.8/program/python \
    /data/convert_pptx_with_bullet_and_autofit_fixes.py \
    "${pipeName}" \
#    --skip-bullet-normalization \
#    --skip-asian-western-spacing-fix \
#    --skip-autofit-relayout \
    /data/file.pptx \
    /data/file.pdf; then
  cat "${logFile}" >&2 || true
  exit 1
fi

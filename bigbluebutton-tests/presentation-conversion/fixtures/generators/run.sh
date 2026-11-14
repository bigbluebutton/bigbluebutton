#!/usr/bin/env bash
# Regenerate the synthetic presentation-conversion fixtures inside a pinned container.
#   run.sh           rewrite fixtures/synthetic/ (fixture files and manifests)
#   run.sh --check   generate into a temporary directory and compare sha256 with fixtures/synthetic/
# Needs only docker. The image tag is a hash of Dockerfile, requirements.txt and *.py.
set -euo pipefail

GEN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SYN_DIR="$(cd "$GEN_DIR/../synthetic" && pwd)"

mode=generate
case "${1:-}" in
  "") ;;
  --check) mode=check ;;
  -h | --help) sed -n '2,5p' "${BASH_SOURCE[0]}"; exit 0 ;;
  *) echo "usage: $0 [--check]" >&2; exit 2 ;;
esac

command -v docker >/dev/null || { echo "docker is required" >&2; exit 2; }

cd "$GEN_DIR"
mapfile -t inputs < <(printf '%s\n' Dockerfile requirements.txt *.py | LC_ALL=C sort)
tag="$(sha256sum -- "${inputs[@]}" | sha256sum | cut -c1-12)"
image="pcf-generators:$tag"

if ! docker image inspect "$image" >/dev/null 2>&1; then
  echo "building $image" >&2
  docker build --quiet --tag "$image" "$GEN_DIR" >/dev/null
fi

tmp="$(mktemp -d "${TMPDIR:-/tmp}/pcf-fixtures.XXXXXX")"
trap 'rm -rf -- "$tmp"' EXIT
mkdir "$tmp/out"

docker run --rm --network none --user "$(id -u):$(id -g)" -e HOME=/tmp \
  --volume "$tmp/out:/out" "$image" python /gen/make_fixtures.py /out >"$tmp/log"

# name -> sha256 for the regular, non-hidden files of a directory
hashes() {
  (cd "$1" && find . -maxdepth 1 -type f ! -name '.*' -printf '%f\n' | LC_ALL=C sort |
    xargs -r -d '\n' sha256sum --)
}

if [ "$mode" = check ]; then
  declare -A new=() old=()
  while read -r h f; do new[$f]=$h; done < <(hashes "$tmp/out")
  while read -r h f; do old[$f]=$h; done < <(hashes "$SYN_DIR")
  drift=0
  while read -r f; do
    if [ -z "${old[$f]+x}" ]; then
      echo "missing  $f (generated, not in synthetic/)"; drift=1
    elif [ -z "${new[$f]+x}" ]; then
      echo "extra    $f (in synthetic/, no longer generated)"; drift=1
    elif [ "${old[$f]}" != "${new[$f]}" ]; then
      echo "changed  $f"; drift=1
    fi
  done < <(printf '%s\n' "${!new[@]}" "${!old[@]}" | LC_ALL=C sort -u)
  if [ "$drift" -ne 0 ]; then
    echo "FAIL: fixtures/synthetic/ differs from what $image generates; run $0 and commit the result" >&2
    exit 1
  fi
  echo "PASS: ${#new[@]} files in fixtures/synthetic/ match $image byte for byte"
  exit 0
fi

cp -- "$tmp/out/"* "$SYN_DIR/"
while read -r f; do
  [ -e "$tmp/out/$f" ] || { rm -f -- "$SYN_DIR/$f"; echo "removed  $f"; }
done < <(find "$SYN_DIR" -maxdepth 1 -type f ! -name '.*' -printf '%f\n')
tail -n 1 "$tmp/log"
echo "wrote fixtures/synthetic/ with $image"

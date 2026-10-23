#!/usr/bin/env bash
# Produce dist/ (minified + Safari 14/15 unminified twin) for packaging, Docker, or deploy.
# Callers own `npm ci`. Set CLIENT_BUILD to stamp settings.yml and ?v=VERSION.
set -euo pipefail

cd "$(dirname "$0")"

sed_inplace() {
  local expr=$1
  shift
  if sed --version >/dev/null 2>&1; then
    sed -i "$expr" "$@"
  else
    sed -i '' "$expr" "$@"
  fi
}

rm -rf dist

if [ -n "${CLIENT_BUILD:-}" ] && [ -f private/config/settings.yml ]; then
  sed_inplace "s/HTML5_CLIENT_VERSION/${CLIENT_BUILD}/g" private/config/settings.yml
fi

# Safari twin first; build-dual keeps emptyOutDir false so it survives.
npm run build-safari
npm run build-dual

# Align safari twin with the hashed default name (boot.js derives .safari.js from the entry).
# Vite/Rolldown hashes are not hex-only (e.g. bundle.D4bPxve0oreB5lRJWtyb.js).
cd dist
HASH="$(ls -1 bundle.*.js 2>/dev/null | grep -v '\.safari\.js$' | head -n 1 | sed -E 's/^bundle\.([^.]+)\.js$/\1/' || true)"
if [ -z "${HASH:-}" ]; then
  echo "Bundle hash not found." >&2
  exit 1
fi
shopt -s nullglob
for FILE in *.safari.js *.safari.js.map *.safari.js.gz *.safari.js.map.gz; do
  [[ "$FILE" == *".$HASH."* ]] && continue
  PREFIX="${FILE%%.safari.js*}"
  SUFFIX="${FILE#*.safari.js}"
  mv -- "$FILE" "${PREFIX}.${HASH}.safari.js${SUFFIX}"
done
shopt -u nullglob
cd ..

if [ -n "${CLIENT_BUILD:-}" ]; then
  [ -f dist/index.html ] && sed_inplace "s/?v=VERSION/?v=${CLIENT_BUILD}/g" dist/index.html
  [ -f dist/stylesheets/fonts.css ] && sed_inplace "s/?v=VERSION/?v=${CLIENT_BUILD}/g" dist/stylesheets/fonts.css
  # The build compressed both files before the replacement; nginx serves the .gz
  for FILE in dist/index.html dist/stylesheets/fonts.css; do
    if [ -f "$FILE.gz" ]; then gzip -9 -kf "$FILE"; fi
  done
  if grep -q 'v=VERSION' dist/index.html || gzip -dc dist/index.html.gz | grep -q 'v=VERSION'; then
    echo "Unreplaced v=VERSION in dist/index.html" >&2
    exit 1
  fi
fi

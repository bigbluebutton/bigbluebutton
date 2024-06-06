#!/bin/bash -xe

cd "$(dirname "$0")/.."

# get the list of stuff that needs to be downloaded from
# .gitlab-ci.yml, so we don't need to maintain it in two places.
DEPENDENCIES=$(python3 -c 'import yaml; print(" ".join(yaml.load(open(".gitlab-ci.yml"), Loader=yaml.SafeLoader)["get_external_dependencies"]["artifacts"]["paths"]))')

for DEPENDENCY in $DEPENDENCIES; do
    DOWNLOAD_COMMAND_FILE="${DEPENDENCY}.placeholder.sh"
    echo "getting component ${DOWNLOAD_COMMAND_FILE}..."
    bash -xe "$DOWNLOAD_COMMAND_FILE" &
done

wait

set +x

echo "downloaded external dependencies:"
for DEPENDENCY in $DEPENDENCIES; do
    du --summarize -h "$DEPENDENCY"
done

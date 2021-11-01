#!/bin/bash -xe

# This script uploads the packages to the CI repo server. Its counterpart
# on the server end is ci-repo-upload/cgi-bin/incoming.py. The variable
# ADDITIONAL_PACKAGE_FILES contains a comma-separated list of the package
# files that the change detection decided to re-use for this build, since
# the contents have not changed since that commit.

ADDITIONAL_PACKAGE_FILES="$(awk '{print $2}' < packages_to_skip.txt | tr '\n' ',' | sed 's/,*$//')"

curl \
    $(for file in artifacts/*.deb; do echo -n "-F pkgs[]=@${file} " ; done) \
    -F "branch=${CI_COMMIT_BRANCH}" \
    -F "additional_package_files=${ADDITIONAL_PACKAGE_FILES}" \
    -F "gpg_passphrase=${GPG_PASSPHRASE}" \
    -u "${PACKAGES_UPLOAD_AUTHENTICATION}" \
    "${PACKAGES_UPLOAD_BASE_URL}/cgi-bin/incoming.py"

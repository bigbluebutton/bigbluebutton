#!/bin/bash -e

# This script checks which recent commits have not changed a
# particular package and asks the repo server whether it has
# a build of any of those versions (done for all packages).
#
# Alternately, if called with a --github-json switch, will output a
# JSON list suitable to be passed to github's cache action.
#
# In either case, the bigbluebutton package is not cached.

cd "$(dirname $0)"
source package-names.inc.sh
cd ..

REQ_JSON=""
GITHUB_JSON="[]"

for DEBNAME in "${!DEBNAME_TO_SOURCEDIR[@]}"
do
	if [ "$DEBNAME" == bigbluebutton ] ; then
		# always rebuild the meta package
		continue
	fi
	#echo "package $DEBNAME"
	SOURCEDIR="${DEBNAME_TO_SOURCEDIR[$DEBNAME]}"
	if [ "$SOURCEDIR" == "do_not_copy_anything" ] ; then
		SOURCEDIR=""
	fi
	LAST_CHANGE="$(git log -n1 --format=format:%H -- ${SOURCEDIR} "build/packages-template/$DEBNAME" "$DEBNAME.placeholder.sh" .gitlab-ci.yml build/*.sh)"
	VALID_PACKAGE_VERSIONS="$(git log --format=%H "${LAST_CHANGE}^..HEAD")"
	VALID_PACKAGE_VERSIONS="$(for HASH in $VALID_PACKAGE_VERSIONS; do echo -n "${HASH::10} "; done)"
	VALID_PACKAGE_VERSIONS="${VALID_PACKAGE_VERSIONS::-1}"
	REQ_JSON="${REQ_JSON} \"$DEBNAME\": [\"${VALID_PACKAGE_VERSIONS//$' '/\",\"}\"],"
	GITHUB_JSON=$(echo ${GITHUB_JSON} | jq ". + [{id: \"$DEBNAME\", key: \"$LAST_CHANGE\", path: \"artifacts/${DEBNAME}_*\"}]")
	if [ "$1" == "--debug" ]; then
	    echo package $DEBNAME
	    echo LAST_CHANGE $LAST_CHANGE
	fi
done

if [ "$1" == "--debug" ]; then
    git log -n 5 --stat
    exit
fi

REQ_JSON="{${REQ_JSON:1:-1}}"

if [ "$1" == "--github-json" ]; then
    echo $GITHUB_JSON | jq --compact-output .
    exit
fi

curl \
    -u "${PACKAGES_UPLOAD_AUTHENTICATION}" \
	-X POST \
	--data "$REQ_JSON" \
    "${PACKAGES_UPLOAD_BASE_URL}/cgi-bin/get_compatible_packages.py" \
	> packages_to_skip.txt

echo "We will re-use the following packages:"
cat packages_to_skip.txt

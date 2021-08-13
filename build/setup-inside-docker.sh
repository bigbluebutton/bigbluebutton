#!/bin/bash -ex

if [ "$LOCAL_BUILD" != 1 ] ; then
    echo "we are building in CI, check whether this package is marked as skippable"
    EXISTING_VERSION="$(grep "$1 " packages_to_skip.txt || (( $? == 1 )))"
    if [ -n "$EXISTING_VERSION" ]; then
        echo "Package $1 can be reused from a previous build"
        echo "$EXISTING_VERSION"
        exit 0
    fi
else
    echo "we are building locally, don't check packages_to_skip.txt (LOCAL_BUILD=1)"
fi

BUILD_DIR="$PWD"

cd "$(dirname "$0")"
source package-names.inc.sh

# source is in the parent directory of the 'build' dir
SOURCE=$(dirname $PWD)

# use persistent cache dirs
for dir in .gradle .grails .ivy2 .m2; do
    mkdir -p "${SOURCE}/cache/${dir}"
    ln -s "${SOURCE}/cache/${dir}" "/root/${dir}"
done

if [ "$LOCAL_BUILD" != 1 ] ; then
    GIT_REV="${CI_COMMIT_SHA:0:10}"
else
    GIT_REV=$(git rev-parse HEAD)
    GIT_REV="local-build-${GIT_REV:0:10}"
fi
VERSION_NUMBER="$(cat "$SOURCE/bigbluebutton-config/bigbluebutton-release" | cut -d '=' -f2 | cut -d "-" -f1)"
# this contains stuff like alpha4 etc
VERSION_ADDON="$(cat "$SOURCE/bigbluebutton-config/bigbluebutton-release" | cut -d '=' -f2 | cut -d "-" -f2)"
COMMIT_DATE="$(git log -n1 --pretty='format:%cd' --date=format:'%Y%m%dT%H%M%S')"
BUILD_NUMBER=${BUILD_NUMBER:=1}
EPOCH=${EPOCH:=2}

if [[ $BUILD_TYPE == 'release' ]]; then
    # release build package version will be something like
    # 2:2.3.0-1 for epoch 2, BBB Version 2.3.0 and build number 1
    VERSION="${VERSION_NUMBER}"
else
    # devel builds
    # 2:2.3.0~alpha4+20210729T022518-git.abcdef
    VERSION="${VERSION_NUMBER}~${VERSION_ADDON}+${COMMIT_DATE}-git.${GIT_REV}"
fi

DISTRO=bionic
CACHE_DIR="/root/"
mkdir -p "$CACHE_DIR"

build_package() {
    PACKAGE="$1"
    PACKAGE_SOURCEDIR=${DEBNAME_TO_SOURCEDIR[$PACKAGE]:=$PACKAGE}

    TARGET="${PACKAGE}_${VERSION}_${DISTRO}"

    TMP=/tmp/build
    rm -rf "$TMP/$TARGET"
    mkdir -p "$TMP/$TARGET"
    
    # copy the stuff in packages-template over
    cp -a "./packages-template/${PACKAGE}/." "$TMP/$TARGET/";

    # some packages do not need source files from the repo (e.g. the bigbluebutton meta-package)
    if [[ "$PACKAGE_SOURCEDIR" != "do_not_copy_anything" ]] ; then
        # some packages have multiple source dirs, in this case, copy all of them
        # to the build directory
        if [[ "$PACKAGE_SOURCEDIR" = *' '* ]]; then
            for ITEM in $PACKAGE_SOURCEDIR; do
                cp -a "${SOURCE}/${ITEM}" "${TMP}/${TARGET}/"
            done
        else
            # for packages with only one source directory, copy that directory's contents
            # directly into the build dir
            cp -a "${SOURCE}/${PACKAGE_SOURCEDIR}/." "${TMP}/${TARGET}/"
        fi
    fi

    # global fpm options for all packages
    cp opts-global.sh "$TMP/$TARGET"

    # prepend deb-helper.sh to all pre/post-install/remove scripts
    for file in before-install.sh after-install.sh after-remove.sh before-remove.sh; do
        if [ -f "./packages-template/$PACKAGE/$file" ] ; then
            cat deb-helper.sh "./packages-template/$PACKAGE/$file" > "$TMP/$TARGET/$file"
        fi
    done

    echo "list all files in build directory: -------------------------"
    ls -al "$TMP/$TARGET"

    pushd "$TMP/$TARGET"
    echo "starting build.sh: -----------------------------------------"
    VERSION="$VERSION" EPOCH="$EPOCH" ./build.sh $BUILD_NUMBER
    popd
}

mkdir -p "${BUILD_DIR}/artifacts"
build_package "$1"
cp "$TMP"/"$TARGET"/*.deb "${BUILD_DIR}/artifacts/"

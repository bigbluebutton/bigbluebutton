#!/bin/bash -ex

PACKAGE_TO_BUILD="$1"
if [ -z "$PACKAGE_TO_BUILD" ]; then
    set +x
    echo "please provide a package name as first parameter, e.g."
    echo "build/setup.sh bbb-freeswitch-core"
    exit 1
fi

cd "$(dirname "$0")"
cd ..

mkdir -p artifacts

DOCKER_IMAGE=$(python3 -c 'import yaml; print(yaml.load(open("./.gitlab-ci.yml"), Loader=yaml.SafeLoader)["default"]["image"])')

LOCAL_BUILD=1
if [ "$LOCAL_BUILD" != 1 ] ; then
    GIT_REV="${CI_COMMIT_SHA:0:10}"
else
    GIT_REV=$(git rev-parse HEAD)
    GIT_REV="local-build-${GIT_REV:0:10}"
fi
COMMIT_DATE="$(git log -n1 --pretty='format:%cd' --date=format:'%Y%m%dT%H%M%S')"

# Arrange to write the docker container ID to a temp file, then run
# the container detached and immediately attach it (without stdin) so
# we can catch CTRL-C in this script and kill the container if so.

DOCKER_CONTAINER_ID_FILE=$(mktemp)
rm $DOCKER_CONTAINER_ID_FILE

kill_docker() {
   if [[ -r $DOCKER_CONTAINER_ID_FILE ]]; then
      sudo docker kill $(cat $DOCKER_CONTAINER_ID_FILE)
      sudo rm $DOCKER_CONTAINER_ID_FILE
   fi
   tput cnorm
   exit 1
}

trap 'kill_docker' SIGINT SIGTERM

# -v "$CACHE_DIR/dev":/root/dev
sudo docker run --rm --detach --cidfile $DOCKER_CONTAINER_ID_FILE \
        --env GIT_REV=$GIT_REV --env COMMIT_DATE=$COMMIT_DATE --env LOCAL_BUILD=$LOCAL_BUILD \
        --mount type=bind,src="$PWD",dst=/mnt \
        --mount type=bind,src="${PWD}/artifacts,dst=/artifacts" \
        -t "$DOCKER_IMAGE" /mnt/build/setup-inside-docker.sh "$PACKAGE_TO_BUILD"
        
#        -v "$CACHE_DIR/$DISTRO/.gradle:/root/.gradle" \
#        -v "$CACHE_DIR/$DISTRO/.grails:/root/.grails" \
#        -v "$CACHE_DIR/$DISTRO/.ivy2:/root/.ivy2" \
#        -v "$CACHE_DIR/$DISTRO/.m2:/root/.m2" \
#        -v "$TMP/$TARGET:$TMP/$TARGET"  \

docker attach --no-stdin $(cat $DOCKER_CONTAINER_ID_FILE)
sudo rm $DOCKER_CONTAINER_ID_FILE

find artifacts

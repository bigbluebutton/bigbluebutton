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

# -v "$CACHE_DIR/dev":/root/dev
sudo docker run --rm \
        -e "LOCAL_BUILD=1" \
        --mount type=bind,src="$PWD",dst=/mnt \
        --mount type=bind,src="${PWD}/artifacts,dst=/artifacts" \
        -t "$DOCKER_IMAGE" /mnt/build/setup-inside-docker.sh "$PACKAGE_TO_BUILD"
        
#        -v "$CACHE_DIR/$DISTRO/.gradle:/root/.gradle" \
#        -v "$CACHE_DIR/$DISTRO/.grails:/root/.grails" \
#        -v "$CACHE_DIR/$DISTRO/.ivy2:/root/.ivy2" \
#        -v "$CACHE_DIR/$DISTRO/.m2:/root/.m2" \
#        -v "$TMP/$TARGET:$TMP/$TARGET"  \

find artifacts
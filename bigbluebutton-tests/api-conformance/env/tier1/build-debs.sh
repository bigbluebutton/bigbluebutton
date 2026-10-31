#!/bin/sh
# Builds the debs the Tier 1 stack runs, with the packages' own build
# scripts (build/packages-template/<pkg>/build.sh) in the image CI builds
# them in, as build/setup.sh does. Unlike setup.sh it builds from a clean
# snapshot of the tree (tracked files only, with uncommitted changes to
# them), so nothing gitignored, such as a local application.conf, ends up
# in a package; it needs no sudo; and its output belongs to you.
#
#   build-debs.sh [package...]   default: all five
#   build-debs.sh --key           print a key for what the five build from:
#                                 the same key, the same debs (CI caches them)
#
# Environment: DEBS_DIR (default env/.state/debs), CACHE_DIR (default
# env/.state/cache), BUILD_IMAGE (default: the one .gitlab-ci.yml names).
set -eu

ALL="bbb-web bbb-apps-akka bbb-graphql-server bbb-graphql-middleware bbb-graphql-actions"
# What the five build from (build/package-names.inc.sh), the parts of build/
# their builds use, and the release file the version comes from.
SOURCES="build/setup-inside-docker.sh build/package-names.inc.sh build/opts-global.sh
	build/deb-helper.sh build/packages-template/bbb-web build/packages-template/bbb-apps-akka
	build/packages-template/bbb-graphql-server build/packages-template/bbb-graphql-middleware
	build/packages-template/bbb-graphql-actions bigbluebutton-config/bigbluebutton-release
	bigbluebutton-web bbb-common-web bbb-common-message akka-bbb-apps bbb-graphql-server
	bbb-graphql-middleware bbb-graphql-actions"
here=$(cd "$(dirname "$0")" && pwd)
env_dir=$(dirname "$here")
repo=$(git -C "$here" rev-parse --show-toplevel)
DEBS_DIR=${DEBS_DIR:-$env_dir/.state/debs}
CACHE_DIR=${CACHE_DIR:-$env_dir/.state/cache}

if [ -z "${BUILD_IMAGE:-}" ]; then
	BUILD_IMAGE=$(sed -n '/^default:/,/^[^ ]/s/^  image: *//p' "$repo/.gitlab-ci.yml" | head -n 1)
fi
[ -n "$BUILD_IMAGE" ] || { echo "build-debs: no default image in .gitlab-ci.yml" >&2; exit 1; }

# The snapshot: HEAD plus uncommitted changes to tracked files.
rev=$(git -C "$repo" stash create)
rev=${rev:-$(git -C "$repo" rev-parse HEAD)}

# The key: the snapshot's SOURCES, this script and the image. The inputs are
# gathered first, so that a failure fails the script rather than the hash.
inputs=$(
	for s in $SOURCES; do
		git -C "$repo" rev-parse "$rev:$s"
	done
	git -C "$repo" hash-object "$here/build-debs.sh"
)
key=$(printf '%s\n%s\n' "$inputs" "$BUILD_IMAGE" | sha256sum | cut -c1-16)
if [ "${1:-}" = --key ]; then
	echo "$key"
	exit 0
fi

packages=${*:-$ALL}
for p in $packages; do
	case " $ALL " in
	*" $p "*) ;;
	*) echo "build-debs: unknown package $p (known: $ALL)" >&2; exit 2 ;;
	esac
done
commit_date=$(git -C "$repo" log -n 1 --pretty=format:%cd --date=format:%Y%m%dT%H%M%S HEAD)
# Named after the key, so a deb's name says what it was built from (a stash
# commit's hash changes with every run). The date is HEAD's when it was built.
git_rev="conform-$key"

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
src="$work/src"
mkdir -p "$src" "$DEBS_DIR"
# shellcheck disable=SC2086 # SOURCES is a list
git -C "$repo" archive "$rev" $SOURCES | tar -x -C "$src"

for d in gradle grails ivy2 m2 sbt cache go npm; do
	mkdir -p "$CACHE_DIR/$d"
done
# The mount points inside the snapshot, made here so they aren't root's.
mkdir -p "$src/cache/.gradle" "$src/cache/.grails" "$src/cache/.ivy2" "$src/cache/.m2"

uid=$(id -u)
gid=$(id -g)
for p in $packages; do
	echo "build-debs: building $p from $git_rev in $BUILD_IMAGE"
	out="$work/out-$p"
	mkdir -p "$out"
	# setup-inside-docker.sh links the source's cache/ dirs into /root, so
	# those are mounted there; the other tool caches are mounted directly.
	docker run --rm \
		--env LOCAL_BUILD=1 --env GIT_REV="$git_rev" --env COMMIT_DATE="$commit_date" \
		--mount type=bind,src="$src",dst=/mnt \
		--mount type=bind,src="$out",dst=/artifacts \
		--mount type=bind,src="$CACHE_DIR/gradle",dst=/mnt/cache/.gradle \
		--mount type=bind,src="$CACHE_DIR/grails",dst=/mnt/cache/.grails \
		--mount type=bind,src="$CACHE_DIR/ivy2",dst=/mnt/cache/.ivy2 \
		--mount type=bind,src="$CACHE_DIR/m2",dst=/mnt/cache/.m2 \
		--mount type=bind,src="$CACHE_DIR/sbt",dst=/root/.sbt \
		--mount type=bind,src="$CACHE_DIR/cache",dst=/root/.cache \
		--mount type=bind,src="$CACHE_DIR/go",dst=/root/go \
		--mount type=bind,src="$CACHE_DIR/npm",dst=/root/.npm \
		--workdir / \
		"$BUILD_IMAGE" sh -c '
			status=0
			/mnt/build/setup-inside-docker.sh "$1" || status=$?
			# Hand everything the root build wrote back to the caller.
			chown -R "$2" /artifacts /mnt/cache /root/.sbt /root/.cache /root/go /root/.npm
			exit $status' sh "$p" "$uid:$gid"
	set -- "$out/${p}_"*.deb
	if [ "$#" -ne 1 ] || [ ! -f "$1" ]; then
		echo "build-debs: $p built $# debs, not one:" "$@" >&2
		exit 1
	fi
	rm -f "$DEBS_DIR/${p}_"*.deb
	# A colon (from an epoch) would trip docker's COPY globs.
	cp "$1" "$DEBS_DIR/$(basename "$1" | tr : _)"
done
echo "build-debs: debs in $DEBS_DIR:"
ls -l "$DEBS_DIR"

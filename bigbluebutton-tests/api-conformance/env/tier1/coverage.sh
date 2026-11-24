#!/bin/sh
# bbb-web's coverage on the Tier 1 stack: what JaCoCo's agent recorded while
# the suite ran (make -C env up COVERAGE=1). make coverage and
# coverage-clean run it under the profile switcher's lock.
#
#   coverage.sh report DIR   stop bbb-web, so the agent writes what it has;
#                            write jacoco.xml, jacoco.csv and html/ to DIR,
#                            from the classes that ran; start bbb-web again
#   coverage.sh clean        forget the coverage data
set -eu

here=$(cd "$(dirname "$0")" && pwd)
env_dir=$(dirname "$here")
repo=$(cd "$env_dir/../../.." && pwd)
compose="docker compose --progress quiet -f $env_dir/compose.yaml"
data=/var/bigbluebutton/coverage/bbb-web.exec

# running SERVICE: whether it runs. A query that fails stops the script:
# taken for "not running", clean would skip the stop that keeps the old
# data from being written back.
running() {
	ids=$($compose ps -q --status running "$1") || {
		echo "couldn't ask docker compose whether $1 is running" >&2
		exit 1
	}
	[ -n "$ids" ]
}

# oneoff USER ARGS...: runs sh with ARGS in a one-off container from
# bbb-web's image, with its volumes, without the agent.
oneoff() {
	user=$1
	shift
	$compose run --rm --no-deps -T -e JAVA_TOOL_OPTIONS= --user "$user" --entrypoint sh "$@"
}

# An interrupt runs the EXIT trap too, which dash otherwise skips.
trap 'exit 130' INT TERM

start_web() {
	$compose start bbb-web >/dev/null
	id=$($compose ps -q bbb-web)
	waited=0
	until [ "$(docker inspect -f '{{.State.Health.Status}}' "$id")" = healthy ]; do
		if [ "$waited" -ge 300 ]; then
			echo "bbb-web wasn't healthy within 300s of its start" >&2
			exit 1
		fi
		sleep 2
		waited=$((waited + 2))
	done
}

case ${1:-} in
report)
	out=${2:?usage: coverage.sh report DIR}
	if ! running bbb-web; then
		echo "bbb-web isn't running (make -C $env_dir up COVERAGE=1)" >&2
		exit 1
	fi
	mkdir -p "$out"
	out=$(cd "$out" && pwd)
	# A stop is graceful: the agent writes what it has as the JVM exits.
	# The trap comes first, so an interrupt during or right after the stop
	# still starts bbb-web again (start leaves a running one as it is).
	trap start_web EXIT
	$compose stop bbb-web >/dev/null
	log=$(mktemp)
	# The class files that ran, and the sources the HTML report links to.
	# The bbb-common-web jar's version changes with every build.
	# shellcheck disable=SC2016 # the container's shell expands these
	if ! oneoff "$(id -u):$(id -g)" \
		-v "$out:/out" \
		-v "$repo/bigbluebutton-web:/src/bigbluebutton-web:ro" \
		-v "$repo/bbb-common-web:/src/bbb-common-web:ro" \
		bbb-web -c '
			set -eu
			if [ ! -s '"$data"' ]; then
				echo "no coverage data: bring the stack up with COVERAGE=1 and run the suite" >&2
				exit 1
			fi
			lib=/usr/share/bbb-web/WEB-INF/lib
			set -- $lib/bbb-common-web-*.jar
			[ "$#" -eq 1 ] && [ -f "$1" ] || { echo "expected one bbb-common-web jar in $lib" >&2; exit 1; }
			rm -rf /out/html /out/jacoco.xml /out/jacoco.csv
			java -jar /opt/jacoco/jacococli.jar report '"$data"' --name bbb-web \
				--classfiles /usr/share/bbb-web/WEB-INF/classes --classfiles "$1" \
				--sourcefiles /src/bigbluebutton-web/grails-app/controllers \
				--sourcefiles /src/bigbluebutton-web/grails-app/services \
				--sourcefiles /src/bigbluebutton-web/grails-app/init \
				--sourcefiles /src/bigbluebutton-web/src/main/groovy \
				--sourcefiles /src/bbb-common-web/src/main/java \
				--sourcefiles /src/bbb-common-web/src/main/scala \
				--xml /out/jacoco.xml --csv /out/jacoco.csv --html /out/html' >"$log" 2>&1; then
		cat "$log" >&2
		rm -f "$log"
		exit 1
	fi
	# Data recorded by another build of bbb-web, e.g. before make up
	# rebuilt it, describes other classes.
	if grep -q 'does not match' "$log"; then
		cat "$log" >&2
		rm -f "$log"
		echo "the coverage data comes from another build of bbb-web: make -C $env_dir coverage-clean, then run the suite again" >&2
		exit 1
	fi
	rm -f "$log"
	echo "coverage report in $out (jacoco.xml, jacoco.csv, html/index.html)"
	;;
clean)
	if running bbb-web; then
		# So the agent doesn't write the old data back when bbb-web stops.
		trap start_web EXIT
		$compose stop bbb-web >/dev/null
	fi
	oneoff 0 bbb-web -c "rm -f $data"
	echo "coverage data cleared"
	;;
*)
	echo "usage: coverage.sh report DIR | clean" >&2
	exit 2
	;;
esac

#!/bin/bash -e

usage() {
    set +x
    cat 1>&2 <<HERE
BBB Health Check

OPTIONS:
  -t <test name: whiteboard/webcam/virtualizedlist/user/trigger/sharednotes/screenshare/presentation/polling/notifications/customparameters/chat/breakout/audio/all>

  -u Print usage
HERE

}

err() {
	echo "----";
	echo ERROR: $@
	echo "----";
}

main() {
  export DEBIAN_FRONTEND=noninteractive

  while builtin getopts "ut:" opt "${@}"; do

    case $opt in
      t)
	TEST=$OPTARG
	;;

      u)
        usage
        exit 0
        ;;

      :)
        err "Missing option argument for -$OPTARG"
        exit 1
        ;;

      \?)
        err "Invalid option: -$OPTARG" >&2
        usage
        ;;
    esac
  done

  if [ -z "$TEST" ]; then
    err "No test provided";
    usage
    exit 1
  fi

echo "Test is starting in 5 seconds..." && sleep 5;echo $Test " Test has started."
echo $PWD
env $(cat .env | xargs)  jest $TEST.test.js --color --detectOpenHandles --forceExit
}


main "$@" || exit 1


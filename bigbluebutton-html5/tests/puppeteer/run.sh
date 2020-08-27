#!/bin/bash -e

usage() {
    set +x
    cat 1>&2 <<HERE
BBB Health Check

OPTIONS:
  -t <test name: whiteboard/webcam/virtualizedlist/user/sharednotes/screenshare/presentation/notifications/customparameters/chat/breakout/audio/all>
  -h <hostname name of BigBlueButton server>
  -s <Shared secret>

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

  while builtin getopts "uh:s:t:" opt "${@}"; do

    case $opt in
      t)
	TEST=$OPTARG
	;;

      h)
        HOST=$OPTARG
        ;;

      s)
        SECRET=$OPTARG
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

  if [ -z "$HOST" ]; then
    err "No host provided";
    usage
    exit 1
  fi

  if [ -z "$SECRET" ]; then
    err "No scret provided";
    usage
    exit 1
  fi

  IS_AUDIO_TEST=false

  if [ "$TEST" = "audio" ]; then
	IS_AUDIO_TEST=true;
  fi;

env $(cat tests/puppeteer/.env | xargs)  jest $TEST.test.js --color --detectOpenHandles
}


main "$@" || exit 1


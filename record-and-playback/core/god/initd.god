#!/bin/bash
#
# Record and Playback God init.d script
#    http://god.rubyforge.org/
#
### BEGIN INIT INFO
# Provides:             bbb-record-core
# Required-Start:       $syslog
# Required-Stop:        $syslog
# Should-Start:         $local_fs
# Should-Stop:          $local_fs
# Default-Start:        2 3 4 5
# Default-Stop:         0 1 6
# Short-Description:    bbb-record-core - BigBlueButton Record and Playback core
# Description:          bbb-record-core - BigBlueButton Record and Playback core
### END INIT INFO

set -e

RETVAL=0

case "$1" in
    start)
      god -c /etc/bigbluebutton/god/god.rb -P /var/run/god.pid -l /var/log/god.log
      RETVAL=$?
      echo "God started"
  ;;
    stop)
      kill `cat /var/run/god.pid`
      RETVAL=$?
      echo "God stopped"
  ;;
    restart)
      kill `cat /var/run/god.pid`
      god -c /etc/bigbluebutton/god/god.rb -P /var/run/god.pid -l /var/log/god.log
      RETVAL=$?
      echo "God restarted"
  ;;
    status)
      RETVAL=$?
  ;;
    *)
      echo "Usage: god {start|stop|restart|status}"
      exit 1
  ;;
esac

exit $RETVAL


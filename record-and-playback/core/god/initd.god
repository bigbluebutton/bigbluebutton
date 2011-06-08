#!/bin/bash
#
# BigBlueButton God init.d script
#

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


#!/bin/bash
#
# BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
#
# Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
#
# This program is free software; you can redistribute it and/or modify it under the
# terms of the GNU Lesser General Public License as published by the Free Software
# Foundation; either version 3.0 of the License, or (at your option) any later
# version.
#
# BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
# PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License along
# with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
#
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


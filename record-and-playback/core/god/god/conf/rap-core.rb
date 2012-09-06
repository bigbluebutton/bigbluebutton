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


# NOTE:
# Copy into /etc/bigbluebutton/god/conf
#    sudo cp rap-god-conf.rb /etc/bigbluebutton/god/conf/rap-conf.rb
#
# Monitors the BigBlueButton archive, ingesting, processing, publishing process
God.watch do |w|
	# The name of the watcher 
	w.name = "bbb-rap-proc"

	# The default time for reporting the state of the monitored process
	w.interval = 1.minute

	# Start the process
	w.start = "sudo -u tomcat6 ruby rap-worker.rb"

	# Start your process in this directory
	w.dir = "/usr/local/bigbluebutton/core/scripts/"

	# Time to wait before monitoring, after starting the process
	w.start_grace = 30.seconds

	# Cleans the pid file before starting the process. 
	# god will daemonizes the process
	w.behavior(:clean_pid_file)


	# Start the process if it is not running
	# And report its status every 30 seconds
	# In other words god revives the process every time it dies
	w.start_if do |start|
		start.condition(:process_running) do |c|
			c.interval = 30.seconds
			c.running = false
		end
	end
end


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


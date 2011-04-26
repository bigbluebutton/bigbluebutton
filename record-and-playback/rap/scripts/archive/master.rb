require 'logger'
require '../lib/recordandplayback'
require 'trollop'
require 'yaml'

logger = Logger.new('/var/log/bigbluebutton/archive.log', 'daily' )
BigBlueButton.logger = logger

opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :default => '58f4a6b3-cd07-444d-8564-59116cb53974', :type => String
end

meeting_id = opts[:meeting_id]

# TODO:
# 1. Check if meeting-id has corresponding dir in /var/bigbluebutton/archive
# 2. If yest, return
# 3. If not, archive the recording
# 4. Add entry in /var/bigbluebutton/status/archived/<meeting-id>.done file


# Execute all the scripts under the steps directory.
# This script must be invoked from the scripts directory for the PATH to be resolved.
Dir.glob("#{Dir.pwd}/archive/steps/*.rb").sort.each do |file|
  BigBlueButton.logger.info("Executing #{file}\n")  
  IO.popen("ruby #{file} -m #{meeting_id}")
  Process.wait
  #puts "********** #{$?.exitstatus} #{$?.exited?} #{$?.success?}********************"
end

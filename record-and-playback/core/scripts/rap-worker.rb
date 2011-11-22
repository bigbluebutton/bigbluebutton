require '../lib/recordandplayback'
require 'rubygems'
require 'yaml'
require 'fileutils'

logger = Logger.new("/var/log/bigbluebutton/bbb-rap-worker.log",'daily' )
logger.level = Logger::ERROR
BigBlueButton.logger = logger

def archive_recorded_meeting()
  `ruby archive/archive.rb`
end

def process_archived_meeting(recording_dir)
  done_files = Dir.glob("#{recording_dir}/status/archived/*.done")	
  done_files.each do |df|
    match = /(.*).done/.match df.sub(/.+\//, "")
    meeting_id = match[1]
    
    # Execute all the scripts under the steps directory.
    # This script must be invoked from the scripts directory for the PATH to be resolved.
    Dir.glob("#{Dir.pwd}/process/*.rb").sort.each do |file|
      #  BigBlueButton.logger.info("Executing #{file}\n")  
	#IO.popen("ruby #{file} -m #{meeting_id}")
	#Process.wait
	#puts "********** #{$?.exitstatus} #{$?.exited?} #{$?.success?}********************"
      command = "ruby #{file} -m #{meeting_id}"
      BigBlueButton.execute(command)

    end
  end	
end

def publish_processed_meeting(recording_dir)
  done_files = Dir.glob("#{recording_dir}/status/processed/*.done")
  
  done_files.each do |df|
    match = /(.*).done/.match df.sub(/.+\//, "")
    meeting_id = match[1]
    
    # Execute all the scripts under the steps directory.
    # This script must be invoked from the scripts directory for the PATH to be resolved.
    Dir.glob("#{Dir.pwd}/publish/*.rb").sort.each do |file|
      #  BigBlueButton.logger.info("Executing #{file}\n")  
      #IO.popen("ruby #{file} -m #{meeting_id}")
      #Process.wait
      #puts "********** #{$?.exitstatus} #{$?.exited?} #{$?.success?}********************"
      command = "ruby #{file} -m #{meeting_id}"
      BigBlueButton.execute(command)

    end
  end	
end

props = YAML::load(File.open('bigbluebutton.yml'))
recording_dir = props['recording_dir']
archive_recorded_meeting()
process_archived_meeting(recording_dir)
publish_processed_meeting(recording_dir)


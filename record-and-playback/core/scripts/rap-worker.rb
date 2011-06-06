require '../lib/recordandplayback'
require 'rubygems'
require 'yaml'
require 'fileutils'


def archive_recorded_meeting()
	`sudo -u tomcat6 ruby archive/archive.rb`
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
		  IO.popen("sudo -u tomcat6 ruby #{file} -m #{meeting_id}")
		  Process.wait
		  puts "********** #{$?.exitstatus} #{$?.exited?} #{$?.success?}********************"
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
		  IO.popen("sudo -u tomcat6 ruby #{file} -m #{meeting_id}")
		  Process.wait
		  puts "********** #{$?.exitstatus} #{$?.exited?} #{$?.success?}********************"
		end
	end	
end

#  if not FileTest.directory?("#{archive_dir}/#{meeting_id}")
#    puts "#{archive_dir}/#{meeting_id} does not exist."
#    
#  else
#    puts "#{archive_dir}/#{meeting_id} exists."
#    `ruby process/simple.rb -m #{meeting_id}`
#    `ruby publish/simple.rb -m #{meeting_id}`
#  end  
  


# TODO:
# 1. Check if meeting-id has corresponding dir in /var/bigbluebutton/archive
# 2. If yest, return
# 3. If not, archive the recording
# 4. Add entry in /var/bigbluebutton/status/archived/<meeting-id>.done file


# Execute all the scripts under the steps directory.
# This script must be invoked from the scripts directory for the PATH to be resolved.
#Dir.glob("#{Dir.pwd}/archive/steps/*.rb").sort.each do |file|
#  BigBlueButton.logger.info("Executing #{file}\n")  
#  IO.popen("ruby #{file} -m #{meeting_id}")
#  Process.wait
  #puts "********** #{$?.exitstatus} #{$?.exited?} #{$?.success?}********************"
#end



props = YAML::load(File.open('bigbluebutton.yml'))
recording_dir = props['recording_dir']
archive_recorded_meeting()
process_archived_meeting(recording_dir)



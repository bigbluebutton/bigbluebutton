# Set encoding to utf-8
# encoding: UTF-8

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

require '../lib/recordandplayback'
require 'rubygems'
require 'yaml'
require 'fileutils'

logger = Logger.new("/var/log/bigbluebutton/bbb-rap-worker.log",'daily' )
logger.level = Logger::ERROR
BigBlueButton.logger = logger

def archive_recorded_meeting(recording_dir)
  recorded_done_files = Dir.glob("#{recording_dir}/status/recorded/*.done")
  archived_dirs = Dir.entries("#{recording_dir}/raw/") - ['.','..']
  
  recorded_done_files.each do |df|
	match = /(.*).done/.match df.sub(/.+\//, "")
	meeting_id = match[1]
	
	is_archived = archived_dirs.any? { |s| s.include?(meeting_id)  }

	if(!is_archived)
		command = "ruby archive/archive.rb -m #{meeting_id}"
	    BigBlueButton.execute(command)
	end
  end
  
end

def sanity_archived_meeting(recording_dir)
  archived_done_files = Dir.glob("#{recording_dir}/status/archived/*.done")
  sanity_done_files = Dir.glob("#{recording_dir}/status/sanity/*.done")
  sanity_failed_files = Dir.glob("#{recording_dir}/status/sanity/*.fail")

  archived_done_files.each do |df|
        match = /(.*).done/.match df.sub(/.+\//, "")
        meeting_id = match[1]

	has_failed = sanity_failed_files.any? { |s| s.include?(meeting_id)  }
	if(has_failed)
		BigBlueButton.logger.info("it has failed sanity check... skipping meeting: #{meeting_id}")
		next
	end

        is_sanity_check_completed = sanity_done_files.any? { |s| s.include?(meeting_id)  }
        if(!is_sanity_check_completed)
                command = "ruby sanity/sanity.rb -m #{meeting_id}"
            BigBlueButton.execute(command)
        end
  end

end

def process_archived_meeting(recording_dir)
  sanity_done_files = Dir.glob("#{recording_dir}/status/sanity/*.done")
  
  sanity_done_files.each do |df|
    match = /(.*).done/.match df.sub(/.+\//, "")
    meeting_id = match[1]
    
	# Execute all the scripts under the steps directory.
	# This script must be invoked from the scripts directory for the PATH to be resolved.
	Dir.glob("#{Dir.pwd}/process/*.rb").sort.each do |file|
	  
	  # Checking if the meeting hasn't been processed
	  match2 = /(.*).rb/.match file.sub(/.+\//, "")
	  process_type = match2[1]
	  is_processed = false
	  if File.directory?("#{recording_dir}/process/#{process_type}")
		processed_dirs = Dir.entries("#{recording_dir}/process/#{process_type}") - ['.','..']
		is_processed = processed_dirs.any? { |s| s.include?(meeting_id)  }
	  end
	  
	  if(!is_processed)
	     #  BigBlueButton.logger.info("Executing #{file}\n")  
	     #IO.popen("ruby #{file} -m #{meeting_id}")
	     #Process.wait
	     #puts "********** #{$?.exitstatus} #{$?.exited?} #{$?.success?}********************"
		 command = "ruby #{file} -m #{meeting_id}"
	     timestamp_start = Time.now
	     BigBlueButton.execute(command)
	     timestamp_stop = Time.now
	     processing_time = ((timestamp_stop-timestamp_start).to_f * 1000).truncate
	     processing_time_file = "#{recording_dir}/process/#{process_type}/#{meeting_id}/processing_time"
	     File.open(processing_time_file, 'w') { |file| file.write("#{processing_time}") }
	  end

	end
  end	
end

def publish_processed_meeting(recording_dir)
  processed_done_files = Dir.glob("#{recording_dir}/status/processed/*.done")
 
  processed_done_files.each do |df|
    match = /(.*).done/.match df.sub(/.+\//, "")
    meeting_id = match[1]
    
    # Execute all the scripts under the steps directory.
    # This script must be invoked from the scripts directory for the PATH to be resolved.
    Dir.glob("#{Dir.pwd}/publish/*.rb").sort.each do |file|
	
	  # Checking if the meeting hasn't been processed
	  match2 = /(.*).rb/.match file.sub(/.+\//, "")
	  publish_type = match2[1]
	  
	  match2 = /(.*)-(.*)/.match meeting_id
	  c_meeting_id = match2[1]
	  
	  is_published = false
	  if File.directory?("#{recording_dir}/publish/#{publish_type}")
		published_dirs = Dir.entries("#{recording_dir}/publish/#{publish_type}") - ['.','..']
		is_published = published_dirs.any? { |s| s.include?(c_meeting_id)  }
	  end
	
	  if(!is_published)
		#  BigBlueButton.logger.info("Executing #{file}\n")  
		#IO.popen("ruby #{file} -m #{meeting_id}")
		#Process.wait
		#puts "********** #{$?.exitstatus} #{$?.exited?} #{$?.success?}********************"
		command = "ruby #{file} -m #{meeting_id}"
		BigBlueButton.execute(command)
	  end

    end
  end	
end

props = YAML::load(File.open('bigbluebutton.yml'))
recording_dir = props['recording_dir']
archive_recorded_meeting(recording_dir)
sanity_archived_meeting(recording_dir)
process_archived_meeting(recording_dir)
publish_processed_meeting(recording_dir)


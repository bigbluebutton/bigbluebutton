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


require '../../core/lib/recordandplayback'
require 'rubygems'
require 'trollop'
require 'yaml'

opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :default => '58f4a6b3-cd07-444d-8564-59116cb53974', :type => String
end

meeting_id = opts[:meeting_id]

#Matterhorn process log file
logger = Logger.new("/var/log/bigbluebutton/matterhorn/process-#{meeting_id}.log", 'daily' )
BigBlueButton.logger = logger

# This script lives in scripts/archive/steps while bigbluebutton.yml lives in scripts/
props = YAML::load(File.open('../../core/scripts/bigbluebutton.yml'))

recording_dir = props['recording_dir']
raw_archive_dir = "#{recording_dir}/raw/#{meeting_id}"
target_dir = "#{recording_dir}/process/matterhorn/#{meeting_id}"

if not FileTest.directory?(target_dir)	  
	  	 FileUtils.mkdir_p target_dir


	if !Dir["#{raw_archive_dir}/video/*"].empty? or !Dir["#{raw_archive_dir}/deskshare/*"].empty?
		  # Create a copy of the raw archives
		  temp_dir = "#{target_dir}/temp"
		  FileUtils.mkdir_p temp_dir
		  FileUtils.cp_r(raw_archive_dir, temp_dir)

		  # Process webcam recording
		  BigBlueButton.process_webcam(target_dir, temp_dir, meeting_id) if !Dir["#{raw_archive_dir}/video/*"].empty?
				  
		  # Process desktop sharing
		  BigBlueButton.process_deskstop_sharing(target_dir, temp_dir, meeting_id) if !Dir["#{raw_archive_dir}/deskshare/*"].empty?		 

		  # Mux audio and deskshare if webcam was not processed
		  if !File.exists?("#{target_dir}/muxed-audio-webcam.flv")
		    BigBlueButton::AudioProcessor.process("#{temp_dir}/#{meeting_id}", "#{target_dir}/audio")
		    BigBlueButton.mux_audio_deskshare( target_dir, "#{target_dir}/audio.ogg", "#{target_dir}/deskshare.flv") 
		  end

		  #Create xml files with metadata
		  BigBlueButton::MatterhornProcessor.create_manifest_xml("#{target_dir}/muxed-audio-webcam.flv", "#{target_dir}/deskshare.flv", "#{target_dir}/manifest.xml", meeting_id)  		

		  metadata = BigBlueButton::Events.get_meeting_metadata("#{temp_dir}/#{meeting_id}/events.xml")
		  
		  dublincore_data = {   :title => metadata[:title.to_s].nil? ? meeting_id : metadata[:title.to_s],
					:subject => metadata[:subject.to_s],
					:description => metadata[:description.to_s],
					:creator => metadata[:creator.to_s],
					:contributor => metadata[:contributor.to_s],
					:language => metadata[:language.to_s],
					:identifier => metadata[:identifier.to_s]
					}                                                                                                                                             
		  BigBlueButton::MatterhornProcessor.create_dublincore_xml("#{target_dir}/dublincore.xml", dublincore_data)

	else
		logger.error "Failed Matterhorn process for meeting #{meeting_id}. Absence of video (webcam or deskshare)."	
	end	
	process_done = File.new("#{recording_dir}/status/processed/#{meeting_id}-matterhorn.done", "w")
	process_done.write("Processed #{meeting_id}")
	process_done.close
end


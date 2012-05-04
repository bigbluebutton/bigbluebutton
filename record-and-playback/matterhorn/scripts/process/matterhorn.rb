# Set encoding to utf-8
# encoding: UTF-8

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

	#Verify media absence before trying to process
	media_absence = Hash.new
	media_absence["audio"] = !Dir["#{raw_archive_dir}/audio/*"].empty?
	media_absence["video"] = !Dir["#{raw_archive_dir}/video/*"].empty?
	media_absence["deskshare"] = !Dir["#{raw_archive_dir}/deskshare/*"].empty?

	if not media_absence.values.join("_").include? "false"
		  # Create a copy of the raw archives
		  temp_dir = "#{target_dir}/temp"
		  FileUtils.mkdir_p temp_dir
		  FileUtils.cp_r(raw_archive_dir, temp_dir)

		  # Process webcam recording
		  BigBlueButton.process_webcam(target_dir, temp_dir, meeting_id)
				  
		  # Process desktop sharing
		  BigBlueButton.process_deskstop_sharing(target_dir, temp_dir, meeting_id)
		  
		  #Create xml files with metadata
		  BigBlueButton::MatterhornProcessor.create_manifest_xml("#{target_dir}/muxed-audio-webcam.flv", "#{target_dir}/deskshare.flv", "#{target_dir}/manifest.xml")
		  
		  metadata = BigBlueButton::Events.get_meeting_metadata("#{temp_dir}/#{meeting_id}/events.xml")
		  
		  dublincore_data = { 	:title => metadata[:title.to_s], 
					:subject => metadata[:subject.to_s],
					:description => metadata[:description.to_s],
					:creator => metadata[:creator.to_s],
					:contributor => metadata[:contributor.to_s],
					:language => metadata[:language.to_s],
					:identifier => metadata[:identifier.to_s]
					}                                                                                                                                             
		  BigBlueButton::MatterhornProcessor.create_dublincore_xml("#{target_dir}/dublincore.xml", dublincore_data)
	else
		logger.error "Failed Matterhorn process for meeting  #{meeting_id}. Absence of media #{media_absence.to_s}"
	end

end


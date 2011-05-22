require '../../core/lib/recordandplayback'
require 'rubygems'
require 'trollop'
require 'yaml'

logger = Logger.new('/var/log/bigbluebutton/matterhorn.log', 'daily' )
BigBlueButton.logger = logger

opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :default => '58f4a6b3-cd07-444d-8564-59116cb53974', :type => String
end

meeting_id = opts[:meeting_id]

# This script lives in scripts/archive/steps while bigbluebutton.yml lives in scripts/
props = YAML::load(File.open('../../core/scripts/bigbluebutton.yml'))

recording_dir = props['recording_dir']
raw_archive_dir = "#{recording_dir}/raw/#{meeting_id}"

target_dir = "#{recording_dir}/process/matterhorn/#{meeting_id}"
if FileTest.directory?(target_dir)
  FileUtils.remove_dir target_dir
end
FileUtils.mkdir_p target_dir

# Create a copy of the raw archives
temp_dir = "#{target_dir}/temp"
FileUtils.mkdir_p temp_dir
FileUtils.cp_r(raw_archive_dir, temp_dir)

# Process webcam recording
BigBlueButton.process_webcam(target_dir, temp_dir, meeting_id)
        
# Process desktop sharing
BigBlueButton.process_deskstop_sharing(target_dir, temp_dir, meeting_id)

BigBlueButton::MatterhornProcessor.create_manifest_xml("#{target_dir}/muxed-audio-webcam.flv", "#{target_dir}/deskshare.flv", "#{target_dir}/manifest.xml")

BigBlueButton::MatterhornProcessor.create_dublincore_xml("#{target_dir}/dublincore.xml",
                                                          {:title => "Business Ecosystem",
                                                              :subject => "TTMG 5001",
                                                              :description => "How to manage your product's ecosystem",
                                                              :creator => "Richard Alam",
                                                              :contributor => "Popen3",
                                                              :language => "En-US",
                                                              :identifier => "ttmg-5001-2"})
                                                              

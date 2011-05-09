require '../lib/recordandplayback'
require 'logger'
require 'trollop'
require 'yaml'

logger = Logger.new('/var/log/bigbluebutton/archive.log', 'daily' )

opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :default => '58f4a6b3-cd07-444d-8564-59116cb53974', :type => String
end

meeting_id = opts[:meeting_id]

# This script lives in scripts/archive/steps while properties.yaml lives in scripts/
props = YAML::load(File.open('properties.yaml'))

audio_dir = props['audio_dir']
archive_dir = props['archive_dir']
deskshare_dir = props['deskshare_dir']
redis_host = props['redis_host']
redis_port = props['redis_port']
presentation_dir = props['presentation_dir']
video_dir = props['video_dir']

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


def archive_events(meeting_id, redis_host, redis_port, archive_dir)
  BigBlueButton.logger.info("Archiving events for #{meeting_id}.")
  begin
    redis = BigBlueButton::RedisWrapper.new(redis_host, redis_port)
    events_archiver = BigBlueButton::RedisEventsArchiver.new redis    
    events_archiver.save_events_to_file("#{archive_dir}/#{meeting_id}", events_archiver.store_events(meeting_id))
  rescue => e
    BigBlueButton.logger.warn("Failed to archive events for #{meeting_id}. " + e.to_s)
  end
end

def archive_audio(meeting_id, audio_dir, archive_dir)
  BigBlueButton.logger.info("Archiving audio for #{meeting_id}.")
  begin
    BigBlueButton::AudioArchiver.archive(meeting_id, audio_dir, archive_dir) 
  rescue => e
    BigBlueButton.logger.warn("Failed to archive audio for #{meeting_id}. " + e.to_s)
  end
end

def self.archive_video(meeting_id, video_dir, archive_dir)
  BigBlueButton.logger.info("Archiving video for #{meeting_id}.")
  begin
    BigBlueButton::VideoArchiver.archive(meeting_id, "#{video_dir}/#{meeting_id}", archive_dir)
  rescue => e
    BigBlueButton.logger.warn("Failed to archive video for #{meeting_id}. " + e.to_s)
  end
end

def archive_deskshare(meeting_id, deskshare_dir, archive_dir)
  BigBlueButton.logger.info("Archiving deskshare for #{meeting_id}.")
  begin
    BigBlueButton::DeskshareArchiver.archive(meeting_id, deskshare_dir, archive_dir)
  rescue => e
    BigBlueButton.logger.warn("Failed to archive deskshare for #{meeting_id}. " + e.to_s)
  end
end

def archive_presentation(meeting_id, presentation_dir, archive_dir)
  BigBlueButton.logger.info("Archiving presentation for #{meeting_id}.")
  begin
    BigBlueButton::PresentationArchiver.archive(meeting_id, "#{presentation_dir}/#{meeting_id}/#{meeting_id}", archive_dir)
  rescue => e
    BigBlueButton.logger.warn("Failed to archive presentations for #{meeting_id}. " + e.to_s)
  end
end

archive_events(meeting_id, redis_host, redis_port, archive_dir)
archive_audio(meeting_id, audio_dir, archive_dir)
archive_presentation(meeting_id, presentation_dir, archive_dir)
archive_deskshare(meeting_id, deskshare_dir, archive_dir)
archive_video(meeting_id, video_dir, archive_dir)

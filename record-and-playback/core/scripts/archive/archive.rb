require '../lib/recordandplayback'
require 'logger'
require 'trollop'
require 'yaml'

logger = Logger.new('/var/log/bigbluebutton/archive.log', 'daily' )

opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :default => '58f4a6b3-cd07-444d-8564-59116cb53974', :type => String
end

meeting_id = opts[:meeting_id]

# This script lives in scripts/archive/steps while bigbluebutton.yml lives in scripts/
props = YAML::load(File.open('bigbluebutton.yml'))

audio_dir = props['raw_audio_src']
recording_dir = props['recording_dir']
raw_archive_dir = "#{recording_dir}/raw"
deskshare_dir = props['raw_deskshare_src']
redis_host = props['redis_host']
redis_port = props['redis_port']
presentation_dir = props['raw_presentation_src']
video_dir = props['raw_video_src']

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

def archive_audio(meeting_id, audio_dir, raw_archive_dir)
  BigBlueButton.logger.info("Archiving audio #{audio_dir}/#{meeting_id}*.wav.")
  begin
    audio_dest_dir = "#{raw_archive_dir}/#{meeting_id}/audio"
    FileUtils.mkdir_p audio_dest_dir
    BigBlueButton::AudioArchiver.archive(meeting_id, audio_dir, audio_dest_dir) 
  rescue => e
    BigBlueButton.logger.warn("Failed to archive audio for #{meeting_id}. " + e.to_s)
  end
end

def archive_events(meeting_id, redis_host, redis_port, raw_archive_dir)
  BigBlueButton.logger.info("Archiving events for #{meeting_id}.")
  begin
    redis = BigBlueButton::RedisWrapper.new(redis_host, redis_port)
    events_archiver = BigBlueButton::RedisEventsArchiver.new redis    
    events = events_archiver.store_events(meeting_id)
    events_archiver.save_events_to_file("#{raw_archive_dir}/#{meeting_id}", events )
  rescue => e
    BigBlueButton.logger.warn("Failed to archive events for #{meeting_id}. " + e.to_s)
  end
end

def archive_video(meeting_id, video_dir, raw_archive_dir)
  BigBlueButton.logger.info("Archiving video for #{meeting_id}.")
  begin
    video_dest_dir = "#{raw_archive_dir}/#{meeting_id}/video"
    FileUtils.mkdir_p video_dest_dir
    BigBlueButton::VideoArchiver.archive(meeting_id, "#{video_dir}/#{meeting_id}", video_dest_dir)
  rescue => e
    BigBlueButton.logger.warn("Failed to archive video for #{meeting_id}. " + e.to_s)
  end
end

def archive_deskshare(meeting_id, deskshare_dir, raw_archive_dir)
  BigBlueButton.logger.info("Archiving deskshare for #{meeting_id}.")
  begin
    deskshare_dest_dir = "#{raw_archive_dir}/#{meeting_id}/deskshare"
    FileUtils.mkdir_p deskshare_dest_dir
    BigBlueButton::DeskshareArchiver.archive(meeting_id, deskshare_dir, deskshare_dest_dir)
  rescue => e
    BigBlueButton.logger.warn("Failed to archive deskshare for #{meeting_id}. " + e.to_s)
  end
end

def archive_presentation(meeting_id, presentation_dir, raw_archive_dir)
  BigBlueButton.logger.info("Archiving presentation for #{meeting_id}.")
  begin
    presentation_dest_dir = "#{raw_archive_dir}/#{meeting_id}/presentation"
    FileUtils.mkdir_p presentation_dest_dir
    BigBlueButton::PresentationArchiver.archive(meeting_id, "#{presentation_dir}/#{meeting_id}/#{meeting_id}", presentation_dest_dir)
  rescue => e
    BigBlueButton.logger.warn("Failed to archive presentations for #{meeting_id}. " + e.to_s)
  end
end

target_dir = "#{raw_archive_dir}/#{meeting_id}"
if FileTest.directory?(target_dir)
  FileUtils.remove_dir target_dir
end
FileUtils.mkdir_p target_dir
        
archive_events(meeting_id, redis_host, redis_port, raw_archive_dir)
archive_audio(meeting_id, audio_dir, raw_archive_dir)
archive_presentation(meeting_id, presentation_dir, raw_archive_dir)
archive_deskshare(meeting_id, deskshare_dir, raw_archive_dir)
archive_video(meeting_id, video_dir, raw_archive_dir)

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
require 'logger'
require 'trollop'
require 'yaml'


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

def archive_screenshare(meeting_id, deskshare_dir, raw_archive_dir)
  BigBlueButton.logger.info("Archiving screenshare for #{meeting_id}.")
  begin
    deskshare_dest_dir = "#{raw_archive_dir}/#{meeting_id}/deskshare"
    FileUtils.mkdir_p deskshare_dest_dir
    BigBlueButton::DeskshareArchiver.archive(meeting_id, "#{deskshare_dir}/#{meeting_id}", deskshare_dest_dir)
  rescue => e
    BigBlueButton.logger.warn("Failed to archive screenshare for #{meeting_id}. " + e.to_s)
  end
end

def archive_kurento_screenshare(meeting_id, screenshare_dir, raw_archive_dir)
  BigBlueButton.logger.info("Archiving WebRTC screenshare for #{meeting_id}.")
  begin
    deskshare_dest_dir = "#{raw_archive_dir}/#{meeting_id}/deskshare"
    FileUtils.mkdir_p(deskshare_dest_dir)
    Dir.glob("#{screenshare_dir}/#{meeting_id}/*").each do |file|
      BigBlueButton.logger.debug("#{file} to #{deskshare_dest_dir}")
      FileUtils.cp(file, deskshare_dest_dir)
    end
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

def archive_has_recording_marks?(meeting_id, raw_archive_dir)
  BigBlueButton.logger.info("Fetching the recording marks for #{meeting_id}.")
  has_recording_marks = true
  begin
    record_events = BigBlueButton::Events.get_record_status_events("#{raw_archive_dir}/#{meeting_id}/events.xml")
    BigBlueButton.logger.info("record_events:\n#{BigBlueButton.hash_to_str(record_events)}")
    has_recording_marks = (not record_events.empty?)
  rescue => e
    BigBlueButton.logger.warn("Failed to fetch the recording marks for #{meeting_id}. " + e.to_s)
  end
  has_recording_marks
end


################## START ################################

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
screenshare_dir = props['raw_screenshare_src']
redis_host = props['redis_host']
redis_port = props['redis_port']
presentation_dir = props['raw_presentation_src']
video_dir = props['raw_video_src']
kurento_video_dir = props['kurento_video_src']
kurento_screenshare_dir = props['kurento_screenshare_src']
log_dir = props['log_dir']

BigBlueButton.logger = Logger.new("#{log_dir}/archive-#{meeting_id}.log", 'daily' )

target_dir = "#{raw_archive_dir}/#{meeting_id}"
if not FileTest.directory?(target_dir)
  FileUtils.mkdir_p target_dir
  archive_events(meeting_id, redis_host, redis_port, raw_archive_dir)
  archive_audio(meeting_id, audio_dir, raw_archive_dir)
  archive_presentation(meeting_id, presentation_dir, raw_archive_dir)
  archive_deskshare(meeting_id, deskshare_dir, raw_archive_dir)
  archive_screenshare(meeting_id, screenshare_dir, raw_archive_dir)
  archive_kurento_screenshare(meeting_id, kurento_video_dir, raw_archive_dir)
  archive_video(meeting_id, video_dir, raw_archive_dir)
  archive_video(meeting_id, kurento_video_dir, raw_archive_dir)

  if not archive_has_recording_marks?(meeting_id, raw_archive_dir)
    BigBlueButton.logger.info("There's no recording marks for #{meeting_id}, not processing recording.")

    # we need to delete the keys here because the sanity phase won't
    # automatically happen for this recording
    BigBlueButton.logger.info("Deleting redis keys")
    redis = BigBlueButton::RedisWrapper.new(redis_host, redis_port)
    events_archiver = BigBlueButton::RedisEventsArchiver.new redis
    events_archiver.delete_events(meeting_id)

    File.open("#{recording_dir}/status/archived/#{meeting_id}.norecord", "w") do |archive_norecord|
      archive_norecord.write("Archived #{meeting_id} (no recording marks")
    end

  else
    File.open("#{recording_dir}/status/archived/#{meeting_id}.done", "w") do |archive_done|
      archive_done.write("Archived #{meeting_id}")
    end
  end
end

# frozen_string_literal: true

# BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
#
# Copyright (c) 2017 BigBlueButton Inc. and by respective authors (see below).
#
# This program is free software; you can redistribute it and/or modify it under
# the terms of the GNU Lesser General Public License as published by the Free
# Software Foundation; either version 3.0 of the License, or (at your option)
# any later version.
#
# BigBlueButton is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
# details.
#
# You should have received a copy of the GNU Lesser General Public License along
# with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.

require File.expand_path('../../../lib/recordandplayback', __FILE__)
require 'logger'
require 'optimist'
require 'yaml'

AUDIO_ARCHIVE_FORMAT = {
  extension: 'opus',
  # TODO: consider changing bitrate based on channels or sample rate - this is
  # overkill if freeswitch is configured in a mono or low quality profile
  parameters: [
    %w[-c:a libopus -b:a 128K -f ogg],
  ]
}.freeze

def archive_events(meeting_id, redis_host, redis_port, redis_password, raw_archive_dir, break_timestamp)
  BigBlueButton.logger.info("Archiving events for #{meeting_id}")
  redis = BigBlueButton::RedisWrapper.new(redis_host, redis_port, redis_password)
  events_archiver = BigBlueButton::RedisEventsArchiver.new(redis)
  events_archiver.store_events(meeting_id, File.join(raw_archive_dir, meeting_id, 'events.xml'), break_timestamp) do |events|
    # Adjust the audio filenames to match the audio archive format
    events.xpath('/recording/event[@module="VOICE"]/filename').each do |filename|
      if filename.content.end_with?('.wav')
        filename.content = "#{File.basename(filename.content, '.wav')}.#{AUDIO_ARCHIVE_FORMAT[:extension]}"
      end
    end
  end
end

def archive_notes(meeting_id, notes_endpoint, notes_formats, raw_archive_dir)
  BigBlueButton.logger.info("Archiving notes for #{meeting_id}")
  events = Nokogiri::XML(File.open("#{raw_archive_dir}/#{meeting_id}/events.xml"))
  notes_id = BigBlueButton::Events.get_notes_id(events)

  notes_dir = "#{raw_archive_dir}/#{meeting_id}/notes"
  FileUtils.mkdir_p(notes_dir)

  tmp_note = "#{notes_dir}/tmp_note.txt"
  base_path_notes = CGI.escape notes_id
  if base_path_notes != "undefined"
    BigBlueButton.try_download("#{notes_endpoint}/#{base_path_notes}/export/txt", tmp_note)
  end
  if File.exist? tmp_note
    # If the notes are empty, do not archive them
    blank = false
    content = File.open(tmp_note).read
    if content.strip.empty?
      blank = true
    end
    FileUtils.rm_f(tmp_note)
    if blank
      BigBlueButton.logger.info("Empty notes for #{meeting_id}")
      return
    end
  else
    BigBlueButton.logger.info("Notes were not used in #{meeting_id}")
    return
  end

  notes_formats.each do |format|
    BigBlueButton.try_download("#{notes_endpoint}/#{CGI.escape notes_id}/export/#{format}", "#{notes_dir}/notes.#{format}")
  end
end

def archive_audio(meeting_id, audio_dir, raw_archive_dir)
  BigBlueButton.logger.info("Archiving audio #{audio_dir}/#{meeting_id}-*.*")
  audio_dest_dir = File.join(raw_archive_dir, meeting_id, 'audio')
  FileUtils.mkdir_p(audio_dest_dir)
  audio_files = Dir.glob("#{audio_dir}/#{meeting_id}-*.*")
  if audio_files.empty?
    BigBlueButton.logger.warn("No audio found for #{meeting_id}")
    return
  end
  audio_files.each do |audio_file|
    # Recompress the audio only if freeswitch saved an uncompressed wav, otherwise copy
    if audio_file.end_with?('.wav')
      output_basename = File.join(audio_dest_dir, File.basename(audio_file, '.wav'))
      # Note that the encode method saves to a temp file then renames to the
      # final filename, making this safe for segmented recordings that are
      # concurrently being processed.
      BigBlueButton::EDL.encode(audio_file, nil, AUDIO_ARCHIVE_FORMAT, output_basename)
    else
      ret = BigBlueButton.exec_ret('rsync', '-stv', audio_file, audio_dest_dir)
      BigBlueButton.logger.warn("Failed to archive #{audio_file}") if ret != 0
    end
  end
end

def delete_audio(meeting_id, audio_dir)
  BigBlueButton.logger.info("Deleting audio #{audio_dir}/#{meeting_id}-*.*")
  Dir.glob("#{audio_dir}/#{meeting_id}-*.*").each do |audio_file|
    FileUtils.rm_f(audio_file)
  end
end

def remux_and_archive(source_dir, dest_dir)
  files = Dir.glob("#{source_dir}/*")

  if files.empty?
    BigBlueButton.logger.warn("No media files found in #{source_dir}")
    return
  end

  BigBlueButton.logger.info("Remuxing and archiving files at #{source_dir}")
  FileUtils.mkdir_p(dest_dir)

  files .each do |file|
    ext = File.extname(file)
    next if ext.empty?
    # These can potentially be webm (VP8/VP9), mp4 (H.264), or mkv (VP8/VP9/H.264)
    output_basename = File.join(dest_dir, File.basename(file, ext))
    format = {
      extension: ext.delete_prefix('.'),
      parameters: [
        %w[-c copy],
      ]
    }
    BigBlueButton::EDL.encode(
      nil,
      file,
      format,
      output_basename
    )
  rescue StandardError => e
    BigBlueButton.logger.warn("Failed to remux #{file}, archiving anyways: #{e}")
    # Archive the file anyways - later steps (eg sanity) might strip it out
    # if invalid or fix it if necessary
    FileUtils.cp(file, "#{output_basename}#{ext}")
  end
end

def archive_directory(source, dest)
  BigBlueButton.logger.info("Archiving contents of #{source}")
  FileUtils.mkdir_p(dest)
  ret = BigBlueButton.exec_ret('rsync', '-rstv',
          "#{source}/", "#{dest}/")
  if ret != 0
    BigBlueButton.logger.warn("Failed to archive contents of #{source}")
  end
end

def archive_has_recording_marks?(meeting_id, raw_archive_dir, break_timestamp)
  BigBlueButton.logger.info("Fetching the recording marks for #{meeting_id}.")

  doc = Nokogiri::XML(File.open("#{raw_archive_dir}/#{meeting_id}/events.xml"))

  # Find the start and stop timestamps for the current recording segment
  start_timestamp = BigBlueButton::Events.get_segment_start_timestamp(
          doc, break_timestamp)
  end_timestamp = BigBlueButton::Events.get_segment_end_timestamp(
          doc, break_timestamp)
  BigBlueButton.logger.info("Segment start: #{start_timestamp}, end: #{end_timestamp}")

  BigBlueButton.logger.info("Checking for recording marks for #{meeting_id} segment #{break_timestamp}")
  rec_events = BigBlueButton::Events.match_start_and_stop_rec_events(
          BigBlueButton::Events.get_start_and_stop_rec_events(doc, true))
  has_recording_marks = false
  # Scan for a set of recording start/stop events which fits any of these cases:
  # - Recording started during segment
  # - Recording stopped during segment
  # - Recording started before segment and stopped after segment
  rec_events.each do |rec_event|
    if (rec_event[:start_timestamp] > start_timestamp and
        rec_event[:start_timestamp] < end_timestamp) or
       (rec_event[:stop_timestamp] > start_timestamp and
        rec_event[:stop_timestamp] < end_timestamp) or
       (rec_event[:start_timestamp] <= start_timestamp and
        rec_event[:stop_timestamp] >= end_timestamp)
      has_recording_marks = true
    end
  end
  BigBlueButton.logger.info("Recording marks found: #{has_recording_marks}")
  has_recording_marks
end


################## START ################################

opts = Optimist::options do
  opt :meeting_id, "Meeting id to archive", type: :string
  opt :break_timestamp, "Chapter break end timestamp", type: :integer
end
Optimist::die :meeting_id, "must be provided" if opts[:meeting_id].nil?

meeting_id = opts[:meeting_id]
break_timestamp = opts[:break_timestamp]

props = BigBlueButton.read_props
audio_dir = props['raw_audio_src']
recording_dir = props['recording_dir']
raw_archive_dir = "#{recording_dir}/raw"
deskshare_dir = props['raw_deskshare_src']
redis_host = props['redis_host']
redis_port = props['redis_port']
redis_password = props['redis_password']
presentation_dir = props['raw_presentation_src']
kurento_video_dir = props['kurento_video_src']
kurento_screenshare_dir = props['kurento_screenshare_src']
mediasoup_video_dir = props['mediasoup_video_src']
mediasoup_screenshare_dir = props['mediasoup_screenshare_src']
webrtc_recorder_video_dir = props['webrtc_recorder_video_src']
webrtc_recorder_screenshare_dir = props['webrtc_recorder_screenshare_src']
webrtc_recorder_audio_dir = props['webrtc_recorder_audio_src']
log_dir = props['log_dir']
notes_endpoint = props['notes_endpoint']
notes_formats = props['notes_formats']

# Determine the filenames for the done and fail files
if !break_timestamp.nil?
  done_base = "#{meeting_id}-#{break_timestamp}"
else
  done_base = meeting_id
end
archive_done_file = "#{recording_dir}/status/archived/#{done_base}.done"
archive_norecord_file = "#{recording_dir}/status/archived/#{done_base}.norecord"

BigBlueButton.logger = Logger.new("#{log_dir}/archive-#{meeting_id}.log", 'daily' )

target_dir = "#{raw_archive_dir}/#{meeting_id}"
FileUtils.mkdir_p target_dir
archive_events(meeting_id, redis_host, redis_port, redis_password, raw_archive_dir, break_timestamp)
# FreeSWITCH Audio files
archive_audio(meeting_id, audio_dir, raw_archive_dir)
# Etherpad notes
archive_notes(meeting_id, notes_endpoint, notes_formats, raw_archive_dir)
# Presentation files
archive_directory("#{presentation_dir}/#{meeting_id}/#{meeting_id}", "#{target_dir}/presentation")
# Kurento media
remux_and_archive("#{kurento_screenshare_dir}/#{meeting_id}", "#{target_dir}/deskshare")
remux_and_archive("#{kurento_video_dir}/#{meeting_id}", "#{target_dir}/video/#{meeting_id}")
# mediasoup media
archive_directory("#{mediasoup_screenshare_dir}/#{meeting_id}", "#{target_dir}/deskshare")
archive_directory("#{mediasoup_video_dir}/#{meeting_id}", "#{target_dir}/video/#{meeting_id}")
# bbb-webrtc-recorder media
remux_and_archive("#{webrtc_recorder_screenshare_dir}/#{meeting_id}", "#{target_dir}/deskshare")
remux_and_archive("#{webrtc_recorder_video_dir}/#{meeting_id}", "#{target_dir}/video/#{meeting_id}")
remux_and_archive("#{webrtc_recorder_audio_dir}/#{meeting_id}", "#{target_dir}/audio")

# If this was the last (or only) segment in a recording, delete the original media files
if break_timestamp.nil?
  BigBlueButton.logger.info('Deleting originals of archived media files.')
  # FreeSWITCH Audio files
  delete_audio(meeting_id, audio_dir)
  # Kurento media
  FileUtils.rm_rf("#{kurento_screenshare_dir}/#{meeting_id}")
  FileUtils.rm_rf("#{kurento_video_dir}/#{meeting_id}")
  # mediasoup media
  FileUtils.rm_rf("#{mediasoup_screenshare_dir}/#{meeting_id}")
  FileUtils.rm_rf("#{mediasoup_video_dir}/#{meeting_id}")
  # bbb-webrtc-recorder media
  FileUtils.rm_rf("#{webrtc_recorder_screenshare_dir}/#{meeting_id}")
  FileUtils.rm_rf("#{webrtc_recorder_video_dir}/#{meeting_id}")
  FileUtils.rm_rf("#{webrtc_recorder_audio_dir}/#{meeting_id}")
end

if not archive_has_recording_marks?(meeting_id, raw_archive_dir, break_timestamp)
  BigBlueButton.logger.info("There's no recording marks for #{meeting_id}, not processing recording.")

  if break_timestamp.nil?
    # we need to delete the keys here because the sanity phase might not
    # automatically happen for this recording
    BigBlueButton.logger.info("Deleting redis keys")
    redis = BigBlueButton::RedisWrapper.new(redis_host, redis_port, redis_password)
    events_archiver = BigBlueButton::RedisEventsArchiver.new(redis)
    events_archiver.delete_events(meeting_id)
  end

  File.open(archive_norecord_file, "w") do |archive_norecord|
    archive_norecord.write("Archived #{meeting_id} (no recording marks")
  end

else
  File.open(archive_done_file, "w") do |archive_done|
    archive_done.write("Archived #{meeting_id}")
  end
end

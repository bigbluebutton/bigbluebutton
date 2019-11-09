# Set encoding to utf-8
# encoding: UTF-8

#
# BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
#
# Copyright (c) 2019 BigBlueButton Inc. and by respective authors (see below).
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

# For DEVELOPMENT
# Allows us to run the script manually
# require File.expand_path('../../../../core/lib/recordandplayback', __FILE__)

# For PRODUCTION
require File.expand_path('../../../lib/recordandplayback', __FILE__)

require 'rubygems'
require 'trollop'
require 'yaml'
require 'json'
require 'nokogiri'
require 'erb'

opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :type => String
  opt :stderr, "Log output to stderr"
end

Trollop::die :meeting_id, "must be provided" unless opts[:meeting_id]
meeting_id = opts[:meeting_id]

# Load parameters and set up paths
props = YAML::load(File.open('../../core/scripts/bigbluebutton.yml'))
screenshare_props = YAML::load(File.open('screenshare.yml'))

recording_dir = props['recording_dir']
playback_dir = screenshare_props['playback_dir']
target_dir = "#{recording_dir}/process/screenshare/#{meeting_id}"
raw_archive_dir = "#{recording_dir}/raw/#{meeting_id}"
done_file = "#{recording_dir}/status/processed/#{meeting_id}-screenshare.done"
log_dir = props['log_dir']

if opts[:stderr]
  BigBlueButton.logger = Logger.new(STDERR)
else
  BigBlueButton.logger = Logger.new("#{log_dir}/screenshare/process-#{meeting_id}.log", 'daily')
end
logger = BigBlueButton.logger

if File.exists?(done_file)
  logger.warn "This processing script has already been run"
  exit 0
end

begin
  FileUtils.mkdir_p(target_dir)

  logger.info "Reading basic recording information"
  events = Nokogiri::XML(File.open("#{raw_archive_dir}/events.xml"))
  initial_timestamp = nil
  final_timestamp = nil
  metadata = events.at_xpath('/recording/metadata')
  meetingName = metadata['meetingName']

  # Create initial metadata.xml
  b = Builder::XmlMarkup.new(:indent => 2)
  metaxml = b.recording {
    b.id(meeting_id)
    b.state("processing")
    b.published(false)
    b.start_time
    b.end_time
    b.participants
    b.playback
    b.meta
  }
  metadata_xml = File.new("#{target_dir}/metadata.xml", "w")
  metadata_xml.write(metaxml)
  metadata_xml.close
  BigBlueButton.logger.info("Created inital metadata.xml")

  begin
    event = events.at_xpath('/recording/event[position()=1]')
    initial_timestamp = event['timestamp'].to_i
    event = events.at_xpath('/recording/event[position()=last()]')
    final_timestamp = event['timestamp'].to_i
  end

  video_edl = []
  begin
    logger.info "Generating video events list"

    # Webcams
    webcam_edl = BigBlueButton::Events.create_webcam_edl(events, raw_archive_dir)
    logger.debug "Webcam EDL:"
    BigBlueButton::EDL::Video.dump(webcam_edl)

    # Deskshare
    deskshare_edl = BigBlueButton::Events.create_deskshare_edl(events, raw_archive_dir)
    logger.debug "Deskshare EDL:"
    BigBlueButton::EDL::Video.dump(deskshare_edl)

    video_edl = BigBlueButton::EDL::Video.merge(webcam_edl, deskshare_edl)
  end

  logger.debug "Merged Video EDL:"
  BigBlueButton::EDL::Video.dump(video_edl)

  start_time = BigBlueButton::Events.first_event_timestamp(events)
  end_time = BigBlueButton::Events.last_event_timestamp(events)

  logger.info "Applying recording start/stop events to video"
  video_edl = BigBlueButton::Events.edl_match_recording_marks_video(video_edl, events, start_time, end_time)
  logger.debug "Trimmed Video EDL:"
  BigBlueButton::EDL::Video.dump(video_edl)

  audio_edl = []
  logger.info "Generating audio events list"
  audio_edl = BigBlueButton::AudioEvents.create_audio_edl(events, raw_archive_dir)
  logger.debug "Audio EDL:"
  BigBlueButton::EDL::Audio.dump(audio_edl)

  logger.info "Applying recording start/stop events to audio"
  audio_edl = BigBlueButton::Events.edl_match_recording_marks_audio(audio_edl, events, start_time, end_time)
  logger.debug "Trimmed Audio EDL:"
  BigBlueButton::EDL::Audio.dump(audio_edl)

  logger.info "Rendering audio"
  audio = "#{target_dir}/audio.#{BigBlueButton::EDL::Audio::WF_EXT}"
  if File.exist?(audio)
    logger.warn "  Skipping rendering audio ... File already exists"
  else
    audio = BigBlueButton::EDL::Audio.render(audio_edl, "#{target_dir}/audio")
  end

  layout = screenshare_props['layout']

  logger.info "Rendering video"
  video = "#{target_dir}/video.#{BigBlueButton::EDL::Video::WF_EXT}"
  if File.exist?(video)
    logger.warn "  Skipping rendering video ... File already exists"
  else
    video = BigBlueButton::EDL::Video.render(video_edl, layout, "#{target_dir}/video")
  end

  logger.info "Encoding output files to #{screenshare_props['formats'].length} formats"
  screenshare_props['formats'].each_with_index do |format, i|
    logger.info "  #{format[:mimetype]}"
    filename = "#{target_dir}/screenshare-#{i}.#{format[:extension]}"
    if File.exist?(filename)
      logger.warn "    Skipping encode ... File already exists"
    else
      filename = BigBlueButton::EDL.encode(audio, video, format, "#{target_dir}/screenshare-#{i}", 0)
    end
  end

  logger.info("Generating closed captions")
  ret = BigBlueButton.exec_ret('utils/gen_webvtt', '-i', raw_archive_dir, '-o', target_dir)
  if ret != 0
    raise "Generating closed caption files failed"
  end
  captions = JSON.load(File.new("#{target_dir}/captions.json", 'r'))

  # Publishing support files

  logger.info "Generating index page"
  index_template = "#{playback_dir}/index.html.erb"
  index_erb = ERB.new(File.read(index_template))
  index_erb.filename = index_template
  File.open("#{target_dir}/index.html", 'w') do |index_html|
    index_html.write(index_erb.result)
  end

  logger.info "Copying css and js support files"
  FileUtils.cp_r("#{playback_dir}/css", target_dir)
  FileUtils.cp_r("#{playback_dir}/js", target_dir)
  FileUtils.cp_r("#{playback_dir}/video-js", target_dir)

  # Get the real-time start and end timestamp
  @doc = Nokogiri::XML(File.open("#{raw_archive_dir}/events.xml"))

  meeting_start = @doc.xpath("//event")[0][:timestamp]
  meeting_end = @doc.xpath("//event").last()[:timestamp]

  match = /.*-(\d+)$/.match(meeting_id)
  real_start_time = match[1]
  real_end_time = (real_start_time.to_i + (meeting_end.to_i - meeting_start.to_i)).to_s

  # Add start_time, end_time and meta to metadata.xml
  ## Load metadata.xml
  metadata = Nokogiri::XML(File.open("#{target_dir}/metadata.xml"))
  ## Add start_time and end_time
  recording = metadata.root
  ### Date Format for recordings: Thu Mar 04 14:05:56 UTC 2010
  start_time = recording.at_xpath("start_time")
  start_time.content = real_start_time
  end_time = recording.at_xpath("end_time")
  end_time.content = real_end_time

  ## Copy the breakout and breakout rooms node from
  ## events.xml if present.
  breakout_xpath = @doc.xpath("//breakout")
  breakout_rooms_xpath = @doc.xpath("//breakoutRooms")
  meeting_xpath = @doc.xpath("//meeting")

  if (meeting_xpath != nil)
    recording << meeting_xpath
  end

  if (breakout_xpath != nil)
    recording << breakout_xpath
  end

  if (breakout_rooms_xpath != nil)
    recording << breakout_rooms_xpath
  end

  participants = recording.at_xpath("participants")
  participants.content = BigBlueButton::Events.get_num_participants(@doc)

  ## Remove empty meta
  metadata.search('//recording/meta').each do |meta|
    meta.remove
  end
  ## Add the actual meta
  metadata_with_playback = Nokogiri::XML::Builder.with(metadata.at('recording')) do |xml|
    xml.meta {
      BigBlueButton::Events.get_meeting_metadata("#{raw_archive_dir}/events.xml").each {|k, v| xml.method_missing(k, v)}
    }
  end
  ## Write the new metadata.xml
  metadata_file = File.new("#{target_dir}/metadata.xml", "w")
  metadata = Nokogiri::XML(metadata.to_xml) {|x| x.noblanks}
  metadata_file.write(metadata.root)
  metadata_file.close
  BigBlueButton.logger.info("Created an updated metadata.xml with start_time and end_time")

  logger.info "Processing successfully completed, writing done file"

  File.open(done_file, 'w') do |done|
    done.write("Processed #{meeting_id}")
  end

  # Update state in metadata.xml
  ## Load metadata.xml
  metadata = Nokogiri::XML(File.open("#{target_dir}/metadata.xml"))
  ## Update status
  recording = metadata.root
  state = recording.at_xpath("state")
  state.content = "processed"
  ## Write the new metadata.xml
  metadata_file = File.new("#{target_dir}/metadata.xml", "w")
  metadata_file.write(metadata.root)
  metadata_file.close
  BigBlueButton.logger.info("Created an updated metadata.xml with state=processed")

rescue Exception => e
  warn e.message
  logger.error e.message
  e.backtrace.each do |traceline|
    logger.error traceline
  end
  exit 1
end

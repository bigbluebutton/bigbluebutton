#!/usr/bin/ruby
# encoding: UTF-8

# BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
#
# Copyright (c) 2018 BigBlueButton Inc. and by respective authors.
#
# BigBlueButton is free software: you can redistribute it and/or modify it
# under the terms of the GNU Lesser General Public License as published by the
# Free Software Foundation, either version 3 of the License, or (at your
# option) any later version.
#
# BigBlueButton is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
# details.
#
# You should have received a copy of the GNU Lesser General Public License
# along with BigBlueButton.  If not, see <http://www.gnu.org/licenses/>.

require File.expand_path('../../../lib/recordandplayback', __FILE__)
require File.expand_path('../../../lib/recordandplayback/edl', __FILE__)

require 'trollop'
require 'yaml'
require 'nokogiri'

opts = Trollop::options do
  opt :meeting_id, "Meeting id to process", :type => String
  opt :stderr, "Log output to stderr"
end
Trollop::die :meeting_id, "must be provided" unless opts[:meeting_id]
meeting_id = opts[:meeting_id]

start_real_time = nil
begin
  m = /-(\d+)$/.match(meeting_id)
  start_real_time = m[1].to_i
end

# Load parameters and set up paths
props = YAML::load(File.open(File.expand_path('../../bigbluebutton.yml', __FILE__)))
screenshare_props = YAML::load(File.open(File.expand_path('../../screenshare.yml', __FILE__)))

recording_dir = props['recording_dir']
playback_dir = screenshare_props['playback_dir']
process_dir = "#{recording_dir}/process/screenshare/#{meeting_id}"
publish_dir = "#{screenshare_props['publish_dir']}/#{meeting_id}"
raw_archive_dir = "#{recording_dir}/raw/#{meeting_id}"
donefile = "#{recording_dir}/status/processed/#{meeting_id}-screenshare.done"
log_file = "#{props['log_dir']}/screenshare/process-#{meeting_id}.log"

if opts[:stderr]
  BigBlueButton.logger = Logger.new(STDERR)
else
  BigBlueButton.logger = Logger.new(log_file)
end
logger = BigBlueButton.logger

if File.exists?(donefile)
  logger.warn "This processing script has already been run"
  exit 0
end

begin

FileUtils.mkdir_p(process_dir)

logger.info "Reading basic recording information"
events = Nokogiri::XML(File.open("#{raw_archive_dir}/events.xml"))
initial_timestamp = nil
final_timestamp = nil
metadata = events.at_xpath('/recording/metadata')
meetingName = metadata['meetingName']
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
  webcam_edl = BigBlueButton::Events.create_webcam_edl(raw_archive_dir)
  logger.debug "Webcam EDL:"
  BigBlueButton::EDL::Video.dump(webcam_edl)

  # Deskshare
  deskshare_edl = BigBlueButton::Events.create_deskshare_edl(raw_archive_dir)
  logger.debug "Deskshare EDL:"
  BigBlueButton::EDL::Video.dump(deskshare_edl)

  video_edl = BigBlueButton::EDL::Video.merge(webcam_edl, deskshare_edl)
end

logger.debug "Merged Video EDL:"
BigBlueButton::EDL::Video.dump(video_edl)

logger.info "Applying recording start/stop events to video"
video_edl = BigBlueButton::Events.edl_match_recording_marks_video(
                  video_edl, raw_archive_dir)
logger.debug "Trimmed Video EDL:"
BigBlueButton::EDL::Video.dump(video_edl)

audio_edl = []
logger.info "Generating audio events list"
audio_edl = BigBlueButton::AudioEvents.create_audio_edl(raw_archive_dir)
logger.debug "Audio EDL:"
BigBlueButton::EDL::Audio.dump(audio_edl)

logger.info "Applying recording start/stop events to audio"
audio_edl = BigBlueButton::Events.edl_match_recording_marks_audio(
                audio_edl, raw_archive_dir)
logger.debug "Trimmed Audio EDL:"
BigBlueButton::EDL::Audio.dump(audio_edl)

logger.info "Rendering audio"
audio = "#{process_dir}/audio.#{BigBlueButton::EDL::Audio::WF_EXT}"
if File.exist?(audio)
  logger.warn "  Skipping rendering audio ... File already exists"
else
  audio = BigBlueButton::EDL::Audio.render(audio_edl, "#{process_dir}/audio")
end

layout = screenshare_props['layout']

logger.info "Rendering video"
video = "#{process_dir}/video.#{BigBlueButton::EDL::Video::WF_EXT}"
if File.exist?(video)
  logger.warn "  Skipping rendering video ... File already exists"
else
  video = BigBlueButton::EDL::Video.render(video_edl, layout, "#{process_dir}/video")
end

logger.info "Encoding output files to #{screenshare_props['formats'].length} formats"
screenshare_props['formats'].each_with_index do |format, i|
  logger.info "  #{format[:mimetype]}"
  filename = "#{process_dir}/screenshare-#{i}.#{format[:extension]}"
  if File.exist?(filename)
    logger.warn "    Skipping encode ... File already exists"
  else
    filename = BigBlueButton::EDL.encode(audio, video, format, "#{process_dir}/screenshare-#{i}", screenshare_props['audio_offset'])
  end
end

logger.info("Generating closed captions")
ret = BigBlueButton.exec_ret('utils/gen_webvtt', '-i', raw_archive_dir, '-o', process_dir)
if ret != 0
  raise "Generating closed caption files failed"
end
captions = JSON.load(File.new("#{process_dir}/captions.json", 'r'))

# Publishing support files

logger.info "Generating index page"
index_template = "#{playback_dir}/index.html.erb"
index_erb = ERB.new(File.read(index_template))
index_erb.filename = index_template
File.open("#{process_dir}/index.html", 'w') do |index_html|
  index_html.write(index_erb.result)
end

logger.info "Generating metadata xml"
duration = BigBlueButton::Events.get_recording_length("#{raw_archive_dir}/events.xml")
metadata_xml = Nokogiri::XML::Builder.new do |xml|
  xml.recording {
    xml.id(meeting_id)
    xml.state('available')
    xml.published('true')
    xml.start_time(start_real_time)
    xml.end_time(start_real_time + final_timestamp - initial_timestamp)
    xml.playback {
      xml.format('screenshare')
      xml.link("#{props['playback_protocol']}://#{props['playback_host']}/screenshare/#{meeting_id}/")
      xml.duration(duration)
    }
    xml.meta {
      metadata.attributes.each do |k, v|
        xml.method_missing(k, v)
      end
    }
  }
end
File.open("#{process_dir}/metadata.xml", 'w') do |metadata_file|
  metadata_file.write(metadata_xml.to_xml)
end

logger.info "Copying css and js support files"
FileUtils.cp_r("#{playback_dir}/css", process_dir)
FileUtils.cp_r("#{playback_dir}/js", process_dir)
FileUtils.cp_r("#{playback_dir}/video-js", process_dir)

logger.info "Processing successfully completed, writing done file"

File.open(donefile, 'w') do |done|
  done.write("Processed #{meeting_id}")
end

rescue Exception => e
  warn e.message
  logger.error e.message
  e.backtrace.each do |traceline|
    logger.error traceline
  end
  exit 1
end

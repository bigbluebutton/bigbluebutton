#!/usr/bin/env ruby
# frozen_string_literal: true

# This file is part of BigBlueButton.
#
# Copyright © BigBlueButton Inc. and by respective authors.
#
# BigBlueButton is free software: you can redistribute it and/or modify it
# under the terms of the GNU Lesser General Public License as published by the
# Free Software Foundation, either version 3.0 of the License, or (at your
# option) any later version.
#
# BigBlueButton is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
# details.
#
# You should have received a copy of the GNU Lesser General Public License
# along with BigBlueButton. If not, see <https://www.gnu.org/licenses>.

require File.expand_path('../../lib/recordandplayback', __dir__)
require File.expand_path('../../lib/recordandplayback/edl', __dir__)
require 'active_support/core_ext/hash'
require 'optimist'
require 'yaml'
require 'nokogiri'
require 'erb'
require 'cgi'

opts = Optimist.options do
  opt :meeting_id, 'Meeting id to process', type: String
  opt :stderr, 'Log output to stderr'
end
Optimist.die :meeting_id, 'must be provided' unless opts[:meeting_id]
meeting_id = opts[:meeting_id]

start_real_time = nil
begin
  m = /-(\d+)$/.match(meeting_id)
  start_real_time = m[1].to_i
end

# Load parameters and set up paths
props = BigBlueButton.read_props
video_props = YAML::safe_load(File.read(File.expand_path('../video.yml', __dir__)))
begin
  video_props_override = YAML::safe_load(File.read('/etc/bigbluebutton/recording/video.yml'))
  # Merge the presets separately, to allow someone to use the override file to add additional presets
  if video_props.include?('presets') && video_props_override.include?('presets')
    video_props['presets'].merge!(video_props_override.delete('presets'))
  end
  video_props.merge!(video_props_override)
rescue Errno::ENOENT
  # Not an error: override props file does not exist
end
video_props['audio_offset'] = 0 if video_props['audio_offset'].nil?

recording_dir = props['recording_dir']
playback_dir = video_props['playback_dir']
process_dir = "#{recording_dir}/process/video/#{meeting_id}"
raw_archive_dir = "#{recording_dir}/raw/#{meeting_id}"
donefile = "#{recording_dir}/status/processed/#{meeting_id}-video.done"
log_file = "#{props['log_dir']}/video/process-#{meeting_id}.log"

logger = opts[:stderr] ? Logger.new($stderr) : Logger.new(log_file)
BigBlueButton.logger = logger

if File.exist?(donefile)
  logger.warn 'This processing script has already been run'
  exit 0
end

FileUtils.mkdir_p process_dir

logger.info 'Reading basic recording information'
events = Nokogiri::XML(File.read("#{raw_archive_dir}/events.xml"))
initial_timestamp = BigBlueButton::Events.first_event_timestamp(events)
final_timestamp = BigBlueButton::Events.last_event_timestamp(events)
duration = BigBlueButton::Events.get_recording_length(events)
participants = BigBlueButton::Events.get_num_participants(events)
metadata = events.at_xpath('/recording/metadata')

preset = nil
if video_props.fetch('allow_meta_preset', true)
  # Use preset specified via metadata parameter, if available
  preset_name = metadata['bbb-recording-video-preset']
  logger.info("Using preset #{preset_name.inspect}")
  preset = video_props.dig('presets', preset_name) unless preset_name.nil?
end
# Fall back to using the default preset
if preset.nil?
  preset_name = video_props['default_preset']
  logger.info("Preset doesn't exist, falling back to default preset #{preset_name.inspect}")
  preset = video_props.dig('presets', preset_name) unless preset_name.nil?
end
# Fall back to using the top-level config properties (for backwards compatibility with older video.yml)
if preset.nil?
  logger.warn('Configuration file does not contain presets, assuming old-style configuration')
  preset = video_props
end

# Sanity check on the loaded preset
unless preset.include?('layout') && preset.include?('formats')
  logger.error('Preset is missing required properties in configuration')
  exit(1)
end

# For backwards compatibility with older video.yml files, convert named layouts to constraint-based layouts
preset['layouts'] ||= []
# Layout with only webcams
if preset.include?('webcam_layout') || preset.include?('nopresentation_layout')
  layout = preset['webcam_layout'] || preset['nopresentation_layout']
  layout['name'] = 'webcam_layout'
  if layout['areas'].include?('webcam')
    layout['required'] = ['webcam']
    layout['areas'] = layout['areas'].select { |name, _videos| name == 'webcam' }
    preset['layouts'] << layout
  end
end
# Layout with webcams & presentation, optional deskshare
if preset.include?('presentation_webcam_layout')
  layout = preset['presentation_webcam_layout']
  layout['name'] = 'presentation_webcam_layout'
  if layout['areas'].include?('presentation') && layout['areas'].include?('webcam')
    layout['required'] = %w[webcam presentation]
    preset['layouts'] << layout
  end
end
# Layout with webcams and deskshare, no presentation
if preset.include?('deskshare_webcam_layout')
  layout = preset['deskshare_webcam_layout']
  layout['name'] = 'deskshare_webcam_layout'
  if layout['areas'].include?('deskshare') && layout['areas'].include?('webcam')
    layout['required'] = %w[webcam deskshare]
    layout['areas'] = layout['areas'].select { |name, _videos| layout['required'].include?(name) }
    preset['layouts'] << layout
  end
end
# Layout with only presentation area and/or deskshare (no webcams)
if preset.include?('presentation_layout') || preset.include?('nowebcam_layout')
  layout = preset['presentation_layout'] || preset['nowebcam_layout']
  layout['name'] = 'presentation_layout'
  if layout['areas'].include?('presentation') || layout['areas'].include?('deskshare')
    layout['required'] = []
    layout['areas'] = layout['areas'].reject { |name, _videos| name == 'webcam' }
    preset['layouts'] << layout
  end
end

# Convert the layout to have symbol keys and area names, as required by the EDL render method
layout = preset.fetch('layout', {})

layout.symbolize_keys!
layout[:areas].each do |area|
  area.symbolize_keys!
  area[:name] = area[:name].to_sym
end
preset['layouts'].each do |specific_layout|
  specific_layout.symbolize_keys!
  specific_layout[:required]&.map!(&:to_sym)
  specific_layout[:areas].each do |area|
    area.symbolize_keys!
    area[:name] = area[:name].to_sym
  end
  specific_layout[:conditions]&.symbolize_keys!
end

logger.info 'Generating video events list'

webcam_edl = BigBlueButton::Events.create_webcam_edl(events, raw_archive_dir, props['show_moderator_viewpoint'])
logger.debug 'Webcam EDL:'
BigBlueButton::EDL::Video.dump(webcam_edl)

deskshare_edl = BigBlueButton::Events.create_deskshare_edl(events, raw_archive_dir)
logger.debug 'Deskshare EDL:'
BigBlueButton::EDL::Video.dump(deskshare_edl)

presentation_edl = BigBlueButton::Events.create_presentation_edl(events, raw_archive_dir, process_dir)
logger.debug 'Presentation EDL:'
BigBlueButton::EDL::Video.dump(presentation_edl)

layout_edl = BigBlueButton::Events.create_layout_edl(events)
logger.debug 'Layout EDL'
BigBlueButton::EDL::Video.dump(layout_edl)

video_edl = BigBlueButton::EDL::Video.merge(webcam_edl, deskshare_edl, presentation_edl, layout_edl)

logger.debug 'Merged Video EDL:'
BigBlueButton::EDL::Video.dump(video_edl)

logger.info 'Applying recording start/stop events to video'
video_edl = BigBlueButton::Events.edl_match_recording_marks_video(video_edl, events, initial_timestamp, final_timestamp)
logger.debug 'Trimmed Video EDL:'
BigBlueButton::EDL::Video.dump(video_edl)

logger.info 'Generating audio events list'

audio_edl = BigBlueButton::AudioEvents.create_audio_edl(events, raw_archive_dir)
logger.debug 'Audio EDL:'
BigBlueButton::EDL::Audio.dump(audio_edl)

if BigBlueButton::Events.screenshare_has_audio?(events, "#{raw_archive_dir}/deskshare")
  logger.info('Generating audio events list for deskshare')
  deskshare_audio_edl = BigBlueButton::AudioEvents.create_deskshare_audio_edl(events, "#{raw_archive_dir}/deskshare")
  logger.debug('Deskshare audio EDL:')
  BigBlueButton::EDL::Audio.dump(deskshare_audio_edl)

  audio_edl = BigBlueButton::EDL::Audio.merge(audio_edl, deskshare_audio_edl)

  logger.debug 'Merged Audio EDL:'
  BigBlueButton::EDL::Audio.dump(audio_edl)
end

logger.info 'Applying recording start/stop events to audio'
audio_edl = BigBlueButton::Events.edl_match_recording_marks_audio(audio_edl, events, initial_timestamp, final_timestamp)
logger.debug 'Trimmed Audio EDL:'
BigBlueButton::EDL::Audio.dump(audio_edl)

logger.info 'Rendering audio'
audio = BigBlueButton::EDL::Audio.render(audio_edl, "#{process_dir}/audio")

logger.info 'Rendering video'
video = BigBlueButton::EDL::Video.render(
  video_edl,
  layout,
  "#{process_dir}/video",
  props.fetch('video_compositing_parallel_workers', 2),
  layouts: preset['layouts']
)

logger.info "Encoding output files to #{preset['formats'].length} formats"
preset['formats'].each_with_index do |format, i|
  format.symbolize_keys!
  logger.info "  #{format[:mimetype]}"
  BigBlueButton::EDL.encode(audio, video, format, "#{process_dir}/video-#{i}", video_props['audio_offset'])
end

logger.info('Generating closed captions')
ret = BigBlueButton.exec_ret('utils/gen_webvtt', '-i', raw_archive_dir, '-o', process_dir)
raise 'Generating closed caption files failed' if ret != 0

captions = JSON.parse(File.read("#{process_dir}/captions.json"))

# Generate the support files for chat events
have_chat = false
begin
  logger.info 'Processing chat events'
  chats = BigBlueButton::Events.get_chat_events(events, initial_timestamp, final_timestamp, props)
  have_chat = true unless chats.empty?

  # Output the chat events to the popcorn events file
  popcorn_events = Nokogiri::XML::Builder.new do |xml|
    xml.popcorn do
      chats.each do |chat|
        chattimeline = {
          in: (chat[:in] / 1000.0).round(1),
          id: chat[:id],
          direction: 'down',
          name: chat[:sender],
          senderId: chat[:sender_id],
          chatEmphasizedText: chat[:chatEmphasizedText],
          senderRole: chat[:senderRole],
          message: chat[:message],
          replyToMessageId: chat[:replyToMessageId],
          lastEditedTimestamp: chat[:lastEditedTimestamp],
          target: 'chat',
        }
        chattimeline[:out] = (chat[:out] / 1000.0).round(1) unless chat[:out].nil?
        chattimeline[:reactions] = JSON.generate(chat[:reactions]) unless chat[:reactions].nil?
        xml.chattimeline(**chattimeline)
      end
    end
  end
  File.write("#{process_dir}/video.xml", popcorn_events.to_xml)
end

# Publishing support files

logger.info 'Generating index page'
index_template = "#{playback_dir}/index.html.erb"
index_erb = ERB.new(File.read(index_template))
index_erb.filename = index_template
File.write(
  "#{process_dir}/index.html",
  index_erb.result_with_hash(
    captions: captions,
    haveChat: have_chat,
    meetingName: metadata['meetingName'],
    preset: preset
  )
)

logger.info 'Generating metadata xml'
metadata_xml = Nokogiri::XML::Builder.new do |xml|
  xml.recording do
    xml.id(meeting_id)
    xml.state('available')
    xml.published('true')
    xml.start_time(start_real_time)
    xml.end_time(start_real_time + final_timestamp - initial_timestamp)
    xml.participants(participants)
    xml.playback do
      xml.format('video')
      xml.link("#{props['playback_protocol']}://#{props['playback_host']}/playback/video/#{meeting_id}/")
      xml.duration(duration)
    end
    xml.meta do
      metadata.attributes.each do |k, v|
        xml.method_missing(k, v)
      end
    end
  end
end
File.write("#{process_dir}/metadata.xml", metadata_xml.to_xml)

logger.info 'Copying css and js support files'
FileUtils.cp_r("#{playback_dir}/css", process_dir)
FileUtils.cp_r("#{playback_dir}/js", process_dir)
FileUtils.cp_r("#{playback_dir}/video-js", process_dir)

logger.info 'Processing successfully completed, writing done file'

File.write(donefile, "Processed #{meeting_id}")

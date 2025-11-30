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
video_props = File.open(File.expand_path('../video.yml', __dir__)) do |video_props_file|
  YAML.safe_load(video_props_file)
end
begin
  video_props_override = File.open('/etc/bigbluebutton/recording/video.yml') do |video_props_override_file|
    YAML.safe_load(video_props_override_file)
  end
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
events = Nokogiri::XML(File.open("#{raw_archive_dir}/events.xml"))
initial_timestamp = BigBlueButton::Events.first_event_timestamp(events)
final_timestamp = BigBlueButton::Events.last_event_timestamp(events)
duration = BigBlueButton::Events.get_recording_length(events)
participants = BigBlueButton::Events.get_num_participants(events)
metadata = events.at_xpath('/recording/metadata')

logger.info 'Checking whether webcams were used'
have_webcams = BigBlueButton::Events.have_webcam_events(events)
if have_webcams
  logger.info('Webcams were used in this session')
else
  logger.info('No webcams were used in this session')
end

logger.info('Checking whether desktop sharing was used')
have_deskshare = BigBlueButton::Events.have_deskshare_events(events)
if have_deskshare
  logger.info('Desktop sharing was used in this session')
else
  logger.info('No desktop sharing was used in this session')
end

logger.info 'Checking whether the presentation area was used'
have_presentation = BigBlueButton::Events.have_presentation_events(events)
if have_presentation
  logger.info('Have presentation events, rendering presentation area')
else
  logger.info('No presentation events found')
end

if !have_presentation && !have_webcams
  logger.info('This recording has neither webcams or presentation')
  logger.info("Re-enabling presentation area, so the video isn't blank...")
  have_presentation = true
end

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

# Load the layout, using 'layout' as a base, and merging the more specific layout on top.
layout = preset.fetch('layout', {})
layout_name = 'layout'

# Select the specific layout based on what media types are available
media = Set.new
media << 'presentation' if have_presentation
media << 'webcam' if have_webcams
media << 'deskshare' if have_deskshare

logger.info("Media present in recording: #{media.to_a.inspect}")

# Find a specific layout based on layout constraints listed in the config file
specific_layout, _layout_index = preset.fetch('layouts', []).each_with_index.find do |sl, i|
  required = Set.new(sl.fetch('required', []))
  supported = Set.new(sl.fetch('areas', layout.fetch('areas', [])).map { |area| area['name'] })

  if !media.superset?(required)
    logger.debug("Not using layout #{i} - missing required media #{(required - media).to_a.inspect}")
    false
  elsif !media.subset?(supported)
    logger.debug("Not using layout #{i} - doesn't support media #{(media - supported).to_a.inspect}")
    false
  else
    logger.debug("Using layout #{i} - required #{required.to_a.inspect}, areas: #{supported.to_a.inspect}")
    layout_name = "layout #{i}"
    true
  end
end

if specific_layout.nil?
  logger.debug('No constraint-based layouts matched')

  # Try some named layouts for backwards compatibility
  specific_layout_name = \
    if have_webcams && !(have_presentation || have_deskshare)
      # Layout with only webcams, no presentation or deskshare area
      # Equivalent to required: [webcam], supported: [webcam]
      if preset.include?('webcam_layout')
        'webcam_layout'
      else
        'nopresentation_layout'
      end
    elsif have_webcams && have_presentation
      # Layout with webcams, presentation, optional deskshare
      # Equivalent to required: [webcam, presentation], supported: [webcam, presentation, deskshare]
      'presentation_webcam_layout'
    elsif have_webcams && have_deskshare
      # Layout with webcams and deskshare, no presentation
      # Equivalent to required: [webcam, deskshare], supported: [webcam, deskshare]
      'deskshare_webcam_layout'
    elsif !have_webcams
      # Layout with only presentation area and/or deskshare (no webcams)
      # Equivalent to required: [], supported: [presentation, deskshare]
      if preset.include?('presentation_layout')
        'presentation_layout'
      else
        'nowebcam_layout'
      end
    end
  unless specific_layout_name.nil?
    specific_layout = preset[specific_layout_name]
    if specific_layout
      logger.info("Using named layout #{specific_layout_name}")
      layout_name = specific_layout_name
    else
      logger.debug("Named layout #{specific_layout_name} is not available")
    end
  end
end

layout.merge!(specific_layout) unless specific_layout.nil?

# Sanity check on the loaded layout
unless layout.include?('width') && layout.include?('height') && layout.include?('framerate') && layout.include?('areas')
  logger.error("Preset #{preset_name} layout #{layout_name} is missing required properties in configuration")
  exit(1)
end

logger.debug("Selected layout: #{layout_name}")
logger.debug("  size: #{layout['width']}x#{layout['height']}, framerate: #{layout['framerate']}")
logger.debug('  Video areas:')
layout['areas'].each do |area|
  logger.debug("    #{area['name']}: position: #{area['x']}x#{area['y']}, size: #{area['width']}x#{area['height']}")
end

# Ensure the presentation video is not generated unless there is a presentation area in the selected layout
have_presentation = false unless layout['areas'].any? { |area| area['name'] == 'presentation' }

layout.symbolize_keys!
layout[:areas].each do |area|
  area.symbolize_keys!
  area[:name] = area[:name].to_sym
end

logger.info 'Generating video events list'

# Webcams
webcam_edl = BigBlueButton::Events.create_webcam_edl(events, raw_archive_dir, props['show_moderator_viewpoint'])
logger.debug 'Webcam EDL:'
BigBlueButton::EDL::Video.dump(webcam_edl)

# Deskshare
deskshare_edl = BigBlueButton::Events.create_deskshare_edl(events, raw_archive_dir)
logger.debug 'Deskshare EDL:'
BigBlueButton::EDL::Video.dump(deskshare_edl)

video_edl = BigBlueButton::EDL::Video.merge(webcam_edl, deskshare_edl)

logger.debug 'Merged Video EDL:'
BigBlueButton::EDL::Video.dump(video_edl)

logger.info 'Applying recording start/stop events to video'
video_edl = BigBlueButton::Events.edl_match_recording_marks_video(video_edl, events, initial_timestamp, final_timestamp)
logger.debug 'Trimmed Video EDL:'
BigBlueButton::EDL::Video.dump(video_edl)

presentation_edl = nil
if have_presentation
  # The presentation video gets special treatment
  presentation_video = "#{process_dir}/presentation.mkv"
  presentation_edl = [
    {
      timestamp: 0,
      areas: { presentation: [{ filename: presentation_video, timestamp: 0 }] },
    },
    {
      timestamp: duration,
      areas: { presentation: [] },
    },
  ]
else
  presentation_edl = [
    {
      timestamp: 0,
      areas: { presentation: [] },
    },
  ]
end
logger.debug 'Presentation EDL:'
BigBlueButton::EDL::Video.dump(presentation_edl)

video_edl = BigBlueButton::EDL::Video.merge(presentation_edl, video_edl)
logger.debug 'Merged Video EDL with Presentation:'
BigBlueButton::EDL::Video.dump(video_edl)

logger.info 'Generating audio events list'
audio_edl = BigBlueButton::AudioEvents.create_audio_edl(events, raw_archive_dir)
logger.debug 'Audio EDL:'
BigBlueButton::EDL::Audio.dump(audio_edl)

logger.info 'Applying recording start/stop events to audio'
audio_edl = BigBlueButton::Events.edl_match_recording_marks_audio(audio_edl, events, initial_timestamp, final_timestamp)
logger.debug 'Trimmed Audio EDL:'
BigBlueButton::EDL::Audio.dump(audio_edl)

logger.info 'Rendering audio'
audio = BigBlueButton::EDL::Audio.render(audio_edl, "#{process_dir}/audio")

if BigBlueButton::Events.screenshare_has_audio?(events, "#{raw_archive_dir}/deskshare")
  logger.info('Generating audio events list for deskshare')
  deskshare_audio_edl = BigBlueButton::AudioEvents.create_deskshare_audio_edl(events, "#{raw_archive_dir}/deskshare")
  logger.debug('Deskshare audio EDL:')
  BigBlueButton::EDL::Audio.dump(deskshare_audio_edl)

  logger.info('Applying recording start/stop events to deskshare audio')
  deskshare_audio_edl = BigBlueButton::Events.edl_match_recording_marks_audio(
    deskshare_audio_edl, events, initial_timestamp, final_timestamp
  )
  logger.debug('Trimmed deskshare audio EDL:')
  BigBlueButton::EDL::Audio.dump(deskshare_audio_edl)

  logger.info('Rendering deskshare audio')
  deskshare_audio = BigBlueButton::EDL::Audio.render(deskshare_audio_edl, "#{process_dir}/deskshare_audio")

  logger.info('Mixing meeting audio and deskshare audio')
  audio = BigBlueButton::EDL::Audio.mixer([audio, deskshare_audio], "#{process_dir}/mixed_audio")
end

if have_presentation
  logger.info 'Creating presentation area video'
  presentation_area = layout[:areas].detect { |area| area[:name] == :presentation }

  bbb_presentation_video_codec = video_props.fetch('bbb_presentation_video_codec', 'vp9')
  BigBlueButton.execute(
    [
      'bbb-presentation-video',
      '-i', raw_archive_dir,
      '-w', presentation_area[:width].to_s, '-h', presentation_area[:height].to_s, '-r', layout[:framerate].to_s,
      '-c', bbb_presentation_video_codec,
      '-o', presentation_video,
    ],
    true
  )
end

logger.info 'Rendering video'
video = BigBlueButton::EDL::Video.render(video_edl, layout, "#{process_dir}/video")

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

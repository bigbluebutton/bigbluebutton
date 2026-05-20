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
require 'optimist'
require 'yaml'

opts = Optimist.options do
  opt :meeting_id, 'Meeting id to publish', type: String
  opt :stderr, 'Log output to stderr'
end
Optimist.die :meeting_id, 'must be provided' unless opts[:meeting_id]

match = /(.*)-(.*)/.match(opts[:meeting_id])
meeting_id = match[1]
playback = match[2]
if playback != 'video'
  warn 'Playback format is not video'
  exit 0
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
process_dir = "#{props['recording_dir']}/process/video/#{meeting_id}"
publish_dir = "#{video_props['publish_dir']}/#{meeting_id}"
process_donefile = "#{props['recording_dir']}/status/processed/#{meeting_id}-video.done"
donefile = "#{props['recording_dir']}/status/published/#{meeting_id}-video.done"
logfile = "#{props['log_dir']}/video/publish-#{meeting_id}.log"

logger = opts[:stderr] ? Logger.new($stderr) : Logger.new(logfile)
BigBlueButton.logger = logger

unless File.exist?(process_donefile)
  logger.warn 'No done file from the processing step, was processing successful?'
  exit 1
end

metadata_xml = File.open("#{process_dir}/metadata.xml") do |io|
  Nokogiri::XML(io)
end
meta = metadata_xml.at_xpath('/recording/meta')
unless meta
  logger.error('Recording metadata.xml is missing <meta> element')
  exit 1
end

preset = nil
if video_props.fetch('allow_meta_preset', true)
  # Use preset specified via metadata parameter, if available
  preset_name = meta.at_xpath('./bbb-recording-video-preset')&.content
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

FileUtils.mkdir_p publish_dir

logger.info 'Copying files to publish directory'

# Copy the index html file
FileUtils.cp("#{process_dir}/index.html", "#{publish_dir}/index.html")

# The chat events file
FileUtils.cp("#{process_dir}/video.xml", "#{publish_dir}/video.xml")

# Copy over generated video files
preset['formats'].each_with_index do |format, i|
  FileUtils.cp("#{process_dir}/video-#{i}.#{format['extension']}",
               "#{publish_dir}/video-#{i}.#{format['extension']}")
end

# Captions files
captions = JSON.parse(File.read("#{process_dir}/captions.json"))
FileUtils.cp("#{process_dir}/captions.json", "#{publish_dir}/captions.json")
captions.each do |caption|
  FileUtils.cp("#{process_dir}/caption_#{caption['locale']}.vtt",
               "#{publish_dir}/caption_#{caption['locale']}.vtt")
end

# Copy over metadata xml file
FileUtils.cp("#{process_dir}/metadata.xml", "#{publish_dir}/metadata.xml")

# Get raw size of presentation files
raw_dir = "#{recording_dir}/raw/#{meeting_id}"
# After all the processing we'll add the published format and raw sizes to the metadata file
BigBlueButton.add_raw_size_to_metadata(publish_dir, raw_dir)
BigBlueButton.add_playback_size_to_metadata(publish_dir)

# Copy over css and js support files
FileUtils.cp_r("#{process_dir}/css", publish_dir)
FileUtils.cp_r("#{process_dir}/js", publish_dir)
FileUtils.cp_r("#{process_dir}/video-js", publish_dir)

logger.info 'Cleaning up processed files'
FileUtils.rm_r(Dir.glob("#{process_dir}/*"))

# Create the done file
File.open(donefile, 'w') do |done|
  done.write("Published #{meeting_id}")
end

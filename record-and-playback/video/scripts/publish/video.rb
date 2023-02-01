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
Optimist.dir :meeting_id, 'must be provided' unless opts[:meeting_id]

match = /(.*)-(.*)/.match(opts[:meeting_id])
meeting_id = match[1]
playback = match[2]
if playback != 'video'
  warn 'Playback format is not video'
  exit 0
end

# Load parameters and set up paths
props = YAML.safe_load(File.open(File.expand_path('../bigbluebutton.yml', __dir__)))
video_props = YAML.safe_load(File.open(File.expand_path('../video.yml', __dir__)))

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

FileUtils.mkdir_p publish_dir

logger.info 'Copying files to publish directory'

# Copy the index html file
FileUtils.cp("#{process_dir}/index.html", "#{publish_dir}/index.html")

# The chat events file
FileUtils.cp("#{process_dir}/video.xml", "#{publish_dir}/video.xml")

# Copy over generated video files
video_props['formats'].each_with_index do |format, i|
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

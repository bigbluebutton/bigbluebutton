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
require 'trollop'
require 'yaml'

opts = Trollop::options do
  opt :meeting_id, "Meeting id to publish", :type => String
  opt :stderr, "Log output to stderr"
end
Trollop::dir :meeting_id, "must be provided" unless opts[:meeting_id]

match = /(.*)-(.*)/.match(opts[:meeting_id])
meeting_id = match[1]
playback = match[2]
if playback != 'screenshare'
  warn "Playback format is not screenshare"
  exit 0
end

# Load parameters and set up paths
props = YAML::load(File.open(File.expand_path('../../bigbluebutton.yml', __FILE__)))
screenshare_props = YAML::load(File.open(File.expand_path('../../screenshare.yml', __FILE__)))

process_dir = "#{props['recording_dir']}/process/screenshare/#{meeting_id}"
publish_dir = "#{screenshare_props['publish_dir']}/#{meeting_id}"
process_donefile = "#{props['recording_dir']}/status/processed/#{meeting_id}-screenshare.done"
donefile = "#{props['recording_dir']}/status/published/#{meeting_id}-screenshare.done"
logfile = "#{props['log_dir']}/screenshare/publish-#{meeting_id}.log"

if opts[:stderr]
  BigBlueButton.logger = Logger.new(STDERR)
else
  BigBlueButton.logger = Logger.new(logfile)
end
logger = BigBlueButton.logger

if !File.exists?(process_donefile)
  logger.warn "No done file from the processing step, was processing successful?"
  exit 1
end

begin

FileUtils.mkdir_p publish_dir

logger.info "Copying files to publish directory"

# Copy the index html file
FileUtils.cp("#{process_dir}/index.html", "#{publish_dir}/index.html")

# Copy over generated video files
screenshare_props['formats'].each_with_index do |format, i|
  FileUtils.cp("#{process_dir}/screenshare-#{i}.#{format[:extension]}",
               "#{publish_dir}/screenshare-#{i}.#{format[:extension]}")
end

# Captions files
captions = JSON.load(File.new("#{process_dir}/captions.json", 'r'))
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

logger.info "Cleaning up processed files"
FileUtils.rm_r(Dir.glob("#{process_dir}/*"))

# Create the done file
File.open(donefile, 'w') do |done|
  done.write("Published #{meeting_id}")
end

rescue Exception => e
  warn e.message
  logger.error e.message
  e.backtrace.each do |traceline|
    logger.error traceline
  end
  exit 1
end

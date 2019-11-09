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

require '../../core/lib/recordandplayback'
require 'rubygems'
require 'trollop'
require 'yaml'
require 'builder'

opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :type => String
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

# This script lives in s cripts/publish/steps while properties.yaml lives in scripts/
props = YAML::load(File.open('../../core/scripts/bigbluebutton.yml'))
screenshare_props = YAML::load(File.open('screenshare.yml'))

recording_dir = props['recording_dir']
raw_archive_dir = "#{recording_dir}/raw/#{meeting_id}"
process_dir = "#{props['recording_dir']}/process/screenshare/#{meeting_id}"
publish_dir = "#{screenshare_props['publish_dir']}/#{meeting_id}"
playback_protocol = props['playback_protocol']
playback_host = props['playback_host']
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

# Copy over css and js support files
  FileUtils.cp_r("#{process_dir}/css", publish_dir)
  FileUtils.cp_r("#{process_dir}/js", publish_dir)
  FileUtils.cp_r("#{process_dir}/video-js", publish_dir)

  @doc = Nokogiri::XML(File.open("#{raw_archive_dir}/events.xml"))
  recording_time = BigBlueButton::Events.get_recording_length(@doc)

  BigBlueButton.logger.info("Creating metadata.xml")

# Copy over metadata xml file
  FileUtils.cp("#{process_dir}/metadata.xml", "#{publish_dir}/metadata.xml")

# Update state and add playback to metadata.xml
## Load metadata.xml
  metadata = Nokogiri::XML(File.open("#{publish_dir}/metadata.xml"))
## Update state
  recording = metadata.root
  state = recording.at_xpath("state")
  state.content = "published"
  published = recording.at_xpath("published")
  published.content = "true"
## Remove empty playback
  metadata.search('//recording/playback').each do |playback|
    playback.remove
  end
## Add the actual playback
  metadata_with_playback = Nokogiri::XML::Builder.with(metadata.at('recording')) do |xml|
    xml.playback {
      xml.format("screenshare")
      xml.link("#{playback_protocol}://#{playback_host}/screenshare/#{meeting_id}/")
      xml.duration("#{recording_time}")
    }
  end
## Write the new metadata.xml
  metadata_file = File.new("#{publish_dir}/metadata.xml", "w")
  metadata = Nokogiri::XML(metadata.to_xml) {|x| x.noblanks}
  metadata_file.write(metadata.root)
  metadata_file.close
  BigBlueButton.logger.info("Added playback to metadata.xml")

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

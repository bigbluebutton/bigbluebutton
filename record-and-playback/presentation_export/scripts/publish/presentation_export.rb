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

require File.expand_path('../../../lib/recordandplayback', __FILE__)
require 'rubygems'
require 'trollop'
require 'yaml'
require 'zip/zip'

opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :default => '58f4a6b3-cd07-444d-8564-59116cb53974', :type => String
end

$meeting_id = opts[:meeting_id]
match = /(.*)-(.*)/.match $meeting_id
$meeting_id = match[1]
$playback = match[2]

if ($playback == "presentation_export")
  logger = Logger.new("/var/log/bigbluebutton/presentation_export/publish-#{$meeting_id}.log", 'daily' )
  BigBlueButton.logger = logger
  # This script lives in scripts/archive/steps while properties.yaml lives in scripts/

  bbb_props = YAML::load(File.open('../../core/scripts/bigbluebutton.yml'))
  simple_props = YAML::load(File.open('presentation_export.yml'))
  BigBlueButton.logger.info("Setting recording dir")
  recording_dir = bbb_props['recording_dir']
  BigBlueButton.logger.info("Setting process dir")
  process_dir = "#{recording_dir}/process/presentation_export/#{$meeting_id}"
  BigBlueButton.logger.info("setting publish dir")
  publish_dir = simple_props['publish_dir']
  BigBlueButton.logger.info("setting playback host")
  playback_host = bbb_props['playback_host']
  BigBlueButton.logger.info("setting target dir")
  target_dir = "#{recording_dir}/publish/presentation_export/#{$meeting_id}"

  raw_archive_dir = "#{recording_dir}/raw/#{$meeting_id}"

  if not FileTest.directory?(target_dir)
    BigBlueButton.logger.info("Making dir target_dir")
    FileUtils.mkdir_p target_dir

    temp_dir = "#{target_dir}/temp"
    FileUtils.mkdir_p temp_dir
    zipped_directory = "#{temp_dir}/zipped"
    FileUtils.mkdir_p zipped_directory

    FileUtils.cp_r "#{process_dir}/resources", zipped_directory
    FileUtils.cp_r "#{process_dir}/playback", zipped_directory
    FileUtils.mv "#{zipped_directory}/playback/playback.html", zipped_directory

    package_dir = "#{target_dir}/#{$meeting_id}"
    BigBlueButton.logger.info("Making dir package_dir")
    FileUtils.mkdir_p package_dir

    BigBlueButton.logger.info("Creating the .zip file")

    zipped_file = "#{package_dir}/#{$meeting_id}.zip"
    Zip::ZipFile.open(zipped_file, Zip::ZipFile::CREATE) do |zipfile|
      Dir["#{zipped_directory}/**/**"].reject{|f|f==zipped_file}.each do |file|
        zipfile.add(file.sub(zipped_directory+'/', ''), file)
      end
    end

    BigBlueButton.logger.info("Creating metadata.xml")
    # Create metadata.xml
    b = Builder::XmlMarkup.new(:indent => 2)

    metaxml = b.recording {
      b.id($meeting_id)
      b.state("available")
      b.published(true)
      # Date Format for recordings: Thu Mar 04 14:05:56 UTC 2010
      b.start_time(BigBlueButton::Events.first_event_timestamp("#{raw_archive_dir}/events.xml"))
      b.end_time(BigBlueButton::Events.last_event_timestamp("#{raw_archive_dir}/events.xml"))
      b.playback {
        b.format("presentation_export")
        b.link("http://#{playback_host}/presentation_export/#{$meeting_id}/#{$meeting_id}.zip")
      }
      b.meta {
        BigBlueButton::Events.get_meeting_metadata("#{raw_archive_dir}/events.xml").each { |k,v| b.method_missing(k,v) }
      }
    }
    metadata_xml = File.new("#{package_dir}/metadata.xml","w")
    metadata_xml.write(metaxml)
    metadata_xml.close

    if not FileTest.directory?(publish_dir)
      FileUtils.mkdir_p publish_dir
    end
    FileUtils.cp_r(package_dir, publish_dir) # Copy all the files.
    BigBlueButton.logger.info("Finished publishing script presentation.rb successfully.")

    BigBlueButton.logger.info("Removing processed files.")
    FileUtils.rm_r(Dir.glob("#{process_dir}/*"))

    BigBlueButton.logger.info("Removing published files.")
    FileUtils.rm_r(Dir.glob("#{target_dir}/*"))
  end

end
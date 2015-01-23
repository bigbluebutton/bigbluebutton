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
require 'zip'

opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :default => '58f4a6b3-cd07-444d-8564-59116cb53974', :type => String
end

meeting_id = opts[:meeting_id]

BigBlueButton.logger = Logger.new("/var/log/bigbluebutton/presentation_export/post_publish-#{meeting_id}.log", 'daily' )

# This script lives in scripts/archive/steps while properties.yaml lives in scripts/
bbb_props = YAML::load(File.open('../../core/scripts/bigbluebutton.yml'))
recording_dir = bbb_props['recording_dir']
raw_archive_dir = "#{recording_dir}/raw/#{meeting_id}"
playback_host = bbb_props['playback_host']

props = YAML::load(File.open('presentation_export.yml'))
presentation_published_dir = props['presentation_published_dir']
presentation_unpublished_dir = props['presentation_unpublished_dir']
playback_dir = props['playback_dir']
published_dir = props['publish_dir']

publish_done = "#{recording_dir}/status/published/#{meeting_id}-presentation_export.done"
if not FileTest.directory? publish_done

  ############################
  # this is the process part #
  ############################

  process_dir = "#{recording_dir}/process/presentation_export/#{meeting_id}"
  FileUtils.rm_rf process_dir
  FileUtils.mkdir_p process_dir

  presentation_done = "#{recording_dir}/status/published/#{meeting_id}-presentation.done"
  if not File.exists? presentation_done
    BigBlueButton.logger.warn "Presentation format seems not to be published, aborting"
    abort
  end

  meeting_published_dir = nil
  [ "#{presentation_published_dir}/#{meeting_id}",
    "#{presentation_unpublished_dir}/#{meeting_id}" ].each do |dir|
      if FileTest.directory? dir
        meeting_published_dir = dir
        break
      end
  end

  if not meeting_published_dir
    BigBlueButton.logger.warn "Couldn't locate the presentation published/unpublished files, aborting"
    abort
  end

  BigBlueButton.logger.info("Processing script presentation_export.rb")

  resources_dir = "#{process_dir}/resources"
  FileUtils.mkdir_p resources_dir
  FileUtils.cp_r Dir.glob("#{meeting_published_dir}/*"), resources_dir

  player_dir = "#{process_dir}/playback"
  FileUtils.mkdir_p player_dir
  FileUtils.cp_r Dir.glob("#{playback_dir}/*"), player_dir

  ############################
  # this is the publish part #
  ############################

  publish_dir = "#{recording_dir}/publish/presentation_export/#{meeting_id}"

  BigBlueButton.logger.info("Making dir publish_dir")
  FileUtils.rm_rf publish_dir
  FileUtils.mkdir_p publish_dir

  temp_dir = "#{publish_dir}/temp"
  FileUtils.mkdir_p temp_dir
  zipped_directory = "#{temp_dir}/zipped"
  FileUtils.mkdir_p zipped_directory

  FileUtils.cp_r "#{process_dir}/resources", zipped_directory
  FileUtils.cp_r "#{process_dir}/playback", zipped_directory
  FileUtils.mv "#{zipped_directory}/playback/playback.html", zipped_directory

  package_dir = "#{publish_dir}/#{meeting_id}"
  BigBlueButton.logger.info("Making dir package_dir")
  FileUtils.mkdir_p package_dir

  BigBlueButton.logger.info("Creating the .zip file")

  zipped_file = "#{package_dir}/#{meeting_id}.zip"
  Zip::File.open(zipped_file, Zip::File::CREATE) do |zipfile|
    Dir["#{zipped_directory}/**/**"].reject{|f|f==zipped_file}.each do |file|
      zipfile.add(file.sub(zipped_directory+'/', ''), file)
    end
  end
  FileUtils.chmod 0644, zipped_file

  BigBlueButton.logger.info("Creating metadata.xml")
  presentation_metadata = "#{meeting_published_dir}/metadata.xml"
  BigBlueButton.logger.info "Parsing metadata on #{presentation_metadata}"
  doc = nil
  begin
    doc = Nokogiri::XML(open(presentation_metadata).read)
  rescue Exception => e
    BigBlueButton.logger.error "Something went wrong: #{$!}"
    raise e
  end
  doc.at("published").content = true;
  doc.at("format").content = "presentation_export"
  doc.at("link").content = "http://#{playback_host}/presentation_export/#{meeting_id}/#{meeting_id}.zip"

  metadata_xml = File.new("#{package_dir}/metadata.xml","w")
  metadata_xml.write(doc.to_xml(:indent => 2))
  metadata_xml.close

  if not FileTest.directory?(published_dir)
    FileUtils.mkdir_p published_dir
  end
  FileUtils.cp_r(package_dir, published_dir) # Copy all the files.
  BigBlueButton.logger.info("Finished publishing script presentation.rb successfully.")

  BigBlueButton.logger.info("Removing processed files.")
  FileUtils.rm_r(process_dir)

  BigBlueButton.logger.info("Removing published files.")
  FileUtils.rm_r(publish_dir)

  FileUtils.touch("#{recording_dir}/status/published/#{meeting_id}-presentation_export.done")
end

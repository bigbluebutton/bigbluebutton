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

opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :type => String
end

meeting_id = opts[:meeting_id]

# This script lives in scripts/archive/steps while properties.yaml lives in scripts/
props = YAML::load(File.open('../../core/scripts/bigbluebutton.yml'))
presentation_props = YAML::load(File.open('presentation.yml'))
presentation_props['audio_offset'] = 0 if presentation_props['audio_offset'].nil?
presentation_props['include_deskshare'] = false if presentation_props['include_deskshare'].nil?

recording_dir = props['recording_dir']
raw_archive_dir = "#{recording_dir}/raw/#{meeting_id}"
BigBlueButton.logger.info("Setting process dir")
$process_dir = "#{recording_dir}/process/presentation/#{$meeting_id}"
BigBlueButton.logger.info("setting captions dir")
captions_dir = props['captions_dir']
captions_meeting_dir = "#{captions_dir}/#{meeting_id}"

log_dir = props['log_dir']

target_dir = "#{recording_dir}/process/presentation/#{meeting_id}"
if not FileTest.directory?(target_dir)

  FileUtils.mkdir_p "#{log_dir}/presentation"
  logger = Logger.new("#{log_dir}/presentation/process-#{meeting_id}.log", 'daily')
  BigBlueButton.logger = logger
  BigBlueButton.logger.info("Processing script captions.rb")
  FileUtils.mkdir_p target_dir

  begin
    BigBlueButton.logger.info("Generating closed captions")
    FileUtils.mkdir_p captions_meeting_dir
    ret = BigBlueButton.exec_ret('utils/gen_webvtt', '-i', raw_archive_dir, '-o', captions_meeting_dir)
    FileUtils.cp("#{captions_meeting_dir}/captions.json", "#{captions_meeting_dir}/captions_playback.json")
    if ret != 0
      raise "Generating closed caption files failed"
    end

    unless File.exist?("#{captions_meeting_dir}/captions.json")
      FileUtils.rmdir captions_meeting_dir
    end

  rescue Exception => e
    BigBlueButton.logger.error(e.message)
    e.backtrace.each do |traceline|
      BigBlueButton.logger.error(traceline)
    end
    exit 1
  end

end

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
require 'optimist'
require 'yaml'
require 'json'
require 'tmpdir'

opts = Optimist::options do
  opt :meeting_id, "Meeting id to archive", :type => String
end

meeting_id = opts[:meeting_id]

props = BigBlueButton.read_props

recording_dir = props['recording_dir']
raw_archive_dir = "#{recording_dir}/raw/#{meeting_id}"
BigBlueButton.logger.info("Setting process dir")
BigBlueButton.logger.info("setting captions dir")
captions_dir = props['captions_dir']

log_dir = props['log_dir']

target_dir = "#{recording_dir}/process/presentation/#{meeting_id}"

if not FileTest.directory?(target_dir)

  captions_meeting_dir = "#{captions_dir}/#{meeting_id}"

  FileUtils.mkdir_p "#{log_dir}/presentation"
  logger = Logger.new("#{log_dir}/presentation/process-#{meeting_id}.log", 'daily')
  BigBlueButton.logger = logger
  BigBlueButton.logger.info("Processing script captions.rb")
  FileUtils.mkdir_p target_dir

  begin
    BigBlueButton.logger.info("Generating closed captions")
    FileUtils.mkdir_p captions_meeting_dir
    events = Nokogiri::XML(File.read("#{raw_archive_dir}/events.xml"))
    # Generated aside, so that tracks uploaded for the recording are not replaced
    Dir.mktmpdir('captions') do |live_dir|
      ret = BigBlueButton.generate_webvtt(raw_archive_dir, live_dir, events, props)
      if ret != 0
        raise "Generating closed caption files failed"
      end
      BigBlueButton.update_api_captions(captions_meeting_dir, live_dir)
    end

  rescue Exception => e
    BigBlueButton.logger.error(e.message)
    e.backtrace.each do |traceline|
      BigBlueButton.logger.error(traceline)
    end
    exit 1
  end

end

#!/usr/bin/ruby
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


require '../lib/recordandplayback'
require 'logger'
require 'trollop'
require 'yaml'
require "nokogiri"
require "redis"
require "fileutils"

# This script lives in scripts/archive/steps while bigbluebutton.yml lives in scripts/
props = YAML::load(File.open('bigbluebutton.yml'))
log_dir = props['log_dir']
audio_dir = props['raw_audio_src']
recording_dir = props['recording_dir']
raw_archive_dir = "#{recording_dir}/raw"
redis_host = props['redis_host']
redis_port = props['redis_port']
redis_password = props['redis_password']

opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", type: :string
  opt :break_timestamp, "Chapter break end timestamp", type: :string
end
Trollop::die :meeting_id, "must be provided" if opts[:meeting_id].nil?

meeting_id = opts[:meeting_id]
break_timestamp = opts[:break_timestamp]


BigBlueButton.logger = Logger.new("#{log_dir}/sanity.log", 'daily' )
logger = BigBlueButton.logger

def check_events_xml(raw_dir,meeting_id)
  filepath = "#{raw_dir}/#{meeting_id}/events.xml"
  raise Exception,  "Events file doesn't exists." if not File.exists?(filepath)
  bad_doc = Nokogiri::XML(File.open(filepath)) { |config| config.options = Nokogiri::XML::ParseOptions::STRICT }
end

def repair_red5_ser(directory)
  cp="/usr/share/red5/red5-server.jar:/usr/share/red5/lib/*"
  if File.directory?(directory)
    FileUtils.cd(directory) do

      BigBlueButton.logger.info("Repairing red5 serialized streams")
      Dir.glob("*.flv.ser").each do |ser|
        BigBlueButton.logger.info("Repairing #{ser}")
        ret = BigBlueButton.exec_ret('java', '-cp', cp, 'org.red5.io.flv.impl.FLVWriter', ser, '0', '7')
        if ret != 0
          BigBlueButton.logger.warn("Failed to repair #{ser}")
          next
        end

        BigBlueButton.logger.info("Cleaning up .flv.ser and .flv.info files")
        FileUtils.rm_f(ser)
        FileUtils.rm_f("#{ser[0..-5]}.info")
      end
    end
  end
end


# Determine the filenames for the done and fail files
if !break_timestamp.nil?
  done_base = "#{meeting_id}-#{break_timestamp}"
else
  done_base = meeting_id
end
sanity_done_file = "#{recording_dir}/status/sanity/#{done_base}.done"
sanity_fail_file = "#{recording_dir}/status/sanity/#{done_base}.fail"


begin
  logger.info("Starting sanity check for recording #{meeting_id}")
  if !break_timestamp.nil?
    logger.info("Break timestamp is #{break_timestamp}")
  end

  logger.info("Checking events.xml")
  check_events_xml(raw_archive_dir,meeting_id)

  logger.info("Repairing webcam videos")
  repair_red5_ser("#{raw_archive_dir}/#{meeting_id}/video/#{meeting_id}")

  logger.info("Repairing deskshare videos")
  repair_red5_ser("#{raw_archive_dir}/#{meeting_id}/deskshare")

  if break_timestamp.nil?
    # Either this recording isn't segmented, or we are working on the last
    # segment, so go ahead and clean up all the redis data.
    logger.info("Deleting keys")
    redis = BigBlueButton::RedisWrapper.new(redis_host, redis_port, redis_password)
    events_archiver = BigBlueButton::RedisEventsArchiver.new(redis)
    events_archiver.delete_events(meeting_id)
  end

  logger.info("creating sanity done files")
  File.open(sanity_done_file, "w") do |sanity_done|
    sanity_done.write("sanity check #{meeting_id}")
  end
rescue Exception => e
  BigBlueButton.logger.error("error in sanity check: " + e.message)
  BigBlueButton.logger.error(e.backtrace.join("\n"))
  File.open(sanity_fail_file, "w") do |sanity_fail|
    sanity_fail.write("error: " + e.message)
  end
end



#!/usr/bin/ruby
# encoding: utf-8

# Copyright ⓒ 2017 BigBlueButton Inc. and by respective authors.
#
# This file is part of BigBlueButton open source conferencing system.
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

require File.expand_path('../../lib/recordandplayback', __FILE__)
require File.expand_path('../workers/workers', __FILE__)
require 'rubygems'
require 'yaml'
require 'fileutils'
require 'resque'

def archive_recorded_meetings(props)
  recording_dir = props['recording_dir']
  recorded_done_files = Dir.glob("#{recording_dir}/status/recorded/*.done")

  FileUtils.mkdir_p("#{recording_dir}/status/archived")
  recorded_done_files.each do |recorded_done|
    recorded_done_base = File.basename(recorded_done, '.done')
    meeting_id = nil
    break_timestamp = nil

    if match = /^([0-9a-f]+-[0-9]+)$/.match(recorded_done_base)
      meeting_id = match[1]
    elsif match = /^([0-9a-f]+-[0-9]+)-([0-9]+)$/.match(recorded_done_base)
      meeting_id = match[1]
      break_timestamp = match[2]
    else
      BigBlueButton.logger.warn("Recording done file for #{recorded_done_base} has invalid format")
      next
    end

    attrs = {
      'meeting_id': meeting_id,
      'break_timestamp': break_timestamp,
    }
    BigBlueButton.logger.info("Enqueuing job to archive #{attrs.inspect}")
    Resque.enqueue(BigBlueButton::Resque::ArchiveWorker, attrs)

    FileUtils.rm_f(recorded_done)
  end
end

begin
  props = BigBlueButton.read_props
  log_dir = props['log_dir']

  logger = Logger.new("#{log_dir}/bbb-rap-worker.log")
  logger.level = Logger::INFO
  BigBlueButton.logger = logger

  redis_host = props['redis_workers_host'] || props['redis_host']
  redis_port = props['redis_workers_port'] || props['redis_port']
  Resque.redis = "#{redis_host}:#{redis_port}"

  BigBlueButton.logger.debug('Running rap-trigger...')

  archive_recorded_meetings(props)

  BigBlueButton.logger.debug('rap-trigger done')

rescue Exception => e
  BigBlueButton.logger.error(e.message)
  e.backtrace.each do |traceline|
    BigBlueButton.logger.error(traceline)
  end
end

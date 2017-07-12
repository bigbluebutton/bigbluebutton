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

# Number of seconds to delay archiving (red5 race condition workaround)
ARCHIVE_DELAY_SECONDS = 120

def archive_recorded_meetings(recording_dir)
  recorded_done_files = Dir.glob("#{recording_dir}/status/recorded/*.done")

  FileUtils.mkdir_p("#{recording_dir}/status/archived")
  recorded_done_files.each do |recorded_done|
    match = /([^\/]*).done$/.match(recorded_done)
    meeting_id = match[1]

    if File.mtime(recorded_done) + ARCHIVE_DELAY_SECONDS > Time.now
      BigBlueButton.logger.info("Temporarily skipping #{meeting_id} for Red5 race workaround")
      next
    end

    BigBlueButton.logger.info("Enqueuing job to archive #{meeting_id}")
    Resque.enqueue(BigBlueButton::Resque::ArchiveWorker, { "meeting_id": meeting_id })

    FileUtils.rm_f(recorded_done)
  end
end

begin
  props = BigBlueButton.read_props
  log_dir = props['log_dir']
  recording_dir = props['recording_dir']

  logger = Logger.new("#{log_dir}/bbb-rap-worker.log")
  logger.level = Logger::INFO
  BigBlueButton.logger = logger

  BigBlueButton.logger.debug("Running rap-trigger...")

  archive_recorded_meetings(recording_dir)

  BigBlueButton.logger.debug("rap-trigger done")

rescue Exception => e
  BigBlueButton.logger.error(e.message)
  e.backtrace.each do |traceline|
    BigBlueButton.logger.error(traceline)
  end
end

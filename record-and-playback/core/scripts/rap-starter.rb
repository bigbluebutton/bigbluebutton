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
require 'rb-inotify'

def archive_recorded_meetings(recording_dir, done_file)
  FileUtils.mkdir_p("#{recording_dir}/status/archived")
  meeting_id = nil
  break_timestamp = nil

  if match = /^([0-9a-f]+-[0-9]+)$/.match(done_file)
    meeting_id = match[1]
  elsif match = /^([0-9a-f]+-[0-9]+)-([0-9]+)$/.match(done_file)
    meeting_id = match[1]
    break_timestamp = match[2]
  else
    BigBlueButton.logger.warn("Recording done file for #{done_file} has invalid format")
    return
  end

  attrs = {
    'meeting_id': meeting_id,
    'break_timestamp': break_timestamp,
  }
  BigBlueButton.logger.info("Enqueuing job to archive #{attrs.inspect}")
  Resque.enqueue(BigBlueButton::Resque::ArchiveWorker, attrs)
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

  logger.debug('Running rap-trigger...')

  recording_dir = props['recording_dir']
  watch_dir = "#{recording_dir}/status/recorded/"

  # start the process for all .done files already there
  done_files = Dir.glob("#{watch_dir}*.done")
  done_files.each do |file|
    id = File.basename(file, '.done')
    logger.info "Detected recording #{id}, starting the processing"
    archive_recorded_meetings(recording_dir, id)
    FileUtils.rm_f(file)
  end

  # Listen the directory for when new files are created
  logger.info("Setting up inotify watch on #{watch_dir}")
  notifier = INotify::Notifier.new
  notifier.watch(watch_dir, :moved_to, :create) do |event|
    next unless event.name.end_with?('.done')

    id = File.basename(event.name, '.done')
    logger.info "Detected recording #{id}, starting the processing"
    archive_recorded_meetings(recording_dir, id)
    FileUtils.rm_f(event.absolute_name)
  end

  logger.info('Waiting for new recordings...')
  Signal.trap('INT') { raise :sigint }
  Signal.trap('TERM') { raise :sigint }
  notifier.run
rescue :signint
  notifier.stop
rescue Exception => e
  BigBlueButton.logger.error(e.message)
  e.backtrace.each do |traceline|
    BigBlueButton.logger.error(traceline)
  end
end

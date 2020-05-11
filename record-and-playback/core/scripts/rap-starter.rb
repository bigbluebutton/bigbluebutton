#!/usr/bin/ruby
# frozen_string_literal: true

# Copyright © 2017 BigBlueButton Inc. and by respective authors.
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

require_relative '../lib/recordandplayback'

require 'recordandplayback/workers'
require 'rubygems'
require 'yaml'
require 'fileutils'
require 'resque'
require 'rb-inotify'

class StopSignalException < StandardError
end

def parse_meeting_id(done_file)
  id = File.basename(done_file, '.done')
  if (match = /^([0-9a-f]+-[0-9]+)$/.match(id))
    { meeting_id: match[1], break_timestamp: nil }
  elsif (match = /^([0-9a-f]+-[0-9]+)-([0-9]+)$/.match(id))
    { meeting_id: match[1], break_timestamp: match[2] }
  else
    BigBlueButton.logger.warn("Recording done file #{done_file} has invalid format")
    nil
  end
end

def keep_meeting_events(recording_dir, ended_done_file)
  id = File.basename(ended_done_file, '.done')
  BigBlueButton.logger.debug("Seen new ended done file for #{id}")
  attrs = parse_meeting_id(id)
  return if attrs.nil?

  # If a meeting was recorded, the events will be archived by the archive step, and
  # the events script will be run after that (it'll grab the already archived events
  # from the recording raw directory)
  if File.exist?("#{recording_dir}/status/recorded/#{id}.done") || File.exist?("#{recording_dir}/raw/#{attrs[:meeting_id]}")
    BigBlueButton.logger.info("Meeting #{id} had recording enabled, events will be handled after recording archive")
    return
  end

  BigBlueButton.logger.info("Enqueueing job to keep events #{attrs.inspect}")
  Resque.enqueue(BigBlueButton::Resque::EventsWorker, attrs)
  FileUtils.rm_f(ended_done_file)
end

def archive_recorded_meetings(recording_dir, done_file)
  id = File.basename(done_file, '.done')
  BigBlueButton.logger.debug("Seen new recorded done file for #{id}")
  attrs = parse_meeting_id(id)
  return if attrs.nil?

  # The keep events stuff uses this directory presence to check if a meeting is
  # recorded when the recorded done file is gone
  FileUtils.mkdir_p("#{recording_dir}/raw/#{attrs[:meeting_id]}")

  BigBlueButton.logger.info("Enqueuing job to archive #{attrs.inspect}")
  Resque.enqueue(BigBlueButton::Resque::ArchiveWorker, attrs)
  FileUtils.rm_f(done_file)
end

begin
  props = BigBlueButton.read_props

  redis_host = props['redis_workers_host'] || props['redis_host']
  redis_port = props['redis_workers_port'] || props['redis_port']
  Resque.redis = "#{redis_host}:#{redis_port}"

  BigBlueButton.logger.debug('Running rap-starter...')

  recording_dir = props['recording_dir']
  ended_status_dir = "#{recording_dir}/status/ended"
  recorded_status_dir = "#{recording_dir}/status/recorded"

  # Check for missed "ended" .done files
  ended_done_files = Dir.glob("#{ended_status_dir}/*.done")
  ended_done_files.each do |ended_done_file|
    keep_meeting_events(recording_id, ended_done_file)
  end

  # Check for missed "recorded" .done files
  recorded_done_files = Dir.glob("#{recorded_status_dir}/*.done")
  recorded_done_files.each do |recorded_done_file|
    archive_recorded_meetings(recording_dir, recorded_done_file)
  end

  # Listen the directories for when new files are created
  BigBlueButton.logger.info("Setting up inotify watch on #{ended_status_dir}")
  notifier = INotify::Notifier.new
  notifier.watch(ended_status_dir, :moved_to, :create) do |event|
    next unless event.name.end_with?('.done')

    keep_meeting_events(recording_dir, event.absolute_name)
  end
  BigBlueButton.logger.info("Setting up inotify watch on #{recorded_status_dir}")
  notifier.watch(recorded_status_dir, :moved_to, :create) do |event|
    next unless event.name.end_with?('.done')

    archive_recorded_meetings(recording_dir, event.absolute_name)
  end

  BigBlueButton.logger.info('Waiting for new recordings...')
  Signal.trap('INT') { raise StopSignalException, 'INT' }
  Signal.trap('TERM') { raise StopSignalException, 'TERM' }
  notifier.run
rescue StopSignalException
  notifier.stop
end

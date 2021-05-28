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

def keep_meeting_events(recording_dir, file, from_archive)
  # When keeping events from archive:
  #   - <meeting_id>.done
  #   - <meeting_id>.norecord
  id = File.basename(file).split('.').first
  attrs = parse_meeting_id("#{id}.done") # Inject .done to use the same parser
  return if attrs.nil?

  if from_archive
    ended_done_file = "#{recording_dir}/status/ended/#{attrs[:meeting_id]}.done"
    # Skip if keep events is not enabled for this meeting
    return unless File.exist?(ended_done_file)

    BigBlueButton.logger.info("Enqueueing job to keep events from archive #{attrs.inspect}")
    Resque.enqueue(BigBlueButton::Resque::EventsWorker, attrs)
  else
    recorded_done_file = "#{recording_dir}/status/recorded/#{attrs[:meeting_id]}.done"
    raw_dir = "#{recording_dir}/raw/#{attrs[:meeting_id]}"
    # Skip if events will be archived
    return if File.exist?(recorded_done_file) || File.exist?(raw_dir)

    BigBlueButton.logger.info("Enqueueing job to keep events #{attrs.inspect}")
    Resque.enqueue(BigBlueButton::Resque::EventsWorker, attrs)
  end
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
  recorded_status_dir = "#{recording_dir}/status/recorded"

  # Check for missed "recorded" .done files
  recorded_done_files = Dir.glob("#{recorded_status_dir}/*.done")
  recorded_done_files.each do |recorded_done_file|
    archive_recorded_meetings(recording_dir, recorded_done_file)
  end

  ended_status_dir = "#{recording_dir}/status/ended"

  # Check for missed "ended" .done files
  ended_done_files = Dir.glob("#{ended_status_dir}/*.done")
  ended_done_files.each do |ended_done_file|
    keep_meeting_events(recording_dir, ended_done_file, false)
  end

  # Listen the directories for when new files are created
  notifier = INotify::Notifier.new

  # - record=false
  # - events.xml will be created from redis records
  BigBlueButton.logger.info("Setting up inotify watch on #{ended_status_dir}")
  notifier.watch(ended_status_dir, :moved_to, :create) do |event|
    next unless event.name.end_with?('.done')

    keep_meeting_events(recording_dir, event.absolute_name, false)
  end

  archived_status_dir = "#{recording_dir}/status/archived"

  # - record=true
  # - events.xml will be copied from archived
  BigBlueButton.logger.info("Setting up inotify watch on #{archived_status_dir}")
  notifier.watch(archived_status_dir, :moved_to, :create) do |event|
    next if event.name.end_with?('.fail')

    keep_meeting_events(recording_dir, event.absolute_name, true)
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

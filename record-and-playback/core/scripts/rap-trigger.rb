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
require File.expand_path('../rap-archive-worker', __FILE__)
require File.expand_path('../rap-sanity-worker', __FILE__)
require File.expand_path('../rap-process-worker', __FILE__)
require File.expand_path('../rap-publish-worker', __FILE__)
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

    archived_done = "#{recording_dir}/status/archived/#{meeting_id}.done"
    next if File.exists?(archived_done)

    archived_norecord = "#{recording_dir}/status/archived/#{meeting_id}.norecord"
    next if File.exists?(archived_norecord)

    archived_fail = "#{recording_dir}/status/archived/#{meeting_id}.fail"
    next if File.exists?(archived_fail)

    BigBlueButton.logger.info("Enqueuing job to archive #{meeting_id}")
    Resque.enqueue(BigBlueButton::Resque::ArchiveWorker, meeting_id)

    FileUtils.rm_f(recorded_done)
  end
end

def sanity_archived_meetings(recording_dir)
  archived_done_files = Dir.glob("#{recording_dir}/status/archived/*.done")

  FileUtils.mkdir_p("#{recording_dir}/status/sanity")
  archived_done_files.each do |archived_done|
    match = /([^\/]*).done$/.match(archived_done)
    meeting_id = match[1]

    sanity_done = "#{recording_dir}/status/sanity/#{meeting_id}.done"
    next if File.exists?(sanity_done)

    sanity_fail = "#{recording_dir}/status/sanity/#{meeting_id}.fail"
    next if File.exists?(sanity_fail)

    BigBlueButton.logger.info("Enqueuing job to sanity #{meeting_id}")
    Resque.enqueue(BigBlueButton::Resque::SanityWorker, meeting_id)

    FileUtils.rm_f(archived_done)
  end
end

def process_archived_meetings(recording_dir)
  sanity_done_files = Dir.glob("#{recording_dir}/status/sanity/*.done")

  FileUtils.mkdir_p("#{recording_dir}/status/processed")
  sanity_done_files.each do |sanity_done|
    match = /([^\/]*).done$/.match(sanity_done)
    meeting_id = match[1]

    BigBlueButton.logger.info("Enqueuing job to process #{meeting_id}")
    Resque.enqueue(BigBlueButton::Resque::ProcessWorker, meeting_id)

    FileUtils.rm_f(sanity_done)
  end
end

def publish_processed_meetings(recording_dir)
  processed_done_files = Dir.glob("#{recording_dir}/status/processed/*.done")

  FileUtils.mkdir_p("#{recording_dir}/status/published")
  processed_done_files.each do |processed_done|
    match = /([^\/]*)-([^\/-]*).done$/.match(processed_done)
    meeting_id = match[1]
    publish_type = match[2]

    step_succeeded = false

    published_done = "#{recording_dir}/status/published/#{meeting_id}-#{publish_type}.done"
    next if File.exists?(published_done)

    published_fail = "#{recording_dir}/status/published/#{meeting_id}-#{publish_type}.fail"
    next if File.exists?(published_fail)

    BigBlueButton.logger.info("Enqueuing job to publish #{meeting_id}, type #{publish_type}")
    Resque.enqueue(BigBlueButton::Resque::PublishWorker, meeting_id, publish_type)

    FileUtils.rm_f(processed_done)
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
  sanity_archived_meetings(recording_dir)
  process_archived_meetings(recording_dir)
  publish_processed_meetings(recording_dir)

  BigBlueButton.logger.debug("rap-trigger done")

rescue Exception => e
  BigBlueButton.logger.error(e.message)
  e.backtrace.each do |traceline|
    BigBlueButton.logger.error(traceline)
  end
end

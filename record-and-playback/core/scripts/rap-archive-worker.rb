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
require 'rubygems'
require 'yaml'
require 'fileutils'
require 'resque'

module BigBlueButton
  module Resque
    class ArchiveWorker
      @queue = 'rap:archive'

      def self.perform(meeting_id)
        worker = BigBlueButton::Resque::ArchiveWorker.new(meeting_id)
        worker.perform
      end

      def perform
        @logger.debug("Running archive worker for #{@meeting_id}")
        BigBlueButton.redis_publisher.put_archive_started(@meeting_id)

        step_start_time = BigBlueButton.monotonic_clock
        script = File.expand_path('../archive/archive.rb', __FILE__)
        ret = BigBlueButton.exec_ret("ruby", script, "-m", @meeting_id)
        step_stop_time = BigBlueButton.monotonic_clock
        step_time = step_stop_time - step_start_time

        step_succeeded = (ret == 0 &&
                          (File.exists?(@archived_done) ||
                           File.exists?(@archived_norecord)))

        BigBlueButton.redis_publisher.put_archive_ended(
          @meeting_id, {
            "success" => step_succeeded,
            "step_time" => step_time
          })

        if step_succeeded
          @logger.info("Successfully archived #{@meeting_id}")
        else
          @logger.error("Failed to archive #{@meeting_id}")
          FileUtils.touch(@archived_fail)
        end
        @logger.debug("Finished archive worker for #{@meeting_id}")

      rescue Exception => e
        @logger.error(e.message)
        e.backtrace.each do |traceline|
          @logger.error(traceline)
        end
      end

      def initialize(meeting_id)
        props = BigBlueButton.read_props
        BigBlueButton.create_redis_publisher

        @log_dir = props['log_dir']
        @recording_dir = props['recording_dir']
        @meeting_id = meeting_id

        @archived_fail = "#{@recording_dir}/status/archived/#{@meeting_id}.fail"
        @archived_done = "#{@recording_dir}/status/archived/#{@meeting_id}.done"
        @archived_norecord = "#{@recording_dir}/status/archived/#{@meeting_id}.norecord"

        @logger = Logger.new("#{@log_dir}/bbb-rap-worker.log")
        @logger.level = Logger::INFO
      end

    end
  end
end


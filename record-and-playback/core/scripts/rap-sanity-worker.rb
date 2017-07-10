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
    class SanityWorker
      @queue = 'rap:sanity'

      def self.perform(meeting_id)
        worker = BigBlueButton::Resque::SanityWorker.new(meeting_id)
        worker.perform
      end

      def perform
        @logger.info("Running sanity worker for #{@meeting_id}")
        BigBlueButton.redis_publisher.put_sanity_started(@meeting_id)

        step_start_time = BigBlueButton.monotonic_clock
        script = File.expand_path('../sanity/sanity.rb', __FILE__)
        ret = BigBlueButton.exec_ret("ruby", script, "-m", @meeting_id)
        step_stop_time = BigBlueButton.monotonic_clock
        step_time = step_stop_time - step_start_time

        step_succeeded = (ret == 0 && File.exists?(@sanity_done))

        BigBlueButton.redis_publisher.put_sanity_ended(
          @meeting_id, {
            "success" => step_succeeded,
            "step_time" => step_time
          })

        if step_succeeded
          @logger.info("Successfully sanity checked #{@meeting_id}")
          self.post_archive
        else
          @logger.error("Sanity check failed on #{@meeting_id}")
          FileUtils.touch(@sanity_fail)
        end
      end

      def post_archive
        glob = File.join(@post_scripts_path, "*.rb")
        Dir.glob(glob).sort.each do |post_archive_script|
          match = /([^\/]*).rb$/.match(post_archive_script)
          post_type = match[1]
          @logger.info("Running post archive script #{post_type}")

          BigBlueButton.redis_publisher.put_post_archive_started(post_type, @meeting_id)

          step_start_time = BigBlueButton.monotonic_clock
          ret = BigBlueButton.exec_ret("ruby", post_archive_script, "-m", @meeting_id)
          step_stop_time = BigBlueButton.monotonic_clock
          step_time = step_stop_time - step_start_time
          step_succeeded = (ret == 0)

          BigBlueButton.redis_publisher.put_post_archive_ended(
            post_type, @meeting_id, {
              "success" => step_succeeded,
              "step_time" => step_time
            })

          if not step_succeeded
            @logger.warn("Post archive script #{post_archive_script} failed")
          end
        end
      end

      def initialize(meeting_id)
        props = BigBlueButton.read_props
        BigBlueButton.create_redis_publisher

        @log_dir = props['log_dir']
        @recording_dir = props['recording_dir']
        @meeting_id = meeting_id
        @post_scripts_path = File.expand_path('../post_archive', __FILE__)

        @sanity_fail = "#{@recording_dir}/status/sanity/#{@meeting_id}.fail"
        @sanity_done = "#{@recording_dir}/status/sanity/#{@meeting_id}.done"

        @logger = Logger.new("#{@log_dir}/bbb-rap-worker.log")
        @logger.level = Logger::INFO
      end

    end
  end
end

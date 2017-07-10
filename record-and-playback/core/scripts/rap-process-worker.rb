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
    class ProcessWorker
      @queue = 'rap:process'

      def self.perform(meeting_id)
        worker = BigBlueButton::Resque::ProcessWorker.new(meeting_id)
        worker.perform
      end

      def perform
        @logger.info("Running process worker for #{@meeting_id}")

        step_succeeded = true

        # Iterate over the list of recording processing scripts to find available types
        # For now, we look for the ".rb" extension - TODO other scripting languages?
        glob = File.join(File.expand_path('../process', __FILE__), "*.rb")
        Dir.glob(glob).sort.each do |process_script|
          match2 = /([^\/]*).rb$/.match(process_script)
          process_type = match2[1]

          next if File.exists?(processed_done(process_type))
          if File.exists?(processed_fail(process_type))
            step_succeeded = false
            next
          end

          @logger.info("Running process worker for #{@meeting_id}, type #{process_type}")
          BigBlueButton.redis_publisher.put_process_started(process_type, @meeting_id)

          # If the process directory exists, the script does nothing
          FileUtils.rm_rf("#{@recording_dir}/process/#{process_type}/#{@meeting_id}")

          step_start_time = BigBlueButton.monotonic_clock
          ret = BigBlueButton.exec_ret("ruby", process_script, "-m", @meeting_id)
          step_stop_time = BigBlueButton.monotonic_clock
          step_time = step_stop_time - step_start_time

          step_succeeded = (ret == 0 and File.exists?(processed_done(process_type)))

          BigBlueButton.redis_publisher.put_process_ended(
            process_type, @meeting_id, {
              "success" => step_succeeded,
              "step_time" => step_time
            })

          if step_succeeded
            @logger.info("Process format #{process_type} succeeded for #{@meeting_id}")
            @logger.info("Process took #{step_time}ms")
            IO.write("#{@recording_dir}/process/#{process_type}/#{@meeting_id}/processing_time", step_time)
          else
            @logger.info("Process format #{process_type} failed for #{@meeting_id}")
            @logger.info("Process took #{step_time}ms")
            FileUtils.touch(@processed_fail)
            step_succeeded = false
          end
        end

        if step_succeeded
          @logger.info("Successfully processed #{@meeting_id}, calling post process")
          self.post_process
        end
      end

      def post_process
        glob = File.join(@post_scripts_path, "*.rb")
        Dir.glob(glob).sort.each do |post_process_script|
          match = /([^\/]*).rb$/.match(post_process_script)
          post_type = match[1]
          @logger.info("Running post process script #{post_type}")

          BigBlueButton.redis_publisher.put_post_process_started(post_type, @meeting_id)

          step_start_time = BigBlueButton.monotonic_clock
          ret = BigBlueButton.exec_ret("ruby", post_process_script, "-m", @meeting_id)
          step_stop_time = BigBlueButton.monotonic_clock
          step_time = step_stop_time - step_start_time
          step_succeeded = (ret == 0)

          BigBlueButton.redis_publisher.put_post_process_ended(
            post_type, @meeting_id, {
              "success" => step_succeeded,
              "step_time" => step_time
            })

          if not step_succeeded
            @logger.warn("Post process script #{post_process_script} failed")
          end
        end
      end

      def processed_done(process_type)
        "#{@recording_dir}/status/processed/#{@meeting_id}-#{process_type}.done"
      end

      def processed_fail(process_type)
        "#{@recording_dir}/status/processed/#{@meeting_id}-#{process_type}.fail"
      end

      def initialize(meeting_id)
        props = BigBlueButton.read_props
        BigBlueButton.create_redis_publisher

        @log_dir = props['log_dir']
        @recording_dir = props['recording_dir']
        @meeting_id = meeting_id
        @post_scripts_path = File.expand_path('../post_process', __FILE__)

        @logger = Logger.new("#{@log_dir}/bbb-rap-worker.log")
        @logger.level = Logger::INFO
      end
    end
  end
end

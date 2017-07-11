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

require File.expand_path('../../../lib/recordandplayback', __FILE__)
require File.expand_path('../workers', __FILE__)
require 'rubygems'
require 'yaml'
require 'fileutils'
require 'resque'

module BigBlueButton
  module Resque
    class BaseWorker
      @queue = 'rap:base'

      def self.perform(*args)
        worker = self.new(*args)
        worker.perform
      end

      def perform
        @logger.info("Started worker #{@step_name} for #{@meeting_id}")
        yield
        @logger.info("Ended worker #{@step_name} for #{@meeting_id}")

      rescue Exception => e
        @logger.error(e.message)
        e.backtrace.each do |traceline|
          @logger.error(traceline)
        end
      end

      def run_post_scripts(post_scripts_path)
        glob = File.join(post_scripts_path, "*.rb")
        Dir.glob(glob).sort.each do |post_script|
          match = /([^\/]*).rb$/.match(post_script)
          post_type = match[1]
          @logger.info("Running post #{@step_name} script #{post_type}")

          post_started_method(post_type, @meeting_id)

          ret, step_time = self.run_script(post_script)
          step_succeeded = (ret == 0)

          post_ended_method(
            post_type, @meeting_id, {
              "success" => step_succeeded,
              "step_time" => step_time
            })

          if not step_succeeded
            @logger.warn("Post #{type} script #{post_script} failed")
          end
        end
      end

      def run_script(script, meeting_id=@meeting_id)
        step_start_time = BigBlueButton.monotonic_clock
        ret = BigBlueButton.exec_ret("ruby", script, "-m", meeting_id)
        step_stop_time = BigBlueButton.monotonic_clock
        step_time = step_stop_time - step_start_time
        [ret, step_time]
      end

      def post_started_method(*args)
        case @step_name
        when "archive"
          @publisher.put_post_archive_started(*args)
        when "process"
          @publisher.put_post_process_started(*args)
        when "publish"
          @publisher.put_post_publish_started(*args)
        end
      end

      def post_ended_method(*args)
        case @step_name
        when "archive"
          @publisher.put_post_archive_ended(*args)
        when "process"
          @publisher.put_post_process_ended(*args)
        when "publish"
          @publisher.put_post_publish_ended(*args)
        end
      end

      def schedule_next_step(*args)
        @logger.info("Scheduling next step for #{@step_name} with (#{@meeting_id}, false, #{args.inspect})")
        case @step_name
        when "archive"
          ::Resque.enqueue(BigBlueButton::Resque::SanityWorker, @meeting_id, false, *args)
        when "sanity"
          ::Resque.enqueue(BigBlueButton::Resque::ProcessWorker, @meeting_id, false, *args)
        when "process"
          ::Resque.enqueue(BigBlueButton::Resque::PublishWorker, @meeting_id, false, *args)
        end
      end

      def initialize(meeting_id, single_step=false)
        props = BigBlueButton.read_props
        BigBlueButton.create_redis_publisher

        @publisher = BigBlueButton.redis_publisher
        @log_dir = props['log_dir']
        @recording_dir = props['recording_dir']
        @meeting_id = meeting_id
        @single_step = single_step
        @step_name = nil

        @logger = Logger.new("#{@log_dir}/bbb-rap-worker.log")
        @logger.level = Logger::INFO
      end
    end
  end
end

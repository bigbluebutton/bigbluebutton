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

require 'recordandplayback'
require 'rubygems'
require 'yaml'
require 'fileutils'
require 'resque'

module BigBlueButton
  module Resque
    # Base class of exceptions specific to the worker/queue system
    class WorkerError < StandardError; end

    # Exceptions that should prevent the queue system from executing the next job, but which are not actually
    # errors.
    class WorkerHalt < WorkerError; end

    # A meeting had recording enabled (record=true) but did not have recording marks and should not be automatically
    # processed.
    class WorkerNoRecordHalt < WorkerHalt; end

    class BaseWorker
      @queue = 'rap:base'

      def self.perform(*args)
        worker = new(*args)
        worker.perform

        # remove all workers that are not working anymore,
        # a simple form of garbage collection
        ::Resque.workers.first.prune_dead_workers
      end

      def perform
        @logger.info("Started worker #{@step_name} for #{@meeting_id}")
        success = yield
        @logger.info("Ended worker #{@step_name} for #{@meeting_id} with result #{success}")

        raise "Worker #{@step_name} for #{@meeting_id} failed with result #{success}" unless success

        schedule_next_step unless @single_step
      rescue WorkerHalt => e
        @logger.info(e.message)
        @logger.info("Ended worker #{@step_name} for #{@meeting_id} with worker halt. Following steps will not be run.")
      rescue StandardError => e
        @logger.error(e.message)
        e.backtrace.each do |traceline|
          @logger.error(traceline)
        end
        raise e # so that resque knows the job failed
      end

      def run_post_scripts(post_scripts_path)
        glob = File.join(post_scripts_path, '*.rb')
        Dir.glob(glob).sort.each do |post_script|
          match = %r{([^/]*).rb$}.match(post_script)
          post_type = match[1]

          @logger.info("Running post #{@step_name} script #{post_type}")
          post_started_method(post_type, @meeting_id)

          if @format_name.nil?
            ret, step_time = run_script(post_script, '-m', @meeting_id)
          else
            ret, step_time = run_script(post_script, '-m', @meeting_id, '-f', @format_name)
          end
          step_succeeded = ret.zero?

          @logger.warn("Post #{@step_name} script #{post_script}/#{post_type} failed") unless step_succeeded
          post_ended_method(post_type, @meeting_id, success: step_succeeded, step_time: step_time)
        end
      end

      def run_script(script, *args)
        step_start_time = BigBlueButton.monotonic_clock
        ret = BigBlueButton.exec_ret('ruby', script, *args)
        step_stop_time = BigBlueButton.monotonic_clock
        step_time = step_stop_time - step_start_time
        [ret, step_time]
      end

      def post_started_method(*args)
        case @step_name
        when 'archive'
          @publisher.put_post_archive_started(*args)
        when 'process'
          @publisher.put_post_process_started(*args)
        when 'publish'
          @publisher.put_post_publish_started(*args)
        end
      end

      def post_ended_method(*args)
        case @step_name
        when 'archive'
          @publisher.put_post_archive_ended(*args)
        when 'process'
          @publisher.put_post_process_ended(*args)
        when 'publish'
          @publisher.put_post_publish_ended(*args)
        end
      end

      def schedule_next_step
        @logger.info("Scheduling next step for #{@step_name}")

        opts = {
          'meeting_id': @meeting_id,
          'single_step': false,
        }

        # get the steps from the properties files
        props = BigBlueButton.read_props

        next_step = props['steps']["#{@step_name}:#{@format_name}"]
        next_step = props['steps'][@step_name] if next_step.nil?

        # make it always an array e.g. [ "process:presentation" ]
        next_step = [next_step] if next_step && !next_step.is_a?(Array)

        if next_step.nil?
          @logger.info("No next step for #{@step_name}, will not schedule anything")
        else
          next_step.each do |step|
            step_name, step_format = step.split(':') # e.g. 'process:presentation'
            opts['format_name'] = step_format unless step_format.nil?

            @logger.info("Enqueueing #{step_name} worker with #{opts.inspect}")
            klass = Object.const_get("BigBlueButton::Resque::#{step_name.capitalize}Worker")
            ::Resque.enqueue(klass, opts)
          end
        end
      end

      def initialize(opts)
        @props = BigBlueButton.read_props
        BigBlueButton.create_redis_publisher

        @publisher = BigBlueButton.redis_publisher
        @log_dir = @props['log_dir']
        @recording_dir = @props['recording_dir']
        @meeting_id = opts['meeting_id']
        @break_timestamp = opts['break_timestamp']
        @single_step = opts['single_step'] || false
        @step_name = nil
        @format_name = nil
        @full_id = if @break_timestamp.nil?
                     @meeting_id
                   else
                     "#{@meeting_id}-#{break_timestamp}"
                   end

        @logger = BigBlueButton.logger
        ::Resque.logger = @logger
        ::Resque.logger.level = Logger::INFO
      end
    end
  end
end

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
    class PublishWorker
      @queue = 'rap:publish'

      def self.perform(meeting_id, publish_type)
        worker = BigBlueButton::Resque::PublishWorker.new(meeting_id, publish_type)
        worker.perform
      end

      def perform
        @logger.info("Running publish worker for #{@meeting_id}, #{@publish_type}")

        publish_script = File.expand_path("../publish/#{@publish_type}.rb", __FILE__)
        if File.exists?(publish_script)
          BigBlueButton.redis_publisher.put_publish_started(@publish_type, @meeting_id)

          # If the publish directory exists, the script does nothing
          FileUtils.rm_rf("#{@recording_dir}/publish/#{@publish_type}/#{@meeting_id}")

          step_start_time = BigBlueButton.monotonic_clock
          # For legacy reasons, the meeting ID passed to the publish script contains
          # the playback format name.
          ret = BigBlueButton.exec_ret("ruby", publish_script, "-m", "#{@meeting_id}-#{@publish_type}")
          step_stop_time = BigBlueButton.monotonic_clock
          step_time = step_stop_time - step_start_time

          step_succeeded = (ret == 0 and File.exists?(@published_done))

          BigBlueButton.redis_publisher.put_publish_ended(
            @publish_type, @meeting_id, {
              "success" => step_succeeded,
              "step_time" => step_time
            })
        else
          @logger.warn("Processed recording found for type #{@publish_type}, but no publish script exists")
          step_succeeded = true
        end

        if step_succeeded
          @logger.info("Publish format #{@publish_type} succeeded for #{@meeting_id}")
          FileUtils.rm_rf("#{@recording_dir}/process/#{@publish_type}/#{@meeting_id}")
          FileUtils.rm_rf("#{@recording_dir}/publish/#{@publish_type}/#{@meeting_id}")

          # Check if this is the last format to be published
          if Dir.glob("#{@recording_dir}/status/processed/#{@meeting_id}-*.done").length == 0
            self.post_publish
          end
        else
          @logger.info("Publish format #{@publish_type} failed for #{@meeting_id}")
          FileUtils.touch(@published_fail)
        end
      end

      def post_publish
        glob = File.join(@post_scripts_path, "*.rb")
        Dir.glob(glob).sort.each do |post_publish_script|
          match = /([^\/]*).rb$/.match(post_publish_script)
          post_type = match[1]
          BigBlueButton.logger.info("Running post publish script #{post_type}")

          BigBlueButton.redis_publisher.put_post_publish_started post_type, @meeting_id

          step_start_time = BigBlueButton.monotonic_clock
          ret = BigBlueButton.exec_ret("ruby", post_publish_script, "-m", @meeting_id)
          step_stop_time = BigBlueButton.monotonic_clock
          step_time = step_stop_time - step_start_time
          step_succeeded = (ret == 0)

          BigBlueButton.redis_publisher.put_post_publish_ended(
            post_type, @meeting_id, {
              "success" => step_succeeded,
              "step_time" => step_time
            })

          if not step_succeeded
            BigBlueButton.logger.warn("Post publish script #{post_publish_script} failed")
          end
        end
      end

      def initialize(meeting_id, publish_type)
        props = BigBlueButton.read_props
        BigBlueButton.create_redis_publisher

        @log_dir = props['log_dir']
        @recording_dir = props['recording_dir']
        @meeting_id = meeting_id
        @publish_type = publish_type
        @post_scripts_path = File.expand_path('../post_publish', __FILE__)

        @published_done = "#{@recording_dir}/status/published/#{@meeting_id}-#{@publish_type}.done"
        @published_fail = "#{@recording_dir}/status/published/#{@meeting_id}-#{@publish_type}.fail"

        @logger = Logger.new("#{@log_dir}/bbb-rap-worker.log")
        @logger.level = Logger::INFO
      end

    end
  end
end

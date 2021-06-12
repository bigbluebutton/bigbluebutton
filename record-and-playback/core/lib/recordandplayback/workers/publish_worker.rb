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

require 'custom_hash'

module BigBlueButton
  module Resque
    class PublishWorker < BaseWorker
      @queue = 'rap:publish'

      def perform
        super do
          @logger.info("Running publish worker for #{@full_id}:#{@format_name}")

          script = File.join(BigBlueButton.rap_scripts_path,
                             'publish', "#{@format_name}.rb")
          if File.exist?(script)
            @publisher.put_publish_started(@format_name, @meeting_id)

            # If the publish directory exists, the script does nothing
            FileUtils.rm_rf("#{@recording_dir}/publish/#{@format_name}/#{@full_id}")

            remove_status_files

            # For legacy reasons, the meeting ID passed to the publish script contains
            # the playback format name.
            if @break_timestamp.nil?
              ret, step_time = run_script(script, '-m', "#{@meeting_id}-#{@format_name}")
            else
              ret, step_time = run_script(script, '-m', "#{@meeting_id}-#{@format_name}", '-b', @break_timestamp)
            end
            step_succeeded = (
              ret.zero? &&
              File.exist?(@published_done) && !File.exist?(@published_fail)
            )

            published_dir = @props['published_dir']

            playback = {}
            metadata = {}
            download = {}
            raw_size = {}
            start_time = {}
            end_time = {}
            metadata_xml_path = "#{published_dir}/#{@format_name}/#{@full_id}/metadata.xml"
            if File.exist?(metadata_xml_path)
              begin
                doc = Hash.from_xml(File.read(metadata_xml_path))
                playback = doc[:recording][:playback] unless doc[:recording][:playback].nil?
                metadata = doc[:recording][:meta] unless doc[:recording][:meta].nil?
                download = doc[:recording][:download] unless doc[:recording][:download].nil?
                raw_size = doc[:recording][:raw_size] unless doc[:recording][:raw_size].nil?
                start_time = doc[:recording][:start_time] unless doc[:recording][:start_time].nil?
                end_time = doc[:recording][:end_time] unless doc[:recording][:end_time].nil?
              rescue StandardError => e
                BigBlueButton.logger.warn 'An exception occurred while loading the extra information for the publish event'
                BigBlueButton.logger.warn e.message
                e.backtrace.each do |traceline|
                  BigBlueButton.logger.warn traceline
                end
              end
            else
              BigBlueButton.logger.warn "Couldn't find the metadata file at #{metadata_xml_path}"
            end

            @publisher.put_publish_ended(
              @format_name, @meeting_id,
              'success': step_succeeded,
              'step_time': step_time,
              'playback': playback,
              'metadata': metadata,
              'download': download,
              'raw_size': raw_size,
              'start_time': start_time,
              'end_time': end_time
            )
          else
            @logger.warn("Processed recording found for #{@meeting_id}/#{@format_name}, but no publish script exists")
            step_succeeded = true
          end

          if step_succeeded
            @logger.info("Publish format succeeded for #{@full_id}:#{@format_name}")
            FileUtils.rm_rf("#{@recording_dir}/process/#{@format_name}/#{@full_id}")
            FileUtils.rm_rf("#{@recording_dir}/publish/#{@format_name}/#{@full_id}")

            run_post_scripts(@post_scripts_path)
          else
            @logger.error("Publish format failed for #{@full_id}:#{@format_name}")
            FileUtils.touch(@published_fail)
          end

          step_succeeded
        end
      end

      def remove_status_files
        FileUtils.rm_f(@published_done)
        FileUtils.rm_f(@published_fail)
      end

      def initialize(opts)
        super(opts)
        @step_name = 'publish'
        @format_name = opts['format_name']
        @post_scripts_path = File.join(BigBlueButton.rap_scripts_path, 'post_publish')
        @published_done = "#{@recording_dir}/status/published/#{@full_id}-#{@format_name}.done"
        @published_fail = "#{@recording_dir}/status/published/#{@full_id}-#{@format_name}.fail"
      end
    end
  end
end

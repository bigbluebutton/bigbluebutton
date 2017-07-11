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

require File.expand_path('../workers', __FILE__)

module BigBlueButton
  module Resque
    class PublishWorker < BaseWorker
      @queue = 'rap:publish'

      def perform
        super do
          @logger.info("Running publish worker for #{@meeting_id}, #{@publish_type}")

          publish_script = File.expand_path("../../publish/#{@publish_type}.rb", __FILE__)
          if File.exists?(publish_script)
            @publisher.put_publish_started(@publish_type, @meeting_id)

            # If the publish directory exists, the script does nothing
            FileUtils.rm_rf("#{@recording_dir}/publish/#{@publish_type}/#{@meeting_id}")
            self.remove_status_files

            # For legacy reasons, the meeting ID passed to the publish script contains
            # the playback format name.
            ret, step_time = self.run_script(publish_script, "#{@meeting_id}-#{@publish_type}")
            step_succeeded = (
              ret == 0 &&
              File.exists?(@published_done) && !File.exists?(@published_fail)
            )

            @publisher.put_publish_ended(
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
              self.run_post_scripts(@post_scripts_path)
            end

            self.schedule_next_step unless @single_step
          else
            @logger.info("Publish format #{@publish_type} failed for #{@meeting_id}")
            FileUtils.touch(@published_fail)
          end
        end
      end

      def remove_status_files
        FileUtils.rm_f(@published_done)
        FileUtils.rm_f(@published_fail)
      end

      def initialize(meeting_id, single_step=false, publish_type)
        super(meeting_id, single_step)
        @step_name = "publish"
        @publish_type = publish_type
        @post_scripts_path = File.expand_path('../../post_publish', __FILE__)
        @published_done = "#{@recording_dir}/status/published/#{@meeting_id}-#{@publish_type}.done"
        @published_fail = "#{@recording_dir}/status/published/#{@meeting_id}-#{@publish_type}.fail"
      end

    end
  end
end

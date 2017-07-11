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
          @logger.info("Running publish worker for #{@meeting_id}/#{@format_name}")

          publish_script = File.expand_path("../../publish/#{@format_name}.rb", __FILE__)
          if File.exists?(publish_script)
            @publisher.put_publish_started(@format_name, @meeting_id)

            # If the publish directory exists, the script does nothing
            FileUtils.rm_rf("#{@recording_dir}/publish/#{@format_name}/#{@meeting_id}")
            self.remove_status_files

            # For legacy reasons, the meeting ID passed to the publish script contains
            # the playback format name.
            ret, step_time = self.run_script(publish_script, "-m", "#{@meeting_id}-#{@format_name}")
            step_succeeded = (
              ret == 0 &&
              File.exists?(@published_done) && !File.exists?(@published_fail)
            )

            @publisher.put_publish_ended(
              @format_name, @meeting_id, {
                "success" => step_succeeded,
                "step_time" => step_time
              })
          else
            @logger.warn("Processed recording found for #{@meeting_id}/#{@format_name}, but no publish script exists")
            step_succeeded = true
          end

          if step_succeeded
            @logger.info("Publish format succeeded for #{@meeting_id}/#{@format_name}")
            FileUtils.rm_rf("#{@recording_dir}/process/#{@format_name}/#{@meeting_id}")
            FileUtils.rm_rf("#{@recording_dir}/publish/#{@format_name}/#{@meeting_id}")

            self.run_post_scripts(@post_scripts_path)
          else
            @logger.info("Publish format failed for #{@meeting_id}/#{@format_name}")
            FileUtils.touch(@published_fail)
          end
        end
      end

      def remove_status_files
        FileUtils.rm_f(@published_done)
        FileUtils.rm_f(@published_fail)
      end

      def initialize(meeting_id, single_step=false, format_name)
        super(meeting_id, single_step)
        @step_name = "publish"
        @format_name = format_name
        @post_scripts_path = File.expand_path('../../post_publish', __FILE__)
        @published_done = "#{@recording_dir}/status/published/#{@meeting_id}-#{@format_name}.done"
        @published_fail = "#{@recording_dir}/status/published/#{@meeting_id}-#{@format_name}.fail"
      end

    end
  end
end

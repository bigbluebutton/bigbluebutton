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
    class ProcessWorker < BaseWorker
      @queue = 'rap:process'

      def perform
        super do
          @logger.info("Running process worker for #{@meeting_id}/#{@format_name}")

          script = File.expand_path("../../process/#{@format_name}.rb", __FILE__)
          if File.exists?(script)
            @publisher.put_publish_started(@publish_type, @meeting_id)

            self.remove_status_files

            @publisher.put_process_started(@format_name, @meeting_id)

            # If the process directory exists, the script does nothing
            FileUtils.rm_rf("#{@recording_dir}/process/#{@format_name}/#{@meeting_id}")

            ret, step_time = self.run_script(script, "-m", @meeting_id)
            step_succeeded = (
              ret == 0 &&
              File.exists?(@processed_done) && !File.exists?(@processed_fail)
            )

            @publisher.put_process_ended(
              @format_name, @meeting_id, {
                "success" => step_succeeded,
                "step_time" => step_time
              })

            if step_succeeded
              @logger.info("Process format succeeded for #{@meeting_id}/#{@format_name}")
              @logger.info("Process took #{step_time}ms")

              FileUtils.mkdir_p("#{@recording_dir}/process/#{@format_name}/#{@meeting_id}")
              IO.write("#{@recording_dir}/process/#{@format_name}/#{@meeting_id}/processing_time", step_time)

              self.run_post_scripts(@post_scripts_path)

              self.schedule_next_step unless @single_step
            else
              @logger.info("Process format failed for #{@meeting_id}/#{@format_name}")
              @logger.info("Process took #{step_time}ms")
              FileUtils.touch(@processed_fail)
            end

          else
            @logger.warn("Processed recording found for #{@meeting_id}/#{@format_name}, but no process script exists")
            step_succeeded = true
          end
        end
      end

      def remove_status_files
        FileUtils.rm_f(@processed_done)
        FileUtils.rm_f(@processed_fail)
      end

      def initialize(opts)
        super(opts)
        @step_name = "process"
        @format_name = opts["format_name"]
        @post_scripts_path = File.expand_path('../../post_process', __FILE__)
        @processed_done = "#{@recording_dir}/status/processed/#{@meeting_id}-#{@format_name}.done"
        @processed_fail = "#{@recording_dir}/status/processed/#{@meeting_id}-#{@format_name}.fail"
      end

    end
  end
end

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
          @logger.info("Running process worker for #{@meeting_id}")

          all_succeeded = true

          # Iterate over the list of recording processing scripts to find available types
          # For now, we look for the ".rb" extension - TODO other scripting languages?
          glob = File.join(File.expand_path('../../process', __FILE__), "*.rb")
          Dir.glob(glob).sort.each do |process_script|
            match2 = /([^\/]*).rb$/.match(process_script)
            process_type = match2[1]

            self.remove_status_files(process_type)

            @logger.info("Running process worker for #{@meeting_id}, type #{process_type}")
            @publisher.put_process_started(process_type, @meeting_id)

            # If the process directory exists, the script does nothing
            FileUtils.rm_rf("#{@recording_dir}/process/#{process_type}/#{@meeting_id}")

            ret, step_time = self.run_script(process_script)
            step_succeeded = (
              ret == 0 &&
              File.exists?(processed_done(process_type)) && !File.exists?(processed_fail(process_type))
            )

            @publisher.put_process_ended(
              process_type, @meeting_id, {
                "success" => step_succeeded,
                "step_time" => step_time
              })

            if step_succeeded
              @logger.info("Process format #{process_type} succeeded for #{@meeting_id}")
              @logger.info("Process took #{step_time}ms")
              IO.write("#{@recording_dir}/process/#{process_type}/#{@meeting_id}/processing_time", step_time)
              self.schedule_next_step(process_type) unless @single_step
            else
              @logger.info("Process format #{process_type} failed for #{@meeting_id}")
              @logger.info("Process took #{step_time}ms")
              FileUtils.touch(@processed_fail)
            end

            all_succeeded &&= step_succeeded
          end

          if all_succeeded
            @logger.info("Successfully processed #{@meeting_id}, calling post process")
            self.run_post_scripts(@post_scripts_path)
          end
        end
      end

      def remove_status_files(process_type)
        FileUtils.rm_f(processed_done(process_type))
        FileUtils.rm_f(processed_fail(process_type))
      end

      def processed_done(process_type)
        "#{@recording_dir}/status/processed/#{@meeting_id}-#{process_type}.done"
      end

      def processed_fail(process_type)
        "#{@recording_dir}/status/processed/#{@meeting_id}-#{process_type}.fail"
      end

      def initialize(meeting_id, single_step=false)
        super(meeting_id, single_step)
        @step_name = "process"
        @post_scripts_path = File.expand_path('../../post_process', __FILE__)
      end

    end
  end
end

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
    class SanityWorker < BaseWorker
      @queue = 'rap:sanity'

      def perform
        super do
          @logger.info("Running sanity worker for #{@meeting_id}")
          @publisher.put_sanity_started(@meeting_id)

          self.remove_status_files

          script = File.expand_path('../../sanity/sanity.rb', __FILE__)
          ret, step_time = self.run_script(script, "-m", @meeting_id)
          step_succeeded = (ret == 0 && File.exists?(@sanity_done))

          @publisher.put_sanity_ended(
            @meeting_id, {
              "success" => step_succeeded,
              "step_time" => step_time
            })

          if step_succeeded
            @logger.info("Successfully sanity checked #{@meeting_id}")
            self.run_post_scripts(@post_scripts_path)
            self.schedule_next_step unless @single_step
          else
            @logger.error("Sanity check failed on #{@meeting_id}")
            FileUtils.touch(@sanity_fail)
          end
        end
      end

      def remove_status_files
        FileUtils.rm_f(@sanity_done)
        FileUtils.rm_f(@sanity_fail)
      end

      def initialize(meeting_id, single_step=false)
        super(meeting_id, single_step)
        @step_name = "sanity"
        @post_scripts_path = File.expand_path('../../post_archive', __FILE__)
        @sanity_fail = "#{@recording_dir}/status/sanity/#{@meeting_id}.fail"
        @sanity_done = "#{@recording_dir}/status/sanity/#{@meeting_id}.done"
      end

    end
  end
end

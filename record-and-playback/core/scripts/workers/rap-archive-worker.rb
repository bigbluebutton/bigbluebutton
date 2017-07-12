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
    class ArchiveWorker < BaseWorker
      @queue = 'rap:archive'

      def perform
        super do
          @logger.info("Running archive worker for #{@meeting_id}")
          @publisher.put_archive_started(@meeting_id)

          self.remove_status_files

          script = File.expand_path('../../archive/archive.rb', __FILE__)
          ret, step_time = self.run_script(script, "-m", @meeting_id)
          step_succeeded = (
            ret == 0 &&
            (File.exists?(@archived_done) || File.exists?(@archived_norecord)) &&
            !File.exists?(@archived_fail)
          )

          @publisher.put_archive_ended(
            @meeting_id, {
              "success" => step_succeeded,
              "step_time" => step_time
            })

          if step_succeeded
            @logger.info("Successfully archived #{@meeting_id}")
            self.schedule_next_step unless @single_step
          else
            @logger.error("Failed to archive #{@meeting_id}")
            FileUtils.touch(@archived_fail)
          end
          @logger.debug("Finished archive worker for #{@meeting_id}")
        end
      end

      def remove_status_files
        FileUtils.rm_f(@archived_done)
        FileUtils.rm_f(@archived_norecord)
        FileUtils.rm_f(@archived_fail)
      end

      def initialize(opts)
        super(opts)
        @step_name = "archive"
        @archived_fail = "#{@recording_dir}/status/archived/#{@meeting_id}.fail"
        @archived_done = "#{@recording_dir}/status/archived/#{@meeting_id}.done"
        @archived_norecord = "#{@recording_dir}/status/archived/#{@meeting_id}.norecord"
      end

    end
  end
end


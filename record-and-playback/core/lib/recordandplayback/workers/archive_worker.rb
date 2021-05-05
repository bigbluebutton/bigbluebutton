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

module BigBlueButton
  module Resque
    class ArchiveWorker < BaseWorker
      @queue = 'rap:archive'

      def perform
        super do
          @logger.info("Running archive worker for #{@full_id}")
          @publisher.put_archive_started(@meeting_id)

          remove_status_files

          script = File.join(BigBlueButton.rap_scripts_path, 'archive', 'archive.rb')
          if @break_timestamp.nil?
            ret, step_time = run_script(script, '-m', @meeting_id)
          else
            ret, step_time = run_script(script, '-m', @meeting_id, '-b', @break_timestamp)
          end

          step_succeeded = (
            ret.zero? &&
            (File.exist?(@archived_done) || File.exist?(@archived_norecord)) &&
            !File.exist?(@archived_fail)
          )

          norecord = File.exist?(@archived_norecord)
          @publisher.put_archive_norecord(@meeting_id) if norecord

          @publisher.put_archive_ended(@meeting_id, success: step_succeeded, step_time: step_time)

          if step_succeeded
            @logger.info("Successfully archived #{@full_id}")
          else
            @logger.error("Failed to archive #{@full_id}")
            FileUtils.touch(@archived_fail)
          end
          @logger.debug("Finished archive worker for #{@full_id}")

          raise WorkerNoRecordHalt, "Meeting #{@full_id} had no recording marks" if norecord

          step_succeeded
        end
      end

      def remove_status_files
        FileUtils.rm_f(@archived_done)
        FileUtils.rm_f(@archived_norecord)
        FileUtils.rm_f(@archived_fail)
      end

      def initialize(opts)
        super(opts)
        @step_name = 'archive'
        @archived_fail = "#{@recording_dir}/status/archived/#{@full_id}.fail"
        @archived_done = "#{@recording_dir}/status/archived/#{@full_id}.done"
        @archived_norecord = "#{@recording_dir}/status/archived/#{@full_id}.norecord"
      end
    end
  end
end

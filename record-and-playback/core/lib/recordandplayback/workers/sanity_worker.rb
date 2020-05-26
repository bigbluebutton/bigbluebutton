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
    class SanityWorker < BaseWorker
      @queue = 'rap:sanity'

      def perform
        super do
          @logger.info("Running sanity worker for #{@full_id}")
          @publisher.put_sanity_started(@meeting_id)

          remove_status_files

          script = File.join(BigBlueButton.rap_scripts_path, 'sanity', 'sanity.rb')
          if @break_timestamp.nil?
            ret, step_time = run_script(script, '-m', @meeting_id)
          else
            ret, step_time = run_script(script, '-m', @meeting_id, '-b', @break_timestamp)
          end
          step_succeeded = (ret.zero? && File.exist?(@sanity_done))

          @publisher.put_sanity_ended(@meeting_id, success: step_succeeded, step_time: step_time)

          if step_succeeded
            @logger.info("Successfully sanity checked #{@full_id}")
            run_post_scripts(@post_scripts_path)
          else
            @logger.error("Sanity check failed on #{@full_id}")
            FileUtils.touch(@sanity_fail)
          end

          step_succeeded
        end
      end

      def remove_status_files
        FileUtils.rm_f(@sanity_done)
        FileUtils.rm_f(@sanity_fail)
      end

      def initialize(opts)
        super(opts)
        @step_name = 'sanity'
        @post_scripts_path = File.join(BigBlueButton.rap_scripts_path, 'post_archive')
        @sanity_fail = "#{@recording_dir}/status/sanity/#{@full_id}.fail"
        @sanity_done = "#{@recording_dir}/status/sanity/#{@full_id}.done"
      end
    end
  end
end

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
    class CaptionsWorker < BaseWorker
      @queue = 'rap:captions'

      def perform
        super do
          @logger.info("Running captions worker for #{@full_id}")

          script = File.join(BigBlueButton.rap_scripts_path, 'utils', 'captions.rb')
          ret, = run_script(script, '-m', @meeting_id)

          if ret.zero?
            @logger.info("Succeeded generating captions for #{@full_id}")
          else
            @logger.error("Failed generating captions for #{@full_id} (got #{ret})")
          end

          @logger.info("Finished format succeeded for #{@full_id}")
          ret
        end
      end

      def initialize(opts)
        super(opts)
        @step_name = 'captions'
      end
    end
  end
end

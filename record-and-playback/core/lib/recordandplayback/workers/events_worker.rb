# frozen_string_literal: true

# Copyright © 2019 BigBlueButton Inc. and by respective authors.
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
    class EventsWorker < BaseWorker
      @queue = 'rap:archive'

      def store_events(target_dir)
        @logger.info("Keeping events for #{meeting_id}")
        redis = BigBlueButton::RedisWrapper.new(@props['redis_host'], @props['redis_port'], @props['redis_password'])
        events_archiver = BigBlueButton::RedisEventsArchiver.new(redis)

        events_xml = "#{target_dir}/events.xml"
        events_archiver.store_events(@meeting_id, events_xml, @break_timestamp)

        # When the events script is responsible for archiving events, the sanity script (which normally clears the events
        # from redis) will not get run, so we have to clear them here.
        events_archiver.delete_events(meeting_id) if @break_timestamp.nil?
      end

      def perform
        super do
          @logger.info("Running events worker for #{@full_id}")
          unless File.exist(@ended_done)
            @logger.info("Events generation was not enabled for #{@full_id}, skipping")
            next true # We're inside a block and want to return to the block's caller, not return from perform
          end

          target_dir = "#{@events_dir}/#{@meeting_id}"
          FileUtils.mkdir_p(target_dir)

          if File.exist?(raw_events_xml)
            # This is a recorded meeting. The archive step should have already run, so copy the events.xml from the raw
            # recording directory.
            FileUtils.cp("#{@recording_dir}/raw/#{@meeting_id}/events.xml", "#{target_dir}/events.xml")
          else
            # This meeting was not recorded. We need to run the (incremental, if break_timestamp was provided) events archiving.
            store_events(target_dir)
          end

          FileUtils.rm_f(@ended_done)

          # Only run post events scripts after full meeting ends, not during segments
          run_post_scripts(@post_scripts_path) if @break_timestamp.nil?

          @logger.info("Finished events worker for #{@full_id}")
        end
      end

      def initialize(opts)
        super(opts)
        @step_name = 'events'
        @events_dir = @props['events_dir']
        @post_scripts_path = File.join(BigBlueButton.rap_scripts_path, 'post_events')
        @ended_done = "#{@recording_dir}/status/ended/#{@full_id}.done"
      end
    end
  end
end

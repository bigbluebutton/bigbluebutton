# frozen_string_literal: true

# BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
#
# Copyright (c) 2024 BigBlueButton Inc. and by respective authors.
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

require 'shellwords'
require 'csv'
require 'tempfile'

module BigBlueButton
  module EDL
    module MediaUtils
      # Get a list of gaps in PTS values.
      #
      # @param process_dir [String] path to directory for temporary processing files
      # @param filename [String] path to the media file
      # @param stream_type [:audio, :video] The type of media stream to inspect
      # @param duration [Numeric] The expected duration of the media stream (ms)
      # @param min_gap [Numeric] Only include gaps which are at least this long (ms)
      #   Default is 60 seconds, long enough that it won't be hit for short dropouts, but short
      #   enough that it won't cause excessive memory use when ffmpeg fills the gap.
      #
      # @return [Array<Array<Numeric>>] A list of gaps. For each gap, the first element is the
      #   start of the gap (the moment when the last frame of media before the gap finishes) and
      #   the second element is the end of the gap (the moment when the next frame of media after
      #   the gap starts). All timestamps in ms.
      def self.pts_gaps(process_dir, filename, stream_type, duration, min_gap = 60_000)
        stream_specifier =
          case stream_type
          when :audio then 'a:0'
          when :video then 'v:0'
          else raise ArgumentError, "Unexpected stream_type #{stream_type.inspect}"
          end
        ffprobe_cmd = [
          'ffprobe', '-v', 'warning', '-select_streams', stream_specifier,
          '-show_entries', 'packet=pts_time,duration_time', '-of', 'csv=p=0',
          filename,
        ]

        BigBlueButton.logger.debug(
          "Getting #{stream_type} packet PTS times for #{File.basename(filename).inspect}: " \
          "#{Shellwords.join(ffprobe_cmd)}",
        )

        pts_gaps = []
        Tempfile.create(['ffprobe', '.log'], process_dir) do |log_file|
          IO.pipe do |r, w|
            pid = spawn(
              *ffprobe_cmd,
              close_others: true,
              in: :close,
              out: w,
              err: log_file,
            )
            begin
              w.close

              prev_end = 0

              csv = CSV.new(
                r,
                headers: %i[pts_time duration_time],
                converters: %i[float float],
                skip_blanks: true,
                empty_value: 'N/A',
              )
              csv.each do |row|
                next if row[:pts_time] == 'N/A'

                pts = (row[:pts_time] * 1000).round

                gap = pts - prev_end
                if gap >= min_gap
                  BigBlueButton.logger.info("PTS gap detected between #{prev_end}ms and #{pts}ms (#{gap}ms long)")
                  pts_gaps << [prev_end, pts]
                end

                prev_end = pts
                prev_end += (row[:duration_time] * 1000).round unless row[:duration_time] == 'N/A'
              end

              if prev_end < duration
                gap = duration - prev_end
                BigBlueButton.logger.info("PTS gap detected between #{prev_end}ms and end of file at #{duration}ms (#{gap}ms long)")
                # Using Infinity as end time to avoid rounding issues causing a tiny cut near the file end
                pts_gaps << [prev_end, Float::INFINITY]
              end
            ensure
              _pid, status = Process.wait2(pid)
              BigBlueButton.logger.debug("ffprobe #{status}")
              log_file.rewind
              log_file.each_line do |line|
                BigBlueButton.logger.debug(line.chomp)
              end
            end
          end
        end

        pts_gaps
      rescue StandardError => e
        BigBlueButton.logger.warn("Failed to probe PTS: #{e}")
        []
      end
    end
  end
end

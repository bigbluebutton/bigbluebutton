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
      DEFAULT_PTS_GAP_MS = 30_000

      # Split an EDL entry into two entries at a recording timestamp.
      #
      # @param edl [Array<Hash>] EDL to modify in place
      # @param entry_i [Integer] index of the entry to split
      # @param rec_time [Integer] recording timestamp to split at, in ms
      # @param offset_entry [Proc] proc used to clone an EDL entry with timestamps offset
      def self.split_edl_entry(edl, entry_i, rec_time, offset_entry)
        BigBlueButton.logger.debug("Splitting EDL entry #{entry_i} at #{rec_time}ms")

        entry = edl[entry_i]
        offset = rec_time - entry[:timestamp]
        new_entry = offset_entry.call(entry, offset)
        new_entry[:timestamp] = rec_time
        edl.insert(entry_i + 1, new_entry)
      end

      # Get a list of gaps in PTS values.
      #
      # @param process_dir [String] path to directory for temporary processing files
      # @param filename [String] path to the media file
      # @param stream_type [:audio, :video] The type of media stream to inspect
      # @param duration [Numeric, nil] The expected duration of the media stream (ms), if known
      # @param min_gap [Numeric] Only include gaps which are at least this long (ms)
      #   Default is 30 seconds, long enough that it won't be hit for short dropouts, but short
      #   enough that it won't cause excessive memory use when ffmpeg fills the gap.
      #
      # @return [Array<Array<Numeric>>] A list of gaps. For each gap, the first element is the
      #   start of the gap (the moment when the last frame of media before the gap finishes) and
      #   the second element is the end of the gap (the moment when the next frame of media after
      #   the gap starts). All timestamps in ms.
      def self.pts_gaps(process_dir, filename, stream_type, duration = nil, min_gap = DEFAULT_PTS_GAP_MS)
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

              if duration && prev_end < duration
                gap = duration - prev_end
                BigBlueButton.logger.info(
                  "PTS gap detected between #{prev_end}ms and end of file at #{duration}ms " \
                  "(#{gap}ms long)"
                )
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

      # Remove sources from an EDL for time ranges where the underlying media stream has large PTS gaps.
      #
      # @param edl [Array<Hash>] EDL to modify in place
      # @param source_gaps [Hash{Object => Array<Array<Numeric>>}] mapping of logical source ids to PTS gaps
      # @param stream_type [:audio, :video] media stream type to remove
      def self.remove_pts_gaps_from_edl(edl, source_gaps, stream_type:)
        source_for_entry, split_entry, remove_source =
          case stream_type
          when :audio
            [
              lambda { |entry, filename|
                entry[:audios]&.find { |audio| audio[:filename] == filename }
              },
              lambda { |entries, entry_i, rec_time|
                split_edl_entry(entries, entry_i, rec_time, BigBlueButton::Events.edl_entry_offset_audio)
              },
              lambda { |entry, filename|
                entry[:audios]&.reject! { |audio| audio[:filename] == filename }
              },
            ]
          when :video
            [
              lambda { |entry, filename|
                source = nil
                entry[:areas].each_value do |videos|
                  source = videos.find { |video| video[:filename] == filename }
                  break unless source.nil?
                end
                source
              },
              lambda { |entries, entry_i, rec_time|
                split_edl_entry(entries, entry_i, rec_time, BigBlueButton::Events.edl_entry_offset_video)
              },
              lambda { |entry, filename|
                entry[:areas].each_value do |videos|
                  videos.reject! { |video| video[:filename] == filename }
                end
              },
            ]
          else
            raise ArgumentError, "Unexpected stream_type #{stream_type.inspect}"
          end

        source_gaps.each do |source_id, gaps_array|
          next if gaps_array.nil? || gaps_array.empty?

          BigBlueButton.logger.info(
            "#{stream_type.to_s.capitalize} file #{File.basename(source_id.to_s)} " \
            "has #{gaps_array.length} gap(s), adjusting EDL"
          )

          next_entry_i = 0
          gaps = gaps_array.each
          gap_start, gap_end = gaps.next
          while next_entry_i < edl.length - 1
            entry_i = next_entry_i
            entry = edl[entry_i]
            next_entry_i += 1

            source = source_for_entry.call(entry, source_id)
            # Current EDL entry does not contain this file
            next unless source

            source_in = source[:timestamp]
            source_out = source_in + edl[next_entry_i][:timestamp] - entry[:timestamp]

            # Iterate forward through gaps until we find one that's not in the past
            gap_start, gap_end = gaps.next while gap_end <= source_in

            # Nothing to do if the next gap is after the current entry ends
            next if gap_start >= source_out

            BigBlueButton.logger.debug(
              "Processing gap [#{gap_start}ms, #{gap_end}ms) " \
              "in EDL entry #{entry_i} (timestamp=#{entry[:timestamp]}ms)"
            )

            # If gap starts in this EDL entry, then it needs to be split
            if gap_start > source_in
              # Split before the gap; the new entry will be handled by the next loop.
              split_entry.call(edl, entry_i, gap_start - source_in + entry[:timestamp])
              next
            end

            # If gap ends in this EDL entry, then it needs to be split
            if gap_end < source_out
              split_entry.call(edl, entry_i, gap_end - source_in + entry[:timestamp])
              # Source needs to be removed from the current entry
            end

            # Only get here if the current EDL entry is completely contained within a gap.
            # Remove the file from the entry.
            remove_source.call(entry, source_id)
          end
        rescue StopIteration
          # Reached the end of the gaps list for this file, go to the next file.
          next
        end

        nil
      end
    end
  end
end

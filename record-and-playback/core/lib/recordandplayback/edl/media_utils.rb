# encoding: UTF-8

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

require 'json'
require 'shellwords'

module BigBlueButton
  module EDL
    module MediaUtils
      # Gets all packet PTS times from a media file for a specific stream type.
      # stream_type should be 'a' for audio, 'v' for video.
      # Returns an array of PTS times (float) or nil on error / no data.
      def self.get_packet_pts_times(filename, stream_type)
        ffprobe_cmd = [
          *FFPROBE, '-v', 'error', '-select_streams', "#{stream_type}:0",
          '-show_entries', 'packet=pts_time', '-of', 'csv=p=0', filename
        ]
        BigBlueButton.logger.debug "Getting #{stream_type == 'a' ? 'audio' : 'video'} packet PTS times for '#{File.basename(filename)}': #{Shellwords.join(ffprobe_cmd)}"
        
        pts_times = []
        begin
          status = IO.popen(ffprobe_cmd) do |io|
            io.each_line do |line|
              line.strip!
              next if line.empty? || line == "N/A" # Skip empty lines or "N/A"
              begin
                pts_times << Float(line)
              rescue ArgumentError
                BigBlueButton.logger.warn "Could not parse PTS value '#{line}' as float for '#{File.basename(filename)}' (#{stream_type} stream). Skipping line."
              end
            end
            $? # Process status
          end

          if status.nil? || !status.success?
            BigBlueButton.logger.warn "ffprobe command for PTS times on '#{File.basename(filename)}' (#{stream_type} stream) exited with status #{status&.exitstatus}."
            return nil
          end
          
          return pts_times.empty? ? nil : pts_times.sort.uniq
        rescue StandardError => e
          BigBlueButton.logger.error "Error getting PTS times from '#{File.basename(filename)}' (#{stream_type} stream): #{e.message}"
          nil
        end
      end

      # Check if a media file has PTS (Presentation Timestamp) gaps larger than max_gap_ms
      # for the specified stream_type ('a' or 'v').
      # Returns [previous_pts, current_pts] of the first large gap, or nil if no large gaps.
      def self.has_large_pts_gaps?(filename, max_gap_ms, stream_type)
        max_gap_seconds = max_gap_ms / 1000.0
        
        pts_times = get_packet_pts_times(filename, stream_type)
        return nil if pts_times.nil? || pts_times.length < 2

        stream_name = stream_type == 'a' ? 'audio' : 'video'
        BigBlueButton.logger.debug "Checking for #{stream_name} PTS gaps in '#{File.basename(filename)}' (max_gap: #{max_gap_seconds.round(3)}s, total packets: #{pts_times.length})"

        previous_pts = pts_times.first
        (1...pts_times.length).each do |i|
          current_pts = pts_times[i]
          gap = current_pts - previous_pts
          if gap > max_gap_seconds
            BigBlueButton.logger.info "Large #{stream_name} PTS gap (#{gap.round(3)}s > #{max_gap_seconds.round(3)}s) detected in '#{File.basename(filename)}' between PTS #{previous_pts.round(3)} and #{current_pts.round(3)}."
            return [previous_pts, current_pts] # Return PTS boundaries of the gap
          end
          previous_pts = current_pts
        end
        
        BigBlueButton.logger.debug "No large #{stream_name} PTS gaps detected in '#{File.basename(filename)}'."
        nil # No large gaps found
      end
    end
  end
end

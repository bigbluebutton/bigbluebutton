# frozen_string_literal: true

# BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
#
# Copyright (c) 2013 BigBlueButton Inc. and by respective authors.
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
require 'set'
require 'shellwords'

require_relative 'media_utils'
require_relative 'video/presentation_video_source'
require_relative 'video/video_source_reader'
require_relative 'video/video_source'

module BigBlueButton
  module EDL
    module Video
      FFMPEG_WF_CODEC = 'libx264'
      FFMPEG_WF_ARGS = [
        '-codec', FFMPEG_WF_CODEC.to_s, '-threads', '2',
        # Use the faster preset, along with the film tune that reduces deblocking strength slightly to improve
        # appearance of small text/shapes on slides. Adjust the subme option to the value from veryfast preset; without
        # much motion it's not a big quality loss, but it is a big speed improvement. Adjust the bframes value +2 like
        # the animation tune; we have a lot of frames which are very similar. Enable stitchable mode since we are
        # concatenating video. Use crf to balance the file size vs video quality tradeoff.
        '-preset', 'faster', '-tune', 'film', '-x264opts', 'subme=2:bframes=5:stitchable=1', '-crf', '23',
        '-force_key_frames', 'expr:gte(t,n_forced*10)', '-pix_fmt', 'yuv420p',
      ]
      WF_EXT = 'mp4'

      def self.dump(edl)
        BigBlueButton.logger.debug "EDL Dump:"
        edl.each do |entry|
          BigBlueButton.logger.debug "---"
          BigBlueButton.logger.debug "  Timestamp: #{entry[:timestamp]}"
          BigBlueButton.logger.debug "  Video Areas:"
          entry[:areas].each do |name, videos|
            BigBlueButton.logger.debug "    #{name}"
            videos.each do |video|
              BigBlueButton.logger.debug "      #{video[:filename]} at #{video[:timestamp]} (original duration: #{video[:original_duration]})"
            end
          end
          next unless entry[:conditions]&.any?

          BigBlueButton.logger.debug('  Conditions:')
          entry[:conditions].each do |name, value|
            BigBlueButton.logger.debug("    #{name}: #{value}")
          end
        end
      end

      # Merge multiple EDLs into a single EDL
      #
      # The merged EDL will preserve all areas from all EDLS, and merge the list of videos for each area if multiple EDLs
      # provide videos for the same area. Conditions will be merged from all EDLS. If multiple EDLs provide the same condition
      # at the same time with different values, the result is undefined.
      #
      # @param edls [Array<Array<Hash>>] The EDLs to merge
      # @return [Array<Hash>] The merged EDL
      def self.merge(*edls)
        entries_i = Array.new(edls.length, 0)
        done = Array.new(edls.length, false)
        merged_edl = [{ timestamp: 0, areas: {}, conditions: {} }]

        while !done.all?
          # Figure out what the next entry in each edl is
          entries = []
          entries_i.each_with_index do |entry, edl|
            entries << edls[edl][entry]
          end

          # Find the next entry - the one with the lowest timestamp
          next_edl = nil
          next_entry = nil
          entries.each_with_index do |entry, edl|
            if entry
              if !next_entry or entry[:timestamp] < next_entry[:timestamp]
                next_edl = edl
                next_entry = entry
              end
            end
          end

          # To calculate differences, need the previous entry from the same edl
          prev_entry = nil
          if entries_i[next_edl] > 0
            prev_entry = edls[next_edl][entries_i[next_edl] - 1]
          end

          # Find new videos that were added
          add_areas = {}
          if prev_entry
            next_entry[:areas].each do |area, videos|
              add_areas[area] = []
              if !prev_entry[:areas][area]
                add_areas[area] = videos
              else
                videos.each do |video|
                  if !prev_entry[:areas][area].find { |v| v[:filename] == video[:filename] }
                    add_areas[area] << video
                  end
                end
              end
            end
          else
            add_areas = next_entry[:areas]
          end

          # Find videos that were removed
          del_areas = {}
          if prev_entry
            prev_entry[:areas].each do |area, videos|
              del_areas[area] = []
              if !next_entry[:areas][area]
                del_areas[area] = videos
              else
                videos.each do |video|
                  if !next_entry[:areas][area].find { |v| v[:filename] == video[:filename] }
                    del_areas[area] << video
                  end
                end
              end
            end
          end

          # Determine whether to create a new entry or edit the previous one
          merged_entry = last_entry = merged_edl.last
          unless last_entry[:timestamp] == next_entry[:timestamp]
            # Need to create a new entry
            merged_entry = { timestamp: next_entry[:timestamp], areas: {}, conditions: {} }
            merged_edl << merged_entry
            # Copy videos from the last entry into the new entry, updating timestamps
            offset = merged_entry[:timestamp] - last_entry[:timestamp]
            last_entry[:areas].each do |area, videos|
              merged_entry[:areas][area] = videos.map do |video|
                video.merge(timestamp: video[:timestamp] + offset)
              end
            end
            # Carry forward conditions from the last entry
            merged_entry[:conditions] = last_entry.fetch(:conditions, {}).dup
          end

          # Remove deleted videos
          del_areas.each do |area, videos|
            merged_entry[:areas][area] = merged_entry[:areas][area].reject do |video|
              videos.find { |v| v[:filename] == video[:filename] }
            end
          end
          # Add new videos
          add_areas.each do |area, videos|
            if !merged_entry[:areas][area]
              merged_entry[:areas][area] = videos
            else
              merged_entry[:areas][area] += videos
            end
          end

          # Pull in timestamps from the next entry to respect edit cuts
          next_entry[:areas].each do |area, videos|
            videos.each do |video|
              merged_video = merged_entry[:areas][area].find do |v|
                v[:filename] == video[:filename]
              end
              if !merged_video.nil?
                merged_video[:timestamp] = video[:timestamp]
              end
            end
          end

          # Merge conditions from the next entry
          merged_entry[:conditions].merge!(next_entry.fetch(:conditions, {}))

          entries_i[next_edl] += 1
          if entries_i[next_edl] >= edls[next_edl].length
            done[next_edl] = true
          end
        end

        merged_edl
      end

      # Edit the EDL to make sure that every cut has a minimum length to ensure processing will work properly
      def self.enforce_cut_lengths(edl, framerate)
        # Set the minimum cut length to 2 frames long
        # This can range from 83ms for 24fps video (video format), up to 400ms (presentation format deskshare)
        min_cut_len = (1000 / framerate * 2).round

        # Special case handling for the start of the video
        # If there's a cut immediately after the start of the video, the later logic would delete the cut
        # for the start of the video, which would result in desync. Any cuts within min_cut_len of the video
        # start have to be pushed back to avoid this situation. It multiple cuts are pushed back (they'd all get
        # set to the same timestamp), the later logic will clean them up.
        1.upto(edl.length - 1).each do |i|
          # We've made it past the problematic point near the video start
          break if edl[i][:timestamp] >= min_cut_len

          BigBlueButton.logger.debug("Pushing EDL entry index #{i} from #{edl[i][:timestamp]} to #{min_cut_len}")
          offset = min_cut_len - edl[i][:timestamp]
          # Move the cut to start at min_cut_len
          edl[i][:timestamp] = min_cut_len
          # And offset the start times of every video to compensate
          edl[i][:areas].each_value do |videos|
            videos.each do |video|
              video[:timestamp] += offset
            end
          end
        end

        # Iterate through the edl entries from end to just after the start
        (edl.length - 1).downto(1).each do |i|
          duration = edl[i][:timestamp] - edl[i - 1][:timestamp]
          # If the cut that *ends* at EDL entry i is less than the minimum cut length
          next unless duration < min_cut_len

          # Then delete edl entry i - 1 from the list
          BigBlueButton.logger.debug("Dropping EDL entry index #{i - 1} (#{duration} < #{min_cut_len})")
          edl.delete_at(i - 1)
          # On the next iteration through the loop, we'll be re-checking from the same end point, but a new start
        end

        # What if all of the cuts got deleted?
        if edl.length == 1
          BigBlueButton.logger.debug('EDL contains no cuts - enforcing minimum length')
          # Add a new end point at the minimum cut length
          edl << { timestamp: min_cut_len, areas: {} }
        end

        nil
      end

      # Render a video EDL to a file
      #
      # @param edl [Array<Hash>] The EDL to render
      # @param layout [Hash] The layout to use
      # @param output_basename [String] The base name of the output file
      # @param threads [Integer] The number of threads to use
      # @param layouts [Array<Hash>] Additional layouts to select between automatically
      def self.render(edl, layout, output_basename, threads = 2, layouts: nil)
        video_sources = {}
        process_dir = File.dirname(output_basename)

        corrupt_videos = Set.new

        BigBlueButton.logger.info 'Pre-processing EDL'
        enforce_cut_lengths(edl, layout[:framerate])

        (0...(edl.length - 1)).each do |i|
          # Have to fetch information about all the input video files,
          # so collect them.
          edl[i][:areas].each_value do |videos|
            videos.each do |video|
              if video[:source]
                # A video source was passed in as part of the EDL, nothing to do
                next
              end

              if video_sources.key?(video[:filename])
                # We've already determined the video source to use for this file
                video[:source] = video_sources[video[:filename]]
                next
              end

              # Create a new file video source from the filename
              video_source = VideoSource.new(
                video[:filename],
                process_dir,
                original_duration: video[:original_duration]
              )
              if video_source.corrupt?
                BigBlueButton.logger.warn('Will remove corrupt video file from output')
                corrupt_videos << video[:filename]
              end
              video[:source] = video_sources[video[:filename]] = video_source
            end
          end
        end

        unless corrupt_videos.empty?
          BigBlueButton.logger.info 'Removing corrupt video files from EDL'
          edl.each do |event|
            event[:areas].each_value do |videos|
              videos.delete_if { |video| corrupt_videos.include?(video[:filename]) }
            end
          end
        end

        gap_probe_files = video_sources.each_with_object({}) do |(filename, video_source), files|
          next if corrupt_videos.include?(filename)

          files[filename] = {
            filename: video_source.filename,
            duration: video_source.duration,
          }
        end
        remove_video_gaps(edl, gap_probe_files, process_dir)
        # Gap removal can add cuts, so enforce the minimum length on the final EDL.
        enforce_cut_lengths(edl, layout[:framerate])

        (0...(edl.length - 1)).each do |i|
          # The render scripts need this to calculate cut lengths.
          edl[i][:next_timestamp] = edl[i + 1][:timestamp]
        end

        dump(edl)

        BigBlueButton.logger.info 'Compositing cuts'
        render = "#{output_basename}.#{WF_EXT}"
        concat = []
        running = []
        begin
          (0...(edl.length - 1)).each do |i|
            cut = edl[i]
            segment = "#{output_basename}_#{i}.#{WF_EXT}"
            concat << {
              file: segment,
              duration: cut[:next_timestamp] - cut[:timestamp],
            }
            cut_layout = select_layout_for_cut(cut, layout, layouts)

            # Because of the process management that the composite_cut function does internally for the ffmpeg processes
            # it spawns, it is much simpler to run the function in a separate (forked) process rather than attempt to
            # use threads or async. This way each composite_cut function can separately manage its own child processes.
            running << fork do
              composite_cut(segment, cut, cut_layout)
            end

            next if running.length < threads

            # If we've reached the thread limit, then wait for one child process to exit.
            pid, status = Process.wait2
            running.delete(pid)
            raise 'Failed to composite cut' unless status.success?
          end
          # Wait for any remaining processes to finish
          loop do
            pid, status = Process.wait2
            running.delete(pid)
            raise 'Failed to composite cut' unless status.success?
          rescue Errno::ECHILD
            break
          end
        rescue Interrupt, StandardError
          # If we're interrupted, or one of the composite_cut functions failed, then we want to terminate any other
          # running child processes cleanly.
          BigBlueButton.logger.error 'Terminating child processes…'

          running.each do |pid|
            Process.kill('INT', pid)
          rescue Errno::ESRCH, Errno::EPERM
            # Ignore; these errors mean the process is no longer running
          end
          Process.waitall

          raise
        end

        concat_file = "#{output_basename}.txt"
        File.open(concat_file, 'w') do |outio|
          outio.write("ffconcat version 1.0\n")
          concat.each do |segment|
            outio.write("file #{segment[:file]}\n")
          end
        end

        ffmpeg_cmd = [*FFMPEG, '-safe', '0', '-f', 'concat', '-i', concat_file, '-c', 'copy', render]
        exitstatus = BigBlueButton.exec_ret(*ffmpeg_cmd)
        raise "ffmpeg failed, exit code #{exitstatus}" if exitstatus != 0

        concat.each do |segment|
          File.delete(segment[:file])
        end

        render
      end

      # Check video files for large gaps in timestamps and remove them from the EDL for the duration of the gap.
      def self.remove_video_gaps(edl, video_files, process_dir)
        source_handlers = {
          source_for_entry: ->(entry, filename) { find_video(entry, filename) },
          split_entry: ->(entries, entry_i, rec_time) { split_edl_at(entries, entry_i, rec_time) },
          remove_source: ->(entry, filename) { remove_video(entry, filename) },
        }

        BigBlueButton::EDL::MediaUtils.remove_pts_gaps_from_edl(
          edl,
          video_files,
          process_dir,
          stream_type: :video,
          source_handlers: source_handlers,
          min_gap: 30_000
        )
      end

      # The methods below are for private use

      def self.find_video(entry, filename)
        entry[:areas].each_value do |videos|
          video = videos.find { |candidate| candidate[:filename] == filename }
          return video unless video.nil?
        end

        nil
      end

      def self.remove_video(entry, filename)
        entry[:areas].each_value do |videos|
          videos.reject! { |video| video[:filename] == filename }
        end
      end

      def self.split_edl_at(edl, entry_i, rec_time)
        BigBlueButton::EDL::MediaUtils.split_edl_entry(
          edl,
          entry_i,
          rec_time,
          BigBlueButton::Events.edl_entry_offset_video
        )
      end

      def self.ms_to_s(timestamp)
        s = timestamp / 1000
        ms = timestamp % 1000
        "%d.%03d" % [s, ms]
      end

      def self.aspect_scale(old_width, old_height, new_width, new_height)
        return [new_width, new_height] if old_width.nil? || old_height.nil?

        if old_width.to_f / old_height > new_width.to_f / new_height
          new_height = (2 * (old_height.to_f * new_width / old_width / 2).round).to_i
        else
          new_width = (2 * (old_width.to_f * new_height / old_height / 2).round).to_i
        end
        [new_width, new_height]
      end

      # Select one of multiple possible layouts separately for each cut.
      #
      # This function is used to select a layout for a specific cut, based on the media present in the cut and the
      # constraints of the layout (required media types, etc).
      #
      # The layout and area hashes must be normalized to have symbol keys, and the area names and required media types must also
      # be symbols.
      #
      # @param cut [Hash] EDL cut to select layout for
      # @param layout [Hash] Default layout to use if no specific layout is found
      # @param layouts [Array<Hash>, nil] Array of alternative layouts to select from
      # @return [Hash] Selected layout
      def self.select_layout_for_cut(cut, layout, layouts = nil)
        layouts ||= []
        layout_name = 'default'

        media = Set.new(cut[:areas].filter_map { |name, videos| name unless videos.empty? })
        BigBlueButton.logger.info("Media present in cut: #{media.to_a.inspect}")
        cut_conditions = cut.fetch(:conditions, {})

        # Find a specific layout based on layout constraints
        specific_layout, _layout_index = layouts.each_with_index.find do |sl, i|
          required = Set.new(sl.fetch(:required, []))
          supported = Set.new(sl.fetch(:areas, layout.fetch(:areas, [])).map { |area| area[:name] })
          conditions = sl.fetch(:conditions, {})

          sl_name = sl.fetch(:name, "layout #{i}")

          if !media.superset?(required)
            BigBlueButton.logger.debug("Not using #{sl_name} - missing required media #{(required - media).to_a.inspect}")
            false
          elsif !media.subset?(supported)
            BigBlueButton.logger.debug("Not using #{sl_name} - doesn't support media #{(media - supported).to_a.inspect}")
            false
          elsif !conditions.all? { |key, value| cut_conditions[key] == value }
            BigBlueButton.logger.debug do
              key, value = conditions.find { |key, value| cut_conditions[key] != value }
              "Not using #{sl_name} - condition mismatch for #{key.inspect}; " \
              "expected #{value}, actual #{cut_conditions[key].inspect}"
            end
            false
          else
            BigBlueButton.logger.debug(
              "Using #{sl_name} - required #{required.to_a.inspect}, areas: #{supported.to_a.inspect}, " \
              " conditions: #{conditions.inspect}"
            )
            layout_name = sl_name
            true
          end
        end

        cut_layout = \
          if specific_layout
            layout.merge(specific_layout)
          else
            BigBlueButton.logger.debug('No specific layout found, falling back to default')
            layout
          end

        if cut_layout[:width] != layout[:width] ||
           cut_layout[:height] != layout[:height] ||
           cut_layout[:framerate] != layout[:framerate]
          raise "Specific layout #{layout_name} has different dimensions or framerate from default layout"
        end

        unless %i[width height framerate areas].all? { |prop| cut_layout.include?(prop) }
          raise "Layout #{layout_name} is missing required properties in configuration"
        end

        BigBlueButton.logger.debug("Selected layout: #{layout_name}")
        cut_layout[:areas].each do |area|
          BigBlueButton.logger.debug(
            "  #{area[:name]}: position: #{area[:x]}x#{area[:y]}, size: #{area[:width]}x#{area[:height]}"
          )
        end

        cut_layout
      end

      def self.composite_cut(output, cut, layout)
        duration = cut[:next_timestamp] - cut[:timestamp]
        BigBlueButton.logger.info "  Cut start time #{cut[:timestamp]}, duration #{duration}"

        ffmpeg_pid = nil
        video_source_processes = {}
        ffmpeg_inputs = []
        ffmpeg_input_pipes = {}
        ffmpeg_filter = String.new
        ffmpeg_filter << "color=c=white:s=#{layout[:width]}x#{layout[:height]}:r=#{layout[:framerate]}"

        # Check for obscured (completely hidden) video areas, and skip processing for those areas
        layout[:areas].each_with_index do |layout_area, i|
          next unless i >= 1

          area = cut[:areas][layout_area[:name]]
          next if area.nil? || area.empty? || layout_area.fetch(:hidden, false)

          (0...i).each do |j|
            prev_area = layout[:areas][j]
            next if prev_area.fetch(:hidden, false)
            next if prev_area[:x] < layout_area[:x] ||
                    prev_area[:y] < layout_area[:y] ||
                    prev_area[:x] + prev_area[:width] > layout_area[:x] + layout_area[:width] ||
                    prev_area[:y] + prev_area[:height] > layout_area[:y] + layout_area[:height]

            BigBlueButton.logger.debug "  Area #{prev_area[:name]} is obscured; hiding its videos"
            cut[:areas].delete(prev_area[:name])
          end
        end

        layout[:areas].each do |layout_area|
          area = cut[:areas][layout_area[:name]]
          next if area.nil? || area.empty? || layout_area.fetch(:hidden, false)

          video_count = area.length
          BigBlueButton.logger.debug "  Laying out #{video_count} videos in #{layout_area[:name]}"

          tiles_h = 0
          tiles_v = 0
          tile_width = 0
          tile_height = 0
          total_area = 0

          ffmpeg_filter << "[#{layout_area[:name]}_in];\n"

          # Do an exhaustive search to maximize video areas
          for tmp_tiles_v in 1..video_count
            tmp_tiles_h = (video_count / tmp_tiles_v.to_f).ceil
            tmp_tile_width = (2 * (layout_area[:width].to_f / tmp_tiles_h / 2).floor).to_i
            tmp_tile_height = (2 * (layout_area[:height].to_f / tmp_tiles_v / 2).floor).to_i
            next if tmp_tile_width <= 0 or tmp_tile_height <= 0

            tmp_total_area = 0
            area.each do |video|
              video_width = video[:source].aspect_ratio&.numerator
              video_height = video[:source].aspect_ratio&.denominator
              scale_width, scale_height = aspect_scale(video_width, video_height, tmp_tile_width, tmp_tile_height)
              tmp_total_area += scale_width * scale_height
            end

            next unless tmp_total_area > total_area

            tiles_h = tmp_tiles_h
            tiles_v = tmp_tiles_v
            tile_width = tmp_tile_width
            tile_height = tmp_tile_height
            total_area = tmp_total_area
          end

          tile_offset_x = (2 * ((layout_area[:width] - (tiles_h * tile_width)) / 4).floor)
          tile_offset_y = (2 * ((layout_area[:height] - (tiles_v * tile_height)) / 4).floor)

          tile_x = 0
          tile_y = 0

          BigBlueButton.logger.debug "    Tiling in a #{tiles_h}x#{tiles_v} grid"

          xstack_inputs = []
          xstack_layout = []

          area.each do |video|
            BigBlueButton.logger.debug "    tile location (#{tile_x}, #{tile_y})"

            video_source = video[:source]

            pad_name = "#{layout_area[:name]}_x#{tile_x}_y#{tile_y}"

            xstack_inputs << "[#{pad_name}]"
            xstack_layout << "#{tile_offset_x + (tile_x * tile_width)}_#{tile_offset_y + (tile_y * tile_height)}"

            tile_x += 1
            if tile_x >= tiles_h
              tile_x = 0
              tile_y += 1
            end

            video_source_reader = video_source.open(
              tile_width,
              tile_height,
              video[:timestamp],
              duration,
              layout[:framerate],
              "#{cut[:timestamp]}_#{pad_name}"
            )

            unless video_source_reader.pid.nil?
              video_source_processes[video_source_reader.pid] = { log: video_source_reader.log_file }
            end

            input_index = ffmpeg_inputs.length
            ffmpeg_inputs << video_source_reader.ffmpeg_input unless video_source_reader.ffmpeg_input.nil?

            ffmpeg_input_pipes[video_source_reader.read] = video_source_reader.read unless video_source_reader.read.nil?

            ffmpeg_filter << "[#{input_index}]" unless video_source_reader.ffmpeg_input.nil?
            if video_source_reader.ffmpeg_filter.nil?
              # VideoSourceReader requires at least one of ffmpeg_input or ffmpeg_filter, so if ffmpeg_filter is nil,
              # ffmpeg_input must have been present. In that case, the video needs to be passed through to the correct pad name,
              # and the "null" ffmpeg filter handles that.
              ffmpeg_filter << 'null'
            else
              ffmpeg_filter << video_source_reader.ffmpeg_filter
            end
            ffmpeg_filter << "[#{pad_name}];"
          end

          # Create the xstack filter to composite the video elements
          xstack_inputs.each do |xstack_input|
            ffmpeg_filter << xstack_input
          end
          ffmpeg_filter <<
            if xstack_inputs.length >= 2
              "xstack=fill=white:inputs=#{xstack_inputs.length}:layout=#{xstack_layout.join('|')}"
            else
              # xstack doesn't support 1 input; a kind of odd omission
              'null'
            end

          # Overlay this area on top of the input video
          ffmpeg_filter << "[#{layout_area[:name]}];\n"
          ffmpeg_filter << "[#{layout_area[:name]}_in][#{layout_area[:name]}]overlay=x=#{layout_area[:x]}:y=#{layout_area[:y]}"
        end

        # As a safety measure, crop anything that might have made the frame too large.
        ffmpeg_filter << ",crop=w=#{layout[:width]}:h=#{layout[:height]}:x=0:y=0"
        ffmpeg_filter << ",trim=end=#{ms_to_s(duration)}"

        ffmpeg_cmd = [*FFMPEG, '-copyts']
        ffmpeg_inputs.each do |input|
          ffmpeg_cmd.append(*input)
        end

        BigBlueButton.logger.debug('  ffmpeg filter_complex_script:')
        BigBlueButton.logger.debug(ffmpeg_filter)
        filter_complex_script = "#{output}.filter"
        File.write(filter_complex_script, ffmpeg_filter)
        ffmpeg_cmd += ['-filter_complex_script', filter_complex_script]

        ffmpeg_cmd += ['-an', *FFMPEG_WF_ARGS, '-r', layout[:framerate].to_s, output]

        BigBlueButton.logger.info("Executing: #{Shellwords.join(ffmpeg_cmd)}")
        ffmpeg_log = "#{output}.log"
        ffmpeg_pid = spawn(
          *ffmpeg_cmd,
          out: ffmpeg_log,
          err: [:child, :out],
          close_others: true,
          **ffmpeg_input_pipes,
        )
        # We are explicitly keeping our copy of the read side of the pipes open here, since if there
        # are any video source commands still running when the main ffmpeg exits, we want to
        # be able to signal them to exit cleanly while they're blocked trying to write. If the pipe
        # was closed, they would exit with an error code before we can do anything.

        ffmpeg_exitok = []
        loop do
          pid, exitstatus = Process.waitpid2
          if pid == ffmpeg_pid
            BigBlueButton.logger.info("ffmpeg command #{exitstatus} (#{File.basename(ffmpeg_log)})")

            # Tell any video source processes which are blocking on writing
            # to the pipe to exit cleanly
            video_source_processes.each_key do |pid|
              Process.kill('TERM', pid)
            rescue Errno::ESRCH, Errno::EPERM
              # Ignore; these errors mean the process is no longer running
            end
            # Then unblock them by closing our copy of the read side of the pipe
            ffmpeg_input_pipes.each_value(&:close)

            ffmpeg_exitok << exitstatus.success?
            log = ffmpeg_log
          else
            process = video_source_processes.delete(pid)
            BigBlueButton.logger.debug("video source command #{exitstatus} (#{File.basename(process[:log])})")

            ffmpeg_exitok << (
              exitstatus.success? ||
              # Exit code 255 indicates that ffmpeg was terminated due to user request by signal
              exitstatus.exitstatus == 255 ||
              # Unhandled SIGTERM (produced by e.g. bbb-presentation-video)
              (exitstatus.signaled? && exitstatus.termsig == 15)
            )
            log = process[:log]
          end

          # Read the temporary log file and include its contents into the processing log
          File.open(log, 'r') do |io|
            io.each_line do |line|
              BigBlueButton.logger.debug(line.chomp!)
            end
          end
        rescue Errno::ECHILD
          # All child ffmpeg processes have exited
          break
        end

        raise 'At least one ffmpeg process failed' unless ffmpeg_exitok.all?

        BigBlueButton.logger.info('All ffmpeg processes exited normally')
        output
      rescue StandardError, Interrupt
        Signal.trap('INT', 'IGNORE')

        # Clean up child ffmpeg processes before returning.
        BigBlueButton.logger.error('Terminating ffmpeg subprocesses due to error')

        begin
          Process.kill('TERM', ffmpeg_pid) unless ffmpeg_pid.nil?
        rescue Errno::ESRCH, Errno::EPERM
        end
        video_source_processes.each_key do |pid|
          Process.kill('TERM', pid)
        rescue Errno::ESRCH, Errno::EPERM
        end
        ffmpeg_input_pipes&.each_value(&:close)

        # It's still helpful to see the exit status and logs ffmpeg commands
        loop do
          pid, exitstatus = Process.waitpid2
          if pid == ffmpeg_pid
            BigBlueButton.logger.debug("ffmpeg command #{exitstatus} (#{File.basename(ffmpeg_log)})")
            log = ffmpeg_log
          elsif (process = video_source_processes.delete(pid))
            BigBlueButton.logger.debug("video source command #{exitstatus} (#{File.basename(process[:log])})")
            log = process[:log]
          else
            log = nil
          end

          unless log.nil?
            File.open(log, 'r') do |io|
              io.each_line do |line|
                BigBlueButton.logger.debug(line.chomp!)
              end
            end
          end
        rescue Errno::ECHILD
          BigBlueButton.logger.error('All FFmpeg subprocesses have exited.')
          break
        end

        raise
      end
    end
  end
end

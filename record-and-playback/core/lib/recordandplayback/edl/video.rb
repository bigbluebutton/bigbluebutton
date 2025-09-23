# encoding: UTF-8

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
        end
      end

      def self.merge(*edls)
        entries_i = Array.new(edls.length, 0)
        done = Array.new(edls.length, false)
        merged_edl = [ { :timestamp => 0, :areas => {} } ]

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
          merged_entry = { :timestamp => next_entry[:timestamp], :areas => {} }
          last_entry = merged_edl.last
          if last_entry[:timestamp] == next_entry[:timestamp]
            # Edit the existing entry
            merged_entry = last_entry
          else
            # Create a new entry
            merged_entry = { :timestamp => next_entry[:timestamp], :areas => {} }
            merged_edl << merged_entry
            # Have to copy videos from the last entry into the new entry, updating timestamps
            last_entry[:areas].each do |area, videos|
              merged_entry[:areas][area] = videos.map do |video|
                {
                  :filename => video[:filename],
                  :timestamp => video[:timestamp] + merged_entry[:timestamp] - last_entry[:timestamp],
                  :original_duration => video[:original_duration]
                }
              end
            end
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

      def self.render(edl, layout, output_basename, threads = 2)
        videoinfo = {}

        corrupt_videos = Set.new
        try_remux_videos = Set.new

        BigBlueButton.logger.info "Pre-processing EDL"
        enforce_cut_lengths(edl, layout[:framerate])

        (0...(edl.length - 1)).each do |i|
          # The render scripts need this to calculate cut lengths
          edl[i][:next_timestamp] = edl[i+1][:timestamp]
          # Have to fetch information about all the input video files,
          # so collect them.
          edl[i][:areas].each_value do |videos|
            videos.each do |video|
              videoinfo[video[:filename]] = {}
            end
          end
        end

        BigBlueButton.logger.info "Reading source video information"
        videoinfo.keys.each do |videofile|
          BigBlueButton.logger.debug "  #{videofile}"
          info = video_info(videofile)
          if !info[:video]
            BigBlueButton.logger.warn "    This video file is corrupt! It will be removed from the output."
            corrupt_videos << videofile
            next
          end

          videoinfo[videofile] = info

          BigBlueButton.logger.debug "    width: #{info[:width]}, height: #{info[:height]}, duration: #{info[:duration]}, start_time: #{info[:start_time]}"
          if info[:video][:deskshare_timestamp_bug]
            BigBlueButton.logger.debug("    has early 1.1 deskshare timestamp bug")
          elsif info[:format][:format_name] == 'flv' and info[:start_time] > 1
            BigBlueButton.logger.debug("    has large start time, needs remuxing")
            try_remux_videos << videofile
          end

          # Try decoding a frame to detect some types of problems
          unless test_video_decode(videofile)
            BigBlueButton.logger.warn("    Failed to run test decode; will attempt to remux")
            try_remux_videos << videofile
          end
        end

        if try_remux_videos.length > 0
          BigBlueButton.logger.info("Attempting remux of videos with problems")
          remuxdir = File.join(File.dirname(output_basename), "remux")
          FileUtils.mkdir_p(remuxdir)
          try_remux_videos.each do |videofile|
            BigBlueButton.logger.info("  #{File.basename(videofile)}")
            newvideofile = File.join(remuxdir, "#{File.basename(videofile, '.*')}.nut")

            unless File.exist?(newvideofile)
              ffmpeg_cmd = [*FFMPEG, '-i', videofile, '-c', 'copy', newvideofile]
              exitstatus = BigBlueButton.execute(ffmpeg_cmd, false)
              unless exitstatus.success?
                BigBlueButton.logger.warn("    Remux command failed, input file is unusable")
                corrupt_videos << videofile
                next
              end
            end

            info = video_info(newvideofile)
            if !info[:video] || !test_video_decode(newvideofile)
              BigBlueButton.logger.warn("    Result of remux is corrupt, not using it.")
              corrupt_videos << videofile
              next
            end

            BigBlueButton.logger.debug "    width: #{info[:width]}, height: #{info[:height]}, duration: #{info[:duration]}, start_time: #{info[:start_time]}"
            videoinfo[newvideofile] = info

            # Update the filename in the EDL
            edl.each do |event|
              event[:areas].each_value do |videos|
                videos.each do |video|
                  video[:filename] = newvideofile if video[:filename] == videofile
                end
              end
            end
          end
        end

        if corrupt_videos.length > 0
          BigBlueButton.logger.info "Removing corrupt video files from EDL"
          edl.each do |event|
            event[:areas].each_value do |videos|
              videos.delete_if { |video| corrupt_videos.include?(video[:filename]) }
            end
          end
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

            # Because of the process management that the composite_cut function does internally for the ffmpeg processes
            # it spawns, it is much simpler to run the function in a separate (forked) process rather than attempt to
            # use threads or async. This way each composite_cut function can separately manage its own child processes.
            running << fork do
              composite_cut(segment, cut, layout, videoinfo)
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

        return render
      end

      # The methods below are for private use

      def self.video_info(filename)
        IO.popen([*FFPROBE, '-select_streams', 'v:0', '-count_frames', '-read_intervals', '%+#10', filename]) do |probe|
          info = nil
          begin
            info = JSON.parse(probe.read, :symbolize_names => true)
          rescue StandardError => e
            BigBlueButton.logger.warn("Couldn't parse video info: #{e}")
          end
          return {} if !info
          return {} if !info[:streams]
          return {} if !info[:format]

          info[:video] = info[:streams].find do |stream|
            stream[:codec_type] == 'video'
          end

          return {} if !info[:video]

          info[:width] = info[:video][:width].to_i
          info[:height] = info[:video][:height].to_i

          # Check for corrupt/undecodable video streams
          return {} if info[:video][:pix_fmt].nil?
          return {} if info[:width] == 0 or info[:height] == 0
          return {} if info[:video][:nb_read_frames].nil? || info[:video][:nb_read_frames] == 'N/A'

          info[:sample_aspect_ratio] = Rational(1, 1)
          if !info[:video][:sample_aspect_ratio].nil? and
              info[:video][:sample_aspect_ratio] != 'N/A'
            aspect_x, aspect_y = info[:video][:sample_aspect_ratio].split(':')
            aspect_x = aspect_x.to_i
            aspect_y = aspect_y.to_i
            if aspect_x != 0 and aspect_y != 0
              info[:sample_aspect_ratio] = Rational(aspect_x, aspect_y)
            end
          end

          info[:aspect_ratio] = Rational(info[:width], info[:height]) * info[:sample_aspect_ratio]

          if info[:format][:format_name] == 'flv' and info[:video][:codec_name] == 'h264'
            info[:video][:deskshare_timestamp_bug] = self.check_deskshare_timestamp_bug(filename)
          end

          # Convert the duration to milliseconds
          info[:duration] = (info[:format][:duration].to_r * 1000).to_i

          info[:start_time] = (info[:format][:start_time].to_r * 1000).to_i
          info[:video][:start_time] = (info[:video][:start_time].to_r * 1000).to_i

          return info
        end
        {}
      end

      # Try decoding a frame to detect some types of problems
      def self.test_video_decode(videofile)
        ffmpeg_cmd = [
          *FFMPEG,
          '-max_error_rate', '0',
          '-noaccurate_seek', '-ss', '0', '-i', videofile,
          '-map', '0:v:0', '-frames:v', '1', '-f', 'null', '-',
        ]
        exitstatus = BigBlueButton.execute(ffmpeg_cmd, false)
        exitstatus.success?
      end

      def self.check_deskshare_timestamp_bug(filename)
        IO.popen([*FFPROBE, '-select_streams', 'v:0', '-show_frames', '-read_intervals', '%+#10', filename]) do |probe|
          info = JSON.parse(probe.read, symbolize_names: true)
          return false if !info

          if !info[:frames]
            return false
          end

          # First frame in broken stream always has pts=1
          if info[:frames][0][:pkt_pts] != 1
            return false
          end

          # Remaining frames start at 200, and go up by exactly 200 each frame
          for i in 1...info[:frames].length
            if info[:frames][i][:pkt_pts] != i * 200
              return false
            end
          end

          return true
        end
      end

      def self.ms_to_s(timestamp)
        s = timestamp / 1000
        ms = timestamp % 1000
        "%d.%03d" % [s, ms]
      end

      def self.aspect_scale(old_width, old_height, new_width, new_height)
        if old_width.to_f / old_height > new_width.to_f / new_height
          new_height = (2 * (old_height.to_f * new_width / old_width / 2).round).to_i
        else
          new_width = (2 * (old_width.to_f * new_height / old_height / 2).round).to_i
        end
        [new_width, new_height]
      end

      def self.composite_cut(output, cut, layout, videoinfo)
        duration = cut[:next_timestamp] - cut[:timestamp]
        BigBlueButton.logger.info "  Cut start time #{cut[:timestamp]}, duration #{duration}"

        ffmpeg_pid = nil
        aux_ffmpeg_processes = {}
        ffmpeg_inputs = []
        ffmpeg_input_pipes = {}
        ffmpeg_filter = String.new
        ffmpeg_filter << "color=c=white:s=#{layout[:width]}x#{layout[:height]}:r=#{layout[:framerate]}"

        # Check for obscured (completely hidden) video areas, and skip processing for those areas
        layout[:areas].each_with_index do |layout_area, i|
          next unless i >= 1
          area = cut[:areas][layout_area[:name]]
          next if area.nil? || area.empty?

          (0...i).each do |j|
            prev_area = layout[:areas][j]
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
          next if area.nil?

          video_count = area.length
          BigBlueButton.logger.debug "  Laying out #{video_count} videos in #{layout_area[:name]}"
          next if video_count == 0

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
              video_width = videoinfo[video[:filename]][:aspect_ratio].numerator
              video_height = videoinfo[video[:filename]][:aspect_ratio].denominator
              scale_width, scale_height = aspect_scale(video_width, video_height, tmp_tile_width, tmp_tile_height)
              tmp_total_area += scale_width * scale_height
            end

            if tmp_total_area > total_area
              tiles_h = tmp_tiles_h
              tiles_v = tmp_tiles_v
              tile_width = tmp_tile_width
              tile_height = tmp_tile_height
              total_area = tmp_total_area
            end
          end

          tile_offset_x = (2 * ((layout_area[:width] - (tiles_h * tile_width)) / 4).floor)
          tile_offset_y = (2 * ((layout_area[:height] - (tiles_v * tile_height)) / 4).floor)

          tile_x = 0
          tile_y = 0

          BigBlueButton.logger.debug "    Tiling in a #{tiles_h}x#{tiles_v} grid"

          xstack_inputs = []
          xstack_layout = []

          area.each do |video|
            this_videoinfo = videoinfo[video[:filename]]
            BigBlueButton.logger.debug "    tile location (#{tile_x}, #{tile_y})"
            video_width = this_videoinfo[:aspect_ratio].numerator
            video_height = this_videoinfo[:aspect_ratio].denominator
            BigBlueButton.logger.debug "      original aspect: #{video_width}x#{video_height}"

            scale_width, scale_height = aspect_scale(video_width, video_height, tile_width, tile_height)
            BigBlueButton.logger.debug "      scaled size: #{scale_width}x#{scale_height}"

            seek = video[:timestamp]
            BigBlueButton.logger.debug("      start timestamp: #{seek}")
            seek_offset = this_videoinfo[:start_time]
            video_start_offset = this_videoinfo[:video][:start_time]
            BigBlueButton.logger.debug("      seek offset: #{seek_offset}, video start offset: #{video_start_offset}")
            BigBlueButton.logger.debug("      codec: #{this_videoinfo[:video][:codec_name].inspect}")
            BigBlueButton.logger.debug("      duration: #{this_videoinfo[:duration]}, original duration: #{video[:original_duration]}")

            # Desktop sharing videos in flashsv2 do not have regular
            # keyframes, so seeking in them doesn't really work.
            # To make processing more reliable, always decode them from the
            # start in each cut. (Slow!)
            seek = 0 if this_videoinfo[:video][:codec_name] == 'flashsv2'

            # Workaround early 1.1 deskshare timestamp bug
            # It resulted in video files that were too short. To workaround, we
            # assume that the framerate was constant throughout (it might not
            # actually be...) and scale the video length.
            scale = nil
            if !video[:original_duration].nil? and
                  this_videoinfo[:video][:deskshare_timestamp_bug]
              scale = video[:original_duration].to_f / this_videoinfo[:duration]
              # Rather than attempt to recalculate seek...
              seek = 0
              BigBlueButton.logger.debug("      Early 1.1 deskshare timestamp bug: scaling video length by #{scale}")
            end

            pad_name = "#{layout_area[:name]}_x#{tile_x}_y#{tile_y}"

            xstack_inputs << "[#{pad_name}]"
            xstack_layout << "#{tile_offset_x + (tile_x * tile_width)}_#{tile_offset_y + (tile_y * tile_height)}"

            tile_x += 1
            if tile_x >= tiles_h
              tile_x = 0
              tile_y += 1
            end

            # If the seekpoint is at or after the end of the file, the filter chain will
            # have problems. Substitute in a blank video.
            if seek >= this_videoinfo[:duration]
              ffmpeg_filter << "color=c=white:s=#{tile_width}x#{tile_height}:r=#{layout[:framerate]}"
              ffmpeg_filter << ",trim=end=#{ms_to_s(duration)}[#{pad_name}];\n"
              next
            end

            # Apply the video start time offset to seek to the correct point.
            # Only actually apply the offset if we're already seeking so we
            # don't start seeking in a file where we've overridden the seek
            # behaviour.
            seek += seek_offset if seek > 0
            in_time = video[:timestamp] + seek_offset
            out_time = in_time + duration

            # Launch the ffmpeg process to use for this input to pre-process the video to constant video resolution
            # This has to be done in an external process, since if it's done in the same process, the entire filter
            # chain gets re-initialized on every resolution change, resulting in losing state on all stateful filters.
            ffmpeg_preprocess_log = "#{output}.#{pad_name}.log"
            ffmpeg_preprocess_read, ffmpeg_preprocess_write = IO.pipe

            # To reduce overhead, adjust the size of the fifo buffer larger
            # By default, Linux allows pipe sizes to be increased to 1MB by normal users.
            begin
              ffmpeg_preprocess_write.fcntl(Fcntl::F_SETPIPE_SZ, 1_048_576)
            rescue Errno::EPERM
              BigBlueButton.logger.warn('Unable to increase pipe size to 1MB')
            rescue NameError
              # Fcntl::F_SETPIPE_SZ isn't available on Ruby version older than 3.0
            end

            # Pre-filtering: scaling, padding, and extending.
            ffmpeg_preprocess_filter = String.new
            ffmpeg_preprocess_filter << '[0:v:0]'
            ffmpeg_preprocess_filter << "scale=w=#{tile_width}:h=#{tile_height}:force_original_aspect_ratio=decrease,"
            ffmpeg_preprocess_filter << "setsar=1,pad=w=#{tile_width}:h=#{tile_height}:x=-1:y=-1:color=white,"
            # The trim command combines its arguments - end at the timestamp but only if at least one frame has been output.
            ffmpeg_preprocess_filter << "trim=end=#{ms_to_s(out_time)}:end_frame=1"
            ffmpeg_preprocess_filter << '[out]'

            # Set up filters and inputs for video pre-processing ffmpeg command
            ffmpeg_preprocess_command = [
              *FFMPEG,
              # Ensure input isn't misdetected as cfr, and frames prior to seek point run through filters.
              '-vsync', 'vfr', '-noaccurate_seek',
              '-ss', ms_to_s(seek).to_s, '-itsoffset', ms_to_s(seek).to_s, '-i', video[:filename],
              '-filter_complex', ffmpeg_preprocess_filter, '-map', '[out]',
              # Copy timebase from input instead of guessing based on framerate
              '-enc_time_base', '-1',
              '-c:v', 'rawvideo', '-f', 'nut', "pipe:#{ffmpeg_preprocess_write.fileno}",
            ]
            BigBlueButton.logger.info("Executing: #{Shellwords.join(ffmpeg_preprocess_command)}")
            ffmpeg_preprocess_pid = spawn(
              *ffmpeg_preprocess_command,
              close_others: true,
              out: ffmpeg_preprocess_log,
              err: [:child, :out],
              ffmpeg_preprocess_write => ffmpeg_preprocess_write
            )
            ffmpeg_preprocess_write.close
            BigBlueButton.logger.debug("preprocessing ffmpeg command pid #{ffmpeg_preprocess_pid}")
            aux_ffmpeg_processes[ffmpeg_preprocess_pid] = { log: ffmpeg_preprocess_log }

            input_index = ffmpeg_inputs.length

            ffmpeg_inputs << [ '-f', 'nut', '-i', "pipe:#{ffmpeg_preprocess_read.fileno}" ]
            ffmpeg_input_pipes[ffmpeg_preprocess_read] = ffmpeg_preprocess_read

            ffmpeg_filter << "[#{input_index}]"
            # Scale the video length for the deskshare timestamp workaround
            ffmpeg_filter << "setpts=PTS*#{scale}," unless scale.nil?
            # Apply PTS offset so '0' time is aligned
            ffmpeg_filter << "setpts=PTS-#{ms_to_s(in_time)}/TB[#{pad_name}_input];"
            # Extend the video if needed
            ffmpeg_filter << "color=c=white:s=#{tile_width}x#{tile_height}:r=#{layout[:framerate]}[#{pad_name}_tpad];"
            ffmpeg_filter << "[#{pad_name}_input][#{pad_name}_tpad]concat=n=2:v=1:a=0,"
            # Clean up the framerate
            ffmpeg_filter << "fps=#{layout[:framerate]},"
            # Trim frames before the start time
            ffmpeg_filter << 'trim=start=0,'
            # Trim frames after stop time, which can be generated by the pre-processing ffmpeg if there's an unlucky
            # large timestamp gap before a frame which changes resolution.
            # The trim filter is needed to eat these frames so they don't queue up on the inputs of xstack.
            ffmpeg_filter << "trim=end=#{ms_to_s(duration)}"
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
        # are any preprocessing ffmpeg commands still running when the main ffmpeg exits, we want to
        # be able to signal them to exit cleanly while they're blocked trying to write. If the pipe
        # was closed, they would exit with an error code before we can do anything.

        ffmpeg_exitok = []
        loop do
          pid, exitstatus = Process.waitpid2
          if pid == ffmpeg_pid
            BigBlueButton.logger.info("ffmpeg command #{exitstatus} (#{File.basename(ffmpeg_log)})")

            # Tell any preprocessing ffmpeg processes which are blocking on writing
            # to the pipe to exit cleanly
            aux_ffmpeg_processes.each_key do |pid|
              Process.kill('TERM', pid)
            rescue Errno::ESRCH, Errno::EPERM
              # Ignore; these errors mean the process is no longer running
            end
            # Then unblock them by closing our copy of the read side of the pipe
            ffmpeg_input_pipes.each_value(&:close)

            ffmpeg_exitok << exitstatus.success?
            log = ffmpeg_log
          else
            process = aux_ffmpeg_processes.delete(pid)
            BigBlueButton.logger.debug("preprocessing ffmpeg command #{exitstatus} (#{File.basename(process[:log])})")

            # Exit code 255 indicates that ffmpeg was terminated due to user request by signal
            ffmpeg_exitok << (exitstatus.success? || exitstatus.exitstatus == 255)
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
        aux_ffmpeg_processes.each_key do |pid|
          Process.kill('TERM', pid)
        rescue Errno::ESRCH, Errno::EPERM
        end
        ffmpeg_input_pipes&.each_value(&:close)

        # It's still helpful to see the exit status and logs ffmpeg commands
        loop do
          pid, exitstatus = Process.waitpid2
          if pid == ffmpeg_pid
            BigBlueButton.logger.debug("ffmpeg_command #{exitstatus} (#{File.basename(ffmpeg_log)})")
            log = ffmpeg_log
          elsif (process = aux_ffmpeg_processes.delete(pid))
            BigBlueButton.logger.debug("preprocessing ffmpeg command #{exitstatus} (#{File.basename(process[:log])})")
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

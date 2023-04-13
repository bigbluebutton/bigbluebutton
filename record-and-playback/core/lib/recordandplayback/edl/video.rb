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
        '-codec', FFMPEG_WF_CODEC.to_s, '-preset', 'fast', '-crf', '23',
        '-x264opts', 'stitchable=1', '-force_key_frames', 'expr:gte(t,n_forced*10)', '-pix_fmt', 'yuv420p',
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

        # What if the first cut got deleted?
        if edl[0][:timestamp] != 0
          # Need to reset the first cut to start at timestamp 0
          BigBlueButton.logger.debug('Resetting timestamp of first EDL entry to 0')
          offset = edl[0][:timestamp]
          edl[0][:timestamp] = 0
          # And offset the start times of every video to compensate
          edl[0][:areas].each_value do |videos|
            videos.each do |video|
              video[:timestamp] -= offset # This might become negative, that's ok.
            end
          end
        end

        # What if all of the cuts got deleted?
        if edl.length == 1
          BigBlueButton.logger.debug('EDL contains no cuts - enforcing minimum length')
          # Add a new end point at the minimum cut length
          edl << { timestamp: min_cut_len, areas: {} }
        end

        nil
      end

      def self.render(edl, layout, output_basename)
        videoinfo = {}

        corrupt_videos = Set.new
        remux_flv_videos = Set.new

        BigBlueButton.logger.info "Pre-processing EDL"
        enforce_cut_lengths(edl, layout[:framerate])

        for i in 0...(edl.length - 1)
          # The render scripts need this to calculate cut lengths
          edl[i][:next_timestamp] = edl[i+1][:timestamp]
          # Have to fetch information about all the input video files,
          # so collect them.
          edl[i][:areas].each do |name, videos|
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
          else
            BigBlueButton.logger.debug "    width: #{info[:width]}, height: #{info[:height]}, duration: #{info[:duration]}, start_time: #{info[:start_time]}"
            if info[:video][:deskshare_timestamp_bug]
              BigBlueButton.logger.debug("    has early 1.1 deskshare timestamp bug")
            elsif info[:format][:format_name] == 'flv' and info[:start_time] > 1
              BigBlueButton.logger.debug("    has large start time, needs remuxing")
              remux_flv_videos << videofile
            end
          end

          videoinfo[videofile] = info
        end

        if remux_flv_videos.length > 0
          BigBlueButton.logger.info("Remuxing flv files with large start time")
          remux_flv_videos.each do |videofile|
            BigBlueButton.logger.info("  #{File.basename(videofile)}")
            newvideofile = File.join(File.dirname(output_basename), File.basename(videofile))

            if !File.exist?(newvideofile)
              ffmpeg_cmd = [*FFMPEG, '-i', videofile, '-c', 'copy', newvideofile]
              exitstatus = BigBlueButton.exec_ret(*ffmpeg_cmd)
              raise "ffmpeg failed, exit code #{exitstatus}" if exitstatus != 0
            end

            info = video_info(newvideofile)
            if !info[:video]
              BigBlueButton.logger.warn("    Result of remux is corrupt, not using it.")
              next
            end
            BigBlueButton.logger.debug "    width: #{info[:width]}, height: #{info[:height]}, duration: #{info[:duration]}, start_time: #{info[:start_time]}"
            videoinfo[newvideofile] = info

            # Update the filename in the EDL
            edl.each do |event|
              event[:areas].each do |area, videos|
                videos.each do |video|
                  if video[:filename] == videofile
                    video[:filename] = newvideofile
                  end
                end
              end
            end
          end
        end

        if corrupt_videos.length > 0
          BigBlueButton.logger.info "Removing corrupt video files from EDL"
          edl.each do |event|
            event[:areas].each do |area, videos|
              videos.delete_if { |video| corrupt_videos.include?(video[:filename]) }
            end
          end
        end

        dump(edl)

        BigBlueButton.logger.info "Compositing cuts"
        render = "#{output_basename}.#{WF_EXT}"
        concat = []
        for i in 0...(edl.length - 1)
          segment = "#{output_basename}_#{i}.#{WF_EXT}"
          composite_cut(segment, edl[i], layout, videoinfo)
          concat << segment
        end

        concat_file = "#{output_basename}.txt"
        File.open(concat_file, 'w') do |outio|
          concat.each do |segment|
            outio.write("file #{segment}\n")
          end
        end

        ffmpeg_cmd = [*FFMPEG, '-safe', '0', '-f', 'concat', '-i', concat_file , '-c', 'copy', render]
        exitstatus = BigBlueButton.exec_ret(*ffmpeg_cmd)
        raise "ffmpeg failed, exit code #{exitstatus}" if exitstatus != 0

        concat.each do |segment|
          File.delete(segment)
        end

        return render
      end

      # The methods below are for private use

      def self.video_info(filename)
        IO.popen([*FFPROBE, filename]) do |probe|
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

        aux_ffmpeg_processes = {}
        ffmpeg_inputs = [
          {
            format: 'lavfi',
            filename: "color=c=white:s=#{layout[:width]}x#{layout[:height]}:r=#{layout[:framerate]}"
          }
        ]
        ffmpeg_input_pipes = {}
        ffmpeg_filter = '[0]null'
        layout[:areas].each do |layout_area|
          area = cut[:areas][layout_area[:name]]
          next if area.nil?

          video_count = area.length
          BigBlueButton.logger.debug "  Laying out #{video_count} videos in #{layout_area[:name]}"
          next if video_count == 0

          tile_offset_x = layout_area[:x]
          tile_offset_y = layout_area[:y]

          tiles_h = 0
          tiles_v = 0
          tile_width = 0
          tile_height = 0
          total_area = 0

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

          tile_x = 0
          tile_y = 0

          BigBlueButton.logger.debug "    Tiling in a #{tiles_h}x#{tiles_v} grid"

          ffmpeg_filter << "[#{layout_area[:name]}_in];"

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

            tile_x += 1
            if tile_x >= tiles_h
              tile_x = 0
              tile_y += 1
            end

            input_index = ffmpeg_inputs.length

            # If the seekpoint is at or after the end of the file, the filter chain will
            # have problems. Substitute in a blank video.
            if seek >= this_videoinfo[:duration]
              ffmpeg_inputs << {
                format: 'lavfi',
                filename: "color=c=white:s=#{tile_width}x#{tile_height}:r=#{layout[:framerate]}"
              }
              ffmpeg_filter << "[#{input_index}]null[#{pad_name}];"
              next
            end

            # Apply the video start time offset to seek to the correct point.
            # Only actually apply the offset if we're already seeking so we
            # don't start seeking in a file where we've overridden the seek
            # behaviour.
            if seek > 0
              seek = seek + seek_offset
            end

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

            in_time = video[:timestamp] + seek_offset
            out_time = in_time + duration

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
              'ffmpeg', '-y', '-v', 'warning', '-nostats', '-nostdin', '-max_error_rate', '1.0',
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
              err: [ffmpeg_preprocess_log, 'w'],
              ffmpeg_preprocess_write => ffmpeg_preprocess_write
            )
            ffmpeg_preprocess_write.close
            BigBlueButton.logger.debug("preprocessing ffmpeg command pid #{ffmpeg_preprocess_pid}")
            aux_ffmpeg_processes[ffmpeg_preprocess_pid] = { log: ffmpeg_preprocess_log }
            ffmpeg_inputs << { filename: "pipe:#{ffmpeg_preprocess_read.fileno}", format: 'nut' }
            ffmpeg_input_pipes[ffmpeg_preprocess_read] = ffmpeg_preprocess_read
            ffmpeg_filter << "[#{input_index}]"
            # Scale the video length for the deskshare timestamp workaround
            ffmpeg_filter << "setpts=PTS*#{scale}," unless scale.nil?
            # Extend the video if needed and clean up the framerate
            ffmpeg_filter << "tpad=stop=-1:stop_mode=clone,fps=#{layout[:framerate]}:start_time=#{ms_to_s(in_time)}"
            # Apply PTS offset so '0' time is aligned, and trim frames before start point
            ffmpeg_filter << ",setpts=PTS-#{ms_to_s(in_time)}/TB,trim=start=0"
            # Trim frames after stop time, which can be generated by the pre-processing ffmpeg if there's an unlucky
            # large timestamp gap before a frame which changes resolution.
            # The trim filter is needed to eat these frames so they don't queue up on the inputs of overlays.
            ffmpeg_filter << ",trim=end=#{ms_to_s(duration)}"
            ffmpeg_filter << "[#{pad_name}];"
          end

          # Create the video rows
          remaining = video_count
          (0...tiles_v).each do |tile_y|
            this_tiles_h = [tiles_h, remaining].min
            remaining -= this_tiles_h

            (0...this_tiles_h).each do |tile_x|
              ffmpeg_filter << "[#{layout_area[:name]}_x#{tile_x}_y#{tile_y}]"
            end
            if this_tiles_h > 1
              ffmpeg_filter << "hstack=inputs=#{this_tiles_h},"
            end
            ffmpeg_filter << "pad=w=#{layout_area[:width]}:h=#{tile_height}:color=white"
            ffmpeg_filter << "[#{layout_area[:name]}_y#{tile_y}];"
          end

          # Stack the video rows
          (0...tiles_v).each do |tile_y|
            ffmpeg_filter << "[#{layout_area[:name]}_y#{tile_y}]"
          end
          if tiles_v > 1
            ffmpeg_filter << "vstack=inputs=#{tiles_v},"
          end
          ffmpeg_filter << "pad=w=#{layout_area[:width]}:h=#{layout_area[:height]}:color=white"
          ffmpeg_filter << "[#{layout_area[:name]}];"
          ffmpeg_filter << "[#{layout_area[:name]}_in][#{layout_area[:name]}]overlay=x=#{layout_area[:x]}:y=#{layout_area[:y]}"
        end

        ffmpeg_filter << ",trim=end=#{ms_to_s(duration)}"

        ffmpeg_cmd = [*FFMPEG, '-copyts']
        ffmpeg_inputs.each do |input|
          ffmpeg_cmd << '-ss' << ms_to_s(input[:seek]) if input.include?(:seek)
          ffmpeg_cmd << '-f' << input[:format] if input.include?(:format)
          ffmpeg_cmd << '-i' << input[:filename]
        end

        BigBlueButton.logger.debug('  ffmpeg filter_complex_script:')
        BigBlueButton.logger.debug(ffmpeg_filter)
        filter_complex_script = "#{output}.filter"
        File.open(filter_complex_script, 'w') do |io|
          io.write(ffmpeg_filter)
        end
        ffmpeg_cmd += ['-filter_complex_script', filter_complex_script]

        ffmpeg_cmd += ['-an', *FFMPEG_WF_ARGS, '-r', layout[:framerate].to_s, output]

        BigBlueButton.logger.info("Executing: #{Shellwords.join(ffmpeg_cmd)}")
        ffmpeg_log = "#{output}.log"
        ffmpeg_pid = spawn(*ffmpeg_cmd, err: [ffmpeg_log, 'w'], **ffmpeg_input_pipes)
        # We are explicitly keeping our copy of the read side of the pipes open here, since if there
        # are any preprocessing ffmpeg commands still running when the main ffmpeg exits, we want to
        # be able to signal them to exit cleanly while they're blocked trying to write. If the pipe
        # was closed, they would exit with an error code before we can do anything.

        ffmpeg_exitok = []
        loop do
          pid, exitstatus = Process.waitpid2(-1)
          if pid == ffmpeg_pid
            BigBlueButton.logger.debug("ffmpeg command #{exitstatus} (#{File.basename(ffmpeg_log)})")

            # Tell any preprocessing ffmpeg processes which are blocking on writing
            # to the pipe to exit cleanly
            Process.kill('TERM', *aux_ffmpeg_processes.keys) unless aux_ffmpeg_processes.empty?
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
              BigBlueButton.logger.info(line.chomp!)
            end
          end
        rescue Errno::ECHILD
          # All child ffmpeg processes have exited
          break
        end

        raise 'At least one ffmpeg process failed' unless ffmpeg_exitok.all?

        BigBlueButton.logger.info('All ffmpeg processes exited normally')

        return output
      end
    end
  end
end

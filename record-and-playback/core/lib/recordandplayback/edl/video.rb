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

module BigBlueButton
  module EDL
    module Video
      FFMPEG_WF_CODEC = 'mpeg2video'
      FFMPEG_WF_FRAMERATE = 24
      FFMPEG_WF_ARGS = ['-an', '-codec', FFMPEG_WF_CODEC.to_s, '-q:v', '2', '-g', (FFMPEG_WF_FRAMERATE * 10).to_s, '-pix_fmt', 'yuv420p', '-r', FFMPEG_WF_FRAMERATE.to_s, '-f', 'mpegts']
      WF_EXT = 'ts'

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

      def self.render(edl, layout, output_basename)
        videoinfo = {}

        corrupt_videos = Set.new

        BigBlueButton.logger.info "Pre-processing EDL"
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
            end
          end

          videoinfo[videofile] = info
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
        for i in 0...(edl.length - 1)
          if edl[i][:timestamp] == edl[i][:next_timestamp]
            warn 'Skipping 0-length edl entry'
            next
          end
          composite_cut(render, edl[i], layout, videoinfo)
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

          return {} if info[:width] == 0 or info[:height] == 0
          return {} if info[:video][:display_aspect_ratio] == '0:0'

          info[:aspect_ratio] = Rational(*(info[:video][:display_aspect_ratio].split(':')))
          if info[:aspect_ratio] == 0
            info[:aspect_ratio] = Rational(info[:width], info[:height])
          end

          if info[:format][:format_name] == 'flv' and info[:video][:codec_name] == 'h264'
            info[:video][:deskshare_timestamp_bug] = self.check_deskshare_timestamp_bug(filename)
          end

          # Convert the duration to milliseconds
          info[:duration] = (info[:format][:duration].to_r * 1000).to_i

          # Red5 writes video files with the first frame often having a pts
          # much greater than 0.
          # We can compensate for this during decoding if we know the
          # timestamp offset, which ffprobe handily finds. Convert the units
          # to ms.
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

      def self.pad_offset(video_width, video_height, area_width, area_height)
        pad_x = (2 * ((area_width - video_width).to_f / 4).round).to_i
        pad_y = (2 * ((area_height - video_height).to_f / 4).round).to_i
        [pad_x, pad_y]
      end

      def self.composite_cut(output, cut, layout, videoinfo)
        duration = cut[:next_timestamp] - cut[:timestamp]
        BigBlueButton.logger.info "  Cut start time #{cut[:timestamp]}, duration #{duration}"

        ffmpeg_filter = "color=c=white:s=#{layout[:width]}x#{layout[:height]}:r=24"

        layout[:areas].each do |layout_area|
          area = cut[:areas][layout_area[:name]]
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
              video_width = videoinfo[video[:filename]][:width]
              video_height = videoinfo[video[:filename]][:height]
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
            video_width = this_videoinfo[:width]
            video_height = this_videoinfo[:height]
            BigBlueButton.logger.debug "      original size: #{video_width}x#{video_height}"

            scale_width, scale_height = aspect_scale(video_width, video_height, tile_width, tile_height)
            BigBlueButton.logger.debug "      scaled size: #{scale_width}x#{scale_height}"

            offset_x, offset_y = pad_offset(scale_width, scale_height, tile_width, tile_height)
            BigBlueButton.logger.debug "      offset: left: #{offset_x}, top: #{offset_y}"

            BigBlueButton.logger.debug("      start timestamp: #{video[:timestamp]}")
            seek_offset = this_videoinfo[:video][:start_time]
            BigBlueButton.logger.debug("      seek offset: #{seek_offset}")
            BigBlueButton.logger.debug("      codec: #{this_videoinfo[:video][:codec_name].inspect}")
            BigBlueButton.logger.debug("      duration: #{this_videoinfo[:duration]}, original duration: #{video[:original_duration]}")

            if this_videoinfo[:video][:codec_name] == "flashsv2"
              # Desktop sharing videos in flashsv2 do not have regular
              # keyframes, so seeking in them doesn't really work.
              # To make processing more reliable, always decode them from the
              # start in each cut. (Slow!)
              seek = 0
            else
              # Webcam videos are variable, low fps; it might be that there's
              # no frame until some time after the seek point. Start decoding
              # 30s before the desired point to avoid this issue.
              seek = video[:timestamp] - 30000
              seek = 0 if seek < 0
            end

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

            # Apply the video start time offset to seek to the correct point.
            # Only actually apply the offset if we're already seeking so we
            # don't start seeking in a file where we've overridden the seek
            # behaviour.
            if seek > 0
              seek = seek + seek_offset
            end
            ffmpeg_filter << "movie=#{video[:filename]}:sp=#{ms_to_s(seek)}"
            # Scale the video length for the deskshare timestamp workaround
            if !scale.nil?
              ffmpeg_filter << ",setpts=PTS*#{scale}"
            end
            # Subtract away the offset from the timestamps, so the trimming
            # in the fps filter is accurate
            ffmpeg_filter << ",setpts=PTS-#{ms_to_s(seek_offset)}/TB"
            # fps filter fills in frames up to the desired start point, and
            # cuts the video there
            ffmpeg_filter << ",fps=#{FFMPEG_WF_FRAMERATE}:start_time=#{ms_to_s(video[:timestamp])}"
            # Reset the timestamps to start at 0 so that everything is synced
            # for the video tiling, and scale to the desired size.
            ffmpeg_filter << ",setpts=PTS-STARTPTS,scale=#{scale_width}:#{scale_height}"
            # And finally, pad the video to the desired aspect ratio
            ffmpeg_filter << ",pad=w=#{tile_width}:h=#{tile_height}:x=#{offset_x}:y=#{offset_y}:color=white"
            ffmpeg_filter << "[#{pad_name}];"

            tile_x += 1
            if tile_x >= tiles_h
              tile_x = 0
              tile_y += 1
            end
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

        ffmpeg_cmd = [*FFMPEG]
        ffmpeg_cmd += ['-filter_complex', ffmpeg_filter, *FFMPEG_WF_ARGS, '-']

        File.open(output, 'a') do |outio|
          exitstatus = BigBlueButton.exec_redirect_ret(outio, *ffmpeg_cmd)
          raise "ffmpeg failed, exit code #{exitstatus}" if exitstatus != 0
        end

        return output
      end

    end
  end
end

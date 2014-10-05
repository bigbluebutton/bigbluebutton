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
      FFMPEG_WF_FRAMERATE = '24'
      FFMPEG_WF_ARGS = ['-an', '-codec', FFMPEG_WF_CODEC, '-q:v', '2', '-g', '240', '-pix_fmt', 'yuv420p', '-r', FFMPEG_WF_FRAMERATE, '-f', 'mpegts']
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
              BigBlueButton.logger.debug "      #{video[:filename]} at #{video[:timestamp]}"
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
                  :timestamp => video[:timestamp] + merged_entry[:timestamp] - last_entry[:timestamp]
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
          BigBlueButton.logger.debug "    width: #{info[:width]}, height: #{info[:height]}, duration: #{info[:duration]}"

          if !info[:video] || !info[:video][:nb_read_frames]
            BigBlueButton.logger.warn "    This video file is corrupt! It will be removed from the output."
            corrupt_videos << videofile
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

        BigBlueButton.logger.info "Generating missing video end events"
        videoinfo.each do |filename, info|

          edl.each_with_index do |event, index|

            new_entry = { :areas => {} }
            add_new_entry = false
            event[:areas].each do |area, videos|
              videos.each do |video|
                if video[:filename] == filename
                  if video[:timestamp] > info[:duration]
                    videos.delete(video)
                  # Note that I'm using a 5-second fuzz factor here.
                  # If there's a stop event within 5 seconds of the video ending, don't bother to generate
                  # an extra event.
                  elsif video[:timestamp] + (event[:next_timestamp] - event[:timestamp]) > info[:duration] + 5000
                    BigBlueButton.logger.warn "Over-long video #{video[:filename]}, synthesizing stop event"
                    new_entry[:timestamp] = event[:timestamp] + info[:duration] - video[:timestamp]
                    new_entry[:next_timestamp] = event[:next_timestamp]
                    event[:next_timestamp] = new_entry[:timestamp]
                    add_new_entry = true
                  end
                end
              end
            end

            if add_new_entry
              event[:areas].each do |area, videos|
                new_entry[:areas][area] = videos.select do |video|
                  video[:filename] != filename
                end.map do |video|
                  {
                    :filename => video[:filename],
                    :timestamp => video[:timestamp] + new_entry[:timestamp] - event[:timestamp]
                  }
                end
              end
              edl.insert(index + 1, new_entry)
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
          info = JSON.parse(probe.read, :symbolize_names => true)
          return {} if !info

          if info[:streams]
            info[:video] = info[:streams].find { |stream| stream[:codec_type] == 'video' }
            info[:audio] = info[:streams].find { |stream| stream[:codec_type] == 'audio' }
          end

          if info[:video]
            info[:width] = info[:video][:width].to_i
            info[:height] = info[:video][:height].to_i

            info[:aspect_ratio] = info[:video][:display_aspect_ratio].to_r
            if info[:aspect_ratio] == 0
              info[:aspect_ratio] = Rational(info[:width], info[:height])
            end
          end

          # Convert the duration to milliseconds
          if info[:format]
            info[:duration] = (info[:format][:duration].to_r * 1000).to_i
          else
            info[:duration] = 0
          end

          return info
        end
        {}
      end

      def self.ms_to_s(timestamp)
        s = timestamp / 1000
        ms = timestamp % 1000
        "%d.%03d" % [s, ms]
      end

      def self.aspect_scale(old_width, old_height, new_width, new_height)
        if old_width.to_f / old_height > new_width.to_f / new_height
          [new_width, old_height * new_width / old_width]
        else
          [old_width * new_height / old_height, new_height]
        end
      end

      def self.pad_offset(video_width, video_height, area_width, area_height)
        [(area_width - video_width) / 2, (area_height - video_height) / 2]
      end

      def self.composite_cut(output, cut, layout, videoinfo)
        duration = cut[:next_timestamp] - cut[:timestamp]
        BigBlueButton.logger.info "  Cut start time #{cut[:timestamp]}, duration #{duration}"

        ffmpeg_inputs = []
        ffmpeg_filter = "color=c=white:s=#{layout[:width]}x#{layout[:height]}:r=24"

        index = 0

        layout[:areas].each do |layout_area|
          area = cut[:areas][layout_area[:name]]
          video_count = area.length
          BigBlueButton.logger.debug "  Laying out #{video_count} videos in #{layout_area[:name]}"

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
            tmp_tile_width = layout_area[:width] / tmp_tiles_h
            tmp_tile_height = layout_area[:height] / tmp_tiles_v
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

          area.each do |video|
            BigBlueButton.logger.debug "    clip ##{index}"
            BigBlueButton.logger.debug "      tile location (#{tile_x}, #{tile_y})"
            video_width = videoinfo[video[:filename]][:width]
            video_height = videoinfo[video[:filename]][:height]
            BigBlueButton.logger.debug "      original size: #{video_width}x#{video_height}"

            scale_width, scale_height = aspect_scale(video_width, video_height, tile_width, tile_height)
            BigBlueButton.logger.debug "      scaled size: #{scale_width}x#{scale_height}"

            offset_x, offset_y = pad_offset(scale_width, scale_height, tile_width, tile_height)
            offset_x += tile_offset_x + (tile_x * tile_width)
            offset_y += tile_offset_y + (tile_y * tile_height)
            BigBlueButton.logger.debug "      offset: left: #{offset_x}, top: #{offset_y}"

            BigBlueButton.logger.debug "      start timestamp: #{video[:timestamp]}"

            ffmpeg_inputs << {
              :filename => video[:filename],
              :seek => video[:timestamp]
            }
            ffmpeg_filter << "[in#{index}]; [#{index}]fps=24,scale=#{scale_width}:#{scale_height}"
            if layout_area[:pad]
              ffmpeg_filter << ",pad=w=#{tile_width}:h=#{tile_height}:x=#{offset_x}:y=#{offset_y}:color=white"
              offset_x = 0
              offset_y = 0
            end
            ffmpeg_filter << "[mv#{index}]; [in#{index}][mv#{index}] overlay=#{offset_x}:#{offset_y}" 

            tile_x += 1
            if tile_x >= tiles_h
              tile_x = 0
              tile_y += 1
            end
            index += 1
          end
        end

        ffmpeg_filter << ",trim=end=#{ms_to_s(duration)}"

        ffmpeg_cmd = [*FFMPEG]
        ffmpeg_inputs.each do |input|
          ffmpeg_cmd += ['-ss', ms_to_s(input[:seek]), '-i', input[:filename]]
        end
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

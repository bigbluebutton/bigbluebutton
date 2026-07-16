# frozen_string_literal: true

module BigBlueButton
  module EDL
    module Video
      # Handler for an input video file used during EDL rendering
      class VideoSource
        READ_VIDEO_INFO_FLAGS = ['-select_streams', 'v:0', '-count_frames', '-read_intervals', '%+#10'].freeze

        # Initialize a video source from a video file
        #
        # @param filename [String] path to the video file
        # @param process_dir [String] temporary directory for recording processing
        # @param original_duration [Integer, nil] original duration of the video in milliseconds, if known
        def initialize(filename, process_dir, original_duration: nil)
          @filename = @original_filename = filename
          @process_dir = process_dir
          @original_duration = original_duration

          BigBlueButton.logger.info("Reading video info for #{@filename}")
          read_video_info

          if corrupt?
            BigBlueButton.logger.warn("Video file #{@filename} is corrupt")
            return
          end

          BigBlueButton.logger.debug(
            "  width: #{@info[:width]}, height: #{@info[:height]}, " \
            "duration: #{@info[:duration]}, start_time: #{@info[:start_time]}"
          )

          if deskshare_timestamp_bug? && @original_duration
            @scale = @original_duration.to_f / @info[:duration]
            BigBlueButton.logger.debug("  Early 1.1 deskshare timestamp bug: scaling video length by #{@scale}")
          end

          needs_remux = false
          if (@info.dig(:format, :format_name) == 'flv') && (@info[:start_time] > 1)
            BigBlueButton.logger.debug('  Has large start time, needs remuxing')
            needs_remux = true
          end
          unless test_video_decode
            BigBlueButton.logger.debug('  Failed to run test decode; will attempt to remux')
            needs_remux = true
          end
          try_remux_video if needs_remux
        end

        # Check this video source for large gaps in timestamps.
        #
        # @return [Array<Array<Numeric>>] PTS gaps in the current source file
        def pts_gaps
          return [] if corrupt?

          duration = @original_duration || @info[:duration]
          BigBlueButton::EDL::MediaUtils.pts_gaps(@process_dir, @filename, :video, duration)
        end

        # The native aspect ratio of the video source.
        #
        # @return [Rational, nil] The aspect ratio of the video source, or nil if it is unknown.
        def aspect_ratio
          @info&.dig(:aspect_ratio)
        end

        # Check if the video source is corrupt
        #
        # @return [Boolean] true if the video source is corrupt, false otherwise
        def corrupt?
          # If any of the corruption checks fail, the info will be left as nil
          @info.nil?
        end

        # Generate a cut of the input video file using ffmpeg pre-processing
        #
        # @param width [Integer] width of the video area
        # @param height [Integer] height of the video area
        # @param seek [Integer] start time of the cut in milliseconds
        # @param duration [Integer] duration of the cut in milliseconds
        # @param framerate [Float] frame rate of the video
        # @param name [String] name which uniquely identifies the individual cut of this video.
        # @return [VideoSourceReader] reader for the cut
        def open(width, height, seek, duration, framerate, name)
          # If the video is corrupt or the seekpoint is at or after the end of the file, the filter chain will have problems.
          # Substitute in a blank video.
          if corrupt? || seek >= @info[:duration]
            return VideoSourceReader.new(
              ffmpeg_filter: "color=c=white:s=#{width}x#{height}:r=#{framerate}," \
                "trim=end=#{BigBlueButton::EDL::Video.ms_to_s(duration)}"
            )
          end

          video_width = @info[:aspect_ratio].numerator
          video_height = @info[:aspect_ratio].denominator
          BigBlueButton.logger.debug "      original aspect: #{video_width}:#{video_height}"

          scale_width, scale_height = BigBlueButton::EDL::Video.aspect_scale(video_width, video_height, width, height)
          BigBlueButton.logger.debug "      scaled size: #{scale_width}x#{scale_height}"

          BigBlueButton.logger.debug("      start timestamp: #{seek}")
          seek_offset = @info[:start_time]
          video_start_offset = @info[:video][:start_time]
          BigBlueButton.logger.debug("      seek offset: #{seek_offset}, video start offset: #{video_start_offset}")
          BigBlueButton.logger.debug("      codec: #{@info[:video][:codec_name].inspect}")
          BigBlueButton.logger.debug("      duration: #{@info[:duration]}, original duration: #{@original_duration}")

          # Apply the video start time offset to seek to the correct point.
          seek += seek_offset
          in_time = seek + seek_offset
          out_time = in_time + duration + 10_000 # Avoid video blinking at end of cuts

          # If the video is not seekable, decode the video from the start. Frames prior to the in_time will be dropped by the
          # trim filter.
          seek = 0 unless seekable?

          # Launch the ffmpeg process to use for this input to pre-process the video to constant video resolution
          # This has to be done in an external process, since if it's done in the same process, the entire filter
          # chain gets re-initialized on every resolution change, resulting in losing state on all stateful filters.

          log_file = File.join(@process_dir, "ffmpeg-preprocess-#{name}.log")
          read, write = IO.pipe
          # To reduce overhead, adjust the size of the fifo buffer larger
          # By default, Linux allows pipe sizes to be increased to 1MB by normal users.
          begin
            write.fcntl(Fcntl::F_SETPIPE_SZ, 1_048_576)
          rescue Errno::EPERM
            BigBlueButton.logger.warn('Unable to increase pipe size to 1MB')
          rescue NameError
            # Fcntl::F_SETPIPE_SZ isn't available on Ruby version older than 3.0
          end

          # Pre-filtering: scaling, padding, and extending.
          preprocess_filter = String.new
          preprocess_filter << '[0:v:0]'
          preprocess_filter << "scale=w=#{width}:h=#{height}:force_original_aspect_ratio=decrease,"
          preprocess_filter << "setsar=1,pad=w=#{width}:h=#{height}:x=-1:y=-1:color=white,"
          # The trim command combines its arguments - end at the timestamp but only if at least one frame has been output.
          preprocess_filter << "trim=end=#{BigBlueButton::EDL::Video.ms_to_s(out_time)}:end_frame=1"
          preprocess_filter << '[out]'

          # Set up filters and inputs for video pre-processing ffmpeg command
          preprocess_command = [
            *FFMPEG,
            # Ensure input isn't misdetected as cfr, and frames prior to seek point run through filters.
            '-vsync', 'vfr', '-noaccurate_seek',
            '-ss', BigBlueButton::EDL::Video.ms_to_s(seek).to_s,
            '-itsoffset', BigBlueButton::EDL::Video.ms_to_s(seek).to_s,
            '-i', @filename,
            '-filter_complex', preprocess_filter, '-map', '[out]',
            # Copy timebase from input instead of guessing based on framerate
            '-enc_time_base', '-1',
            '-c:v', 'rawvideo', '-f', 'nut', "pipe:#{write.fileno}",
          ]
          BigBlueButton.logger.info("Executing: #{Shellwords.join(preprocess_command)}")
          pid = spawn(
            *preprocess_command,
            close_others: true,
            out: log_file,
            err: %i[child out],
            write => write
          )
          write.close
          BigBlueButton.logger.debug("preprocessing ffmpeg command pid #{pid}")

          ffmpeg_input = ['-f', 'nut', '-i', "pipe:#{read.fileno}"]

          ffmpeg_filter = String.new
          # Scale the video length for the deskshare timestamp workaround
          ffmpeg_filter << "setpts=PTS*#{@scale}," unless @scale.nil?
          # Apply PTS offset so '0' time is aligned
          ffmpeg_filter << "setpts=PTS-#{BigBlueButton::EDL::Video.ms_to_s(in_time)}/TB[#{name}_input];"
          # Extend the video if needed
          ffmpeg_filter << "color=c=white:s=#{width}x#{height}:r=#{framerate}[#{name}_tpad];"
          ffmpeg_filter << "[#{name}_input][#{name}_tpad]concat=n=2:v=1:a=0,"
          # Clean up the framerate
          ffmpeg_filter << "fps=#{framerate},"
          # Trim frames before the start time
          ffmpeg_filter << 'trim=start=0,'
          # Trim frames after stop time, which can be generated by the pre-processing ffmpeg if there's an unlucky
          # large timestamp gap before a frame which changes resolution.
          # The trim filter is needed to eat these frames so they don't queue up on the inputs of xstack.
          ffmpeg_filter << "trim=end=#{BigBlueButton::EDL::Video.ms_to_s(duration)}"

          VideoSourceReader.new(
            pid: pid,
            read: read,
            ffmpeg_input: ffmpeg_input,
            ffmpeg_filter: ffmpeg_filter,
            log_file: log_file
          )
        end

        private

        # Check if the video source is seekable
        #
        # @return [Boolean] true if the video source is seekable, false otherwise
        def seekable?
          # flashsv2 videos don't have regular keyframes, so seeking in them doesn't really work.
          # Can't seek if video length is being scaled.
          @info && @info.dig(:video, :codec_name) != 'flashsv2' && @scale.nil?
        end

        # Read video information using ffprobe
        #
        # Updates the @info variable with the parsed information.
        def read_video_info
          @info = nil

          info = IO.popen([*FFPROBE, *READ_VIDEO_INFO_FLAGS, @filename]) do |probe|
            JSON.parse(probe.read, symbolize_names: true)
          rescue StandardError => e
            BigBlueButton.logger.warn("Couldn't parse ffprobe output: #{e}")
            break
          end

          return unless info
          return unless info[:streams]
          return unless info[:format]

          info[:video] = info[:streams].find { |stream| stream[:codec_type] == 'video' }
          return unless info[:video]

          info[:width] = info[:video][:width].to_i
          info[:height] = info[:video][:height].to_i

          # Check for corrupt/undecodable video streams
          return if info[:video][:pix_fmt].nil?
          return if info[:width] == 0 || info[:height] == 0
          return if info[:video][:nb_read_frames].nil? || info[:video][:nb_read_frames] == 'N/A'

          info[:sample_aspect_ratio] = Rational(1, 1)
          # Parse the actual sample aspect ratio if it's available
          if !info[:video][:sample_aspect_ratio].nil? && info[:video][:sample_aspect_ratio] != 'N/A'
            aspect_x, aspect_y = info[:video][:sample_aspect_ratio].split(':')
            aspect_x = aspect_x.to_i
            aspect_y = aspect_y.to_i
            info[:sample_aspect_ratio] = Rational(aspect_x, aspect_y) if aspect_x != 0 && aspect_y != 0
          end
          # Calculate the actual aspect ratio taking sample aspect ratio into account
          info[:aspect_ratio] = Rational(info[:width], info[:height]) * info[:sample_aspect_ratio]

          # Convert all timestamps to integer milliseconds
          info[:duration] = (info[:format][:duration].to_r * 1000).to_i
          info[:start_time] = (info[:format][:start_time].to_r * 1000).to_i
          info[:video][:start_time] = (info[:video][:start_time].to_r * 1000).to_i

          @info = info
        end

        # Check if the video file has the early 1.1 deskshare timestamp bug
        #
        # This bug resulted in videos incorrect length, because the frame pts values
        # did not reflect real time, but instead incremented by 200ms for each frame.
        #
        # The return value of this function is memoized, so it's fast to call multiple times.
        #
        # @return [Boolean] true if the video has the bug, false otherwise
        def deskshare_timestamp_bug?
          return @deskshare_timestamp_bug unless @deskshare_timestamp_bug.nil?

          frame_info = IO.popen(
            [*FFPROBE, '-select_streams', 'v:0', '-show_frames', '-read_intervals', '%+#10', @filename]
          ) do |probe|
            JSON.parse(probe.read, symbolize_names: true)
          rescue StandardError => e
            BigBlueButton.logger.warn("Couldn't parse ffprobe output: #{e}")
            @deskshare_timestamp_bug = false
          end
          @deskshare_timestamp_bug = false unless frame_info[:frames]
          return @deskshare_timestamp_bug unless @deskshare_timestamp_bug.nil?

          @deskshare_timestamp_bug = true

          # First frame in broken stream always has pts=1
          @deskshare_timestamp_bug = false if frame_info[:frames][0][:pkt_pts] != 1

          # Remaining frames start at 200, and go up by exactly 200 each frame
          (1...frame_info[:frames].length).each do |i|
            if frame_info[:frames][i][:pkt_pts] != i * 200
              @deskshare_timestamp_bug = false
              break
            end
          end

          @deskshare_timestamp_bug
        end

        # Try decoding a frame to detect some types of problems
        def test_video_decode
          ffmpeg_cmd = [
            *FFMPEG,
            '-max_error_rate', '0',
            '-noaccurate_seek', '-ss', '0', '-i', @filename,
            '-map', '0:v:0', '-frames:v', '1', '-f', 'null', '-',
          ]
          exitstatus = BigBlueButton.execute(ffmpeg_cmd, false)
          exitstatus.success?
        end

        # Try remuxing the video to handle certain types of problems with timestamps or decoding
        # failures.
        #
        # Updates @info and @filename to reflect the new video if successful.
        def try_remux_video
          BigBlueButton.logger.info('Attempting remux of video with problems')
          remuxdir = File.join(@process_dir, 'remux')
          FileUtils.mkdir_p(remuxdir)

          @filename = File.join(remuxdir, "#{File.basename(@original_filename, '.*')}.nut")

          ffmpeg_cmd = [*FFMPEG, '-i', @original_filename, '-c', 'copy', @filename]
          exitstatus = BigBlueButton.execute(ffmpeg_cmd, false)
          unless exitstatus.success?
            BigBlueButton.logger.warn('Remux command failed, input file is unusable')
            return
          end

          read_video_info
          return unless corrupt? || !test_video_decode

          BigBlueButton.logger.warn('Result of remux is corrupt, not using it.')
          @filename = @original_filename
        end
      end
    end
  end
end

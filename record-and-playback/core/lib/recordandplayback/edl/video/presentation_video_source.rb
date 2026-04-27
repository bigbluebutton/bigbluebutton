# frozen_string_literal: true

module BigBlueButton
  module EDL
    module Video
      # EDL Video Source for presentation video
      #
      # @param raw_dir [String] directory containing the raw recording data (events.xml file)
      # @param process_dir [String] directory for output files from processing
      class PresentationVideoSource
        def initialize(raw_dir, process_dir)
          @raw_dir = raw_dir
          @process_dir = process_dir
        end

        # The native aspect ratio of the video source.
        #
        # @return [Rational, nil] Always nil, since presentation video can be rendered at arbitrary aspect ratio.
        def aspect_ratio
          nil
        end

        # Check if the video source is corrupt
        #
        # @return [Boolean] Always false, since video is generated on demand
        def corrupt?
          false
        end

        # Generate a cut of presentation area video using the bbb-presentation-video tool
        #
        # @param width [Integer] width of the presentation area
        # @param height [Integer] height of the presentation area
        # @param seek [Integer] start time of the cut in milliseconds
        # @param duration [Integer] duration of the cut in milliseconds
        # @param framerate [Float] frame rate of the presentation video
        # @param name [String] name which uniquely identifies the individual cut of this video.
        def open(width, height, seek, duration, framerate, name)
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

          command = [
            'bbb-presentation-video',
            '-w', width.to_s,
            '-h', height.to_s,
            '-c', 'rawvideo',
            '-r', framerate.to_s,
            '-i', @raw_dir,
            '-o', "/dev/fd/#{write.fileno}",
            '--ignore-record-status',
            '-s', BigBlueButton::EDL::Video.ms_to_s(seek),
            '-e', BigBlueButton::EDL::Video.ms_to_s(seek + duration),
          ]
          log_file = File.join(@process_dir, "bbb-presentation-video-#{name}.log")

          BigBlueButton.logger.debug("Executing: #{Shellwords.join(command)}")
          pid = spawn(
            *command,
            close_others: true,
            out: log_file,
            err: %i[child out],
            write => write
          )
          write.close
          BigBlueButton.logger.debug("bbb-presentation-video pid #{pid}")

          ffmpeg_input = [
            '-f', 'rawvideo',
            '-pixel_format', 'bgr0', # NOTE: bgr0 for little-endian; 0rgb for big-endian
            '-video_size', "#{width}x#{height}",
            '-framerate', framerate.to_s,
            '-i', "pipe:#{read.fileno}",
          ]

          VideoSourceReader.new(
            pid: pid,
            read: read,
            ffmpeg_input: ffmpeg_input,
            log_file: log_file
          )
        end
      end
    end
  end
end

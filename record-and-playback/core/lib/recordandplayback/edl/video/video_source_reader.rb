# frozen_string_literal: true

module BigBlueButton
  module EDL
    module Video
      class VideoSourceReader
        attr_reader :pid, :read, :ffmpeg_input, :ffmpeg_filter, :log_file

        # Initialize a video source reader data class.
        #
        # Note that at least one of ffmpeg_input or ffmpeg_filter must be provided.
        #
        # @param read [IO, nil] file descriptor for reading the video data
        # @param ffmpeg_input [Array<String>, nil] ffmpeg input arguments
        # @param pid [Integer, nil] process ID of the external process which pre-processes or generates the video data
        # @param ffmpeg_filter [String, nil] ffmpeg filter arguments
        # @param log_file [String, nil] path to the log file for the external process
        def initialize(read: nil, ffmpeg_input: nil, pid: nil, ffmpeg_filter: nil, log_file: nil)
          @pid = pid
          @read = read
          @ffmpeg_input = ffmpeg_input
          @ffmpeg_filter = ffmpeg_filter
          @log_file = log_file

          return unless @ffmpeg_input.nil? && @ffmpeg_filter.nil?

          raise ArgumentError, 'Either ffmpeg_input or ffmpeg_filter must be provided'
        end
      end
    end
  end
end

# encoding: UTF-8

require File.expand_path('../edl/video', __FILE__)
require File.expand_path('../edl/audio', __FILE__)

module BigBlueButton
  module EDL
    FFMPEG = ['ffmpeg', '-y', '-v', 'warning', '-nostats']
    FFPROBE = ['ffprobe', '-v', 'warning', '-print_format', 'json', '-show_format', '-show_streams']

    def self.encode(audio, video, format, output_basename, audio_offset = 0)
      output = "#{output_basename}.#{format[:extension]}"
      lastoutput = nil
      format[:parameters].each_with_index do |pass, i|
        BigBlueButton.logger.info "Performing video encode pass #{i}"
        lastoutput = "#{output_basename}.encode.#{format[:extension]}"
        ffmpeg_cmd = FFMPEG
        ffmpeg_cmd += ['-i', video] if video
        if audio
          if audio_offset != 0
            ffmpeg_cmd += ['-itsoffset', ms_to_s(audio_offset)]
          end
          ffmpeg_cmd += ['-i', audio]
        end
        ffmpeg_cmd += [*pass, lastoutput]
        Dir.chdir(File.dirname(output)) do
          exitstatus = BigBlueButton.exec_ret(*ffmpeg_cmd)
          raise "ffmpeg failed, exit code #{exitstatus}" if exitstatus != 0
        end
      end

      # Some formats have post-processing to prepare for streaming
      if format[:postprocess]
        format[:postprocess].each_with_index do |pp, i|
          BigBlueButton.logger.info "Performing post-processing step #{i}"
          ppoutput = "#{output_basename}.pp#{i}.#{format[:extension]}"
          cmd = pp.map do |arg|
            case arg
            when ':input'
              lastoutput
            when ':output'
              ppoutput
            else
              arg
            end
          end
          Dir.chdir(File.dirname(output)) do
            exitstatus = BigBlueButton.exec_ret(*cmd)
            raise "postprocess failed, exit code #{exitstatus}" if exitstatus != 0
          end
          lastoutput = ppoutput
        end
      end

      FileUtils.mv(lastoutput, output)

      return output
    end

    def self.ms_to_s(timestamp)
      s = timestamp / 1000
      ms = timestamp % 1000
      "%d.%03d" % [s, ms]
    end    

  end
end

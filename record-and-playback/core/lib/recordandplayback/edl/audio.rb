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

module BigBlueButton
  module EDL
    module Audio
      FFMPEG_AEVALSRC = "aevalsrc=s=48000:c=stereo:exprs=0|0"
      FFMPEG_AFORMAT = "aformat=sample_fmts=s16:sample_rates=48000:channel_layouts=stereo"
      FFMPEG_WF_CODEC = 'pcm_s16le'
      FFMPEG_WF_ARGS = ['-c:a', FFMPEG_WF_CODEC, '-f', 'wav']
      WF_EXT = 'wav'

      def self.dump(edl)
        BigBlueButton.logger.debug "EDL Dump:"
        edl.each do |entry|
          BigBlueButton.logger.debug "---"
          BigBlueButton.logger.debug "  Timestamp: #{entry[:timestamp]}"
          BigBlueButton.logger.debug "  Audio:"
          audio = entry[:audio]
          if audio
            BigBlueButton.logger.debug "    #{audio[:filename]} at #{audio[:timestamp]}"
          else
            BigBlueButton.logger.debug "    silence"
          end
        end
      end

      def self.render(edl, output_basename)
        sections = []
        audioinfo = {}

        corrupt_audios = Set.new

        BigBlueButton.logger.info "Pre-processing EDL"
        for i in 0...(edl.length - 1)
          # The render scripts use this to calculate cut lengths
          edl[i][:next_timestamp] = edl[i+1][:timestamp]
          # Build a list of audio files to read information from
          if edl[i][:audio]
            audioinfo[edl[i][:audio][:filename]] = {}
          end
        end

        BigBlueButton.logger.info "Reading source audio information"
        audioinfo.keys.each do |audiofile|
          BigBlueButton.logger.debug "  #{audiofile}"
          info = audio_info(audiofile)
          BigBlueButton.logger.debug "    sample rate: #{info[:sample_rate]}, duration: #{info[:duration]}"

          if !info[:audio] || !info[:duration]
            BigBlueButton.logger.warn "    This audio file is corrupt! It will be removed from the output."
            corrupt_audios << audiofile
          end

          audioinfo[audiofile] = info
        end

        if corrupt_audios.length > 0
          BigBlueButton.logger.info "Removing corrupt audio files from EDL"
          edl.each do |event|
            if event[:audio] && corrupt_audios.include?(event[:audio][:filename])
              event[:audio] = nil
            end
          end

          dump(edl)
        end

        input_index = 0
        output_index = 0
        ffmpeg_inputs = []
        ffmpeg_filters = []
        BigBlueButton.logger.info "Generating ffmpeg command"
        for i in 0...(edl.length - 1)
          entry = edl[i]
          audio = entry[:audio]
          duration = entry[:next_timestamp] - entry[:timestamp]

          if audio
            BigBlueButton.logger.info "  Using input #{audio[:filename]}"

            filter = "[#{input_index}] "

            if entry[:original_duration] and ((entry[:original_duration] - audioinfo[audio[:filename]][:duration]).to_f / entry[:original_duration]).abs < 0.05
              speed = audioinfo[audio[:filename]][:duration].to_f / entry[:original_duration]
              BigBlueButton.logger.warn "  Audio file length mismatch, adjusting speed to #{speed}"

              # Have to calculate the start point after the atempo filter in this case,
              # since it can affect the audio start time.
              # Also reset the pts to start at 0, so the duration trim works correctly.
              filter << "atempo=#{speed},atrim=start=#{ms_to_s(audio[:timestamp])},"
              filter << "asetpts=PTS-STARTPTS,"

              ffmpeg_inputs << {
                :filename => audio[:filename],
                :seek => 0
              }
            else
              ffmpeg_inputs << {
                :filename => audio[:filename],
                :seek => audio[:timestamp]
              }
            end

            filter << "#{FFMPEG_AFORMAT},apad,atrim=end=#{ms_to_s(duration)} [out#{output_index}]"
            ffmpeg_filters << filter

            input_index += 1
            output_index += 1
          else
            BigBlueButton.logger.info "  Generating silence"

            ffmpeg_filters << "#{FFMPEG_AEVALSRC},#{FFMPEG_AFORMAT},atrim=end=#{ms_to_s(duration)} [out#{output_index}]"

            output_index += 1
          end
        end

        ffmpeg_cmd = [*FFMPEG]
        ffmpeg_inputs.each do |input|
          ffmpeg_cmd += ['-ss', ms_to_s(input[:seek]), '-i', input[:filename]]
        end
        ffmpeg_filter = ffmpeg_filters.join(' ; ')

        if output_index > 1
          # Add the final concat filter
          ffmpeg_filter << " ; "
          (0...output_index).each { |i| ffmpeg_filter << "[out#{i}]" }
          ffmpeg_filter << " concat=n=#{output_index}:a=1:v=0"
        else
          # Only one input, no need for concat filter
          ffmpeg_filter << " ; [out0] anull"
        end

        ffmpeg_cmd += ['-filter_complex', ffmpeg_filter]

        output = "#{output_basename}.#{WF_EXT}"
        ffmpeg_cmd += [*FFMPEG_WF_ARGS, output]

        BigBlueButton.logger.info "Running audio processing..."
        exitstatus = BigBlueButton.exec_ret(*ffmpeg_cmd)
        raise "ffmpeg failed, exit code #{exitstatus}" if exitstatus != 0

        output
      end

      # The methods below should be considered private

      def self.audio_info(filename)
        IO.popen([*FFPROBE, filename]) do |probe|
          info = JSON.parse(probe.read, :symbolize_names => true)
          if !info[:streams]
            return {}
          end
          info[:audio] = info[:streams].find { |stream| stream[:codec_type] == 'audio' }

          if info[:audio]
            info[:sample_rate] = info[:audio][:sample_rate].to_i
          end

          info[:duration] = (info[:format][:duration].to_r * 1000).to_i

          return info
        end
        {}
      end

      def self.ms_to_s(timestamp)
        s = timestamp / 1000
        ms = timestamp % 1000
        "%d.%03d" % [s, ms]
      end
    end
  end
end

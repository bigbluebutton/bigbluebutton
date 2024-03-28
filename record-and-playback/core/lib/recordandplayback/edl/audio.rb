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
      FFMPEG_AEVALSRC = "aevalsrc=s=48000:channel_layout=mono:exprs=0"
      FFMPEG_AFORMAT = "aresample=async=1000,aformat=sample_fmts=s16:sample_rates=48000:channel_layouts=mono"
      FFMPEG_WF_CODEC = 'libvorbis'
      FFMPEG_WF_ARGS = ['-c:a', FFMPEG_WF_CODEC, '-q:a', '2', '-f', 'ogg']
      WF_EXT = 'ogg'

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

      def self.mixer(inputs, output_basename)
        BigBlueButton.logger.debug "Mixing audio files"

        ffmpeg_cmd = [*FFMPEG]
        inputs.each do |input|
          ffmpeg_cmd += ['-i', input]
        end
        ffmpeg_cmd += ['-filter_complex', "amix=inputs=#{inputs.length}"]

        output = "#{output_basename}.#{WF_EXT}"
        ffmpeg_cmd += ['-vn', *FFMPEG_WF_ARGS, output]

        BigBlueButton.logger.info "Running audio mixer..."
        exitstatus = BigBlueButton.exec_ret(*ffmpeg_cmd)
        raise "ffmpeg failed, exit code #{exitstatus}" if exitstatus != 0

        output
      end

      def self.render(edl, output_basename)
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
          if !info[:audio] || !info[:duration]
            BigBlueButton.logger.warn "    This audio file is corrupt! It will be removed from the output."
            corrupt_audios << audiofile
            next
          end

          BigBlueButton.logger.debug "    format: #{info[:format][:format_name]}, codec: #{info[:audio][:codec_name]}"
          BigBlueButton.logger.debug "    sample rate: #{info[:sample_rate]}, duration: #{info[:duration]}"

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

        ffmpeg_inputs = []
        ffmpeg_filter = ''
        BigBlueButton.logger.info "Generating ffmpeg command"
        for i in 0...(edl.length - 1)
          entry = edl[i]
          audio = entry[:audio]
          duration = entry[:next_timestamp] - entry[:timestamp]

          ffmpeg_filter << "[a_edl#{i}_prev];\n" if i > 0

          if audio
            BigBlueButton.logger.info "  Using input #{audio[:filename]}"

            speed = 1
            seek = audio[:timestamp]

            # Check for and handle audio files with mismatched lengths (generated
            # by buggy versions of freeswitch in old BigBlueButton
            if ((audioinfo[audio[:filename]][:format][:format_name] == 'wav' ||
                 audioinfo[audio[:filename]][:audio][:codec_name] == 'vorbis') &&
                 entry[:original_duration] &&
                 (audioinfo[audio[:filename]][:duration].to_f / entry[:original_duration]) < 0.997 &&
                 ((entry[:original_duration] - audioinfo[audio[:filename]][:duration]).to_f /
                   entry[:original_duration]).abs < 0.05)

              speed = audioinfo[audio[:filename]][:duration].to_f / entry[:original_duration]
              seek = 0
              BigBlueButton.logger.warn "  Audio file length mismatch, adjusting speed to #{speed}"
            end

            # Skip this input and generate silence if the seekpoint is past the end of the audio, which can happen
            # if events are slightly misaligned and you get unlucky with a start/stop or chapter break.
            if audio[:timestamp] < (audioinfo[audio[:filename]][:duration] * speed)
              input_index = ffmpeg_inputs.length
              ffmpeg_inputs << {
                filename: audio[:filename],
                seek: seek
              }
              ffmpeg_filter << "[#{input_index}]#{FFMPEG_AFORMAT},apad"
            else
              ffmpeg_filter << "#{FFMPEG_AEVALSRC},#{FFMPEG_AFORMAT}"
            end

            ffmpeg_filter << ",atempo=#{speed},atrim=start=#{ms_to_s(audio[:timestamp])}" if speed != 1

            ffmpeg_filter << ",asetpts=N"
          else
            BigBlueButton.logger.info "  Generating silence"

            ffmpeg_filter << "#{FFMPEG_AEVALSRC},#{FFMPEG_AFORMAT}"
          end

          if i > 0
            ffmpeg_filter << "[a_edl#{i}];\n"
            ffmpeg_filter << "[a_edl#{i}_prev][a_edl#{i}]concat=n=2:a=1:v=0"
          end

          ffmpeg_filter << ",atrim=end=#{ms_to_s(entry[:next_timestamp])}"
        end

        ffmpeg_cmd = [*FFMPEG]
        ffmpeg_inputs.each do |input|
          ffmpeg_cmd += ['-ss', ms_to_s(input[:seek])]
          # Ensure that the entire contents of freeswitch wav files are read
          if audioinfo[input[:filename]][:format][:format_name] == 'wav'
            ffmpeg_cmd += ['-ignore_length', '1']
          end
          # Prefer using the libopus decoder for opus files, it handles discontinuities better
          if audioinfo[input[:filename]][:audio][:codec_name] == 'opus'
            ffmpeg_cmd << '-c:a' << 'libopus'
          end
          ffmpeg_cmd += ['-i', input[:filename]]
        end

        BigBlueButton.logger.debug('  ffmpeg filter_complex_script:')
        BigBlueButton.logger.debug(ffmpeg_filter)
        filter_complex_script = "#{output_basename}.filter"
        File.open(filter_complex_script, 'w') do |io|
          io.write(ffmpeg_filter)
        end

        ffmpeg_cmd << '-filter_complex_script' << filter_complex_script

        output = "#{output_basename}.#{WF_EXT}"
        ffmpeg_cmd += ['-vn', *FFMPEG_WF_ARGS, output]

        BigBlueButton.logger.info "Running audio processing..."
        exitstatus = BigBlueButton.exec_ret(*ffmpeg_cmd)
        raise "ffmpeg failed, exit code #{exitstatus}" if exitstatus != 0

        output
      end

      # The methods below should be considered private

      def self.audio_info(filename)
        IO.popen([*FFPROBE, filename]) do |probe|
          info = nil
          begin
            info = JSON.parse(probe.read, :symbolize_names => true)
          rescue StandardError => e
            BigBlueButton.logger.warn("Couldn't parse audio info: #{e}")
          end
          return {} if !info
          return {} if !info[:streams]
          return {} if !info[:format]

          info[:audio] = info[:streams].find do |stream|
            stream[:codec_type] == 'audio'
          end
          return {} if !info[:audio]

          info[:sample_rate] = info[:audio][:sample_rate].to_i

          if info[:format][:format_name] == 'wav'
            # wav files generated by freeswitch can have incorrect length
            # field if longer than 4GB, so recalculate based on filesize (ouch!)
            BigBlueButton.logger.debug("Recalculated duration from wav file length")
            audio_offset = self.get_wave_data_offset(filename)
            audio_size = info[:format][:size].to_r - audio_offset
            info[:duration] = (audio_size * 8 / info[:audio][:bit_rate].to_i * 1000).to_i
          else
            info[:duration] = (info[:format][:duration].to_r * 1000).to_i
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

      # Helper function for determining correct length of freeswitch's long wave files
      def self.get_wave_data_offset(filename)
        File.open(filename, 'rb') do |file|
          riff = file.read(4)
          wavesize = file.read(4).unpack('V')[0].to_i
          wave = file.read(4)
          if riff != 'RIFF' or wavesize.nil? or wave != 'WAVE'
            return 0
          end
          while true
            # Read chunks until we find one named 'data'
            chunkname = file.read(4)
            chunksize = file.read(4).unpack('V')[0].to_i
            if chunkname.nil? or chunksize.nil?
              return 0
            end
            if chunkname == 'data'
              # This is a data chunk; we've found the start of the real audio data
              return file.tell
            end
            file.seek(chunksize, IO::SEEK_CUR)
          end
          return 0
        end
      end
    end
  end
end

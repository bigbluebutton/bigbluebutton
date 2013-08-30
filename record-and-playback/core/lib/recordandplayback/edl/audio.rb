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
      SOX = ['sox', '-q']
      SOX_WF_AUDIO_ARGS = ['-b', '16', '-c', '1', '-e', 'signed', '-r', '16000', '-L']
      SOX_WF_ARGS = [*SOX_WF_AUDIO_ARGS, '-t', 'wav']
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

          audioinfo[audiofile] = info
        end

        BigBlueButton.logger.info "Generating sections"
        for i in 0...(edl.length - 1)

          sox_cmd = SOX
          entry = edl[i]
          audio = entry[:audio]
          duration = edl[i][:next_timestamp] - edl[i][:timestamp]
          filename =  "#{output_basename}.temp-%03d.#{WF_EXT}" % i

          if audio
            BigBlueButton.logger.info "  Using input #{audio[:filename]}"
            sox_cmd += ['-m', *SOX_WF_AUDIO_ARGS, '-n', audio[:filename]]
          else
            BigBlueButton.logger.info "  Generating silence"
            sox_cmd += [*SOX_WF_AUDIO_ARGS, '-n']
          end

          BigBlueButton.logger.info "  Outputting to #{filename}"
          sox_cmd += [*SOX_WF_ARGS, filename]
          sections << filename

          if audio
            # If the audio file length is within 5% of where it should be,
            # adjust the speed to match up timing.
            # TODO: This should be part of the import logic somehow, since
            # render can be run after cutting.
            if ((duration - audioinfo[audio[:filename]][:duration]).to_f / duration).abs < 0.05
              speed = audioinfo[audio[:filename]][:duration].to_f / duration
              BigBlueButton.logger.warn "  Audio file length mismatch, adjusting speed to #{speed}"
              sox_cmd += ['speed', speed.to_s, 'rate', '-h', audioinfo[audio[:filename]][:sample_rate].to_s]
            end

            BigBlueButton.logger.info "  Trimming from #{audio[:timestamp]} to #{audio[:timestamp] + duration}"
            sox_cmd += ['trim', "#{ms_to_s(audio[:timestamp])}", "#{ms_to_s(audio[:timestamp] + duration)}"]
          else
            BigBlueButton.logger.info "  Trimming to #{duration}"
            sox_cmd += ['trim', '0.000', "#{ms_to_s(duration)}"]
          end

          exitstatus = BigBlueButton.exec_ret(*sox_cmd)
          raise "sox failed, exit code #{exitstatus}" if exitstatus != 0
        end

        output = "#{output_basename}.#{WF_EXT}"
        BigBlueButton.logger.info "Concatenating sections to #{output}"
        sox_cmd = [*SOX, *sections, *SOX_WF_ARGS, output]
        exitstatus = BigBlueButton.exec_ret(*sox_cmd)
        raise "sox failed, exit code #{exitstatus}" if exitstatus != 0

        output
      end

      # The methods below should be considered private

      def self.audio_info(filename)
        IO.popen([*FFPROBE, filename]) do |probe|
          info = JSON.parse(probe.read, :symbolize_names => true)
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

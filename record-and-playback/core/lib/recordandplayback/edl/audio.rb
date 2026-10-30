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
          BigBlueButton.logger.debug "  Audios:"
          audios = entry[:audios]
          if audios && !audios.empty?
            audios.each do |entry|
              BigBlueButton.logger.debug "    #{entry[:filename]} at #{entry[:timestamp]}"
            end
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
        # The render scripts use this to calculate cut lengths
        (0...(edl.length - 1)).each do |i|
          edl[i][:next_timestamp] = edl[i+1][:timestamp]
        end
      
        # Build a list of audio files to read information from
        edl.each do |entry|
          if entry[:audios]
            entry[:audios].each { |a| audioinfo[a[:filename]] ||= {} }
          end
        end
      
        # Read audio metadata
        BigBlueButton.logger.info "Reading source audio information"
        audioinfo.keys.each do |audiofile|
          BigBlueButton.logger.debug "  #{audiofile}"
          info = audio_info(audiofile)
          if !info[:audio] || !info[:duration]
            BigBlueButton.logger.warn "    This audio file is corrupt! It will be removed from the output."
            corrupt_audios << audiofile
          else
            BigBlueButton.logger.debug "    format: #{info[:format][:format_name]}, codec: #{info[:audio][:codec_name]}"
            BigBlueButton.logger.debug "    sample rate: #{info[:sample_rate]}, duration: #{info[:duration]}"
            audioinfo[audiofile] = info
          end
        end

        if corrupt_audios.any?
          BigBlueButton.logger.info "Removing corrupt audio files from EDL"
          edl.each do |event|
            if event[:audios]
              event[:audios].reject! { |a| corrupt_audios.include?(a[:filename]) }
            end
          end
          dump(edl)
        end

        ffmpeg_inputs = []
        filter_lines  = []
      
        # Keep an array of final segment labels for later concat
        segment_labels = []
      
        BigBlueButton.logger.info "Generating ffmpeg command"
        # Build one chain per segment
        (0...(edl.length - 1)).each do |i|
          entry = edl[i]
          seg_duration = entry[:next_timestamp] - entry[:timestamp]
      
          # label the final output of this segment as [segX]
          seg_label = "seg#{i}"

          audios = entry[:audios]
          if audios && !audios.empty?
            track_labels = []
      
            audios.each_with_index do |audio_data, idx|
              filename = audio_data[:filename]
              seek     = audio_data[:timestamp]
              info     = audioinfo[filename]
              speed    = 1.0

              # Check for and handle audio files with mismatched lengths (generated
              # by buggy versions of freeswitch in old BigBlueButton
              if ((info[:format][:format_name] == 'wav' ||
                info[:audio][:codec_name] == 'vorbis') &&
                  entry[:original_duration] &&
                  (info[:duration].to_f / entry[:original_duration]) < 0.997 &&
                  ((entry[:original_duration] - info[:duration]).to_f /
                    entry[:original_duration]).abs < 0.05)

                speed = audioinfo[audio[:filename]][:duration].to_f / entry[:original_duration]
                seek = 0
                BigBlueButton.logger.warn "  Audio file length mismatch, adjusting speed to #{speed}"
              end

              # Skip this input and generate silence if the seekpoint is past the end of the audio, which can happen
              # if events are slightly misaligned and you get unlucky with a start/stop or chapter break.
              if seek < (info[:duration].to_f * speed)
                input_index = ffmpeg_inputs.size
                ffmpeg_inputs << { filename: filename, seek: seek }
      
                # Build track label
                track_label = "t#{i}_#{idx}"
                line = "[#{input_index}]#{FFMPEG_AFORMAT},apad,asetpts=N"
                line << ",atempo=#{speed}" if speed != 1.0
                line << "[#{track_label}];"
                filter_lines << line
                track_labels << "[#{track_label}]"
              else
                # If we're seeking past the file end => silence
                track_label = "t#{i}_silence#{idx}"
                line = "#{FFMPEG_AEVALSRC},#{FFMPEG_AFORMAT},asetpts=N[#{track_label}];"
                filter_lines << line
                track_labels << "[#{track_label}]"
              end
            end
      
            # Mix audios if more than one
            if track_labels.size > 1
              # e.g.: [t0_0][t0_1]amix=inputs=2[seg0]
              line = track_labels.join
              line << "amix=inputs=#{track_labels.size}:normalize=0[#{seg_label}];"
              filter_lines << line
            else
              # Only one track => rename it to [segX] (via anull or direct rename)
              line = "#{track_labels.first}anull[#{seg_label}];"
              filter_lines << line
            end
          else
            BigBlueButton.logger.info "  Generating silence"
            line = "#{FFMPEG_AEVALSRC},#{FFMPEG_AFORMAT},asetpts=N[#{seg_label}];"
            filter_lines << line
          end
      
          # Now trim this segment to seg_duration
          trim_line = "[#{seg_label}]atrim=end=#{ms_to_s(seg_duration)}[#{seg_label}];"
          filter_lines << trim_line
      
          # Collect the segment’s final label for the eventual concat
          segment_labels << "[#{seg_label}]"
        end
      
        # Build the final concat line if we have at least one segment
        if segment_labels.any?
          # e.g.: [seg0][seg1][seg2]concat=n=3:a=1:v=0
          line = segment_labels.join
          line << "concat=n=#{segment_labels.size}:a=1:v=0"
          filter_lines << line
        end
      
        #-------------------------------------
        # Build the ffmpeg command
        #-------------------------------------
        ffmpeg_cmd = [*FFMPEG]
        ffmpeg_inputs.each do |input|
          # Seek
          ffmpeg_cmd += ['-ss', ms_to_s(input[:seek])]
          # Ensure that the entire contents of freeswitch wav files are read
          info = audioinfo[input[:filename]]
          if info && info[:format][:format_name] == 'wav'
            ffmpeg_cmd += ['-ignore_length', '1']
          end
          # Prefer using the libopus decoder for opus files, it handles discontinuities better
          if info && info[:audio][:codec_name] == 'opus'
            ffmpeg_cmd << '-c:a' << 'libopus'
          end
          ffmpeg_cmd += ['-i', input[:filename]]
        end

        # Write filter script
        filter_script = "#{output_basename}.filter"
        filter_content = filter_lines.join("\n")
        BigBlueButton.logger.debug('  ffmpeg filter_complex_script:')
        BigBlueButton.logger.debug(filter_content)
        File.open(filter_script, 'w') { |f| f.write(filter_content) }
        ffmpeg_cmd << '-filter_complex_script' << filter_script

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

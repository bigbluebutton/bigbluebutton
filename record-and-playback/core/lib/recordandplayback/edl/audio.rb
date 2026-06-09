# frozen_string_literal: true

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

require_relative 'media_utils'

module BigBlueButton
  module EDL
    module Audio
      SAMPLE_RATE = 48_000
      FFMPEG_AEVALSRC = "aevalsrc=s=#{SAMPLE_RATE}:c=stereo:exprs=0|0".freeze
      # Do audio sync to timestamps with a maximum stretch/squeeze rate of 1%
      # Use first_pts to trim (or pad) audio to start at the correct sample
      # Set flags=res to force resampler to be used to workaround a bug in ffmpeg 4.4 where it
      # inserts extra frames with bad timestamps when starting the resampler on-demand.
      FFMPEG_ARESAMPLE = "aresample=async=#{(SAMPLE_RATE / 100).round}:first_pts=0:flags=res".freeze
      FFMPEG_AFORMAT = "aformat=sample_fmts=s16:sample_rates=#{SAMPLE_RATE}:channel_layouts=stereo".freeze
      FFMPEG_WF_CODEC = 'flac'
      FFMPEG_WF_ARGS = ['-sample_fmt', 's16', '-c:a', FFMPEG_WF_CODEC, '-f', 'flac'].freeze
      WF_EXT = 'flac'
      MIN_CUT_LENGTH = 20 # ms (one frame of audio in opus)

      def self.dump(edl)
        BigBlueButton.logger.debug "EDL Dump:"
        edl.each do |entry|
          BigBlueButton.logger.debug "---"
          BigBlueButton.logger.debug "  Timestamp: #{entry[:timestamp]}"
          BigBlueButton.logger.debug "  Audios:"
          audios = entry[:audios]
          if audios && !audios.empty?
            audios.each do |entry|
              BigBlueButton.logger.debug(
                "    #{entry[:filename]} at #{entry[:timestamp]} (original duration: #{entry[:original_duration]})"
              )
            end
          else
            BigBlueButton.logger.debug "    silence"
          end
        end
      end

      # Merge multiple EDLs into a single EDL
      #
      # @param edls [Array<Array<Hash>>] The EDLs to merge
      # @return [Array<Hash>] The merged EDL
      def self.merge(*edls)
        entries_i = Array.new(edls.length, 0)
        done = Array.new(edls.length, false)
        merged_edl = [{ timestamp: 0, audios: [] }]

        until done.all?
          # Figure out what the next entry in each edl is
          entries = []
          entries_i.each_with_index do |entry, edl|
            entries << edls[edl][entry]
          end

          # Find the next entry - the one with the lowest timestamp
          next_edl = nil
          next_entry = nil
          entries.each_with_index do |entry, edl|
            next if next_entry && entry[:timestamp] >= next_entry[:timestamp]

            next_edl = edl
            next_entry = entry
          end

          # To calculate differences, need the previous entry from the same edl
          prev_entry = nil
          prev_entry = edls[next_edl][entries_i[next_edl] - 1] if entries_i[next_edl] > 0

          # Find new audios that were added
          add_audios = []
          if prev_entry
            next_entry[:audios].each do |audio|
              add_audios << audio unless prev_entry[:audios].find { |a| a[:filename] == audio[:filename] }
            end
          else
            add_audios = next_entry[:audios]
          end

          # Find audios that were removed
          del_audios = []
          if prev_entry
            prev_entry[:audios].each do |audio|
              del_audios << audio unless next_entry[:audios].find { |a| a[:filename] == audio[:filename] }
            end
          end

          # Determine whether to create a new entry or edit the previous one
          merged_entry = last_entry = merged_edl.last
          unless last_entry[:timestamp] == next_entry[:timestamp]
            # Need to create a new entry
            offset = next_entry[:timestamp] - last_entry[:timestamp]
            merged_entry = {
              timestamp: next_entry[:timestamp],
              # Copy audios from the last entry into the new entry, updating timestamps
              audios: last_entry[:audios].map do |audio|
                audio.merge(timestamp: audio[:timestamp] + offset)
              end,
            }
            merged_edl << merged_entry
          end

          # Remove deleted audios
          del_audios.each do |audio|
            merged_entry[:audios].reject! { |a| a[:filename] == audio[:filename] }
          end
          # Add new audios
          merged_entry[:audios].concat(add_audios)

          # Pull in timestamps from the next entry to respect edit cuts
          next_entry[:audios].each do |audio|
            merged_audio = merged_entry[:audios].find { |a| a[:filename] == audio[:filename] }
            merged_audio[:timestamp] = audio[:timestamp] unless merged_audio.nil?
          end

          entries_i[next_edl] += 1
          done[next_edl] = true if entries_i[next_edl] >= edls[next_edl].length
        end

        merged_edl
      end

      # Edit the EDL to make sure that every cut has a minimum length
      def self.enforce_cut_lengths(edl)
        # Special case handling for the start
        # If there's a cut immediately after the start, the later logic would delete the first cut,
        # which would result in desync. Any cuts within MIN_CUT_LENGTH of the start have to be
        # pushed back to avoid this situation. If multiple cuts are pushed back (they'd all get set
        #  to the same timestamp), the later logic will clean them up.
        1.upto(edl.length - 1).each do |i|
          # We've made it past the problematic point near the start of the recording
          break if edl[i][:timestamp] >= MIN_CUT_LENGTH

          BigBlueButton.logger.debug("Pushing EDL entry index #{i} from #{edl[i][:timestamp]} to #{MIN_CUT_LENGTH}")
          offset = MIN_CUT_LENGTH - edl[i][:timestamp]
          # Move the cut to start at MIN_CUT_LENGTH
          edl[i][:timestamp] = MIN_CUT_LENGTH
          # And offset the start times of every audio track to compensate
          edl[i][:audios]&.each do |audio_data|
            audio_data[:timestamp] += offset
          end
        end

        # Iterate through the edl entries from end to just after the start
        (edl.length - 1).downto(1).each do |i|
          duration = edl[i][:timestamp] - edl[i - 1][:timestamp]
          # If the cut that *ends* at EDL entry i is less than the minimum cut length
          next unless duration < MIN_CUT_LENGTH

          # Then delete edl entry i - 1 from the list
          BigBlueButton.logger.debug("Dropping EDL entry index #{i - 1} (#{duration} < #{MIN_CUT_LENGTH})")
          edl.delete_at(i - 1)
          # On the next iteration through the loop, we'll be re-checking from the same end point, but a new start
        end

        # What if all of the cuts got deleted?
        if edl.length == 1
          BigBlueButton.logger.debug('EDL contains no cuts - enforcing minimum length')
          # Add a new end point at the minimum cut length
          edl << { timestamp: MIN_CUT_LENGTH, audios: [] }
        end

        nil
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

        BigBlueButton.logger.info 'Pre-processing EDL'

        # Build a list of audio files to read information from
        edl.each do |entry|
          entry[:audios]&.each do |a|
            audioinfo[a[:filename]] ||= {}
            audioinfo[a[:filename]][:original_duration] = a[:original_duration] if a.include?(:original_duration)
          end
        end
      
        # Read audio metadata
        BigBlueButton.logger.info "Reading source audio information"
        audioinfo.each_key do |audiofile|
          BigBlueButton.logger.debug "  #{audiofile}"
          info = audio_info(audiofile)
          if !info[:audio] || !info[:duration]
            BigBlueButton.logger.warn('    This audio file is corrupt! It will be removed from the output.')
            corrupt_audios << audiofile
            next
          end

          BigBlueButton.logger.debug("    format: #{info[:format][:format_name]}, codec: #{info[:audio][:codec_name]}")
          BigBlueButton.logger.debug("    sample rate: #{info[:sample_rate]}, duration: #{info[:duration]}")
          audioinfo[audiofile].merge!(info)
        end

        if corrupt_audios.any?
          BigBlueButton.logger.info "Removing corrupt audio files from EDL"
          edl.each do |event|
            event[:audios]&.reject! { |a| corrupt_audios.include?(a[:filename]) }
          end
          corrupt_audios.each { |f| audioinfo.delete(f) }
        end

        process_dir = File.dirname(output_basename)
        BigBlueButton.logger.info("Removing audio PTS gaps from EDL")
        remove_audio_gaps(edl, audioinfo, process_dir)
        BigBlueButton.logger.info("Adjusting EDL to enforce minimum cut durations")
        enforce_cut_lengths(edl)

        dump(edl)

        # The `process_segment` method uses this to calculate cut lengths
        (0...(edl.length - 1)).each do |i|
          edl[i][:next_timestamp] = edl[i + 1][:timestamp]
        end

        segment_files = []

        # Build one chain per segment
        (0...(edl.length - 1)).each do |i|
          entry = edl[i]
          segment_output = process_segment(entry, output_basename, i+1, edl.length-1, audioinfo)
          segment_files << segment_output
        end
      
        # Merge all segments into the final output file
        BigBlueButton.logger.info "Merging #{segment_files.size} segments..."
        concat_list_file = "#{output_basename}_concat_list.txt"
        File.open(concat_list_file, 'w') do |f|
          f.write("ffconcat version 1.0\n")
          segment_files.each do |segment|
            f.write("file #{segment[:file]}\n")
          end
        end

        # The option -safe 0 is required because the concat list file contains absolute paths
        merge_cmd = [
          *FFMPEG, '-f', 'concat', '-safe', '0', '-i', concat_list_file,
          '-af', "#{FFMPEG_ARESAMPLE},#{FFMPEG_AFORMAT}",
        ]
        output = "#{output_basename}.#{WF_EXT}"
        merge_cmd += ['-vn', *FFMPEG_WF_ARGS, output]
        BigBlueButton.logger.info "Running merge command..."
        exitstatus = BigBlueButton.exec_ret(*merge_cmd)
        raise "ffmpeg merge failed, exit code #{exitstatus}" if exitstatus != 0

        output
      end

      # The methods below should be considered private

      def self.process_segment(entry, output_basename, i, total_segments, audioinfo)
        BigBlueButton.logger.info "Processing segment #{i} of #{total_segments} (duration: #{entry[:next_timestamp] - entry[:timestamp]} ms, num_audios: #{entry[:audios]&.length || 0})"
        ffmpeg_cmd = [*FFMPEG]
        filter_lines = []
        track_labels = []
        input_index = 0

        if entry[:audios] && !entry[:audios].empty?
          entry[:audios].each_with_index do |audio_data, idx|
            filename = audio_data[:filename]
            seek     = audio_data[:timestamp]
            info     = audioinfo[filename]
            speed    = 1.0

            # Check for and handle audio files with mismatched lengths (generated
            # by buggy versions of freeswitch in old BigBlueButton
            if ((info[:format][:format_name] == 'wav' ||
                 info[:audio][:codec_name] == 'vorbis') &&
                 info[:original_duration] &&
                 (info[:duration].to_f / info[:original_duration]) < 0.997 &&
                 (((info[:original_duration] - info[:duration]).to_f) / info[:original_duration]).abs < 0.05)
              speed = info[:duration].to_f / info[:original_duration]
              seek = 0
              BigBlueButton.logger.warn "  Audio file length mismatch in #{filename}, adjusting speed to #{speed}"
            end

            # Skip this input and generate silence if the seekpoint is past the end of the audio, which can happen
            # if events are slightly misaligned and you get unlucky with a start/stop or chapter break.
            if seek < (info[:duration].to_f * speed)
              # For each audio, add a -ss and -i for its input
              # Use -noaccurate_seek to read frames before seek point (will be trimmed by resampler)
              ffmpeg_cmd += ['-noaccurate_seek', '-ss', ms_to_s(seek)]
              # Ensure that the entire contents of freeswitch wav files are read
              if info[:format][:format_name] == 'wav'
                ffmpeg_cmd += ['-ignore_length', '1']
              end
              # Prefer using the libopus decoder for opus files, it handles discontinuities better
              if info[:audio][:codec_name] == 'opus'
                ffmpeg_cmd += ['-c:a', 'libopus']
              end
              ffmpeg_cmd += ['-i', filename]

              # Build track label
              track_label = "t#{i}_#{idx}"
              line = "[#{input_index}]"
              line << "atempo=#{speed},atrim=start=#{ms_to_s(audio_data[:timestamp])}," if speed != 1.0
              # Ensure the aresample filter doesn't see the next audio packet after a long pts gap
              line << "atrim=end=#{ms_to_s(entry[:next_timestamp] - entry[:timestamp])},"
              line << "#{FFMPEG_ARESAMPLE},#{FFMPEG_AFORMAT},apad"
              line << "[#{track_label}];"
              filter_lines << line
              track_labels << "[#{track_label}]"
              input_index += 1
            else
              # If we're seeking past the file end => silence
              track_label = "t#{i}_silence#{idx}"
              line = "#{FFMPEG_AEVALSRC},#{FFMPEG_AFORMAT}[#{track_label}];"
              filter_lines << line
              track_labels << "[#{track_label}]"
            end
          end

          if track_labels.size > 1
            # Mix multiple tracks
            line = track_labels.join
            line << "amix=inputs=#{track_labels.size}:normalize=0,"
            filter_lines << line
          else
            # Single track: simply rename via anull
            line = "#{track_labels.first}anull,"
            filter_lines << line
          end
        else
          BigBlueButton.logger.info "  Generating silence"
          filter_lines << "#{FFMPEG_AEVALSRC},#{FFMPEG_AFORMAT},"
        end

        # Now trim this segment to seg_duration
        filter_lines << "atrim=end=#{ms_to_s(entry[:next_timestamp] - entry[:timestamp])}"

        # Write filter_complex script to a temporary file for this segment
        filter_script = "#{output_basename}_seg#{i}.filter"
        File.open(filter_script, 'w') { |f| f.write(filter_lines.join("\n")) }
        ffmpeg_cmd += ['-filter_complex_script', filter_script]

        BigBlueButton.logger.debug("ffmpeg filter_complex_script for segment #{i}: ")
        BigBlueButton.logger.debug(filter_lines.join("\n"))
      
        segment = "#{output_basename}_seg#{i}.#{WF_EXT}"
        ffmpeg_cmd += ['-vn', *FFMPEG_WF_ARGS, segment]
      
        BigBlueButton.logger.info "Running ffmpeg for segment #{i} of #{total_segments}..."
        exitstatus = BigBlueButton.exec_ret(*ffmpeg_cmd)
        raise "ffmpeg failed for segment #{i}, exit code #{exitstatus}" if exitstatus != 0

        segment_output = { 
          file: segment, 
          duration: entry[:next_timestamp] - entry[:timestamp], 
        } 
        segment_output
      end

      # Check audio files for large gaps in timestamps
      #
      # When there's a large timestamp gap, the ffmpeg `aresample` filter generates silent audio to
      # fill the gap, but it enqueues the full length of the gap into the filter chain all at once,
      # which uses a lot of memory. To work around this issue, detect long gaps in the audio files
      # and remove the audio file from the mix for the duration of the gap.
      def self.remove_audio_gaps(edl, audioinfo, process_dir)
        audio_gaps = audioinfo.each_with_object({}) do |(filename, info), gaps|
          duration = info.fetch(:original_duration, info[:duration])
          gaps[filename] = BigBlueButton::EDL::MediaUtils.pts_gaps(process_dir, filename, :audio, duration)
        end

        BigBlueButton::EDL::MediaUtils.remove_pts_gaps_from_edl(
          edl,
          audio_gaps,
          stream_type: :audio
        )
      end

      def self.split_edl_at(edl, entry_i, rec_time)
        BigBlueButton::EDL::MediaUtils.split_edl_entry(
          edl,
          entry_i,
          rec_time,
          BigBlueButton::Events.edl_entry_offset_audio
        )
      end

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

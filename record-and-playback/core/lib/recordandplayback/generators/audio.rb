# Set encoding to utf-8
# encoding: UTF-8

#
# BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
#
# Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
#
# This program is free software; you can redistribute it and/or modify it under the
# terms of the GNU Lesser General Public License as published by the Free Software
# Foundation; either version 3.0 of the License, or (at your option) any later
# version.
#
# BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
# PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License along
# with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
#


require 'fileutils'
require 'rubygems'
require 'nokogiri'
require 'builder'

module BigBlueButton
  class AudioEvents
    # Generate a silent wav file.
    # 
    #   millis - length of silence in millis
    #   filename - name of the resulting file (absolute location)
    #   sampling_rate = rate of the audio 
    def self.generate_silence(millis, filename, sampling_rate)
      rate_in_ms = sampling_rate / 1000
      samples = millis * rate_in_ms
      temp_file = filename + ".dat"
      f = File.open(temp_file, "wb")
      # Write the sample rate for this audio file.
      f.puts('; SampleRate ' + sampling_rate.to_s + '\n')
      # Create the samples. We will have mono, so we use zeros (0) on the other channel
      1.upto(samples) do |sample|
        f.puts((sample / rate_in_ms).to_s + "\t0\n")
      end
      
      f.close();
      BigBlueButton.logger.info("Task: Generating silence. Filename: #{filename} with duration #{millis} milliseconds")
      command = "sox #{temp_file} -b 16 -r #{sampling_rate} -c 1 -s #{filename}"
      BigBlueButton.execute(command)
      # Delete the temporary raw audio file
      FileUtils.rm(temp_file)
    end
    
    # Contatenates several wav files
    #
    #   files - an array of wav files to concatenate
    #   outfile - resulting wav file
    def self.concatenate_audio_files(files, outfile)
      file_list = files.join(' ')
      command = "sox #{file_list} #{outfile}"
      BigBlueButton.logger.info("Task: Concatenating audio files")
      BigBlueButton.execute(command)  
    end
    
    # Convert a wav file to an ogg file
    #
    #   wav_file - file to convert
    #   ogg_file - resulting ogg file
    def self.wav_to_ogg(wav_file, ogg_file)  
      command = "oggenc -Q -o #{ogg_file} #{wav_file} 2>&1"
      BigBlueButton.logger.info("Converting .wav to .ogg")
      BigBlueButton.execute(command)
    end    
    
    # Extracts the length of the audio file as reurned by running
    #   "sox <file> -n stat"
    # returns the lenght in millis if successful or -1 if it failed
    #
    def self.determine_length_of_audio_from_file(file)
      audio_length = 0
      stats = ""
      # If everything goes well, output should be in the following format. We need to get the Length (seconds) value
        #    Samples read:            888960
        #    Length (seconds):     55.560000
        #    Scaled by:         2147483647.0
        #    Maximum amplitude:     0.822937
        #    Minimum amplitude:    -0.707764
        #    Midline amplitude:     0.057587
        #    Mean    norm:          0.026014
        #    Mean    amplitude:    -0.000059
        #    RMS     amplitude:     0.040610
        #    Maximum delta:         0.330719
        #    Minimum delta:         0.000000
        #    Mean    delta:         0.003805
        #    RMS     delta:         0.008049
        #    Rough   frequency:          504
        #    Volume adjustment:        1.215
      command = "sox #{file} -n stat 2>&1"
      # Try "sox --i -D file" as it is much shorter
      BigBlueButton.logger.info("Task: Getting length of audio")
      output = BigBlueButton.execute(command).output
      if output.to_s =~ /Length(.+)/
        stats = $1
      end

      # Extract  55.560000 from "Length (seconds):     55.560000"
      match = /\d+\.\d+/.match(stats)
      if match
      # Convert to milliseconds
        audio_length = (match[0].to_f * 1000).to_i
        BigBlueButton.logger.info("Determined audio length from stats using sox [#{audio_length}]")
      end
      if (audio_length == 0)
         # Could not deternime the length from information on the file.
         # Try calculating the length from the size of the file.
         # For WAV files, there will be 32000 bps ot 32bpms
         len_from_file = File.size?(file)/32
         # We've got a corrupted header information (http://comments.gmane.org/gmane.comp.audio.sox/2637)
         # Now we need to repair the file otherwise all operations involving sox will fail as the length
         # will be zero.
         temp_wav_file = "#{file}.temp.wav"
         command = "sox --ignore-length #{file} #{temp_wav_file} trim 0 #{len_from_file}"
         BigBlueButton.logger.info("Task: Fixing length of audio")
         BigBlueButton.execute(command)
         File.delete(file)
         File.rename(temp_wav_file, file)
         audio_length = (len_from_file).to_i
        BigBlueButton.logger.info("Determined audio length from file size [#{audio_length}]")
      end
        BigBlueButton.logger.info("Determined audio length is [#{audio_length}]")
      return audio_length
    end
   
    def self.to_xml_file(events, file)
      BigBlueButton.logger.info("Task: Converting events to xml file")
      xml = Builder::XmlMarkup.new( :indent => 2 )
      result = xml.instruct! :xml, :version => "1.0"
      
      events.each do |event|
        xml.event(:start_event_timestamp => event.start_event_timestamp, :start_record_timestamp => event.start_record_timestamp,
                  :stop_event_timestamp => event.stop_event_timestamp, :stop_record_timestamp => event.stop_record_timestamp,
                  :file => event.file, :file_exist => event.file_exist, :bridge => event.bridge,
                  :matched => event.matched, :audio_length => event.audio_length, :padding => event.padding)
      end
      
      puts xml.target!      
    end
    
    # Process the audio events for this recording
    def self.process_events(archive_dir, events_xml)
      BigBlueButton.logger.info("Task: Processing events")
      audio_events = match_start_and_stop_events(start_audio_recording_events(archive_dir, events_xml),
                          stop_audio_recording_events(archive_dir, events_xml)).each do |audio_event|
        if not audio_event.matched
            determine_start_stop_timestamps_for_unmatched_event!(audio_event)
        end
      end

      if audio_events.length > 0
        audio_events.sort! {|a,b| a.start_event_timestamp <=> b.start_event_timestamp}

        unique_events = []
        audio_events.each do |x|
          if (unique_events.empty?)
            unique_events << x
          elsif (not x.eql?(unique_events[-1]))
            unique_events << x
          end
        end

        audio_paddings = generate_audio_paddings(unique_events, events_xml)
        unique_events.concat(audio_paddings)
        return unique_events.sort! {|a,b| a.start_event_timestamp.to_i <=> b.start_event_timestamp.to_i}
      else
        first_event = BigBlueButton::Events.first_event_timestamp(events_xml).to_i
        last_event = BigBlueButton::Events.last_event_timestamp(events_xml).to_i
        return [create_gap_audio_event(last_event - first_event + 1, last_event, first_event)]
      end
    end

    def self.create_audio_edl(archive_dir)
      audio_edl = []
      audio_dir = "#{archive_dir}/audio"
      events = Nokogiri::XML(File.open("#{archive_dir}/events.xml"))

      event = events.at_xpath('/recording/event[position()=1]')
      initial_timestamp = event['timestamp'].to_i
      event = events.at_xpath('/recording/event[position()=last()]')
      final_timestamp = event['timestamp'].to_i

      # Initially start with silence
      audio_edl << {
        :timestamp => 0,
        :audio => nil
      }

      # Add events for recording start/stop
      events.xpath('/recording/event[@module="VOICE"]').each do |event|
        timestamp = event['timestamp'].to_i - initial_timestamp
        case event['eventname']
        when 'StartRecordingEvent'
          filename = event.at_xpath('filename').text
          filename = "#{audio_dir}/#{File.basename(filename)}"
          audio_edl << {
            :timestamp => timestamp,
            :audio => { :filename => filename, :timestamp => 0 }
          }
        when 'StopRecordingEvent'
          filename = event.at_xpath('filename').text
          filename = "#{audio_dir}/#{File.basename(filename)}"
          if audio_edl.last[:audio] && audio_edl.last[:audio][:filename] == filename
            audio_edl << {
              :timestamp => timestamp,
              :audio => nil
            }
          end
        end
      end

      audio_edl << {
        :timestamp => final_timestamp - initial_timestamp,
        :audio => nil
      }

      return audio_edl
    end



        
    TIMESTAMP = 'timestamp'
    BRIDGE = 'bridge'
    FILE = 'filename'
    RECORD_TIMESTAMP = 'recordingTimestamp'
    
    # Get the start audio recording events.
    def self.start_audio_recording_events(archive_dir, events_xml)
      BigBlueButton.logger.info("Task: Getting start audio recording events")
      start_events = []
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("//event[@eventname='StartRecordingEvent']").each do |start_event|
        ae = AudioRecordingEvent.new
        ae.start_event_timestamp = start_event[TIMESTAMP]
        ae.bridge = start_event.xpath(BRIDGE).text
        ae.file = start_event.xpath(FILE).text.sub(/.+\//, "#{archive_dir}/")
        ae.start_record_timestamp = start_event.xpath(RECORD_TIMESTAMP).text
        start_events << ae
      end
      start_events.uniq!
      return start_events.sort {|a,b| a.start_event_timestamp <=> b.start_event_timestamp}
    end
    
    # Get the stop audio recording events.
    def self.stop_audio_recording_events(archive_dir, events_xml)      
      BigBlueButton.logger.info("Task: Getting stop audio recording events")
      stop_events = []
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("//event[@eventname='StopRecordingEvent']").each do |stop_event|
        ae = AudioRecordingEvent.new
        ae.stop_event_timestamp = stop_event[TIMESTAMP]
        ae.bridge = stop_event.xpath(BRIDGE).text
        ae.file = stop_event.xpath(FILE).text.sub(/.+\//, "#{archive_dir}/")
        ae.stop_record_timestamp = stop_event.xpath(RECORD_TIMESTAMP).text
        stop_events << ae
      end
      return stop_events.sort {|a,b| a.stop_event_timestamp <=> b.stop_event_timestamp}
    end
    
    # Determine if the start and stop event matched.
    def self.event_matched?(start_events, stop_event)      
      BigBlueButton.logger.info("Task: Events matched?")
      start_events.each do |start_event|
        if (start_event.file == stop_event.file)
          start_event.matched = true
          start_event.stop_event_timestamp = stop_event.stop_event_timestamp
          start_event.stop_record_timestamp = stop_event.stop_record_timestamp
          return true
        end      
      end
      return false
    end
    
    # Match the start and stop events.
    def self.match_start_and_stop_events(start_events, stop_events)
      BigBlueButton.logger.info("Task: Matching start and stop events")
      combined_events = []
      stop_events.each do |stop|
        if not event_matched?(start_events, stop) 
          combined_events << stop
        end
      end      
      return combined_events.concat( start_events )
    end
    
    # Determine the corresponding start or stop event if it doesn't
    # have an entry in events.xml
    def self.determine_start_stop_timestamps_for_unmatched_event!(event)
      BigBlueButton.logger.info("Task: Determine start and stop timestamps for unmatched event")
      event.file_exist = determine_if_recording_file_exist(event)
      if ((not event.matched) and event.file_exist)
        event.audio_length = determine_length_of_audio_from_file(event.file)
        if (event.audio_length > 0)
          if (event.start_event_timestamp == nil) 
            event.start_record_timestamp = event.start_event_timestamp = event.stop_event_timestamp.to_i - event.audio_length
          elsif (event.stop_event_timestamp == nil)
            event.stop_record_timestamp = event.stop_event_timestamp = event.start_event_timestamp.to_i + event.audio_length
          end
        else 
          BigBlueButton.logger.error("Failed to determine the length of the audio.\n")
          raise Exception,  "Failed to determine the length of the audio."
        end
      end
    end
    
    def self.create_gap_audio_event(length_of_gap, start_timestamp, stop_timestamp)
      BigBlueButton.logger.info("Task: Creating audio gap event")
      ae = AudioRecordingEvent.new
      ae.start_event_timestamp = ae.start_record_timestamp = start_timestamp
      ae.padding = true
      ae.length_of_gap = length_of_gap
      ae.stop_record_timestamp = ae.stop_event_timestamp = stop_timestamp
      
      return ae
    end
    
    # Trim audio file
    def self.trim_audio_file(file, length)
      audio_length = determine_length_of_audio_from_file(file)
      if (audio_length == 0)
        BigBlueButton.logger.error("Can't trim #{file} as it's length is zero\n")
        return
      else
        temp_wav_file = "#{file}.temp.wav"
        command = "sox #{file} #{temp_wav_file} trim 0 #{audio_length - length}"
        BigBlueButton.logger.info("Task: Trimming audio")
        BigBlueButton.execute(command)
        File.delete(file)
        File.rename(temp_wav_file, file)
      end
    end
    
    # Determine the audio padding we need to generate.
    def self.generate_audio_paddings(events, events_xml)
      BigBlueButton.logger.info("Task: Generating audio paddings")
      # TODO: Need to make this a lot DRYer.
      paddings = []
      events.sort! {|a,b| a.start_event_timestamp <=> b.start_event_timestamp}
      
      length_of_gap = events[0].start_event_timestamp.to_i - BigBlueButton::Events.first_event_timestamp(events_xml).to_i
      # Check if the silence is greater that 10 minutes long. If it is, assume something went wrong with the
      # recording. This prevents us from generating a veeeerrryyy looonnngggg silence maxing disk space.
      if (length_of_gap < 3600000)
        if (length_of_gap < 0)
            trim_audio_file(events[0].file, length_of_gap.abs)
        else
          paddings << create_gap_audio_event(length_of_gap, BigBlueButton::Events.first_event_timestamp(events_xml), events[0].start_event_timestamp.to_i - 1)
        end
      else
        BigBlueButton.logger.error("Front padding: #{length_of_gap} [#{events[0].start_event_timestamp.to_i} - #{BigBlueButton::Events.first_event_timestamp(events_xml).to_i}].\n")
        raise Exception,  "Length of silence is too long #{length_of_gap}."
      end

      i = 0
      while i < events.length - 1
        ar_prev = events[i]
        ar_next = events[i+1]
        if (not ar_prev.eql?(ar_next))
          length_of_gap = ar_next.start_event_timestamp.to_i - ar_prev.stop_event_timestamp.to_i

          # Check if the silence is greater than 1 hour long. If it is, assume something went wrong with the
          # recording. This prevents us from generating a veeeerrryyy looonnngggg silence maxing disk space.
          if (length_of_gap < 3600000)
            if (length_of_gap < 0)
              trim_audio_file(ar_prev.file, length_of_gap.abs)
            else
              paddings << create_gap_audio_event(length_of_gap, ar_prev.stop_event_timestamp.to_i + 1, ar_next.start_event_timestamp.to_i - 1)
            end
          else
            BigBlueButton.logger.error("Between padding #{i}: #{length_of_gap} [#{ar_next.start_event_timestamp.to_i} - #{ar_prev.stop_event_timestamp.to_i}].\n")
            raise Exception,  "Length of silence is too long #{length_of_gap}."
          end
        end
        i += 1
      end

      length_of_gap =  BigBlueButton::Events.last_event_timestamp(events_xml).to_i - events[-1].stop_event_timestamp.to_i
      # Check if the silence is greater than 2 hours long. If it is, assume something went wrong with the
      # recording. This prevents us from generating a veeeerrryyy looonnngggg silence maxing disk space.
      if (length_of_gap < 7200000)
        if (length_of_gap < 0)
            trim_audio_file(events[-1].file, length_of_gap.abs)
        else
          paddings << create_gap_audio_event(length_of_gap, events[-1].stop_event_timestamp.to_i + 1, BigBlueButton::Events.last_event_timestamp(events_xml))
        end
      else
        BigBlueButton.logger.error("Tail padding: #{length_of_gap} [ #{BigBlueButton::Events.last_event_timestamp(events_xml).to_i} - #{events[-1].stop_event_timestamp.to_i} ].\n")
        raise Exception,  "Length of silence is too long #{length_of_gap}."
      end


      # Check if the silence is greater that 10 minutes long. If it is, assume something went wrong with the
      # recording. This prevents us from generating a veeeerrryyy looonnngggg silence maxing disk space.      
#
# DO NOT pad the end of the recording for now. Running issues when audio file is longer than the last event timestamp.
#      length_of_gap = BigBlueButton::Events.last_event_timestamp(events_xml).to_i - events[-1].stop_event_timestamp.to_i
#      if ((length_of_gap > 0) and (length_of_gap < 600000))
#        paddings << create_gap_audio_event(length_of_gap, events[-1].stop_event_timestamp.to_i + 1, BigBlueButton::Events.last_event_timestamp(events_xml))
#      else
#        BigBlueButton.logger.error("Length of silence is too long #{length_of_gap}.\n")
#        raise Exception,  "Length of silence is too long #{length_of_gap}."  
#      end
      
      paddings
    end
    
    # Determine if the audio file exists
    def self.determine_if_recording_file_exist(recording_event)
      BigBlueButton.logger.info("Task: Determining if recording file exist")
      if (recording_event.file == nil) 
          return false
      end
      File.exist?(recording_event.file)  
    end
  end
  
  class AudioRecordingEvent
    attr_accessor :start_event_timestamp    # The timestamp of the event
    attr_accessor :start_record_timestamp   # The timestamp of the recording as sent by Asterisk or FreeSWITCH
    attr_accessor :stop_event_timestamp     # The timestamp of the event
    attr_accessor :stop_record_timestamp    # The timestamp of the recording event as sent by Asterisk or FreeSWITCH
    attr_accessor :bridge       # The audio bridge for the recording
    attr_accessor :file         # The path to the audio file
    attr_accessor :file_exist   # True if the audio file has been confirmed to exist
    attr_accessor :matched      # True if the event has matching start/stop events
    attr_accessor :audio_length
    attr_accessor :padding, :length_of_gap # If this is padding and the length of it
     
    def to_s
      "[startEvent=#{start_event_timestamp}, startRecord=#{start_record_timestamp}, stopRecord=#{stop_record_timestamp}, stopEvent=#{stop_event_timestamp}, " +
      "brige=#{bridge}, file=#{file}, exist=#{file_exist}, padding=#{padding}]\n"
    end

    def eql?(other)
      (start_record_timestamp == other.start_record_timestamp) and
      (file == other.file) and
      (bridge == other.bridge)
    end
    
  end
end

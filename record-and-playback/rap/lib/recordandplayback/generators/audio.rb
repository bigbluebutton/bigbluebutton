require 'fileutils'
require 'rubygems'
require 'nokogiri'

module Generator
  class Audio
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
      proc = IO.popen("sox #{temp_file} -b 16 -r #{sampling_rate} -c 1 -s #{filename}", "w+")
      # Wait for the process to finish before removing the temp file
      Process.wait()
      # Delete the temporary raw audio file
      FileUtils.rm(temp_file)
    end
    
    # Contatenates several wav files
    #
    #   files - an array of wav files to concatenate
    #   outfile - resulting wav file
    def self.concatenate_audio_files(files, outfile)
      file_list = files.join(' ')
      proc = IO.popen("sox #{file_list} #{outfile}", "w+")
      # Wait for the process to finish
      Process.wait()    
    end
    
    # Convert a wav file to an ogg file
    #
    #   wav_file - file to convert
    #   ogg_file - resulting ogg file
    def self.wav_to_ogg(wav_file, ogg_file)    
      proc = IO.popen("oggenc -Q -o #{ogg_file} #{wav_file} 2>&1", "w+")
      Process.wait() 
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
      IO.popen("sox #{file} -n stat 2>&1", "w+") do |output|
        output.each do |line|
          stats = line if line =~ /Length(.+)/
        end
      end
      # Extract  55.560000 from "Length (seconds):     55.560000"
      match = /\d+\.\d+/.match(stats)
      if match
      # Convert to milliseconds
        audio_length = (match[0].to_f * 1000).to_i
      end
      audio_length
    end
  end
  
  class AudioEvents	
    def initialize(events)
      @doc = Nokogiri::XML(File.open(events))
    end
    
    def first_event_timestamp
      @doc.xpath("recording/event").first["timestamp"].to_s
    end
    
    def last_event_timestamp
      @doc.xpath("recording/event").last["timestamp"].to_s
    end
    
    def process_events
      audio_events = match_start_and_stop_events(start_audio_recording_events, stop_audio_recording_events).each do |audio_event|
        if not audio_event.matched 
            determine_start_stop_timestamps_for_unmatched_event!(audio_event)
        end
      end
      audio_paddings = generate_audio_paddings(audio_events)
      audio_events.concat(audio_paddings)
      return audio_events.sort! {|a,b| a.start_event_timestamp.to_i <=> b.start_event_timestamp.to_i}
    end
    
    def recording_events 
        create_recording_event(start_audio_recording_events)
        match_start_and_stop_events(stop_audio_recording_events)
        audio_events.each do |ae|
          determine_if_recording_file_exist(ae)
        end
        return audio_events
    end
    
    TIMESTAMP = 'timestamp'
    BRIDGE = 'bridge'
    FILE = 'filename'
    RECORD_TIMESTAMP = 'recordingTimestamp'
    
    def start_audio_recording_events
      start_events = []
      @doc.xpath("//event[@name='StartRecordingEvent']").each do |start_event|
        ae = AudioRecordingEvent.new
        ae.start_event_timestamp = start_event[TIMESTAMP]
        ae.bridge = start_event.xpath(BRIDGE).text
        ae.file = start_event.xpath(FILE).text
        ae.start_record_timestamp = start_event.xpath(RECORD_TIMESTAMP).text
        start_events << ae
      end
      return start_events.sort {|a,b| a.start_event_timestamp <=> b.start_event_timestamp}
    end
    
    def stop_audio_recording_events
      stop_events = []
      @doc.xpath("//event[@name='StopRecordingEvent']").each do |stop_event|
        ae = AudioRecordingEvent.new
        ae.stop_event_timestamp = stop_event[TIMESTAMP]
        ae.bridge = stop_event.xpath(BRIDGE).text
        ae.file = stop_event.xpath(FILE).text
        ae.stop_record_timestamp = stop_event.xpath(RECORD_TIMESTAMP).text
        stop_events << ae
      end
      return stop_events.sort {|a,b| a.stop_event_timestamp <=> b.stop_event_timestamp}
    end
    
    def event_matched?(start_events, stop_event)      
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
    
    def match_start_and_stop_events(start_events, stop_events)
      combined_events = []
      stop_events.each do |stop|
        if not event_matched?(start_events, stop) 
          combined_events << stop
        end
      end      
      return combined_events.concat( start_events )
    end
     
    def determine_start_stop_timestamps_for_unmatched_event!(event)
      event.file_exist = determine_if_recording_file_exist(event)
      if ((not event.matched) and event.file_exist)
        event.audio_length = Generator::Audio.determine_length_of_audio_from_file(event.file)
        if (event.audio_length > 0)
          if (event.start_event_timestamp == nil) 
            event.start_record_timestamp = event.start_event_timestamp = event.stop_event_timestamp.to_i - event.audio_length
          elsif (event.stop_event_timestamp == nil)
            event.stop_record_timestamp = event.stop_event_timestamp = event.start_event_timestamp.to_i + event.audio_length
          end
        end
      end
    end
    
    def generate_audio_paddings(events)
      paddings = []
      events.sort! {|a,b| a.start_event_timestamp <=> b.start_event_timestamp}
      if first_event_timestamp.to_i < events[0].start_event_timestamp.to_i
        ae = AudioRecordingEvent.new
        ae.start_event_timestamp = ae.start_record_timestamp = first_event_timestamp
        ae.padding = true
        ae.stop_record_timestamp = ae.stop_event_timestamp = events[0].start_event_timestamp.to_i - 1
        paddings << ae
      end
      
      i = 0
      while i < events.length - 1
        ar_prev = events[i]
        ar_next = events[i+1]
        length_of_gap = ar_next.start_event_timestamp.to_i - ar_prev.stop_event_timestamp.to_i
        
        if (length_of_gap > 0):   
          ae = AudioRecordingEvent.new
          ae.start_event_timestamp = ae.start_record_timestamp = ar_prev.stop_event_timestamp.to_i + 1
          ae.padding = true
          ae.stop_record_timestamp = ae.stop_event_timestamp = ar_next.start_event_timestamp.to_i - 1
          paddings << ae
        end
        
        i += 1
      end
        
      if last_event_timestamp.to_i > events[-1].stop_event_timestamp.to_i
        ae = AudioRecordingEvent.new
        ae.start_event_timestamp = ae.start_record_timestamp = events[-1].stop_event_timestamp.to_i + 1
        ae.padding = true
        ae.stop_record_timestamp = ae.stop_event_timestamp = last_event_timestamp
        paddings << ae
      end
      
      paddings
    end
    
    def determine_if_recording_file_exist(recording_event)
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
    attr_accessor :padding
     
    def to_s
      "startEvent=#{start_event_timestamp}, startRecord=#{start_record_timestamp}, \n" +
      "stopRecord=#{stop_record_timestamp}, stopEvent=#{stop_event_timestamp}, \n" +
      "brige=#{bridge}, file=#{file}, exist=#{file_exist}\n"
    end
    
  end
end
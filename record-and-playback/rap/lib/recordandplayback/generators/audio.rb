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
      proc = IO.popen("oggenc -Q -o #{ogg_file} #{wav_file}", "w+")
      Process.wait() 
    end    
    
    # Extracts the length of the audio file as reurned by running
    #   "sox <file> -n stat"
    # returns the lenght in millis if successful or -1 if it failed
    #
    def self.determine_length_of_audio_from_file(file)
      audio_length = -1
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
    attr_reader :audio_events
    
    def initialize(events)
      @audio_events = []
      @doc = Nokogiri::XML(File.open(events))
    end
    
    def first_event_timestamp
      @doc.xpath("events/event").first["timestamp"].to_s
    end
    
    def last_event_timestamp
      @doc.xpath("events/event").last["timestamp"].to_s
    end
    
    def recording_events 
        create_recording_event(start_audio_recording_events)
        match_start_and_stop_events(stop_audio_recording_events)
        audio_events.each do |ae|
          determine_if_recording_file_exist(ae)
        end
        return audio_events
    end
    
    def start_audio_recording_events
      start_events = []
      @doc.xpath("//event[@name='StartRecordingEvent']").each do |e|
        start_events << {:start_event_timestamp => e["timestamp"], :bridge => e.xpath("bridge").text, 
            :file => e.xpath("filename").text, :start_record_timestamp => e.xpath("recordingTimestamp").text}
      end
      return start_events.sort {|a,b| a[:start_event_timestamp] <=> b[:start_event_timestamp]}
    end
      
      def create_recording_event(start_events)
        start_events.each do |e|
          ae = AudioRecordingEvent.new
          ae.start_event_timestamp = e[:start_event_timestamp]
          ae.bridge = e[:bridge]
          ae.file = e[:file]
          ae.start_record_timestamp = e[:start_record_timestamp]
          audio_events << ae
        end
      end
      
      def stop_audio_recording_events
        stop_events = []
        @doc.xpath("//event[@name='StopRecordingEvent']").each do |e|
          stop_events << {:stop_event_timestamp => e["timestamp"], :bridge => e.xpath("bridge").text, 
                :file => e.xpath("filename").text, :stop_record_timestamp => e.xpath("recordingTimestamp").text} 
        end
        return stop_events.sort {|a,b| a[:stop_event_timestamp] <=> b[:stop_event_timestamp]}
      end
      
      def match_start_and_stop_events(stop_events)
        audio_events.each { |saev|
          stop_events.each { |soev|
            if (soev[:file] == saev.file) 
              saev.stop_event_timestamp = soev[:stop_event_timestamp]
              saev.stop_record_timestamp = soev[:stop_record_timestamp]
            end
          }
        }      
      end
      
      def determine_if_recording_file_exist(recording_event)
        if (recording_event.file == nil) 
          recording_event.file_exist = false
        else
         recording_event.file_exist = File.exist?(recording_event.file)  
        end
      end
  end
  
  class AudioRecordingEvent
    attr_accessor :start_event_timestamp, :start_record_timestamp, :stop_event_timestamp, :stop_record_timestamp
    attr_accessor :bridge, :file, :file_exist
    
    def file_exist?
      file_exist
    end
    
    def to_s
      "startEvent=#{start_event_timestamp}, startRecord=#{start_record_timestamp}, \n" +
      "stopRecord=#{stop_record_timestamp}, stopEvent=#{stop_event_timestamp}, \n" +
      "brige=#{bridge}, file=#{file}, exist=#{file_exist}\n"
    end
    
  end
end
require 'fileutils'

module Generator
  class Audio
    # Generate a silent wav file.
    # Params:
    #   millis - length of silence in millis
    #   filename - name of the resulting file (absolute location)
    #   sampling_rate = rate of the audio 
    def generate_silence(millis, filename, sampling_rate)
      rate_in_ms = sampling_rate / 1000
      samples = millis * rate_in_ms
      temp_file = filename + ".dat"
      f = File.open(temp_file, "wb")
      # Write the sample rate for this audio file.
      f.puts('; SampleRate ' + sampling_rate.to_s + '\n')
      
      1.upto(samples) do |sample|
        f.puts((sample / rate_in_ms).to_s + "\t0\n")
      end
      
      f.close();
      proc = IO.popen("sox #{temp_file} -b 16 -r 16000 -c 1 -s #{filename}", "w+")
      # Wait for the process to finish before removing the temp file
      Process.wait()
      # Delete the temporary raw audio file
      FileUtils.rm(temp_file)
    end
    
    def concatenate_audio_files(files, out_filename)
      concat_cmd = 'sox '
      files.each do |file|
        concat_cmd += " " + file
      end
      
      concat_cmd += " " + out_filename
      #puts concat_cmd
      
      proc = IO.popen(concat_cmd, "w+")
      # Wait for the process to finish
      Process.wait()    
    end
    
    def wav_to_ogg(wav_file, atts, ogg_file)
    
      proc = IO.popen("oggenc -o #{ogg_file} #{wav_file}", "w+")
      Process.wait() 
    end
    
  end
end
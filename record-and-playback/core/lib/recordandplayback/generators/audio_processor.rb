require 'fileutils'

module BigBlueButton
  class AudioProcessor
    # Process the raw recorded audio to ogg file.
    #   archive_dir - directory location of the raw archives. Assumes there is audio file and events.xml present.
    #   ogg_file - the file name of the ogg audio output
    #
    def self.process(archive_dir, ogg_file)
      audio_dir = "#{archive_dir}/audio"
      events_xml = "#{archive_dir}/events.xml"
      audio_events = BigBlueButton::AudioEvents.process_events(audio_dir, events_xml)
      audio_files = []
      audio_events.each do |ae|
        if ae.padding 
          ae.file = "#{audio_dir}/#{ae.length_of_gap}.wav"
          BigBlueButton::AudioEvents.generate_silence(ae.length_of_gap, ae.file, 16000)
        else
          # Substitute the original file location with the archive location
          ae.file = ae.file.sub(/.+\//, "#{audio_dir}/")
        end
        
        audio_files << ae.file
      end
      
      wav_file = "#{audio_dir}/recording.wav"
      BigBlueButton::AudioEvents.concatenate_audio_files(audio_files, wav_file)    
      BigBlueButton::AudioEvents.wav_to_ogg(wav_file, ogg_file)
    end
  end
end
require 'fileutils'

module BigBlueButton
  class AudioProcessor
    def self.process(archive_dir)
      audio_dir = "#{archive_dir}/audio"
      events_xml = "#{archive_dir}/events.xml"
      audio_events = Generator::AudioEvents.process_events(events_xml)
      audio_files = []
      audio_events.each do |ae|
        if ae.padding 
          ae.file = "#{audio_dir}/#{ae.length_of_gap}.wav"
          Generator::AudioEvents.generate_silence(ae.length_of_gap, ae.file, 16000)
        else
          # Substitute the original file location with the archive location
          ae.file = ae.file.sub(/.+\//, "#{audio_dir}/")
        end
        
        audio_files << ae.file
      end
      
      wav_file = "#{audio_dir}/recording.wav"
      ogg_file = "#{audio_dir}/recording.ogg"
      Generator::AudioEvents.concatenate_audio_files(audio_files, wav_file)    
      Generator::AudioEvents.wav_to_ogg(wav_file, ogg_file)
    end
  end
end
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
      first_no_silence = audio_events.select { |e| !e.padding }.first
      sampling_rate = first_no_silence.nil? ? 16000 :  FFMPEG::Movie.new(first_no_silence.file).audio_sample_rate
      audio_events.each do |ae|
        if ae.padding 
          ae.file = "#{audio_dir}/#{ae.length_of_gap}.wav"
          BigBlueButton::AudioEvents.generate_silence(ae.length_of_gap, ae.file, sampling_rate)
        else
          # Substitute the original file location with the archive location
          orig_file = ae.file.sub(/.+\//, "#{audio_dir}/")
          length = ae.stop_event_timestamp.to_i - ae.start_event_timestamp.to_i

          ae.file = BigBlueButton::AudioEvents.stretch_audio_file(orig_file, length, sampling_rate)
        end
        
        audio_files << ae.file
      end
      
      wav_file = "#{audio_dir}/recording.wav"
      BigBlueButton::AudioEvents.concatenate_audio_files(audio_files, wav_file)    
      BigBlueButton::AudioEvents.wav_to_ogg(wav_file, ogg_file)
    end
  end
end

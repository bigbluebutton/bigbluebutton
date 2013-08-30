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

require File.expand_path('../../edl', __FILE__)

module BigBlueButton
  class AudioProcessor
    # Process the raw recorded audio to ogg file.
    #   archive_dir - directory location of the raw archives. Assumes there is audio file and events.xml present.
    #   file_basename - the file name of the audio output. '.webm' will be added
    #
    def self.process(archive_dir, file_basename)
      audio_edl = BigBlueButton::AudioEvents.create_audio_edl(archive_dir)

      audio_dir = "#{archive_dir}/audio"
      events_xml = "#{archive_dir}/events.xml"

      wav_file = BigBlueButton::EDL::Audio.render(audio_edl, "#{audio_dir}/recording")

      ogg_format = {
        :extension => 'ogg',
        :parameters => [ [ '-c:a', 'libvorbis', '-b:a', '32K', '-f', 'ogg' ] ]
      }
      BigBlueButton::EDL.encode(wav_file, nil, ogg_format, file_basename)

      webm_format = {
        :extension => 'webm',
        :parameters => [ [ '-c:a', 'libvorbis', '-b:a', '32K', '-f', 'webm' ] ]
      }
      BigBlueButton::EDL.encode(wav_file, nil, webm_format, file_basename)
    end
  end
end

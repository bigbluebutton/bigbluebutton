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


require 'rubygems'

require File.expand_path('../../edl', __FILE__)

module BigBlueButton

  def BigBlueButton.process_multiple_videos(target_dir, temp_dir, meeting_id, output_width, output_height, audio_offset, include_deskshare=false)
    BigBlueButton.logger.info("Processing webcam videos")

    # Process audio
    audio_edl = BigBlueButton::AudioEvents.create_audio_edl(
      "#{temp_dir}/#{meeting_id}")
    BigBlueButton::EDL::Audio.dump(audio_edl)

    BigBlueButton.logger.info("Applying recording start stop events:")
    audio_edl = BigBlueButton::Events.edl_match_recording_marks_audio(audio_edl, "#{temp_dir}/#{meeting_id}")
    BigBlueButton::EDL::Audio.dump(audio_edl)

    audio_file = BigBlueButton::EDL::Audio.render(
      audio_edl, "#{target_dir}/webcams")

    # Process video
    webcam_edl = BigBlueButton::Events.create_webcam_edl(
      "#{temp_dir}/#{meeting_id}")
    deskshare_edl = BigBlueButton::Events.create_deskshare_edl(
      "#{temp_dir}/#{meeting_id}")
    video_edl = BigBlueButton::EDL::Video.merge(webcam_edl, deskshare_edl)
    BigBlueButton.logger.debug("Merged video EDL:")
    BigBlueButton::EDL::Video.dump(video_edl)

    BigBlueButton.logger.debug("Applying recording start stop events:")
    video_edl = BigBlueButton::Events.edl_match_recording_marks_video(video_edl,
                    "#{temp_dir}/#{meeting_id}")
    BigBlueButton::EDL::Video.dump(video_edl)

    layout = {
      :width => output_width, :height => output_height,
      :areas => [ { :name => :webcam, :x => 0, :y => 0,
        :width => output_width, :height => output_height } ]
    }
    if include_deskshare
      layout[:areas] += [ { :name => :deskshare, :x => 0, :y => 0,
        :width => output_width, :height => output_height, :pad => true } ]
    end
    video_file = BigBlueButton::EDL::Video.render(
      video_edl, layout, "#{target_dir}/webcams")

    formats = [
      {
        :extension => 'webm',
        :parameters => [
          [ '-c:v', 'libvpx',
            '-crf', '34', '-b:v', '60M', '-threads', '2', '-deadline', 'good', '-cpu-used', '3',
            '-c:a', 'libvorbis',
            '-q:a', '2',
            '-f', 'webm' ]
        ],
        :postprocess => [
          [ 'mkclean', '--quiet', ':input', ':output' ]
        ]
      }
    ]
    formats.each do |format|
      filename = BigBlueButton::EDL::encode(
        audio_file, video_file, format, "#{target_dir}/webcams", audio_offset)
    end
  end

end



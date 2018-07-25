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


  def BigBlueButton.process_webcam_videos(target_dir, temp_dir, meeting_id, output_width, output_height, audio_offset, processed_audio_file, video_formats=['webm'])
    BigBlueButton.logger.info("Processing webcam videos")

    # Process user video (camera)
    webcam_edl = BigBlueButton::Events.create_webcam_edl(
      "#{temp_dir}/#{meeting_id}")
    user_video_edl = BigBlueButton::Events.edl_match_recording_marks_video(webcam_edl, "#{temp_dir}/#{meeting_id}")
    BigBlueButton::EDL::Video.dump(user_video_edl)

    user_video_layout = {
      :width => output_width, :height => output_height,
      :areas => [ { :name => :webcam, :x => 0, :y => 0,
        :width => output_width, :height => output_height } ]
    }
    user_video_file = BigBlueButton::EDL::Video.render(
      user_video_edl, user_video_layout, "#{target_dir}/webcams")

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
      },
      {
        :extension => 'mp4',
        :parameters => [
          [ '-c:v', 'libx264', '-crf', '23', '-b:v', '60M',
            '-threads', '2', '-preset', 'medium', '-cpu-used', '3',
            '-c:a', 'libmp3lame', '-b:a', '48K',
            '-f', 'mp4' ]
        ]
      }
    ]
    formats.reject!{ |format| ! video_formats.include? format[:extension] }
    formats.each do |format|
      filename = BigBlueButton::EDL::encode(
        processed_audio_file, user_video_file, format, "#{target_dir}/webcams", audio_offset)
    end
  end

  def BigBlueButton.process_deskshare_videos(target_dir, temp_dir, meeting_id, output_width, output_height, video_formats=['webm'])
    BigBlueButton.logger.info("Processing deskshare videos")

    deskshare_edl = BigBlueButton::Events.create_deskshare_edl(
      "#{temp_dir}/#{meeting_id}")
    deskshare_video_edl = BigBlueButton::Events.edl_match_recording_marks_video(deskshare_edl, "#{temp_dir}/#{meeting_id}")

    return if not BigBlueButton.video_recorded?(deskshare_video_edl)

    BigBlueButton::EDL::Video.dump(deskshare_video_edl)

    deskshare_layout = {
      :width => output_width, :height => output_height,
      :areas => [ { :name => :deskshare, :x => 0, :y => 0,
        :width => output_width, :height => output_height } ]
    }

    deskshare_video_file = BigBlueButton::EDL::Video.render(
      deskshare_video_edl, deskshare_layout, "#{target_dir}/deskshare")

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
      },
      {
        :extension => 'mp4',
        :parameters => [
          [ '-c:v', 'libx264', '-crf', '23', '-b:v', '60M',
            '-threads', '2', '-preset', 'medium', '-cpu-used', '3',
            '-c:a', 'libmp3lame', '-b:a', '48K',
            '-f', 'mp4' ]
        ]
      }
    ]
    formats.reject!{ |format| ! video_formats.include? format[:extension] }
    formats.each do |format|
      filename = BigBlueButton::EDL::encode(
        nil, deskshare_video_file, format, "#{target_dir}/deskshare", 0)
    end
  end

  def self.video_recorded?(video_edl)
    video_edl.each do |edl|
      edl[:areas].each do |name, videos|
        return true if not videos.empty?
      end
    end

    return false
  end

end



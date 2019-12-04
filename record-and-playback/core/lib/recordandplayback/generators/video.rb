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

    events = Nokogiri::XML(File.open("#{temp_dir}/#{meeting_id}/events.xml"))

    # Process user video (camera)
    start_time = BigBlueButton::Events.first_event_timestamp(events)
    end_time = BigBlueButton::Events.last_event_timestamp(events)
    webcam_edl = BigBlueButton::Events.create_webcam_edl(
                    events, "#{temp_dir}/#{meeting_id}")
    user_video_edl = BigBlueButton::Events.edl_match_recording_marks_video(
                    webcam_edl, events, start_time, end_time)
    BigBlueButton::EDL::Video.dump(user_video_edl)

    user_video_layout = {
      width: output_width, height: output_height,
      areas: [ { name: :webcam, x: 0, y: 0, width: output_width, height: output_height } ]
    }
    user_video_file = BigBlueButton::EDL::Video.render(
      user_video_edl, user_video_layout, "#{target_dir}/webcams")

    formats = [
      {
        extension: 'webm',
        parameters: [
          # These settings are appropriate for 640x480 medium quality, and should be tweaked for other resolutions
          # See https://developers.google.com/media/vp9/settings/vod/
          # Increase -threads to max of 4 or increase -speed to max of 4 to speed up processing
          %w[-c:v libvpx-vp9 -b:v 750K -minrate 375K -maxrate 1088K -crf 33 -quality good -speed 1 -g 240 -tile-columns 1 -threads 2
             -c:a libopus -b:a 48K
             -f webm]
          # Google recommends doing a 2-pass encode for better quality, but it's a lot slower. If you want to do this,
          # comment the lines above, and uncomment the lines below.
          #%w[-c:v libvpx-vp9 -b:v 750K -minrate 375K -maxrate 1088K -crf 33 -quality good -speed 4 -g 240 -tile-columns 1 -threads 2
          #   -an
          #   -f webm -pass 1],
          #%w[-c:v libvpx-vp9 -b:v 750K -minrate 375K -maxrate 1088K -crf 33 -quality good -speed 1 -g 240 -tile-columns 1 -threads 2
          #   -c:a libopus -b:a 48K
          #   -f webm -pass 2]
        ],
        postprocess: [ %w[mkclean --quiet :input :output] ]
      },
      {
        extension: 'mp4',
        parameters: [
          # These settings are appropriate for medium quality at any resolution
          # Increase -threads (or remove it, to use all cpu cores) to speed up processing
          # You can also change the preset: try 'fast' or 'faster'
          # To change quality, adjust the -crf value. Lower numbers are higher quality.
          %w[-c:v libx264 -crf 23 -threads 2 -preset medium -g 240
             -c:a aac -b:a 64K
             -f mp4 -movflags faststart]
        ],
        postprocess: [ ]
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

    events = Nokogiri::XML(File.open("#{temp_dir}/#{meeting_id}/events.xml"))

    start_time = BigBlueButton::Events.first_event_timestamp(events)
    end_time = BigBlueButton::Events.last_event_timestamp(events)
    deskshare_edl = BigBlueButton::Events.create_deskshare_edl(
                    events, "#{temp_dir}/#{meeting_id}")
    deskshare_video_edl = BigBlueButton::Events.edl_match_recording_marks_video(
                    deskshare_edl, events, start_time, end_time)

    return if not BigBlueButton.video_recorded?(deskshare_video_edl)

    BigBlueButton::EDL::Video.dump(deskshare_video_edl)

    deskshare_layout = {
      width: output_width, height: output_height,
      areas: [ { name: :deskshare, x: 0, y: 0, width: output_width, height: output_height } ]
    }

    deskshare_video_file = BigBlueButton::EDL::Video.render(
      deskshare_video_edl, deskshare_layout, "#{target_dir}/deskshare")

    formats = [
      {
        extension: 'webm',
        parameters: [
          # These settings are appropriate for 1280x720 medium quality, and should be tweaked for other resolutions
          # See https://developers.google.com/media/vp9/settings/vod/
          # Increase -threads to max of 8 or increase -speed to max of 4 to speed up processing
          %w[-c:v libvpx-vp9 -b:v 1024K -minrate 512K -maxrate 1485K -crf 32 -quality good -speed 2 -g 240 -tile-columns 2 -threads 2
             -c:a libopus -b:a 48K
             -f webm]
          # Google recommends doing a 2-pass encode for better quality, but it's a lot slower. If you want to do this,
          # comment the lines above, and uncomment the lines below.
          #%w[-c:v libvpx-vp9 -b:v 1024K -minrate 512K -maxrate 1485K -crf 32 -quality good -speed 4 -g 240 -tile-columns 2 -threads 2
          #   -an
          #   -f webm -pass 1],
          #%w[-c:v libvpx-vp9 -b:v 1024K -minrate 512K -maxrate 1485K -crf 32 -quality good -speed 2 -g 240 -tile-columns 2 -threads 2
          #   -c:a libopus -b:a 48K
          #   -f webm -pass 2]
        ],
        postprocess: [ %w[mkclean --quiet :input :output] ]
      },
      {
        extension: 'mp4',
        parameters: [
          # These settings are appropriate for medium quality at any resolution
          # Increase -threads (or remove it, to use all cpu cores) to speed up processing
          # You can also change the preset: try 'fast' or 'faster'
          # To change quality, adjust the -crf value. Lower numbers are higher quality.
          %w[-c:v libx264 -crf 23 -threads 2 -preset medium -g 240
             -c:a aac -b:a 64K
             -f mp4 -movflags faststart]
        ],
        postprocess: [ ]
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



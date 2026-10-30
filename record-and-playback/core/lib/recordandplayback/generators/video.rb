
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


  def BigBlueButton.process_webcam_videos(target_dir, raw_archive_dir, output_width, output_height, output_framerate, audio_offset, processed_audio_file, video_formats=['webm'], show_moderator_viewpoint=false)
    BigBlueButton.logger.info("Processing webcam videos")

    # raw_archive_dir already contains meeting_id
    events = Nokogiri::XML(File.open("#{raw_archive_dir}/events.xml"))

    # Process user video (camera)
    start_time = BigBlueButton::Events.first_event_timestamp(events)
    end_time = BigBlueButton::Events.last_event_timestamp(events)
    webcam_edl = BigBlueButton::Events.create_webcam_edl(
                    events, raw_archive_dir, show_moderator_viewpoint)
    user_video_edl = BigBlueButton::Events.edl_match_recording_marks_video(
                    webcam_edl, events, start_time, end_time)
    BigBlueButton::EDL::Video.dump(user_video_edl)

    user_video_layout = {
      width: output_width, height: output_height, framerate: output_framerate,
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
          # We use force_key_frames instead of -g to set the GOP size independent of the frame rate
          %w[-c:v libvpx-vp9 -crf 32 -deadline realtime -cpu-used 8 -force_key_frames expr:gte(t,n_forced*10) -tile-columns 2 -tile-rows 2 -threads 4
             -c:a copy
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
          %w[-c:v copy
             -c:a aac -q:a 0.5
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

  def BigBlueButton.process_deskshare_videos(target_dir, raw_archive_dir, output_width, output_height, output_framerate, video_formats=['webm'])
    BigBlueButton.logger.info("Processing deskshare videos")

    # raw_archive_dir already contains meeting_id
    events = Nokogiri::XML(File.open("#{raw_archive_dir}/events.xml"))

    start_time = BigBlueButton::Events.first_event_timestamp(events)
    end_time = BigBlueButton::Events.last_event_timestamp(events)
    deskshare_edl = BigBlueButton::Events.create_deskshare_edl(
                    events, raw_archive_dir)
    deskshare_video_edl = BigBlueButton::Events.edl_match_recording_marks_video(
                    deskshare_edl, events, start_time, end_time)

    return if not BigBlueButton.video_recorded?(deskshare_video_edl)

    BigBlueButton::EDL::Video.dump(deskshare_video_edl)

    deskshare_layout = {
      width: output_width, height: output_height, framerate: output_framerate,
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
          # We use force_key_frames instead of -g to set the GOP size independent of the frame rate
          %w[-c:v libvpx-vp9 -crf 32 -deadline realtime -cpu-used 8 -force_key_frames expr:gte(t,n_forced*10) -tile-columns 2 -tile-rows 2 -threads 4
             -c:a copy
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
          %w[-c:v copy
             -c:a aac -q:a 0.5
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
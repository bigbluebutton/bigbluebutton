require 'spec_helper'
require 'digest/md5'

module BigBlueButton
  describe "DeskshareProcessing" do
    context "#success" do
      it "should get the webcam start events" do
        dir = "resources/raw/8774263b-c4a6-4078-b2e6-46b7d4bc91c1"
        events_xml = "#{dir}/events.xml"
        se = BigBlueButton::Events.get_start_video_events(events_xml)
        se.size.should == 1
        se.each do |e|
          e[:timestamp].should == 1301433180493.to_s
        end
      end

      it "should get the webcam stop events" do
        dir = "resources/raw/8774263b-c4a6-4078-b2e6-46b7d4bc91c1"
        events_xml = "#{dir}/events.xml"
        se = BigBlueButton::Events.get_stop_video_events(events_xml)
        se.size.should == 1
        se.each do |e|
          e[:timestamp].should == 1301433230082.to_s
        end
        
      end

      it "should get the deskshare start events" do
        dir = "resources/raw/8774263b-c4a6-4078-b2e6-46b7d4bc91c1"
        events_xml = "#{dir}/events.xml"
        BigBlueButton::Events.get_start_deskshare_events(events_xml).size.should == 1
      end

      it "should get the deskshare stop events" do
        dir = "resources/raw/8774263b-c4a6-4078-b2e6-46b7d4bc91c1"
        events_xml = "#{dir}/events.xml"
        BigBlueButton::Events.get_stop_deskshare_events(events_xml).size.should == 1
      end
      
      it "should get the video width" do
        dir = "resources/raw/8774263b-c4a6-4078-b2e6-46b7d4bc91c1"
        video = "#{dir}/video/8774263b-c4a6-4078-b2e6-46b7d4bc91c1/320x240-1-1301433140446.flv"
        BigBlueButton.get_video_width(video).should == 320
        BigBlueButton.get_video_height(video).should == 240
      end

      it "should get the video duration" do
        dir = "resources/raw/8774263b-c4a6-4078-b2e6-46b7d4bc91c1"
        video = "#{dir}/video/8774263b-c4a6-4078-b2e6-46b7d4bc91c1/320x240-1-1301433140446.flv"
        BigBlueButton.get_video_duration(video).should == 48.4
      end

      it "should get the video bitrate and framerate" do
        dir = "resources/raw/8774263b-c4a6-4078-b2e6-46b7d4bc91c1"
        video = "#{dir}/video/8774263b-c4a6-4078-b2e6-46b7d4bc91c1/320x240-1-1301433140446.flv"
        BigBlueButton.get_video_bitrate(video).should == 0
        BigBlueButton.get_video_framerate(video).should == nil
      end
      
      it "should generate a video " do
        dir = "resources/raw/8774263b-c4a6-4078-b2e6-46b7d4bc91c1"
        video = "#{dir}/video/8774263b-c4a6-4078-b2e6-46b7d4bc91c1/320x240-1-1301433140446.flv"
        temp_dir = "/tmp/matterhorn"
        if FileTest.directory?(temp_dir)
          FileUtils.remove_dir temp_dir
        end
        FileUtils.mkdir_p temp_dir
        
        stripped_flv = "#{temp_dir}/stripped.flv"
        BigBlueButton.strip_audio_from_video(video, stripped_flv)
        blank_canvas = "#{temp_dir}/canvas.jpg"
        blank1 = "#{temp_dir}/blank1.flv"
        blank2 = "#{temp_dir}/blank2.flv"
        concat_vid = "#{temp_dir}/concat-video.flv"
        vid_width = BigBlueButton.get_video_width(video)
        vid_height = BigBlueButton.get_video_height(video)
                
        events_xml = "#{dir}/events.xml"
        first_timestamp = BigBlueButton::Events.first_event_timestamp(events_xml)
        last_timestamp = BigBlueButton::Events.last_event_timestamp(events_xml)
        start_evt = BigBlueButton::Events.get_start_video_events(events_xml)
        start_evt[0][:timestamp].to_i.should == 1301433180493
        stop_evt = BigBlueButton::Events.get_stop_video_events(events_xml)
        stop_evt[0][:timestamp].to_i.should == 1301433230082
        BigBlueButton.create_blank_canvas(vid_width, vid_height, "white", blank_canvas)
        
        first_gap_duration = start_evt[0][:timestamp].to_i - first_timestamp.to_i
        puts "First gap = " + first_gap_duration.to_s
        end_gap_duration = last_timestamp.to_i - stop_evt[0][:timestamp].to_i
        puts "End gap = " + end_gap_duration.to_s
        BigBlueButton.create_blank_video(first_gap_duration/1000, 1000, blank_canvas, blank1)
        BigBlueButton.create_blank_video(end_gap_duration/1000, 1000, blank_canvas, blank2)
        BigBlueButton.concatenate_videos([blank1, stripped_flv, blank2], concat_vid)
        
      # Comment out for now as it is failing. We need to get a complete recording with 
      # audio, webcam, and deskshare events
      #  BigBlueButton::AudioProcessor.process(dir, "#{temp_dir}/audio.ogg") 
      #  BigBlueButton.multiplex_audio_and_video("#{temp_dir}/audio.ogg", concat_vid, "#{temp_dir}/processed-video.flv")
      end
    end
  end
end

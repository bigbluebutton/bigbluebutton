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
          puts e[:timestamp]
        end
      end

      it "should get the webcam stop events" do
        dir = "resources/raw/8774263b-c4a6-4078-b2e6-46b7d4bc91c1"
        events_xml = "#{dir}/events.xml"
        se = BigBlueButton::Events.get_stop_video_events(events_xml)
        se.size.should == 1
        se.each do |e|
          puts e[:timestamp]
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
        BigBlueButton.create_blank_canvas(320,240, "white", blank_canvas)
        BigBlueButton.create_blank_video(15, 1000, blank_canvas, blank1)
        BigBlueButton.create_blank_video(4, 1000, blank_canvas, blank2)
        BigBlueButton.concatenate_videos([blank1, stripped_flv, blank2], concat_vid)
       # BigBlueButton.multiplex_audio_and_video("audio.wav", "concat-video.flv", "processed-video.flv")
      end
    end
  end
end

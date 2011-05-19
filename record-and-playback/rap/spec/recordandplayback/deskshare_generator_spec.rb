require 'spec_helper'
require 'digest/md5'

module BigBlueButton
  describe "DeskshareProcessing" do
    context "#success" do
      it "should get the 2 webcam start events" do
        dir = "resources/raw"
        events_xml = "#{dir}/webcam-events.xml"
        se = BigBlueButton::Events.get_start_video_events(events_xml)
        se.size.should == 2
      end

      it "should get the 2 webcam stop events" do
        dir = "resources/raw"
        events_xml = "#{dir}/webcam-events.xml"
        se = BigBlueButton::Events.get_stop_video_events(events_xml)
        se.size.should == 2       
      end

      it "should match the 2 webcam events" do
        dir = "resources/raw"
        events_xml = "#{dir}/webcam-events.xml"
        start = BigBlueButton::Events.get_start_video_events(events_xml)
        start.size.should == 2       
        stop = BigBlueButton::Events.get_stop_video_events(events_xml)
        stop.size.should == 2
        matched = BigBlueButton::Events.match_start_and_stop_video_events(start, stop)
        matched.size.should == 2
        matched.each do |me|
          puts "foo ts=#{me[:start_timestamp]} end_ts=#{me[:stop_timestamp]} stream=#{me[:stream]} match=#{me[:matched]}"
        end
      end
      
      it "should get the 2 deskshare start events" do
        dir = "resources/raw/974a4b8c-5bf7-4382-b4cd-eb26af7dfcc2"
        events_xml = "#{dir}/events.xml"
        BigBlueButton::Events.get_start_deskshare_events(events_xml).size.should == 2
      end

      it "should get the 2 deskshare stop events" do
        dir = "resources/raw/974a4b8c-5bf7-4382-b4cd-eb26af7dfcc2"
        events_xml = "#{dir}/events.xml"
        BigBlueButton::Events.get_stop_deskshare_events(events_xml).size.should == 2
      end
      
      it "should get the webcam start events" do
        dir = "resources/raw"
        events_xml = "#{dir}/webcam-events.xml"
        se = BigBlueButton::Events.get_start_video_events(events_xml)
        se.size.should == 2
      end

      it "should get the webcam stop events" do
        dir = "resources/raw"
        events_xml = "#{dir}/webcam-events.xml"
        se = BigBlueButton::Events.get_stop_video_events(events_xml)
        se.size.should == 2       
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

        concat_vid = "#{temp_dir}/concat-video.flv"
        vid_width = BigBlueButton.get_video_width(video)
        vid_height = BigBlueButton.get_video_height(video)
                
        events_xml = "#{dir}/events.xml"
        first_timestamp = BigBlueButton::Events.first_event_timestamp(events_xml)
        last_timestamp = BigBlueButton::Events.last_event_timestamp(events_xml)
        
        
        blank1 = "#{temp_dir}/blank1.flv"
        blank2 = "#{temp_dir}/blank2.flv"       
        
        start_evt = BigBlueButton::Events.get_start_video_events(events_xml)
        start_evt[0][:start_timestamp].should == 1301433180523
        
        stop_evt = BigBlueButton::Events.get_stop_video_events(events_xml)
        stop_evt[0][:stop_timestamp].should == 1301433230112
        BigBlueButton.create_blank_canvas(vid_width, vid_height, "white", blank_canvas)
        
        first_gap_duration = start_evt[0][:start_timestamp] - first_timestamp
        puts "First gap = " + first_gap_duration.to_s
        end_gap_duration = last_timestamp - stop_evt[0][:stop_timestamp]
        puts "End gap = " + end_gap_duration.to_s
        BigBlueButton.create_blank_video(first_gap_duration/1000, 1000, blank_canvas, blank1)
        BigBlueButton.create_blank_video(end_gap_duration/1000, 1000, blank_canvas, blank2)
        BigBlueButton.concatenate_videos([blank1, stripped_flv, blank2], concat_vid)
        
      # Comment out for now as it is failing. We need to get a complete recording with 
      # audio, webcam, and deskshare events
      #  BigBlueButton::AudioProcessor.process(dir, "#{temp_dir}/audio.ogg") 
      #  BigBlueButton.multiplex_audio_and_video("#{temp_dir}/audio.ogg", concat_vid, "#{temp_dir}/processed-video.flv")
      end
      
      it "should generate one webcam file from multiple webcam files " do
        meeting_id = "974a4b8c-5bf7-4382-b4cd-eb26af7dfcc2"
        raw_archive_dir = "resources/raw/#{meeting_id}"

        target_dir = "/tmp/matterhorn/process/matterhorn/#{meeting_id}"
        if FileTest.directory?(target_dir)
          FileUtils.remove_dir target_dir
        end
        FileUtils.mkdir_p target_dir

        # Create a copy of the raw archives
        temp_dir = "#{target_dir}/temp"
        FileUtils.mkdir_p temp_dir
        FileUtils.cp_r(raw_archive_dir, temp_dir)

        BigBlueButton::AudioProcessor.process("#{temp_dir}/#{meeting_id}", "#{target_dir}/audio.ogg")

        # Process video
        video_dir = "#{temp_dir}/#{meeting_id}/video/#{meeting_id}"
        raw_webcams = Dir.glob("#{video_dir}/*.flv")
        raw_webcams.size.should == 2
       
        vid_width = BigBlueButton.get_video_width(raw_webcams[0])
        vid_height = BigBlueButton.get_video_height(raw_webcams[0])
        blank_canvas = "#{temp_dir}/canvas.jpg"
        BigBlueButton.create_blank_canvas(vid_width.to_i, vid_height.to_i, "white", blank_canvas)
        
        events_xml = "#{temp_dir}/#{meeting_id}/events.xml"
        first_timestamp = BigBlueButton::Events.first_event_timestamp(events_xml)
        first_timestamp.to_i.should == 1305560822952
        last_timestamp = BigBlueButton::Events.last_event_timestamp(events_xml)
        last_timestamp.to_i.should == 1305561067407
        
        start_evt = BigBlueButton::Events.get_start_video_events(events_xml)
        start_evt.size.should == 2
        stop_evt = BigBlueButton::Events.get_stop_video_events(events_xml)       
        stop_evt.size.should == 2
        
        matched_evts = BigBlueButton::Events.match_start_and_stop_video_events(start_evt, stop_evt)
        matched_evts.size.should == 2
        
        paddings = BigBlueButton.generate_video_paddings(matched_evts, first_timestamp, last_timestamp)
        paddings.size.should == 3
        
        ind_flvs = []
        paddings.concat(matched_evts).sort{|a,b| a[:start_timestamp] <=> b[:start_timestamp]}.each do |comb|
          if (comb[:gap])
            ind_flvs << "#{temp_dir}/#{comb[:stream]}"
            BigBlueButton.create_blank_video((comb[:stop_timestamp] - comb[:start_timestamp])/1000, 1000, blank_canvas, "#{temp_dir}/#{comb[:stream]}")
          else
            ind_flvs << "#{temp_dir}/stripped-#{comb[:stream]}.flv"
            BigBlueButton.strip_audio_from_video("#{video_dir}/#{comb[:stream]}.flv", "#{temp_dir}/stripped-#{comb[:stream]}.flv")
          end
        end
               
        concat_vid = "#{target_dir}/webcam.flv"
        BigBlueButton.concatenate_videos(ind_flvs, concat_vid)        
        BigBlueButton.multiplex_audio_and_video("#{target_dir}/audio.ogg", concat_vid, "#{target_dir}/muxed-audio-webcam.flv")        
      end

      it "should generate one deskshare file from multiple deskshare files" do
        meeting_id = "974a4b8c-5bf7-4382-b4cd-eb26af7dfcc2"
        raw_archive_dir = "resources/raw/#{meeting_id}"

        target_dir = "/tmp/matterhorn/process/matterhorn/#{meeting_id}"
        if FileTest.directory?(target_dir)
          FileUtils.remove_dir target_dir
        end
        FileUtils.mkdir_p target_dir

        # Create a copy of the raw archives
        temp_dir = "#{target_dir}/temp"
        FileUtils.mkdir_p temp_dir
        FileUtils.cp_r(raw_archive_dir, temp_dir)

        BigBlueButton::AudioProcessor.process("#{temp_dir}/#{meeting_id}", "#{target_dir}/audio.ogg")

        # Process video
        video_dir = "#{temp_dir}/#{meeting_id}/video/#{meeting_id}"
        raw_webcams = Dir.glob("#{video_dir}/*.flv")
        raw_webcams.size.should == 2
        
        vid_width = BigBlueButton.get_video_width(raw_webcams[0])
        vid_height = BigBlueButton.get_video_height(raw_webcams[0])
        blank_canvas = "#{temp_dir}/canvas.jpg"
        BigBlueButton.create_blank_canvas(vid_width.to_i, vid_height.to_i, "white", blank_canvas)
        
        events_xml = "#{temp_dir}/#{meeting_id}/events.xml"
        first_timestamp = BigBlueButton::Events.first_event_timestamp(events_xml)
        first_timestamp.to_i.should == 1305560822952
        last_timestamp = BigBlueButton::Events.last_event_timestamp(events_xml)
        last_timestamp.to_i.should == 1305561067407
        
        start_evt = BigBlueButton::Events.get_start_video_events(events_xml)
        start_evt.size.should == 2
        stop_evt = BigBlueButton::Events.get_stop_video_events(events_xml)       
        stop_evt.size.should == 2
        
        matched_evts = BigBlueButton::Events.match_start_and_stop_video_events(start_evt, stop_evt)
        matched_evts.size.should == 2
        
        paddings = BigBlueButton.generate_video_paddings(matched_evts, first_timestamp, last_timestamp)
        paddings.size.should == 3
        
        ind_flvs = []
        paddings.concat(matched_evts).sort{|a,b| a[:start_timestamp] <=> b[:start_timestamp]}.each do |comb|
          if (comb[:gap])
            ind_flvs << "#{temp_dir}/#{comb[:stream]}"
            BigBlueButton.create_blank_video((comb[:stop_timestamp] - comb[:start_timestamp])/1000, 1000, blank_canvas, "#{temp_dir}/#{comb[:stream]}")
          else
            ind_flvs << "#{temp_dir}/stripped-#{comb[:stream]}.flv"
            BigBlueButton.strip_audio_from_video("#{video_dir}/#{comb[:stream]}.flv", "#{temp_dir}/stripped-#{comb[:stream]}.flv")
          end
        end
               
        concat_vid = "#{target_dir}/webcam.flv"
        BigBlueButton.concatenate_videos(ind_flvs, concat_vid)        
        BigBlueButton.multiplex_audio_and_video("#{target_dir}/audio.ogg", concat_vid, "#{target_dir}/muxed-audio-webcam.flv")        
        
        deskshare = Dir.glob("#{temp_dir}/#{meeting_id}/deskshare/*.flv")
        
        ds_width = BigBlueButton.get_video_width(deskshare[0])
        ds_height = BigBlueButton.get_video_height(deskshare[0])
        ds_blank_canvas = "#{temp_dir}/ds-canvas.jpg"
        BigBlueButton.create_blank_canvas(ds_width, ds_height, "white", ds_blank_canvas)
        
        start_ds_evt = BigBlueButton::Events.get_start_deskshare_events(events_xml)
        start_ds_evt.size.should == 2
        stop_ds_evt = BigBlueButton::Events.get_stop_deskshare_events(events_xml)
        stop_ds_evt.size.should == 2
        
        ds_matched_evts = BigBlueButton::Events.match_start_and_stop_deskshare_events(start_ds_evt, stop_ds_evt)
        ds_matched_evts.size.should == 2
        
        ds_paddings = BigBlueButton.generate_deskshare_paddings(ds_matched_evts, first_timestamp, last_timestamp)
        ds_paddings.size.should == 3
        
        ds_ind_flvs = []
        ds_paddings.concat(ds_matched_evts).sort{|a,b| a[:start_timestamp] <=> b[:start_timestamp]}.each do |comb|
          if (comb[:gap])
            ds_ind_flvs << "#{temp_dir}/#{comb[:stream]}"
            BigBlueButton.create_blank_deskshare_video((comb[:stop_timestamp] - comb[:start_timestamp])/1000, 1000, ds_blank_canvas, "#{temp_dir}/#{comb[:stream]}")
          else
            ds_ind_flvs << "#{temp_dir}/#{meeting_id}/deskshare/#{comb[:stream]}"
          end
        end
        
        dsconcat_vid = "#{target_dir}/deskshare.flv"
        BigBlueButton.concatenate_videos(ds_ind_flvs, dsconcat_vid)    

        BigBlueButton::MatterhornProcessor.create_manifest_xml("#{target_dir}/muxed-audio-webcam.flv", "#{target_dir}/deskshare.flv", "#{target_dir}/manifest.xml")
        BigBlueButton::MatterhornProcessor.create_dublincore_xml("#{target_dir}/dublincore.xml",
                                                          {:title => "Business Ecosystem",
                                                              :subject => "TTMG 5001",
                                                              :description => "How to manage your product's ecosystem",
                                                              :creator => "Richard Alam",
                                                              :contributor => "Popen3",
                                                              :language => "En-US",
                                                              :identifier => "ttmg-5001-2"})        
                                                              
        puts Dir.pwd
        Dir.chdir(target_dir) do
          puts Dir.pwd
          BigBlueButton::MatterhornProcessor.zip_artifacts("muxed-audio-webcam.flv", "deskshare.flv", "dublincore.xml", "manifest.xml", "#{meeting_id}.zip")
        end
        puts Dir.pwd

        cmd = "scp -i /home/firstuser/.ssh/matt_id_rsa #{target_dir}/#{meeting_id}.zip root@ec2-50-16-8-19.compute-1.amazonaws.com:/opt/matterhorn/felix/inbox/"
        puts cmd
        Open3.popen3(cmd) do | stdin, stdout, stderr|
          p $?.exitstatus 
        end
      end      
    end
  end
end

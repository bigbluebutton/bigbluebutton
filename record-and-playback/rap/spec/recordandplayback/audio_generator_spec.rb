require 'spec_helper'
require 'digest/md5'

module Generator
  describe Audio do
    context "#success" do
      it "should create a silence file" do 
        length = 2000
        file = "/tmp/silence-audio.wav"
        Generator::Audio.generate_silence(length, file, 16000)
        Generator::Audio.determine_length_of_audio_from_file(file).should equal(length)       
      end
      
      it "should concatenate files" do
        dir = "resources/raw/1b199e88-7df7-4842-a5f1-0e84b781c5c8/audio"
        file1 = "#{dir}/1b199e88-7df7-4842-a5f1-0e84b781c5c8-20110202-041247.wav"
        file2 = "#{dir}/1b199e88-7df7-4842-a5f1-0e84b781c5c8-20110202-041415.wav"
        outfile = "/tmp/concatenated.wav"
        Generator::Audio.concatenate_audio_files([file1, file2], outfile)
        Generator::Audio.determine_length_of_audio_from_file(outfile).should equal(115580) 
      end
      
      it "should convert wav file to ogg" do
        dir = "resources/raw/1b199e88-7df7-4842-a5f1-0e84b781c5c8/audio"
        file1 = "#{dir}/1b199e88-7df7-4842-a5f1-0e84b781c5c8-20110202-041247.wav"
        outfile = "/tmp/wav2ogg.ogg"
        Generator::Audio.wav_to_ogg(file1, outfile)
        Generator::Audio.determine_length_of_audio_from_file(outfile).should equal(60020) 
      end
      
      it "should find the timestamp of the first event" do
        events_xml = 'resources/raw/good_audio_events.xml'
        ae = Generator::AudioEvents.new events_xml
        ae.first_event_timestamp.should == "50"
      end
      
      it "should find the timestamp of the last event" do
        events_xml = 'resources/raw/good_audio_events.xml'
        ae = Generator::AudioEvents.new events_xml
        ae.last_event_timestamp.should == "1000"
      end   

      it "should get all start audio recording events" do
        events_xml = 'resources/raw/good_audio_events.xml'
        ae = Generator::AudioEvents.new events_xml
        start = ae.start_audio_recording_events
        start.length.should == 2
        start[0].start_event_timestamp.should == "100"
        start[1].start_event_timestamp.should == "500"
      end
      
      it "should get all stop audio recording events" do
        events_xml = 'resources/raw/good_audio_events.xml'
        ae = Generator::AudioEvents.new events_xml
        stop = ae.stop_audio_recording_events
        stop.length.should == 2
        stop[0].stop_event_timestamp.should == "350"
        stop[1].stop_event_timestamp.should == "800"
      end

      it "should match all start and stop events" do
        events_xml = 'resources/raw/good_audio_events.xml'
        ae = Generator::AudioEvents.new events_xml
        se = ae.match_start_and_stop_events(ae.start_audio_recording_events, ae.stop_audio_recording_events)
        se.length.should == 2
      end 

      it "should not match all start and stop events" do
        events_xml = 'resources/raw/unmatched_audio_events.xml'
        ae = Generator::AudioEvents.new events_xml
        se = ae.match_start_and_stop_events(ae.start_audio_recording_events, ae.stop_audio_recording_events)
        se.length.should == 4
      end 

      it "should generate audio pads" do
        events_xml = 'resources/raw/good_audio_events.xml'
        ae = Generator::AudioEvents.new events_xml
        se = ae.match_start_and_stop_events(ae.start_audio_recording_events, ae.stop_audio_recording_events)
        se.length.should == 2
        audio_paddings = ae.generate_audio_paddings(se)
        audio_paddings.length.should == 3
      end 

      it "should generate sorted audio events" do
        events_xml = 'resources/raw/good_audio_events.xml'
        ae = Generator::AudioEvents.new events_xml
        ae.stub(:determine_if_recording_file_exist).and_return(true)
        Generator::Audio.stub(:determine_length_of_audio_from_file).and_return(50)
        audio_events = ae.process_events
        audio_events.length.should == 5
        i = 0
        while i < audio_events.length - 1
          (audio_events[i+1].start_event_timestamp.to_i > audio_events[i].stop_event_timestamp.to_i).should be_true
          i += 1
        end
      end 
      
      it "should determine the start/stop timestamps for non-matched events" do
        events_xml = 'resources/raw/unmatched_audio_events.xml'
        ae = Generator::AudioEvents.new events_xml
        ae.stub(:determine_if_recording_file_exist).and_return(true)
        Generator::Audio.stub(:determine_length_of_audio_from_file).and_return(50)
        se = ae.match_start_and_stop_events(ae.start_audio_recording_events, ae.stop_audio_recording_events)
        se.length.should == 4
        se.each do |e|
          if not e.matched 
            ae.determine_start_stop_timestamps_for_unmatched_event!(e)
            e.stop_event_timestamp.to_i.should == e.start_event_timestamp.to_i + 50
          end
        end
      end
    end
  end
end
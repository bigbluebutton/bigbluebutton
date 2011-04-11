require 'spec_helper'
require 'digest/md5'

module Generator
  describe AudioEvents do
    context "#success" do
      it "should generate a complete audio file for the recording" do
        dir = "resources/raw/1b199e88-7df7-4842-a5f1-0e84b781c5c8"
        events_xml = "#{dir}/events.xml"
        audio_dir = "#{dir}/audio"
        audio_events = Generator::AudioEvents.process_events(events_xml)
        audio_events.each do |ae|
          puts ae.file
        end
      end
    
      it "should create a silence file" do 
        length = 2000
        file = "/tmp/silence-audio.wav"
        Generator::AudioEvents.generate_silence(length, file, 16000)
        Generator::AudioEvents.determine_length_of_audio_from_file(file).should equal(length)       
      end
      
      it "should concatenate files" do
        dir = "resources/raw/1b199e88-7df7-4842-a5f1-0e84b781c5c8/audio"
        file1 = "#{dir}/1b199e88-7df7-4842-a5f1-0e84b781c5c8-20110202-041247.wav"
        file2 = "#{dir}/1b199e88-7df7-4842-a5f1-0e84b781c5c8-20110202-041415.wav"
        outfile = "/tmp/concatenated.wav"
        Generator::AudioEvents.concatenate_audio_files([file1, file2], outfile)
        Generator::AudioEvents.determine_length_of_audio_from_file(outfile).should equal(115580) 
      end
      
      it "should convert wav file to ogg" do
        dir = "resources/raw/1b199e88-7df7-4842-a5f1-0e84b781c5c8/audio"
        file1 = "#{dir}/1b199e88-7df7-4842-a5f1-0e84b781c5c8-20110202-041247.wav"
        outfile = "/tmp/wav2ogg.ogg"
        Generator::AudioEvents.wav_to_ogg(file1, outfile)
        Generator::AudioEvents.determine_length_of_audio_from_file(outfile).should equal(60020) 
      end
      
      it "should find the timestamp of the first event" do
        events_xml = 'resources/raw/good_audio_events.xml'
        Generator::AudioEvents.first_event_timestamp(events_xml).should == "50"
      end
      
      it "should find the timestamp of the last event" do
        events_xml = 'resources/raw/good_audio_events.xml'
        Generator::AudioEvents.last_event_timestamp(events_xml).should == "1000"
      end   

      it "should get all start audio recording events" do
        events_xml = 'resources/raw/good_audio_events.xml'
        start = Generator::AudioEvents.start_audio_recording_events events_xml
        start.length.should == 2
        start[0].start_event_timestamp.should == "100"
        start[1].start_event_timestamp.should == "500"
      end
      
      it "should get all stop audio recording events" do
        events_xml = 'resources/raw/good_audio_events.xml'
        stop = Generator::AudioEvents.stop_audio_recording_events events_xml
        stop.length.should == 2
        stop[0].stop_event_timestamp.should == "350"
        stop[1].stop_event_timestamp.should == "800"
      end

      it "should match all start and stop events" do
        events_xml = 'resources/raw/good_audio_events.xml'
        se = Generator::AudioEvents.match_start_and_stop_events(Generator::AudioEvents.start_audio_recording_events(events_xml), 
                          Generator::AudioEvents.stop_audio_recording_events(events_xml))
        se.length.should == 2
      end 

      it "should not match all start and stop events" do
        events_xml = 'resources/raw/unmatched_audio_events.xml'
        se = Generator::AudioEvents.match_start_and_stop_events(Generator::AudioEvents.start_audio_recording_events(events_xml), 
                        Generator::AudioEvents.stop_audio_recording_events(events_xml))
        se.length.should == 4
      end 

      it "should generate audio pads" do
        events_xml = 'resources/raw/good_audio_events.xml'
        se = Generator::AudioEvents.match_start_and_stop_events(Generator::AudioEvents.start_audio_recording_events(events_xml), 
                    Generator::AudioEvents.stop_audio_recording_events(events_xml))
        se.length.should == 2
        audio_paddings = Generator::AudioEvents.generate_audio_paddings(se, events_xml)
        audio_paddings.length.should == 3
      end 

      it "should generate sorted audio events" do
        Generator::AudioEvents.stub(:determine_if_recording_file_exist).and_return(true)
        Generator::AudioEvents.stub(:determine_length_of_audio_from_file).and_return(50)
        events_xml = 'resources/raw/good_audio_events.xml'
        audio_events = Generator::AudioEvents.process_events(events_xml)
        audio_events.length.should == 5
        i = 0
        while i < audio_events.length - 1
          (audio_events[i+1].start_event_timestamp.to_i > audio_events[i].stop_event_timestamp.to_i).should be_true
          i += 1
        end
        
       # Generator::AudioEvents.to_xml_file(audio_events, "/tmp/event.audio.xml")
      end 
      
      it "should determine the start/stop timestamps for non-matched events" do
        Generator::AudioEvents.stub(:determine_if_recording_file_exist).and_return(true)
        Generator::AudioEvents.stub(:determine_length_of_audio_from_file).and_return(50)
        events_xml = 'resources/raw/unmatched_audio_events.xml'
        se = Generator::AudioEvents.match_start_and_stop_events(Generator::AudioEvents.start_audio_recording_events(events_xml), 
                    Generator::AudioEvents.stop_audio_recording_events(events_xml))
        se.length.should == 4
        se.each do |e|
          if not e.matched 
            Generator::AudioEvents.determine_start_stop_timestamps_for_unmatched_event!(e)
            e.stop_event_timestamp.to_i.should == e.start_event_timestamp.to_i + 50
          end
        end
      end
    end
  end
end
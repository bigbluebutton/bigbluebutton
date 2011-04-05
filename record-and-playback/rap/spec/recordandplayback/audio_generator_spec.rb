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
        events_xml = 'resources/raw/1b199e88-7df7-4842-a5f1-0e84b781c5c8/events.xml'
        ae = Generator::AudioEvents.new events_xml
        ae.first_event_timestamp.should == "1296681157242"
      end
      
      it "should find the timestamp of the last event" do
        events_xml = 'resources/raw/1b199e88-7df7-4842-a5f1-0e84b781c5c8/events.xml'
        ae = Generator::AudioEvents.new events_xml
        ae.last_event_timestamp.should == "1296681317181"
      end   

      it "should get all start audio recording events" do
        events_xml = 'resources/raw/1b199e88-7df7-4842-a5f1-0e84b781c5c8/events.xml'
        ae = Generator::AudioEvents.new events_xml
        se = ae.start_audio_recording_events
        se.size.should equal(2)
        se[0][:start_event_timestamp].should == "1296681167689"
        se[1][:start_event_timestamp].should == "1296681255586"
      end
      
      it "should get all stop audio recording events" do
        events_xml = 'resources/raw/1b199e88-7df7-4842-a5f1-0e84b781c5c8/events.xml'
        ae = Generator::AudioEvents.new events_xml
        se = ae.stop_audio_recording_events
        se.size.should equal(2)
        se[0][:stop_event_timestamp].should == "1296681230166"
        se[1][:stop_event_timestamp].should == "1296681315499"
      end

      it "should get all audio recording events" do
        events_xml = 'resources/raw/1b199e88-7df7-4842-a5f1-0e84b781c5c8/events.xml'
        ae = Generator::AudioEvents.new events_xml
        se = ae.recording_events
        se.size.should equal(2)
        se[0].stop_event_timestamp.should == "1296681230166"
        se[1].stop_event_timestamp.should == "1296681315499"
      end      
    end
  end
end
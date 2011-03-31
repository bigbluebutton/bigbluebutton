require 'spec_helper'
require 'fileutils'
require 'logger'
  
module Collector
    describe Audio do     
        context "#success" do
            it "should copy audio recording to archive" do
                from_dir = 'resources/raw/audio'
                to_dir = 'resources/archive'
                meeting_id = 'meeting-id'
                audio_dir = "#{to_dir}/#{meeting_id}/audio"
                FileUtils.mkdir_p audio_dir
                archiver = Collector::Audio.new
                expect {
                    archiver.collect_audio( meeting_id, from_dir, audio_dir )
                    }.to_not raise_error
                
                FileUtils.remove_dir "#{to_dir}/#{meeting_id}"
            end
        end
        
        context "#fail" do
            it "should raise from directory not found exception" do
                from_dir = '/from-dir-not-found'
                to_dir = 'resources/archive'
                meeting_id = 'meeting-id'
                archiver = Collector::Audio.new
                expect {
                    archiver.collect_audio( meeting_id, from_dir, to_dir )
                    }.to raise_error(NoSuchDirectoryException)
            end
            it "should raise to directory not found exception" do
                from_dir = 'resources/raw/audio'
                to_dir = '/to-dir-not-found'
                meeting_id = 'meeting-id'
                audio_dir = "#{to_dir}/#{meeting_id}/audio"

                archiver = Collector::Audio.new
                expect {
                    archiver.collect_audio( meeting_id, from_dir, to_dir )
                    }.to raise_error(NoSuchDirectoryException)
            end
        end
    end
end
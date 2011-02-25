require 'spec_helper'
require 'fileutils'
  
module Archiver
    describe Audio do
        context "#success" do
            it "directory is present" do
                output = mock('output')
                output.stub(:error)
                archiver = Audio.new 
                FileTest.stub(:directory?).and_return(true)
                expect { archiver.location_exist?('/from') }.to_not raise_error

            end
            it "recorded audio is/are present" do
                output = mock('output')
                output.stub(:error)
                archiver = Audio.new output      
                Dir.stub(:glob).and_return(['file1'])
                expect { archiver.audio_is_present?('meeting-id', 'location') }.to_not raise_error                
            end
            it "should move audio recording to archive" do
                output = mock('output')
                output.stub(:error)
                archiver = Audio.new output
                FileTest.stub(:directory?).and_return(true)
                Dir.stub(:glob).and_return(['file1.wav', 'file2.wav'])
                FileUtils.stub(:mv)
                expect { archiver.archive_audio_recording( 'meeting-id', '/from', '/to' ) }.should_not raise_error
            end                  
            it "should move audio recording to archive real" do
                output = mock('output')
                output.stub(:error)
                output.stub(:info)
                archiver = Audio.new output
                expect {
                    archiver.archive_audio_recording( 'meeting-id', '/from', '/to' ).should raise_error
                }
            end
        end
    end
end
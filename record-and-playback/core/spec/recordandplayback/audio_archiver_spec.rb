require 'spec_helper'
require 'fileutils'

module BigBlueButton
    describe AudioArchiver do     
        context "#success" do
            it "should copy audio recording to archive" do
                FileTest.stub(:directory?).and_return(true)
                FileUtils.stub(:cp)
                Dir.stub(:glob).and_return(['file1.wav', 'file2.wav'])
                from_dir = '/from/dir/'
                to_dir = '/to/dir/'
                meeting_id = 'meeting-id'
                BigBlueButton::AudioArchiver.archive(meeting_id, from_dir, to_dir)  
            end
        end
    end
end
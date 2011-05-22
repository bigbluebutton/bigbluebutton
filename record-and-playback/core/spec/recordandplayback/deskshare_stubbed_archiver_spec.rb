require 'spec_helper'
require 'fileutils'

module BigBlueButton
    describe DeskshareArchiver do     
        context "#success" do
            it "should copy deskshare recordings to archive" do
                FileTest.stub(:directory?).and_return(true)
                FileUtils.stub(:cp)
                Dir.stub(:glob).and_return(['file1.wav', 'file2.wav'])
                from_dir = 'from'
                to_dir = 'to'
                meeting_id = 'meeting-id'
                
                expect { BigBlueButton::DeskshareArchiver.archive( meeting_id, from_dir, to_dir ) }.to_not raise_error   
            end
        end
        
        context "#fail" do
            it "should raise from directory not found exception" do
                FileTest.stub(:directory?).and_return(false)
                FileUtils.stub(:cp)
                Dir.stub(:glob).and_return(['file1.wav', 'file2.wav'])
                from_dir = '/from-dir-not-found'
                to_dir = 'resources/archive'
                meeting_id = 'meeting-id'
                
                expect { BigBlueButton::DeskshareArchiver.archive( meeting_id, from_dir, to_dir )}.to raise_error(MissingDirectoryException)
            end
            it "should raise to directory not found exception" do
                from_dir = 'resources/raw/audio'
                to_dir = '/to-dir-not-found'
                meeting_id = 'meeting-id'
                FileTest.stub(:directory?).and_return(false)
                FileUtils.stub(:cp)
                Dir.stub(:glob).and_return(['file1.wav', 'file2.wav'])
                
                expect { BigBlueButton::DeskshareArchiver.archive( meeting_id, from_dir, to_dir ) }.to raise_error(MissingDirectoryException)
            end
            it "should raise deskshare files not found exception" do
                from_dir = 'resources/raw/audio'
                to_dir = '/to-dir-not-found'
                meeting_id = 'meeting-id'
                FileTest.stub(:directory?).and_return(true)
                FileUtils.stub(:cp)
                Dir.stub(:glob).and_return([])
                
                expect { BigBlueButton::DeskshareArchiver.archive( meeting_id, from_dir, to_dir ) }.to raise_error(FileNotFoundException)
            end
        end
    end
end
require 'fileutils'

Given /^the meeting has ended$/ do
  @archive_dir = "/tmp/archive"
  if FileTest.directory?(@archive_dir)
    FileUtils.remove_dir @archive_dir
  end
  FileUtils.mkdir_p @archive_dir
end

When /^the meeting has been recorded$/ do
  true.should be_true
end

Then /^store the recorded events to the archive$/ do
  BigBlueButton::EventsArchiver.archive('meeting_id').should be_true
end

Then /^store the raw audio recording to the archive$/ do
  meeting_id = "8774263b-c4a6-4078-b2e6-46b7d4bc91c1" 
  from_dir = "resources/raw/#{meeting_id}/audio"
  meeting_id = "8774263b-c4a6-4078-b2e6-46b7d4bc91c1"
  BigBlueButton::AudioArchiver.archive(meeting_id, from_dir,@archive_dir)  
end

Then /^store the uploaded presentations to the archive$/ do
  meeting_id = "8774263b-c4a6-4078-b2e6-46b7d4bc91c1"
  from_dir = "resources/raw/#{meeting_id}/presentations"
  BigBlueButton::PresentationArchiver.archive(meeting_id, from_dir, @archive_dir)
end

Then /^store the raw webcam recordings to the archive$/ do
  meeting_id = "8774263b-c4a6-4078-b2e6-46b7d4bc91c1"
  from_dir = "resources/raw/#{meeting_id}/video/#{meeting_id}"
  BigBlueButton::VideoArchiver.archive(meeting_id, from_dir, @archive_dir)
end

Then /^store the raw deskshare recordings to the archive$/ do
  meeting_id = "8774263b-c4a6-4078-b2e6-46b7d4bc91c1"
  from_dir = "resources/raw/#{meeting_id}/deskshare"
  BigBlueButton::DeskshareArchiver.archive(meeting_id, from_dir, @archive_dir)
end





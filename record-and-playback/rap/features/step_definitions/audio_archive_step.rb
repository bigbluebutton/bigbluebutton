require 'fileutils'

Given /^the meeting has ended$/ do
  @archive_dir = "/tmp/archive"
  if FileTest.directory?(@archive_dir)
    FileUtils.remove_dir @archive_dir
  end
  FileUtils.mkdir_p @archive_dir
  @archiver = BigBlueButton::Archiver.new
end

When /^the meeting has been recorded$/ do
  @archiver.meeting_recorded?('test-meeting-id').should be_true
end

Then /^store the recorded events to the archive$/ do
  @archiver.store_recorded_events('test-meeting-id')
end

Then /^store the raw audio recording to the archive$/ do
  pending # express the regexp above with the code you wish you had
end

Then /^store the uploaded presentations to the archive$/ do
  pending # express the regexp above with the code you wish you had
end

Then /^store the raw webcam recordings to the archive$/ do
  pending # express the regexp above with the code you wish you had
end

Then /^store the raw deskshare recordings to the archive$/ do
  pending # express the regexp above with the code you wish you had
end





require 'fileutils'

Given /^recordings in the archive$/ do
  @tmp_archive_dir = "/tmp/archive"
  if FileTest.directory?(@tmp_archive_dir)
    FileUtils.remove_dir @tmp_archive_dir
  end
  FileUtils.mkdir_p @tmp_archive_dir
  
  @meeting_id = "8774263b-c4a6-4078-b2e6-46b7d4bc91c1"
  
  @raw_dir = "resources/raw/#{@meeting_id}" 
  FileUtils.cp_r(@raw_dir, @tmp_archive_dir)
end

When /^asked to create playback for Matterhorn$/ do
  BigBlueButton::MatterhornProcessor.process("#{@tmp_archive_dir}/#{@meeting_id}", @meeting_id)
end

Then /^all media files should be converted to formats supported by Matterhorn$/ do
  pending # express the regexp above with the code you wish you had
end

Then /^packaged in a zip file$/ do
  pending # express the regexp above with the code you wish you had
end

Then /^uploaded to Matterhorn for ingestion$/ do
  pending # express the regexp above with the code you wish you had
end

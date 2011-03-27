require 'fileutils'

Given /^a set of recordings in the archive$/ do
  @tmp_archive_dir = "/tmp/archive"
  if FileTest.directory?(@tmp_archive_dir)
    FileUtils.remove_dir @tmp_archive_dir
  end
  FileUtils.mkdir_p @tmp_archive_dir
  
  @meeting_id = "8774263b-c4a6-4078-b2e6-46b7d4bc91c1"
  
  @raw_dir = "resources/raw/#{@meeting_id}" 
  FileUtils.cp_r(@raw_dir, @tmp_archive_dir)
end

Given /^the list of events in the recording$/ do  
  Dir.glob("#{@tmp_archive_dir}/#{@meeting_id}/audio/#{@meeting_id}*.wav").empty?.should be_false
end

When /^an recording is processed for playback on Matterhorn$/ do
  @processor = BigBlueButton::AudioProcessor.process("#{@tmp_archive_dir}/#{@meeting_id}")
end

Then /^zip the artifacts$/ do
  #pending # express the regexp above with the code you wish you had
end

Then /^upload to Matterhorn$/ do
 # pending # express the regexp above with the code you wish you had
end
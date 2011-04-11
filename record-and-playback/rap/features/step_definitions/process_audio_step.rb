require 'fileutils'

Given /^a set of audio recordings in the archive$/ do
  @tmp_archive_dir = "/tmp/archive"
  if FileTest.directory?(@tmp_archive_dir)
    FileUtils.remove_dir @tmp_archive_dir
  end
  FileUtils.mkdir_p @tmp_archive_dir
  
  @meeting_id = "1b199e88-7df7-4842-a5f1-0e84b781c5c8"
  
  @raw_dir = "resources/raw/#{@meeting_id}" 
  FileUtils.cp_r(@raw_dir, @tmp_archive_dir)
end

Given /^the list of events in the recording$/ do  
  Dir.glob("#{@tmp_archive_dir}/#{@meeting_id}/audio/#{@meeting_id}*.wav").empty?.should be_false
end

When /^an audio is processed for playback$/ do
  @processor = BigBlueButton::AudioProcessor.process("#{@tmp_archive_dir}/#{@meeting_id}")
end

Then /^all raw audio files should be combined to create one audio file$/ do
  #pending # express the regexp above with the code you wish you had
end

Then /^converted from wav to ogg$/ do
 # pending # express the regexp above with the code you wish you had
end

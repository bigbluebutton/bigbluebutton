require 'fileutils'

Given /^the meeting has ended$/ do
  @archive_dir = "/tmp/archive"
  if FileTest.directory?(@archive_dir)
    FileUtils.remove_dir @archive_dir
  end
  FileUtils.mkdir_p @archive_dir
  @archiver = Collector::Audio.new
end

When /^the audio has been recorded$/ do
  @archiver.audio_present?("resources/raw/8774263b-c4a6-4078-b2e6-46b7d4bc91c1/audio", "8774263b-c4a6-4078-b2e6-46b7d4bc91c1")
end

Then /^copy over the raw recordings to the archive$/ do
  @archiver.collect_audio("8774263b-c4a6-4078-b2e6-46b7d4bc91c1", "resources/raw/8774263b-c4a6-4078-b2e6-46b7d4bc91c1/audio", @archive_dir) 
end



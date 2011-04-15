require 'fileutils'

Given /^recordings in the archive$/ do
  @tmp_archive_dir = "/tmp/archive"
  if FileTest.directory?(@tmp_archive_dir)
    FileUtils.remove_dir @tmp_archive_dir
  end
  FileUtils.mkdir_p @tmp_archive_dir
  
  @meeting_id = "58f4a6b3-cd07-444d-8564-59116cb53974"
  
  @raw_dir = "resources/raw/#{@meeting_id}" 
  FileUtils.cp_r(@raw_dir, @tmp_archive_dir)
end

When /^asked to create playback for Matterhorn$/ do
  BigBlueButton::MatterhornProcessor.process("#{@tmp_archive_dir}/#{@meeting_id}", @meeting_id)
end

Then /^all media files should be converted to formats supported by Matterhorn$/ do
  matterhorn = "#{@tmp_archive_dir}/#{@meeting_id}/matterhorn"
  BigBlueButton::MatterhornProcessor.create_manifest_xml("#{matterhorn}/audio.ogg", "#{matterhorn}/video.flv", "#{matterhorn}/deskshare.flv", "#{matterhorn}/manifest.xml")
  BigBlueButton::MatterhornProcessor.create_dublincore_xml("#{matterhorn}/dublincore.xml",
                                                            {:title => "Business Ecosystem",
                                                              :subject => "TTMG 5001",
                                                              :description => "How to manage your product's ecosystem",
                                                              :creator => "Richard Alam",
                                                              :contributor => "Tony B.",
                                                              :language => "En-US",
                                                              :identifier => "ttmg-5001-2"})
end

Then /^packaged in a zip file$/ do
  matterhorn = "#{@tmp_archive_dir}/#{@meeting_id}/matterhorn"

  puts Dir.pwd
  Dir.chdir(matterhorn) do
    puts Dir.pwd
    BigBlueButton::MatterhornProcessor.zip_artifacts("audio.ogg", "video.flv", "deskshare.flv", "dublincore.xml", "manifest.xml", "tosend.zip")
  end
  puts Dir.pwd
end

Then /^uploaded to Matterhorn for ingestion$/ do
  pending # express the regexp above with the code you wish you had
end

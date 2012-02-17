require 'fileutils'

Given /^the raw recorded events$/ do
  @tmp_archive_dir = "/tmp/archive"
  if FileTest.directory?(@tmp_archive_dir)
    FileUtils.remove_dir @tmp_archive_dir
  end
  FileUtils.mkdir_p @tmp_archive_dir
  
  @meeting_id = "1b199e88-7df7-4842-a5f1-0e84b781c5c8"
  
  @raw_dir = "resources/raw/#{@meeting_id}" 
  FileUtils.cp_r(@raw_dir, @tmp_archive_dir)
end

Given /^the processed recorded audio$/ do
  pending # express the regexp above with the code you wish you had
end

Given /^the raw recorded video$/ do
  pending # express the regexp above with the code you wish you had
end

When /^processing the audio and video for playback$/ do
  pending # express the regexp above with the code you wish you had
end

Then /^the audio must be stripped from the raw video$/ do
  stripped_flv = "stripped.flv"
  strip_audio_from_video("webcam.flv", stripped_flv)
end

Then /^the video must be made the same length as the processed audio$/ do
  blank_canvas = "canvas.jpg"
  # Determine the width and height of the video
  create_blank_canvas(1280, 720, "white", blank_canvas)
  # Determine the paddings that need to be generated
  create_blank_video(15, 1000, blank_canvas, "blank1.flv")
  create_blank_video(4, 1000, blank_canvas, "blank2.flv")
  # Concatenate all videos
  concatenate_videos(["blank1.flv", "stripped.flv", "blank2.flv"], "concat-video.flv")
end

Then /^the processed audio multiplexed into the video$/ do
  multiplex_audio_and_video("audio.wav", "concat-video.flv", "processed-video.flv")
end





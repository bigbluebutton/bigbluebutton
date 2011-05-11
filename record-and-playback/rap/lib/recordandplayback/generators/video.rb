require 'rubygems'
require 'streamio-ffmpeg'

module BigBlueButton
  # Strips the audio stream from the video file
  #   video_in - the FLV file that needs to be stripped of audio
  #   video_out - the resulting FLV with the audio stripped
  # Example:
  #    strip_audio_from_video(orig-video.flv, video2.flv)
  def self.strip_audio_from_video(video_in, video_out)
    IO.popen("ffmpeg -i #{video_in} -an -vcodec copy #{video_out}")
    Process.wait
    # TODO: check for result, raise an exception when there is an error
  end

  # Create a blank video using Flash Screen Video codec of specific length
  #   length - length of blank video in seconds
  #   rate - the frame rate of the video
  #   blank_canvas - an image (JPG) used to generate the video frames
  #   video_out - the resulting blank video file
  #  Example:
  #   create_blank_video(15, 1000, canvas.jpg, blank-video.flv)
  def self.create_blank_deskshare_video(length, rate, blank_canvas, video_out)
    IO.popen("ffmpeg -loop_input -t #{length} -i #{blank_canvas} -r #{rate} -vcodec flashsv #{video_out}")
    Process.wait
    # TODO: check for result, raise exception when there is an error
  end

  # Create a blank video of specific length
  #   length - length of blank video in seconds
  #   rate - the frame rate of the video
  #   blank_canvas - an image (JPG) used to generate the video frames
  #   video_out - the resulting blank video file
  #  Example:
  #   create_blank_video(15, 1000, canvas.jpg, blank-video.flv)
  def self.create_blank_video(length, rate, blank_canvas, video_out)
    IO.popen("ffmpeg -loop_input -t #{length} -i #{blank_canvas} -r #{rate} #{video_out}")
    Process.wait
    # TODO: check for result, raise exception when there is an error
  end

  # Creates a blank image file with the specified dimension and color
  #   width - the width of the image
  #   height - the height of the image
  #   color - the color of the image
  #   out_file - the file of the resulting image
  # Example:
  #   create_blank_canvas(1280, 720, white, blank_canvas.jpg)
  def self.create_blank_canvas(width, height, color, out_file)
    IO.popen("convert -size #{width}x#{height} xc:#{color} #{out_file}")
    Process.wait
    # TODO: check for result, raise an exception when there is an error
  end

  # Concatenates several videos into one video
  #   videos_in - an array of videos that need to be concatenated. The videos
  #               will be concatenated based on their order in the array.
  #   video_out - the concatenated video
  #                
  def self.concatenate_videos(videos_in, video_out)
    videos = " "
    videos_in.each { |v| videos << "#{v} "}
    puts "combining #{videos}"
    command = "mencoder -forceidx -of lavf -oac copy -ovc copy -o #{video_out} #{videos}"
    puts command
    IO.popen("mencoder -forceidx -of lavf -oac copy -ovc copy -o #{video_out} #{videos}")
    Process.wait
    # TODO: check result, raise exception on failure
  end

  # Multiplexes an audio and video
  #  audio - the audio file
  #  video - the video file. Must not contain an audio stream. 
  def self.multiplex_audio_and_video(audio, video, video_out)
    IO.popen("ffmpeg -i #{audio} -i #{video} -map 1:0 -map 0:0 -ar 22050 #{video_out}")
    Process.wait 
    # TODO: check result, raise an exception when there is an error
  end

  def self.get_video_height(video)
    FFMPEG::Movie.new(video).height
  end
  
  def self.get_video_width(video)
    FFMPEG::Movie.new(video).width
  end
  
  def self.get_video_duration(video)
    FFMPEG::Movie.new(video).duration
  end
  
  def self.get_video_bitrate(video)
    FFMPEG::Movie.new(video).bitrate
  end
  
  def self.get_video_framerate(video)
    FFMPEG::Movie.new(video).frame_rate
  end
end



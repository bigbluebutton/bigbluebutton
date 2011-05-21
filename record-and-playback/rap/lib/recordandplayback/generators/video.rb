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
    # This command hangs.
    #command = "mencoder -forceidx -of lavf -oac copy -ovc copy -o #{video_out} #{videos_in.join(' ')}"
    #BigBlueButton.execute(command)
    # Somehow, using the backtick works but not using popen.
    puts "mencoder -forceidx -of lavf -oac copy -ovc copy -o #{video_out} #{videos_in.join(' ')}"
    `mencoder -forceidx -of lavf -oac copy -ovc copy -o #{video_out} #{videos_in.join(' ')}`
  end

  # Multiplexes an audio and video
  #  audio - the audio file
  #  video - the video file. Must not contain an audio stream. 
  def self.multiplex_audio_and_video(audio, video, video_out)
    IO.popen("ffmpeg -i #{audio} -i #{video} -map 1:0 -map 0:0 -ar 22050 #{video_out}")
    Process.wait 
    # TODO: check result, raise an exception when there is an error
  end

  
  # Determine the video padding we need to generate.
  def self.generate_video_paddings(events, first_timestamp, last_timestamp)
    paddings = []
    events.sort! {|a,b| a[:start_timestamp] <=> b[:start_timestamp]}
        
    length_of_gap = events[0][:start_timestamp] - first_timestamp
    if  (length_of_gap > 0)
      paddings << {:start_timestamp => first_timestamp, :stop_timestamp => events[0][:start_timestamp] - 1, :gap => true, :stream => "blank-beginning.flv"}
    end
        
    i = 0
    while i < events.length - 1
      ar_prev = events[i]
      ar_next = events[i+1]
      length_of_gap = ar_next[:start_timestamp] - ar_prev[:stop_timestamp]
          
      if (length_of_gap > 0) 
        paddings << {:start_timestamp => ar_prev[:stop_timestamp] + 1, :stop_timestamp => ar_next[:start_timestamp] - 1, :gap => true, :stream => "blank-#{i}.flv"}
      end
          
      i += 1
    end
        
    length_of_gap = last_timestamp - events[-1][:stop_timestamp]
    if (length_of_gap > 0)
      paddings << {:start_timestamp => events[-1][:stop_timestamp] + 1, :stop_timestamp => last_timestamp - 1, :gap => true, :stream => "blank-end.flv"}
    end
        
    paddings
  end

  # Determine the deskshare padding we need to generate.
  def self.generate_deskshare_paddings(events, first_timestamp, last_timestamp)
    paddings = []
    events.sort! {|a,b| a[:start_timestamp] <=> b[:start_timestamp]}
        
    length_of_gap = events[0][:start_timestamp] - first_timestamp
    if  (length_of_gap > 0)
      paddings << {:start_timestamp => first_timestamp, :stop_timestamp => events[0][:start_timestamp] - 1, :gap => true, :stream => "ds-blank-beginning.flv"}
    end
        
    i = 0
    while i < events.length - 1
      ar_prev = events[i]
      ar_next = events[i+1]
      length_of_gap = ar_next[:start_timestamp] - ar_prev[:stop_timestamp]
          
      if (length_of_gap > 0) 
        paddings << {:start_timestamp => ar_prev[:stop_timestamp] + 1, :stop_timestamp => ar_next[:start_timestamp] - 1, :gap => true, :stream => "ds-blank-#{i}.flv"}
      end
          
      i += 1
    end
        
    length_of_gap = last_timestamp - events[-1][:stop_timestamp]
    if (length_of_gap > 0)
      paddings << {:start_timestamp => events[-1][:stop_timestamp] + 1, :stop_timestamp => last_timestamp - 1, :gap => true, :stream => "ds-blank-end.flv"}
    end
        
    paddings
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

  MAX_VID_WIDTH = 640
  MAX_VID_HEIGHT = 480
  
  # Calculate the anamorphic factor for this video.
  #   see http://howto-pages.org/ffmpeg/
  # We need to calculate how much we need to scale
  # the width and height to maintain a 4/3 aspect ratio
  def self.calc_anamorphic_factor(width, height)
    (4.0 * height) / (width * 3.0)
  end
  
  def self.portrait?(width, height)
     larger_than_max?(width, height) and (width < height)
  end
  
  def self.landscape?(width, height)
    larger_than_max?(width, height) and (width > height)
  end
  
  def self.larger_than_max?(width, height)
    (width > MAX_VID_WIDTH) and (height > MAX_VID_HEIGHT)
  end
  
  # Calculate the height of the video to maintain 4/3 aspect ratio.
  # We want to fit the video into 640/480 size. If we shrink the width (W)
  # of the video to 640, calculate the height (H) using the formula.
  #  (W/H)*(anamorphic_factor) = (4/3)
  #
  def self.calc_height(anamorphic_factor)
    (3 * MAX_VID_WIDTH * anamorphic_factor) / 4
  end
  
  # Calculate the width of the video to maintain 4/3 aspect ratio.
  # We want to fit the video into 640/480 size. If we shrink the height (H)
  # of the video to 480, calculate the width (W) using the formula.
  #  (W/H)*(anamorphic_factor) = (4/3)
  #
  def self.calc_width(anamorphic_factor)
    (4 * MAX_VID_HEIGHT) / (3 * anamorphic_factor)
  end
  
  # Determine if video is less that 640x480.
  def self.fits_640_by_480?(width, height)
    (width < MAX_VID_WIDTH) and (height < MAX_VID_HEIGHT)
  end  
   
  def self.scale_to_640_x_480(flv_in, flv_out)
    width = get_video_width(flv_in)
    height = get_video_height(flv_in)
    anamorphic_factor = calc_anamorphic_factor(width, height)
    puts "factor=#{anamorphic_factor}, width=#{width}, height=#{height}"
    if (fits_640_by_480?(width, height))
      # The raw media is smaller than 640x480. Pad the sides of video to fit 640x480.
      padding = "-vf pad=#{MAX_VID_WIDTH}:#{MAX_VID_HEIGHT}:#{(MAX_VID_WIDTH - width)/2}:#{(MAX_VID_HEIGHT - height)/2}:FFFFFF"
      command = "ffmpeg -i #{flv_in} -aspect 4:3 -r 1000 -sameq #{padding} -vcodec flashsv #{flv_out}" 
      puts command
      IO.popen(command)
      Process.wait
    elsif (width < MAX_VID_WIDTH) and (height > MAX_VID_HEIGHT) or (portrait?(width, height)
        # Fit the video vertically and adjust the width then pad it to fit into 640x480 video.
        c_width = calc_width(anamorphic_factor)
        padding = MAX_VID_WIDTH - c_width
        puts "w < mW and h > mH : padding=#{padding}, c_width=#{c_width}"
        command = "ffmpeg -i #{flv_in} -aspect 4:3 -r 1000 -sameq -s #{c_width.to_i}x#{MAX_VID_HEIGHT} -vf pad=#{MAX_VID_WIDTH}:#{MAX_VID_HEIGHT}:#{(padding/2).to_i}:0:FFFFFF -vcodec flashsv #{flv_out}" 
        puts command
        IO.popen(command)
        Process.wait       
    elsif (height < MAX_VID_HEIGHT) and (width > MAX_VID_WIDTH) or (landscape?(width, height)
        # Fit the video horizontally and adjust the height then pad the top and bottom to fit the 640x480 video.
        c_height = calc_height(anamorphic_factor)
        padding = MAX_VID_HEIGHT - c_height
        puts "w > mW and h < mH padding=#{padding}, c_height=#{c_height}"
        command = "ffmpeg -i #{flv_in} -aspect 4:3 -r 1000 -sameq -s #{MAX_VID_WIDTH}x#{c_height.to_i} -vf pad=#{MAX_VID_WIDTH}:#{MAX_VID_HEIGHT}:0:#{(padding/2).to_i}:FFFFFF -vcodec flashsv #{flv_out}" 
        puts command
        IO.popen(command)
        Process.wait          
    end
  end
end



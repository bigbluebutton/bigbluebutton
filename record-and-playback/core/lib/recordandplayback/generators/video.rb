require 'rubygems'
require 'streamio-ffmpeg'

module BigBlueButton
  # Strips the audio stream from the video file
  #   video_in - the FLV file that needs to be stripped of audio
  #   video_out - the resulting FLV with the audio stripped
  # Example:
  #    strip_audio_from_video(orig-video.flv, video2.flv)
  def self.strip_audio_from_video(video_in, video_out)
    command = "ffmpeg -i #{video_in} -an -vcodec copy #{video_out}"
    BigBlueButton.logger.info(command)
    IO.popen(command)
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
    command = "ffmpeg -loop_input -t #{length} -i #{blank_canvas} -r #{rate} -vcodec flashsv #{video_out}"
    BigBlueButton.logger.info(command)
    IO.popen(command)
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
    command = "ffmpeg -loop_input -t #{length} -i #{blank_canvas} -r #{rate} #{video_out}"
    BigBlueButton.logger.info(command)
    IO.popen(command)
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
    command = "convert -size #{width}x#{height} xc:#{color} #{out_file}"
    BigBlueButton.logger.info(command)
    IO.popen(command)
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
    BigBlueButton.logger.info("mencoder -forceidx -of lavf -oac copy -ovc copy -o #{video_out} #{videos_in.join(' ')}")
    `mencoder -forceidx -of lavf -oac copy -ovc copy -o #{video_out} #{videos_in.join(' ')}`
  end

  # Multiplexes an audio and video
  #  audio - the audio file
  #  video - the video file. Must not contain an audio stream. 
  def self.multiplex_audio_and_video(audio, video, video_out)
    command = "ffmpeg -i #{audio} -i #{video} -map 1:0 -map 0:0 -ar 22050 #{video_out}"
    BigBlueButton.logger.info(command)
    IO.popen(command)
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
  
  # Is the video orientation in portrait mode?
  def self.portrait?(width, height)
     larger_than_max?(width, height) and (width < height)
  end
  
  # Is the video orientation in landscape mode?
  def self.landscape?(width, height)
    larger_than_max?(width, height) and (width > height)
  end
  
  # Is the video width and height bigger than 640x480?
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
  
  # Determine the width and height of the video that fits
  # within 640x480 while maintaining aspect ratio.
  def self.fit_to_640_by_480(width, height)
    anamorphic_factor = calc_anamorphic_factor(width, height)
    if (width < MAX_VID_WIDTH) and (height > MAX_VID_HEIGHT)  
      # Fit the video vertically and adjust the width then pad it to fit into 640x480 video.
      width = calc_width(anamorphic_factor)
      height = MAX_VID_HEIGHT
    elsif (height < MAX_VID_HEIGHT) and (width > MAX_VID_WIDTH) 
      # Fit the video horizontally and adjust the height then pad the top and bottom to fit the 640x480 video.
      height = calc_height(anamorphic_factor)
      width = MAX_VID_WIDTH
    else
      height = calc_height(anamorphic_factor)
      width = calc_width(anamorphic_factor)    
    end   
    {:width => width.to_i, :height => height.to_i}    
  end
  
  # Scale the video to 640x480 or smaller
  def self.scale_to_640_x_480(width, height)
    if not fits_640_by_480?(width, height)
      while (width > MAX_VID_WIDTH or height > MAX_VID_HEIGHT)
        scaled_vid = fit_to_640_by_480(width, height)
        width = scaled_vid[:width]
        height = scaled_vid[:height]
      end   
    end   
    {:width => width, :height => height} 
  end
  
  def self.fit_to_screen_size(width, height, flv_in, flv_out)
    frame_size = "-s #{width}x#{height}"
    side_padding = ((MAX_VID_WIDTH - width) / 2).to_i
    top_bottom_padding = ((MAX_VID_HEIGHT - height) / 2).to_i
    padding = "-vf pad=#{MAX_VID_WIDTH}:#{MAX_VID_HEIGHT}:#{side_padding}:#{top_bottom_padding}:FFFFFF"
    command = "ffmpeg -i #{flv_in} -aspect 4:3 -r 1000 -sameq #{frame_size} #{padding} -vcodec flashsv #{flv_out}" 
    BigBlueButton.logger.info(command)
    IO.popen(command)
    Process.wait              
  end

  def self.process_webcam(target_dir, temp_dir, meeting_id) 
    # Process audio
    BigBlueButton::AudioProcessor.process("#{temp_dir}/#{meeting_id}", "#{target_dir}/audio.ogg")

    # Process video    
    video_dir = "#{temp_dir}/#{meeting_id}/video/#{meeting_id}"
    blank_canvas = "#{temp_dir}/canvas.jpg"
    BigBlueButton.create_blank_canvas(MAX_VID_WIDTH, MAX_VID_HEIGHT, "white", blank_canvas)
            
    events_xml = "#{temp_dir}/#{meeting_id}/events.xml"
    first_timestamp = BigBlueButton::Events.first_event_timestamp(events_xml)
    last_timestamp = BigBlueButton::Events.last_event_timestamp(events_xml)        
    start_evt = BigBlueButton::Events.get_start_video_events(events_xml)
    stop_evt = BigBlueButton::Events.get_stop_video_events(events_xml)               
    matched_evts = BigBlueButton::Events.match_start_and_stop_video_events(start_evt, stop_evt)        
    
    paddings = BigBlueButton.generate_video_paddings(matched_evts, first_timestamp, last_timestamp)
        
    webcams = []
    paddings.concat(matched_evts).sort{|a,b| a[:start_timestamp] <=> b[:start_timestamp]}.each do |comb|
      if (comb[:gap])
        webcams << "#{temp_dir}/#{comb[:stream]}"
        BigBlueButton.create_blank_video((comb[:stop_timestamp] - comb[:start_timestamp])/1000, 1000, blank_canvas, "#{temp_dir}/#{comb[:stream]}")
      else
        stripped_webcam = "#{temp_dir}/stripped-wc-#{comb[:stream]}.flv"
        BigBlueButton.strip_audio_from_video("#{video_dir}/#{comb[:stream]}.flv", stripped_webcam)
        flv_out = "#{temp_dir}/#{meeting_id}/scaled-wc-#{comb[:stream]}"
        webcams << flv_out
        frame_size = BigBlueButton.scale_to_640_x_480(BigBlueButton.get_video_width(stripped_webcam), BigBlueButton.get_video_height(stripped_webcam))
        BigBlueButton.fit_to_screen_size(frame_size[:width], frame_size[:height], stripped_webcam, flv_out)         
      end
    end
               
    concat_vid = "#{target_dir}/webcam.flv"
    BigBlueButton.concatenate_videos(webcams, concat_vid)        
    BigBlueButton.multiplex_audio_and_video("#{target_dir}/audio.ogg", concat_vid, "#{target_dir}/muxed-audio-webcam.flv")   
  end
  
  def self.process_deskstop_sharing(target_dir, temp_dir, meeting_id)                
    blank_canvas = "#{temp_dir}/ds-canvas.jpg"
    BigBlueButton.create_blank_canvas(MAX_VID_WIDTH, MAX_VID_HEIGHT, "white", blank_canvas)
    
    events_xml = "#{temp_dir}/#{meeting_id}/events.xml"
    first_timestamp = BigBlueButton::Events.first_event_timestamp(events_xml)
    last_timestamp = BigBlueButton::Events.last_event_timestamp(events_xml)
        
    start_evts = BigBlueButton::Events.get_start_deskshare_events(events_xml)
    stop_evts = BigBlueButton::Events.get_stop_deskshare_events(events_xml)
        
    matched_evts = BigBlueButton::Events.match_start_and_stop_video_events(start_evts, stop_evts)        
    paddings = BigBlueButton.generate_deskshare_paddings(matched_evts, first_timestamp, last_timestamp)
        
    flvs = []
    paddings.concat(matched_evts).sort{|a,b| a[:start_timestamp] <=> b[:start_timestamp]}.each do |comb|
      if (comb[:gap])
        flvs << "#{temp_dir}/#{comb[:stream]}"
        BigBlueButton.create_blank_deskshare_video((comb[:stop_timestamp] - comb[:start_timestamp])/1000, 1000, blank_canvas, "#{temp_dir}/#{comb[:stream]}")
      else
        flvs << "#{temp_dir}/#{meeting_id}/deskshare/scaled-#{comb[:stream]}"
        flv_in = "#{temp_dir}/#{meeting_id}/deskshare/#{comb[:stream]}"
        flv_out = "#{temp_dir}/#{meeting_id}/deskshare/scaled-#{comb[:stream]}"
        frame_size = BigBlueButton.scale_to_640_x_480(BigBlueButton.get_video_width(flv_in), BigBlueButton.get_video_height(flv_in))
        BigBlueButton.fit_to_screen_size(frame_size[:width], frame_size[:height], flv_in, flv_out)            
      end
    end
               
    BigBlueButton.concatenate_videos(flvs, "#{target_dir}/deskshare.flv")   
  end
  
end



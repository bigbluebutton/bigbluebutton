# Set encoding to utf-8
# encoding: UTF-8

#
# BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
#
# Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
#
# This program is free software; you can redistribute it and/or modify it under the
# terms of the GNU Lesser General Public License as published by the Free Software
# Foundation; either version 3.0 of the License, or (at your option) any later
# version.
#
# BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
# PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License along
# with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
#


require 'rubygems'
require 'streamio-ffmpeg'
require 'pp'

module BigBlueButton
  # use "info" or "debug" for development
  FFMPEG_LOG_LEVEL = "fatal"

  # Strips the audio stream from the video file
  #   video_in - the FLV file that needs to be stripped of audio
  #   video_out - the resulting FLV with the audio stripped
  # Example:
  #    strip_audio_from_video(orig-video.flv, video2.flv)
  def self.strip_audio_from_video(video_in, video_out)
    BigBlueButton.logger.info("Task: Stripping audio from video")      
    command = "ffmpeg -y -i #{video_in} -loglevel #{BigBlueButton::FFMPEG_LOG_LEVEL} -an -vcodec copy -sameq #{video_out}"
    BigBlueButton.execute(command)
    # TODO: check for result, raise an exception when there is an error
  end
  
  # Generates a new video file given a start point and a duration
  #   start - start point of the video_in, in milisseconds
  #   duration - duration of the new video file, in milisseconds
  #   video_in - the video to be used as base
  #   video_out - the resulting new video
  def self.trim_video(start, duration, video_in, video_out)
    BigBlueButton.logger.info("Task: Trimming video")
    command = ""
    if duration != (BigBlueButton.get_video_duration(video_in) * 1000).to_i
      # -ss coming before AND after the -i option improves the precision ==> http://ffmpeg.org/pipermail/ffmpeg-user/2012-August/008767.html
      command = "ffmpeg -y -ss #{BigBlueButton.ms_to_strtime(start)} -i #{video_in} -loglevel #{BigBlueButton::FFMPEG_LOG_LEVEL} -vcodec copy -acodec copy -ss 0 -t #{BigBlueButton.ms_to_strtime(duration)} -sameq #{video_out}"
    else
      BigBlueButton.logger.info("The video has exactly the same duration as requested, so it will be just copied")
      command = "ffmpeg -y -i #{video_in} -loglevel #{BigBlueButton::FFMPEG_LOG_LEVEL} -vcodec copy -acodec copy -sameq #{video_out}"
    end
    BigBlueButton.execute(command)  
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
    BigBlueButton.logger.info("Task: Creating blank deskshare video")      
    loop_param = (`ffmpeg -version | grep ffmpeg | cut -d ' ' -f3`).chomp.eql?("0.11.2") ? "-loop 1" : "-loop_input"
    command = "ffmpeg -y #{loop_param} -t #{length} -i #{blank_canvas} -loglevel #{BigBlueButton::FFMPEG_LOG_LEVEL} -v -10 -r #{rate} -vcodec flashsv #{video_out}"
    BigBlueButton.execute(command)
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
    BigBlueButton.logger.info("Task: Creating blank video")      
    loop_param = (`ffmpeg -version | grep ffmpeg | cut -d ' ' -f3`).chomp.eql?("0.11.2") ? "-loop 1" : "-loop_input"
    command = "ffmpeg -y #{loop_param} -t #{length} -i #{blank_canvas} -loglevel #{BigBlueButton::FFMPEG_LOG_LEVEL} -v -10 -r #{rate} #{video_out}"
    BigBlueButton.execute(command)
    # TODO: check for result, raise exception when there is an error
  end
  
  def self.create_blank_video_ms(length, rate, blank_canvas, video_out)
    BigBlueButton.create_blank_video(BigBlueButton.ms_to_strtime(length), rate, blank_canvas, video_out)
  end

  # Creates a blank image file with the specified dimension and color
  #   width - the width of the image
  #   height - the height of the image
  #   color - the color of the image
  #   out_file - the file of the resulting image
  # Example:
  #   create_blank_canvas(1280, 720, white, blank_canvas.jpg)
  def self.create_blank_canvas(width, height, color, out_file)
    BigBlueButton.logger.info("Task: Creating blank canvas")      
    command = "convert -size #{width}x#{height} xc:#{color} #{out_file}"
    BigBlueButton.execute(command)
    # TODO: check for result, raise an exception when there is an error
  end

  # Concatenates several videos into one video
  #   videos_in - an array of videos that need to be concatenated. The videos
  #               will be concatenated based on their order in the array.
  #   video_out - the concatenated video
  #                
  def self.concatenate_videos(videos_in, video_out)
    BigBlueButton.logger.info("Task: Concatenating videos")      
    # This command hangs.
    #command = "mencoder -forceidx -of lavf -oac copy -ovc copy -o #{video_out} #{videos_in.join(' ')}"
    #BigBlueButton.execute(command)
    # Somehow, using the backtick works but not using popen.
    #BigBlueButton.logger.info("mencoder -forceidx -of lavf -oac copy -ovc copy -o #{video_out} #{videos_in.join(' ')}")
    #`mencoder -forceidx -of lavf -oac copy -ovc copy -o #{video_out} #{videos_in.join(' ')}`
    #Converting .flv input videos to .mpg and then concatenating them also works using popen.
   
    #Create .mpg files
    mpgs = []
    videos_in.each do |flv|
        if File.extname(flv) == ".mpg"
            mpg = flv
        else
            mpg = "#{flv}.mpg"
            BigBlueButton.convert_flv_to_mpg(flv,mpg)
        end
        mpgs << mpg
    end
    
	target_dir = File.dirname("#{video_out}")

	#Concatenate mpg files
	BigBlueButton.concatenate_mpg_files(mpgs,"#{target_dir}/concatenated.mpg")
    
	#Convert mpg to flv
	BigBlueButton.convert_mpg_to_flv("#{target_dir}/concatenated.mpg", video_out)

  end

  #Converts flv to mpg
  def self.convert_flv_to_mpg(flv_video, mpg_video_out)
        command = "ffmpeg -y -i #{flv_video} -loglevel #{BigBlueButton::FFMPEG_LOG_LEVEL} -v -10 -sameq -f mpegts -r 29.97 #{mpg_video_out}"
        BigBlueButton.logger.info("Task: Converting .flv to .mpg")    
        BigBlueButton.execute(command)
  end

  #Concatenates mpg files
  def self.concatenate_mpg_files(videos_in, mpg_video_out)        
  	command = "cat #{videos_in.join(' ')} >  #{mpg_video_out}"
        BigBlueButton.logger.info("Task: Concatenating .mpg files")
        BigBlueButton.execute(command);
  end

  #Converts .mpg to .flv
  def self.convert_mpg_to_flv(mpg_video,flv_video_out)
        command = "ffmpeg -y -i  #{mpg_video} -loglevel #{BigBlueButton::FFMPEG_LOG_LEVEL} -v -10 -sameq  #{flv_video_out}"
        BigBlueButton.logger.info("Task: Converting .mpg to .flv")
        BigBlueButton.execute(command);
  end


  # Multiplexes an audio and video
  #  audio - the audio file
  #  video - the video file. Must not contain an audio stream. 
  def self.multiplex_audio_and_video(audio, video, video_out)
    BigBlueButton.logger.info("Task: Multiplexing audio and video")      
    command = "ffmpeg -y -i #{audio} -i #{video} -loglevel #{BigBlueButton::FFMPEG_LOG_LEVEL} -v -10 -map 1:0 -map 0:0 -ar 22050 #{video_out}"
    BigBlueButton.execute(command)
    # TODO: check result, raise an exception when there is an error
  end

  
  # Determine the video padding we need to generate.
  def self.generate_video_paddings(events, first_timestamp, last_timestamp)
    BigBlueButton.logger.info("Task: Generating video paddings")      
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
    BigBlueButton.logger.info("Task: Generating deskshare paddings")      
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
    BigBlueButton.logger.info("Task: Calculating anamorphic factor of video")      
    (4.0 * height) / (width * 3.0)
  end
  
  # Is the video orientation in portrait mode?
  def self.portrait?(width, height)
     BigBlueButton.logger.info("Task: Determining if the video orientation in portrait mode")         
     larger_than_max?(width, height) and (width < height)
  end
  
  # Is the video orientation in landscape mode?
  def self.landscape?(width, height)
    BigBlueButton.logger.info("Task: Determining if the video orientation in landscape mode")         
    larger_than_max?(width, height) and (width > height)
  end
  
  # Is the video width and height bigger than 640x480?
  def self.larger_than_max?(width, height)
    BigBlueButton.logger.info("Task: Determining if the video width and height bigger than max values")         
    (width > MAX_VID_WIDTH) and (height > MAX_VID_HEIGHT)
  end
  
  # Calculate the height of the video to maintain 4/3 aspect ratio.
  # We want to fit the video into 640/480 size. If we shrink the width (W)
  # of the video to 640, calculate the height (H) using the formula.
  #  (W/H)*(anamorphic_factor) = (4/3)
  #
  def self.calc_height(anamorphic_factor)
    BigBlueButton.logger.info("Task: Calculating height of video to maintain 4/3 aspect ratio")         
    (3 * MAX_VID_WIDTH * anamorphic_factor) / 4
  end
  
  # Calculate the width of the video to maintain 4/3 aspect ratio.
  # We want to fit the video into 640/480 size. If we shrink the height (H)
  # of the video to 480, calculate the width (W) using the formula.
  #  (W/H)*(anamorphic_factor) = (4/3)
  #
  def self.calc_width(anamorphic_factor)
    BigBlueButton.logger.info("Task: Calculating width of video to maintain 4/3 aspect ratio")         
    (4 * MAX_VID_HEIGHT) / (3 * anamorphic_factor)
  end
  
  # Determine if video is less that 640x480.
  def self.fits_640_by_480?(width, height)
    BigBlueButton.logger.info("Task: Determine if video is less that max width and height")         
    (width < MAX_VID_WIDTH) and (height < MAX_VID_HEIGHT)
  end  
  
  # Determine the width and height of the video that fits
  # within 640x480 while maintaining aspect ratio.
  def self.fit_to_640_by_480(width, height)
    BigBlueButton.logger.info("Fitting the video to the max width and height")
    anamorphic_factor = calc_anamorphic_factor(width, height)
    if (width <= MAX_VID_WIDTH) and (height > MAX_VID_HEIGHT)  
      # Fit the video vertically and adjust the width then pad it to fit into 640x480 video.
      width = calc_width(anamorphic_factor)
      height = MAX_VID_HEIGHT
    elsif (height <= MAX_VID_HEIGHT) and (width > MAX_VID_WIDTH) 
      # Fit the video horizontally and adjust the height then pad the top and bottom to fit the 640x480 video.
      height = calc_height(anamorphic_factor)
      width = MAX_VID_WIDTH
    else
      if (height > width)
        width = calc_width(anamorphic_factor)
        height = MAX_VID_HEIGHT
      elsif (width >= height)
        height = calc_height(anamorphic_factor)
        width = MAX_VID_WIDTH
      end
    end   
    {:width => width.to_i, :height => height.to_i}    
  end
  
  def self.fit_to(width, height, fit_width, fit_height)
    BigBlueButton.logger.info("Fitting the video resolution from #{width}x#{height} to #{fit_width}x#{fit_height}")
    aspect_ratio = width / height.to_f
    if fit_width / fit_height.to_f > aspect_ratio
      height = fit_height
      width = height * aspect_ratio
    else
      width = fit_width
      height = width / aspect_ratio
    end
    BigBlueButton.logger.info("Best fit width #{width.to_i} height #{height.to_i}")
    {:width => width.to_i, :height => height.to_i}    
  end
  
  # Scale the video to 640x480 or smaller
  def self.scale_to_640_x_480(width, height)
    BigBlueButton.logger.info("Scaling the video to the max width and height")
    if not fits_640_by_480?(width, height)
      while (width > MAX_VID_WIDTH or height > MAX_VID_HEIGHT)
        scaled_vid = fit_to_640_by_480(width, height)
        width = scaled_vid[:width]
        height = scaled_vid[:height]
      end   
    end   
    {:width => width, :height => height} 
  end
  
  def self.process_webcam(target_dir, temp_dir, meeting_id) 
    BigBlueButton.logger.info("Processing webcam")
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
      	blank_flv = "#{temp_dir}/#{comb[:stream]}"
        webcams << blank_flv
        BigBlueButton.create_blank_video((comb[:stop_timestamp] - comb[:start_timestamp].to_f)/1000.0, 1000, blank_canvas, blank_flv)
      else
        stripped_webcam = "#{temp_dir}/stripped-wc-#{comb[:stream]}.flv"
        BigBlueButton.strip_audio_from_video("#{video_dir}/#{comb[:stream]}.flv", stripped_webcam)
        scaled_flv = "#{temp_dir}/#{meeting_id}/scaled-wc-#{comb[:stream]}.flv"
        webcams << scaled_flv
        frame_size = BigBlueButton.scale_to_640_x_480(BigBlueButton.get_video_width(stripped_webcam), BigBlueButton.get_video_height(stripped_webcam))
  
        width = frame_size[:width]
        height = frame_size[:height]
        
     		frame_size = "-s #{width}x#{height}"
    		side_padding = ((MAX_VID_WIDTH - width) / 2).to_i
    		top_bottom_padding = ((MAX_VID_HEIGHT - height) / 2).to_i
 
   			# Use for newer version of FFMPEG
    		padding = "-vf pad=#{MAX_VID_WIDTH}:#{MAX_VID_HEIGHT}:#{side_padding}:#{top_bottom_padding}:FFFFFF"       
		    command = "ffmpeg -y -i #{stripped_webcam} -loglevel #{BigBlueButton::FFMPEG_LOG_LEVEL} -v -10 -aspect 4:3 -r 1000 -sameq #{frame_size} #{padding} #{scaled_flv}" 
		    #BigBlueButton.logger.info(command)
		    #IO.popen(command)
		    #Process.wait                
		    BigBlueButton.execute(command)	
      end
    end
               
    concat_vid = "#{target_dir}/webcam.flv"
    BigBlueButton.concatenate_videos(webcams, concat_vid)        
    BigBlueButton.multiplex_audio_and_video("#{target_dir}/audio.ogg", concat_vid, "#{target_dir}/muxed-audio-webcam.flv")   
  end
  
  def self.process_deskstop_sharing(target_dir, temp_dir, meeting_id) 
    BigBlueButton.logger.info("Processing desktop sharing")               
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
      	blank_flv = "#{temp_dir}/#{comb[:stream]}"
        flvs << blank_flv
        BigBlueButton.create_blank_deskshare_video((comb[:stop_timestamp] - comb[:start_timestamp].to_f)/1000, 1000, blank_canvas, blank_flv)
      else
      	scaled_flv = "#{temp_dir}/#{meeting_id}/deskshare/scaled-#{comb[:stream]}"
        flvs << scaled_flv
        flv_in = "#{temp_dir}/#{meeting_id}/deskshare/#{comb[:stream]}"
        frame_size = BigBlueButton.scale_to_640_x_480(BigBlueButton.get_video_width(flv_in), BigBlueButton.get_video_height(flv_in))

        width = frame_size[:width]
        height = frame_size[:height]
        
     		frame_size = "-s #{width}x#{height}"
    		side_padding = ((MAX_VID_WIDTH - width) / 2).to_i
    		top_bottom_padding = ((MAX_VID_HEIGHT - height) / 2).to_i
 
   			# Use for newer version of FFMPEG
    		padding = "-vf pad=#{MAX_VID_WIDTH}:#{MAX_VID_HEIGHT}:#{side_padding}:#{top_bottom_padding}:FFFFFF"       
		    command = "ffmpeg -y -i #{flv_in} -loglevel #{BigBlueButton::FFMPEG_LOG_LEVEL} -v -10 -aspect 4:3 -r 1000 -sameq #{frame_size} #{padding} -vcodec flashsv #{scaled_flv}" 
		    BigBlueButton.execute(command)
		    #BigBlueButton.logger.info(command)
		    #IO.popen(command)
		    #Process.wait 
      end
    end
               
    BigBlueButton.concatenate_videos(flvs, "#{target_dir}/deskshare.flv")   
  end
  
  # Converts a time in milisseconds to a format that FFmpeg understands
  #   ms - time in milisseconds
  # Example:
  #   ms_to_strtime(1000)
  # Output:
  #   00:00:01.000
  def self.ms_to_strtime(ms)
    t = Time.at(ms / 1000, (ms % 1000) * 1000)
    return t.getutc.strftime("%H:%M:%S.%L")
  end

  def self.hash_to_str(hash)
    return PP.pp(hash, "")
  end

  def self.calculate_videos_grid(videos_list, details, output_video)
    # try to find the number of rows and columns to maximize the internal videos
    each_row = 0
    num_rows = 0
    slot_width = 0
    slot_height = 0
    total_area = 0
    num_cams = videos_list.length
    for tmp_num_rows in 1..(num_cams)
      tmp_each_row = (num_cams / tmp_num_rows.to_f).ceil
      max_width = (output_video[:width] / tmp_each_row).floor
      max_height = (output_video[:height] / tmp_num_rows).floor
      if max_width <= 0 or max_height <= 0 then
        next
      end
      
      tmp_total_area = 0
      videos_list.each do |stream|
        measurements = BigBlueButton.fit_to(details[stream][:width], details[stream][:height], max_width, max_height)
        tmp_total_area += measurements[:width] * measurements[:height]
      end
      
      if tmp_total_area > total_area
        slot_width = max_width
        slot_height = max_height
        num_rows = tmp_num_rows
        each_row = tmp_each_row
        total_area = tmp_total_area
      end
    end

    return {
      :rows => num_rows,
      :columns => each_row,
      :cell_width => slot_width,
      :cell_height => slot_height
    }
  end

  def self.calculate_video_position_and_size(videos_list, details, output_video, grid)
    transformation = Hash.new
    videos_list.each_with_index do |stream, index|
      video_dimensions = BigBlueButton.fit_to(details[stream][:width], details[stream][:height], grid[:cell_width], grid[:cell_height])
      slot_x = (index%grid[:columns])       * grid[:cell_width]  + (output_video[:width]  - grid[:cell_width]  * grid[:columns]) / 2
      slot_y = (index/grid[:columns]).floor * grid[:cell_height] + (output_video[:height] - grid[:cell_height] * grid[:rows]) / 2
      x = slot_x + (grid[:cell_width]  - video_dimensions[:width])  / 2
      y = slot_y + (grid[:cell_height] - video_dimensions[:height]) / 2

      transformation[stream] = {
        :x => x,
        :y => y,
        :width => video_dimensions[:width],
        :height => video_dimensions[:height]
      }
    end
    return transformation
  end

  def self.get_video_dir(temp_dir, meeting_id, type="video")
    dir = nil
    if type == "video"
      dir = "#{temp_dir}/#{meeting_id}/video/#{meeting_id}"
    elsif type == "deskshare"
      dir = "#{temp_dir}/#{meeting_id}/deskshare"
    end
    return dir
  end

  def BigBlueButton.process_multiple_videos(target_dir, temp_dir, meeting_id, output_width, output_height, audio_offset, include_deskshare=false)
    BigBlueButton.logger.info("Processing webcam videos")

    # Process audio
    BigBlueButton::AudioProcessor.process("#{temp_dir}/#{meeting_id}", "#{target_dir}/audio.ogg")

    # Process video
    events_xml = "#{temp_dir}/#{meeting_id}/events.xml"
    first_timestamp = BigBlueButton::Events.first_event_timestamp(events_xml)
    last_timestamp = BigBlueButton::Events.last_event_timestamp(events_xml)        
    start_evt = BigBlueButton::Events.get_start_video_events(events_xml)
    stop_evt = BigBlueButton::Events.get_stop_video_events(events_xml)

    start_evt.each {|evt| evt[:stream_type] = "video"}
    stop_evt.each {|evt| evt[:stream_type] = "video"}
    if include_deskshare
      start_deskshare_evt = BigBlueButton::Events.get_start_deskshare_events(events_xml)
      stop_deskshare_evt = BigBlueButton::Events.get_stop_deskshare_events(events_xml)
      start_deskshare_evt.each {|evt| evt[:stream_type] = "deskshare"}
      stop_deskshare_evt.each {|evt| evt[:stream_type] = "deskshare"}
      start_evt = start_evt + start_deskshare_evt
      stop_evt = stop_evt + stop_deskshare_evt
    end

    (start_evt + stop_evt).each do |evt|
      ext = File.extname(evt[:stream])
      ext = ".flv" if ext.empty?
      evt[:file_extension] = ext
      # removes the file extension from :stream
      evt[:stream].chomp!(File.extname(evt[:stream]))
      evt[:stream_file_name] = evt[:stream] + evt[:file_extension]
    end

    # fix the stop events list so the matched events will be consistent
    start_evt.each do |evt|
      video_dir = get_video_dir(temp_dir, meeting_id, evt[:stream_type])
      if stop_evt.select{ |s| s[:stream] == evt[:stream] }.empty?
        new_event = { 
          :stream => evt[:stream],
          :stop_timestamp => evt[:start_timestamp] + (BigBlueButton.get_video_duration("#{video_dir}/#{evt[:stream_file_name]}") * 1000).to_i
        }
        BigBlueButton.logger.debug("Adding stop event: #{new_event}")
        stop_evt << new_event
      end
    end
    
    # fix the start events list so the matched events will be consistent
    stop_evt.each do |evt|
      if start_evt.select{ |s| s[:stream] == evt[:stream] }.empty?
        new_event = {
          :stream => evt[:stream],
          :start_timestamp => evt[:stop_timestamp] - (BigBlueButton.get_video_duration("#{video_dir}/#{evt[:stream]}.flv") * 1000).to_i
        }
        BigBlueButton.logger.debug("Adding stop event: #{new_event}")
        start_evt << new_event
      end
    end

    matched_evts = BigBlueButton::Events.match_start_and_stop_video_events(start_evt, stop_evt)

    BigBlueButton.logger.debug("First timestamp: #{first_timestamp}")
    BigBlueButton.logger.debug("Last timestamp: #{last_timestamp}")
    BigBlueButton.logger.debug("Matched events:")
    BigBlueButton.logger.debug(hash_to_str(matched_evts))

    video_streams = Hash.new

    matched_evts.each do |evt|
      video_dir = BigBlueButton.get_video_dir(temp_dir, meeting_id, evt[:stream_type])
      # removes audio stream
      stripped_webcam = "#{temp_dir}/#{meeting_id}/stripped-#{evt[:stream]}.flv"
      BigBlueButton.strip_audio_from_video("#{video_dir}/#{evt[:stream_file_name]}", stripped_webcam)

      # the encoder for Flash Screen Codec v2 doesn't work on the current version of FFmpeg, so trim doesn't work at all
      # in this step the desktop sharing file is re-encoded with Flash Screen Codec v1 so everything works fine
      if evt[:stream_type] == "deskshare"
        processed_deskshare = "#{temp_dir}/#{meeting_id}/stripped-#{evt[:stream]}_processed.flv"
        command = "ffmpeg -y -i #{stripped_webcam} -loglevel #{BigBlueButton::FFMPEG_LOG_LEVEL} -v -10 -vcodec flashsv -sameq #{processed_deskshare}"
        BigBlueButton.execute(command)
        stripped_webcam = processed_deskshare
      end

      video_stream = {
        :name => evt[:stream],
        :file => stripped_webcam,
        :duration => (BigBlueButton.get_video_duration(stripped_webcam) * 1000).to_i,
        :width => BigBlueButton.get_video_width(stripped_webcam),
        :height => BigBlueButton.get_video_height(stripped_webcam),
        :start => evt[:start_timestamp] - first_timestamp,
        :stop => evt[:stop_timestamp] - first_timestamp,
        :stream_type => evt[:stream_type]
      }
      video_stream[:start_error] = video_stream[:stop] - (video_stream[:start] + video_stream[:duration])
      # adjust the start_timestamp based on the video duration
      video_stream[:start] = video_stream[:start] + video_stream[:start_error]
      video_streams[video_stream[:name]] = video_stream
    end

    BigBlueButton.logger.debug("Video streams:")
    BigBlueButton.logger.debug(hash_to_str(video_streams))

    # if we include desktop sharing streams to the video, we will use the highest resolution as the output video resolution in order to preserve the quality of the desktop sharing
    deskshare_streams = video_streams.select{ |stream_name, stream_details| stream_details[:stream_type] == "deskshare" }
    if not deskshare_streams.empty?
      max = deskshare_streams.values().max_by {|stream| stream[:width] * stream[:height]}
      output_width = max[:width]
      output_height = max[:height]
      BigBlueButton.logger.debug("Modifying the output video resolution to #{output_width}x#{output_height}")
    end

    blank_color = "000000"
    blank_canvas = "#{temp_dir}/canvas.jpg"
    BigBlueButton.create_blank_canvas(output_width, output_height, "##{blank_color}", blank_canvas)

    # put all events in a single list in ascendent timestamp order
    all_events = []
    video_streams.each do |name, video_stream|
      { "start" => video_stream[:start], "stop" => video_stream[:stop] }.each do |type, timestamp|
        event = Hash.new
        event[:type] = type
        event[:timestamp] = timestamp
        event[:stream] = name
        all_events << event
      end
    end
    all_events.sort!{|a,b| a[:timestamp] <=> b[:timestamp]}

    BigBlueButton.logger.debug("All events:")
    BigBlueButton.logger.debug(hash_to_str(all_events))

    # create a single timeline of events, keeping for each interval which video streams are enabled
    timeline = [ { :timestamp => 0, :streams => [] } ]
    all_events.each do |event|
      new_event = { :timestamp => event[:timestamp], :streams => timeline.last[:streams].clone }
      if event[:type] == "start"
        new_event[:streams] << event[:stream]
      elsif event[:type] == "stop"
        new_event[:streams].delete(event[:stream])
      end
      timeline << new_event
    end
    timeline << { :timestamp => last_timestamp - first_timestamp, :streams => [] }

    BigBlueButton.logger.debug("Current timeline:")
    BigBlueButton.logger.debug(hash_to_str(timeline))

    # isolate the desktop sharing stream so while the presenter is sharing his screen, it will be the only video in the playback
    timeline.each do |evt|
      deskshare_streams = evt[:streams].select{ |stream_name| video_streams[stream_name][:stream_type] == "deskshare" }
      if not deskshare_streams.empty?
        evt[:streams] = deskshare_streams
      end
    end

    BigBlueButton.logger.debug("Timeline keeping desktop sharing isolated:")
    BigBlueButton.logger.debug(hash_to_str(timeline))

    # remove the consecutive events with the same streams list
    timeline_no_duplicates = []
    timeline.each do |evt|
      if timeline_no_duplicates.empty? or timeline_no_duplicates.last()[:streams].uniq.sort != evt[:streams].uniq.sort
        timeline_no_duplicates << evt
      end
    end
    timeline = timeline_no_duplicates

    BigBlueButton.logger.debug("Timeline with no duplicates:")
    BigBlueButton.logger.debug(hash_to_str(timeline))

    for i in 1..(timeline.length-1)
      current_event = timeline[i-1]
      next_event = timeline[i]

      current_event[:duration] = next_event[:timestamp] - current_event[:timestamp]
      current_event[:streams_detailed] = Hash.new
      current_event[:streams].each do |stream|
        current_event[:streams_detailed][stream] = {
          :begin => current_event[:timestamp] - video_streams[stream][:start],
          :end => current_event[:timestamp] - video_streams[stream][:start] + current_event[:duration]
        }
      end
      current_event[:grid] = calculate_videos_grid(current_event[:streams], video_streams, { :width => output_width, :height => output_height })
      current_event[:transformation] = calculate_video_position_and_size(current_event[:streams], video_streams, { :width => output_width, :height => output_height }, current_event[:grid])
    end
    # last_timestamp - first_timestamp is the actual duration of the entire meeting
    timeline.last()[:duration] = (last_timestamp - first_timestamp) - timeline.last()[:timestamp]
    timeline.pop() if timeline.last()[:duration] == 0

    BigBlueButton.logger.debug("Current timeline with details on streams:")
    BigBlueButton.logger.debug(hash_to_str(timeline))

    blank_duration_error = 0
    concat = []

    timeline.each do |event|
      blank_video = "#{temp_dir}/#{meeting_id}/blank_video_#{event[:timestamp]}.flv"

      # Here I evaluated the MSE between the blank video requested duration and the retrieved duration ranging the FPS and found 15 as the best value
      # Mean Squared Error over blank videos duration using k = 10: 32.62620320850205
      # Mean Squared Error over blank videos duration using k = 15: 4.742765771202899 <-- best value
      # Mean Squared Error over blank videos duration using k = 25: 7.874007874011811
      # Mean Squared Error over blank videos duration using k = 30: 7.874007874011811
      # Mean Squared Error over blank videos duration using k = 45: 16.33824567096903
      # Mean Squared Error over blank videos duration using k = 60: 16.33824567096903
      # Mean Squared Error over blank videos duration using k = 100: 29.06399919802359
      # Mean Squared Error over blank videos duration using k = 1000: 29.06399919802359
      BigBlueButton.create_blank_video_ms(event[:duration], 15, blank_canvas, blank_video)
      blank_duration_error = event[:duration] - (BigBlueButton.get_video_duration(blank_video) * 1000).to_i
      BigBlueButton.logger.info("Blank video duration needed: #{event[:duration]}; duration retrieved: #{(BigBlueButton.get_video_duration(blank_video) * 1000).to_i}; error: #{blank_duration_error}")

      filter = ""
      next_main = "0:0"

      event[:streams].each_with_index do |stream_name, index|
        trimmed_video = "#{temp_dir}/#{meeting_id}/#{stream_name}_#{event[:timestamp]}.flv"
        BigBlueButton.trim_video(event[:streams_detailed][stream_name][:begin], event[:duration], video_streams[stream_name][:file], trimmed_video)
        trimmed_duration_error = event[:duration] - (BigBlueButton.get_video_duration(trimmed_video) * 1000).to_i
        BigBlueButton.logger.info("Trimmed video duration needed: #{event[:duration]}; duration retrieved: #{(BigBlueButton.get_video_duration(trimmed_video) * 1000).to_i}; error: #{trimmed_duration_error}")

        current_main = next_main
        next_main = "out-#{Time.now.to_i}"

        filter += "; " if not filter.empty?
        filter += "movie=#{trimmed_video}, scale=#{event[:transformation][stream_name][:width]}:#{event[:transformation][stream_name][:height]}, setpts=PTS%+f/TB [#{stream_name}]; [#{current_main}][#{stream_name}] overlay=#{event[:transformation][stream_name][:x]}:#{event[:transformation][stream_name][:y]}" % (trimmed_duration_error/1000.to_f)
        filter += " [#{next_main}]" unless index == event[:streams].length - 1
      end
      filter = "-filter_complex \"#{filter}\"" unless filter.empty?

      patch_video = "#{temp_dir}/#{meeting_id}/patch_video_#{event[:timestamp]}.flv"
      command = "ffmpeg -y -i #{blank_video} -loglevel #{BigBlueButton::FFMPEG_LOG_LEVEL} -v -10 #{filter} -sameq #{patch_video}"
      BigBlueButton.execute(command)

      concat << patch_video
    end
    
    output = "#{temp_dir}/#{meeting_id}/output.flv"
=begin
    # This is probably the best solution to concatenate the videos, but the filter "concat" isn't available on this version of FFmpeg. Anyway, it could be used in the future.
    # There's also a concat demuxex on FFmpeg 1.1 and above http://ffmpeg.org/trac/ffmpeg/wiki/How%20to%20concatenate%20(join%2C%20merge)%20media%20files
#    filter_input = []
    input = []
    concat.each_with_index do |file,index|
      input << "-i #{file}"
#      filter_input << "[#{index}:0]"
    end
#    command = "ffmpeg #{input.join(' ')} -vcodec copy -sameq -filter_complex \"#{filter_input.join()} concat=n=#{input.length}:v=#{input.length}:a=0\" #{output}"
    command = "ffmpeg -y -f concat #{input.join(' ')} -vcodec copy -sameq #{output}"
    BigBlueButton.execute(command)
=end
    BigBlueButton.concatenate_videos(concat, output)

    # create webm video and mux audio
    command = "ffmpeg -itsoffset #{BigBlueButton.ms_to_strtime(audio_offset)} -i #{target_dir}/audio.ogg -i #{output} -loglevel #{BigBlueButton::FFMPEG_LOG_LEVEL} -v -10 -vcodec libvpx -b 1000k -threads 0 -map 1:0 -map 0:0 -ar 22050 #{target_dir}/webcams.webm"
    BigBlueButton.execute(command)

    recording_duration = last_timestamp - first_timestamp
    audio_duration = (BigBlueButton.get_video_duration("#{target_dir}/audio.ogg") * 1000).to_i
    video_duration = (BigBlueButton.get_video_duration(output) * 1000).to_i
    output_duration = (BigBlueButton.get_video_duration("#{target_dir}/webcams.webm") * 1000).to_i
    BigBlueButton.logger.debug("Recording duration: #{recording_duration}")
    BigBlueButton.logger.debug("Audio file duration: #{audio_duration}")
    BigBlueButton.logger.debug("Video file duration: #{video_duration}")
    BigBlueButton.logger.debug("Output file duration: #{output_duration}")
  end


 # Muxes audio with deskshare video
 # audio_file     : Audio of the recording
 # deskshare_file : Video of shared desktop of the recording

 def self.mux_audio_deskshare(target_dir, audio_file, deskshare_file)
  command = "ffmpeg -y -i #{audio_file} -i #{deskshare_file} -loglevel #{BigBlueButton::FFMPEG_LOG_LEVEL} -v -10 -vcodec flv -b 1000k -threads 0  -map 1:0 -map 0:0 -ar 22050 #{target_dir}/muxed_audio_deskshare.flv"
  BigBlueButton.execute(command)
  FileUtils.mv("#{target_dir}/muxed_audio_deskshare.flv","#{target_dir}/deskshare.flv")
 end

end



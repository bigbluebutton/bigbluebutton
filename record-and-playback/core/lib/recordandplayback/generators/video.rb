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

require File.expand_path('../../edl', __FILE__)

module BigBlueButton

  FFMPEG_CMD_BASE="ffmpeg -loglevel warning -nostats"

  # Strips the audio stream from the video file
  #   video_in - the FLV file that needs to be stripped of audio
  #   video_out - the resulting FLV with the audio stripped
  # Example:
  #    strip_audio_from_video(orig-video.flv, video2.flv)
  def self.strip_audio_from_video(video_in, video_out)
    BigBlueButton.logger.info("Task: Stripping audio from video")      
    command = "#{FFMPEG_CMD_BASE} -i #{video_in} -an -vcodec copy #{video_out}"
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
    command = "#{FFMPEG_CMD_BASE} -i #{video_in} -vcodec copy -acodec copy -ss #{BigBlueButton.ms_to_strtime(start)} -t #{BigBlueButton.ms_to_strtime(duration)} #{video_out}"
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
    command = "#{FFMPEG_CMD_BASE} -loop 1 -i #{blank_canvas} -t #{length} -r #{rate} -vcodec flashsv #{video_out}"
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
    command = "#{FFMPEG_CMD_BASE} -y -loop 1 -i #{blank_canvas} -t #{length} -r #{rate} #{video_out}"
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
        command = "#{FFMPEG_CMD_BASE} -i #{flv_video} -same_quant -f mpegts -r 29.97 #{mpg_video_out}"
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
        command = "#{FFMPEG_CMD_BASE} -i  #{mpg_video} -same_quant  #{flv_video_out}"
        BigBlueButton.logger.info("Task: Converting .mpg to .flv")
        BigBlueButton.execute(command);
  end


  # Multiplexes an audio and video
  #  audio - the audio file
  #  video - the video file. Must not contain an audio stream. 
  def self.multiplex_audio_and_video(audio, video, video_out)
    BigBlueButton.logger.info("Task: Multiplexing audio and video")      
    command = "#{FFMPEG_CMD_BASE} -i #{audio} -i #{video} -map 1:0 -map 0:0 #{video_out}"
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
		    command = "#{FFMPEG_CMD_BASE} -i #{stripped_webcam} -aspect 4:3 -r 1000 -same_quant #{frame_size} #{padding} #{scaled_flv}" 
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
		    command = "#{FFMPEG_CMD_BASE} -i #{flv_in} -aspect 4:3 -r 1000 -same_quant #{frame_size} #{padding} -vcodec flashsv #{scaled_flv}" 
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
  
  def BigBlueButton.process_multiple_videos(target_dir, temp_dir, meeting_id, output_width, output_height, audio_offset, include_deskshare=false)
    BigBlueButton.logger.info("Processing webcam videos")

    # Process audio
    audio_edl = BigBlueButton::AudioEvents.create_audio_edl(
      "#{temp_dir}/#{meeting_id}")
    BigBlueButton::EDL::Audio.dump(audio_edl)

    audio_file = BigBlueButton::EDL::Audio.render(
      audio_edl, "#{target_dir}/webcams")

    # Process video
    webcam_edl = BigBlueButton::Events.create_webcam_edl(
      "#{temp_dir}/#{meeting_id}")
    deskshare_edl = BigBlueButton::Events.create_deskshare_edl(
      "#{temp_dir}/#{meeting_id}")
    video_edl = BigBlueButton::EDL::Video.merge(webcam_edl, deskshare_edl)
    BigBlueButton::EDL::Video.dump(video_edl)

    layout = {
      :width => output_width, :height => output_height,
      :areas => [ { :name => :webcam, :x => 0, :y => 0,
        :width => output_width, :height => output_height } ]
    }
    if include_deskshare
      layout[:areas] += [ { :name => :deskshare, :x => 0, :y => 0,
        :width => output_width, :height => output_height, :pad => true } ]
    end
    video_file = BigBlueButton::EDL::Video.render(
      video_edl, layout, "#{target_dir}/webcams")

    formats = [
      {
        :extension => 'webm',
        :parameters => [
          [ '-c:v', 'libvpx', '-crf', '34', '-b:v', '60M',
            '-threads', '2', '-deadline', 'good', '-cpu-used', '3',
            '-c:a', 'libvorbis', '-b:a', '32K',
            '-f', 'webm' ]
        ]
      }
    ]
    formats.each do |format|
      filename = BigBlueButton::EDL::encode(
        audio_file, video_file, format, "#{target_dir}/webcams", audio_offset)
    end

  end


 # Muxes audio with deskshare video
 # audio_file     : Audio of the recording
 # deskshare_file : Video of shared desktop of the recording

 def self.mux_audio_deskshare(target_dir, audio_file, deskshare_file)
  command = "#{FFMPEG_CMD_BASE} -i #{audio_file} -i #{deskshare_file} -vcodec flv -b 1000k -threads 0  -map 1:0 -map 0:0 -ar 22050 #{target_dir}/muxed_audio_deskshare.flv"
  BigBlueButton.execute(command)
  FileUtils.mv("#{target_dir}/muxed_audio_deskshare.flv","#{target_dir}/deskshare.flv")
 end

end



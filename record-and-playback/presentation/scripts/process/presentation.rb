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

require '../../core/lib/recordandplayback'
require 'rubygems'
require 'trollop'
require 'yaml'

opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :default => '58f4a6b3-cd07-444d-8564-59116cb53974', :type => String
end

meeting_id = opts[:meeting_id]

# This script lives in scripts/archive/steps while properties.yaml lives in scripts/
props = YAML::load(File.open('../../core/scripts/bigbluebutton.yml'))
presentation_props = YAML::load(File.open('presentation.yml'))
presentation_props['audio_offset'] = 0 if presentation_props['audio_offset'].nil?
presentation_props['include_deskshare'] = false if presentation_props['include_deskshare'].nil?

recording_dir = props['recording_dir']
raw_archive_dir = "#{recording_dir}/raw/#{meeting_id}"



target_dir = "#{recording_dir}/process/presentation/#{meeting_id}"
if not FileTest.directory?(target_dir)
  FileUtils.mkdir_p "/var/log/bigbluebutton/presentation"
  logger = Logger.new("/var/log/bigbluebutton/presentation/process-#{meeting_id}.log", 'daily' )
  BigBlueButton.logger = logger
  BigBlueButton.logger.info("Processing script presentation.rb")
  FileUtils.mkdir_p target_dir
  
 begin

  # Create a copy of the raw archives
  temp_dir = "#{target_dir}/temp"
  FileUtils.mkdir_p temp_dir
  FileUtils.cp_r(raw_archive_dir, temp_dir)
  
  BigBlueButton::AudioProcessor.process("#{temp_dir}/#{meeting_id}", "#{target_dir}/audio.ogg")

  events_xml = "#{temp_dir}/#{meeting_id}/events.xml"
  FileUtils.cp(events_xml, target_dir)
  
  presentation_dir = "#{temp_dir}/#{meeting_id}/presentation"
  presentations = BigBlueButton::Presentation.get_presentations(events_xml)
  
  processed_pres_dir = "#{target_dir}/presentation"
  FileUtils.mkdir_p processed_pres_dir
  
  presentations.each do |pres|
    pres_dir = "#{presentation_dir}/#{pres}"
    num_pages = BigBlueButton::Presentation.get_number_of_pages_for(pres_dir)
    
    target_pres_dir = "#{processed_pres_dir}/#{pres}"
    FileUtils.mkdir_p target_pres_dir
    FileUtils.mkdir_p "#{target_pres_dir}/textfiles"
    
    images=Dir.glob("#{pres_dir}/#{pres}.{jpg,png,gif,JPG,PNG,GIF}")
    if images.empty? 
      pres_pdf = "#{pres_dir}/#{pres}.pdf"
      if !File.exists?(pres_pdf)
        BigBlueButton.logger.info("Falling back to old presentation filename")
        pres_pdf = "#{pres_dir}/#{pres}"
      end
      if !File.exists?(pres_pdf)
        raise "Could not find pdf file for presentation #{pres}"
      end
      1.upto(num_pages) do |page| 
        pdf_page = "#{pres_dir}/slide-#{page}.pdf"
        BigBlueButton::Presentation.extract_page_from_pdf(page, pres_pdf, pdf_page)
        #BigBlueButton::Presentation.convert_pdf_to_png(pdf_page, "#{target_pres_dir}/slide-#{page}.png")
        command = "convert -density 300x300 #{pdf_page} -resize 1600x1200 -background white -flatten -quality 90 +dither -depth 8 -colors 256 #{target_pres_dir}/slide-#{page}.png"
        BigBlueButton.execute(command)
        if File.exist?("#{pres_dir}/textfiles/slide-#{page}.txt") then
          FileUtils.cp("#{pres_dir}/textfiles/slide-#{page}.txt", "#{target_pres_dir}/textfiles")
        end
      end
    else
      ext = File.extname("#{images[0]}")
      #BigBlueButton::Presentation.convert_image_to_png(images[0],"#{target_pres_dir}/slide-1.png")
      command="convert #{images[0]} -resize 1600x1200 -background white -flatten #{target_pres_dir}/slide-1.png"
      BigBlueButton.execute(command)
    end
  
  end
  
  if !Dir["#{raw_archive_dir}/video/*"].empty? or (presentation_props['include_deskshare'] and !Dir["#{raw_archive_dir}/deskshare/*"].empty?)
    BigBlueButton.process_multiple_videos(target_dir, temp_dir, meeting_id, presentation_props['video_output_width'], presentation_props['video_output_height'], presentation_props['audio_offset'], presentation_props['include_deskshare'])
  else
    #Convert the audio file to webm to play it in IE
    command = "ffmpeg -i #{target_dir}/audio.ogg  #{target_dir}/audio.webm"
    BigBlueButton.execute(command)
  end

  process_done = File.new("#{recording_dir}/status/processed/#{meeting_id}-presentation.done", "w")
  process_done.write("Processed #{meeting_id}")
  process_done.close
#else
#	BigBlueButton.logger.debug("Skipping #{meeting_id} as it has already been processed.")  
 rescue Exception => e
        BigBlueButton.logger.error(e.message)
 end
end
    

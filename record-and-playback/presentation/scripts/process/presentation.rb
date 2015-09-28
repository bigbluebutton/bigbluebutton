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

# For DEVELOPMENT
# Allows us to run the script manually
# require File.expand_path('../../../../core/lib/recordandplayback', __FILE__)

# For PRODUCTION
require File.expand_path('../../../lib/recordandplayback', __FILE__)

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
log_dir = props['log_dir']


target_dir = "#{recording_dir}/process/presentation/#{meeting_id}"
if not FileTest.directory?(target_dir)
  FileUtils.mkdir_p "#{log_dir}/presentation"
  logger = Logger.new("#{log_dir}/presentation/process-#{meeting_id}.log", 'daily' )
  BigBlueButton.logger = logger
  BigBlueButton.logger.info("Processing script presentation.rb")
  FileUtils.mkdir_p target_dir
  
 begin

  # Create a copy of the raw archives
  temp_dir = "#{target_dir}/temp"
  FileUtils.mkdir_p temp_dir
  FileUtils.cp_r(raw_archive_dir, temp_dir)
  
  BigBlueButton::AudioProcessor.process("#{temp_dir}/#{meeting_id}", "#{target_dir}/audio")
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
    
    images=Dir.glob("#{pres_dir}/#{pres}.{jpg,jpeg,png,gif,JPG,JPEG,PNG,GIF}")
    if images.empty?
      pres_name = "#{pres_dir}/#{pres}"
      if File.exists?("#{pres_name}.pdf")
        pres_pdf = "#{pres_name}.pdf"
        BigBlueButton.logger.info("Found pdf file for presentation #{pres_pdf}")
      elsif File.exists?("#{pres_name}.PDF")
        pres_pdf = "#{pres_name}.PDF"
        BigBlueButton.logger.info("Found PDF file for presentation #{pres_pdf}")
      elsif File.exists?("#{pres_name}")
        pres_pdf = pres_name
        BigBlueButton.logger.info("Falling back to old presentation filename #{pres_pdf}")
      else
        pres_pdf = ""
        BigBlueButton.logger.warn("Could not find pdf file for presentation #{pres}")
      end

      if !pres_pdf.empty?
        1.upto(num_pages) do |page|
          BigBlueButton::Presentation.extract_png_page_from_pdf(
            page, pres_pdf, "#{target_pres_dir}/slide-#{page}.png", '1600x1200')
          if File.exist?("#{pres_dir}/textfiles/slide-#{page}.txt") then
            FileUtils.cp("#{pres_dir}/textfiles/slide-#{page}.txt", "#{target_pres_dir}/textfiles")
          end
        end
      end
    else
      ext = File.extname("#{images[0]}")
      #BigBlueButton::Presentation.convert_image_to_png(images[0],"#{target_pres_dir}/slide-1.png")
      command="convert #{images[0]} -resize 1600x1200 -background white -flatten #{target_pres_dir}/slide-1.png"
      BigBlueButton.execute(command)
    end
  end
  
  if !Dir["#{raw_archive_dir}/video/*"].empty? or (presentation_props['include_deskshare'] and
    (!Dir["#{raw_archive_dir}/deskshare/*"].empty? or !Dir["#{raw_archive_dir}/video-broadcast/*"].empty? ))
    width = presentation_props['video_output_width']
    height = presentation_props['video_output_height']
    if !Dir["#{raw_archive_dir}/deskshare/*"].empty?
      width = presentation_props['deskshare_output_width']
      height = presentation_props['deskshare_output_height']
    end
    if !Dir["#{raw_archive_dir}/video-broadcast/*"].empty?
      width = presentation_props['deskshare_output_width']
      height = presentation_props['deskshare_output_height']
    end
    BigBlueButton.process_multiple_videos(target_dir, temp_dir, meeting_id, width, height, presentation_props['audio_offset'], presentation_props['include_deskshare'])
  end

  process_done = File.new("#{recording_dir}/status/processed/#{meeting_id}-presentation.done", "w")
  process_done.write("Processed #{meeting_id}")
  process_done.close
#else
#	BigBlueButton.logger.debug("Skipping #{meeting_id} as it has already been processed.")  
 rescue Exception => e
        BigBlueButton.logger.error(e.message)
	e.backtrace.each do |traceline|
		BigBlueButton.logger.error(traceline)
	end
	exit 1
 end
end
    

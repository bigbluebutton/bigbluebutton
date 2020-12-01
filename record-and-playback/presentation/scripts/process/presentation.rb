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
require 'json'

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

    # Create initial metadata.xml
    b = Builder::XmlMarkup.new(:indent => 2)
    metaxml = b.recording {
      b.id(meeting_id)
      b.state("processing")
      b.published(false)
      b.start_time
      b.end_time
      b.participants
      b.playback
      b.meta
    }
    metadata_xml = File.new("#{target_dir}/metadata.xml","w")
    metadata_xml.write(metaxml)
    metadata_xml.close
    BigBlueButton.logger.info("Created inital metadata.xml")

    BigBlueButton::AudioProcessor.process("#{temp_dir}/#{meeting_id}", "#{target_dir}/audio")
    events_xml = "#{temp_dir}/#{meeting_id}/events.xml"
    FileUtils.cp(events_xml, target_dir)

    presentation_dir = "#{temp_dir}/#{meeting_id}/presentation"
    presentations = BigBlueButton::Presentation.get_presentations(events_xml)

    processed_pres_dir = "#{target_dir}/presentation"
    FileUtils.mkdir_p processed_pres_dir

    # Get the real-time start and end timestamp
    @doc = Nokogiri::XML(File.read("#{target_dir}/events.xml"))

    meeting_start = @doc.xpath("//event")[0][:timestamp]
    meeting_end = @doc.xpath("//event").last()[:timestamp]

    match = /.*-(\d+)$/.match(meeting_id)
    real_start_time = match[1]
    real_end_time = (real_start_time.to_i + (meeting_end.to_i - meeting_start.to_i)).to_s


    # Add start_time, end_time and meta to metadata.xml
    ## Load metadata.xml
    metadata = Nokogiri::XML(File.read("#{target_dir}/metadata.xml"))
    ## Add start_time and end_time
    recording = metadata.root
    ### Date Format for recordings: Thu Mar 04 14:05:56 UTC 2010
    start_time = recording.at_xpath("start_time")
    start_time.content = real_start_time
    end_time = recording.at_xpath("end_time")
    end_time.content = real_end_time

    ## Copy the breakout and breakout rooms node from
    ## events.xml if present.
    breakout_xpath = @doc.xpath("//breakout")
    breakout_rooms_xpath = @doc.xpath("//breakoutRooms")
    meeting_xpath = @doc.xpath("//meeting")

    if (meeting_xpath != nil)
      recording << meeting_xpath
    end

    if (breakout_xpath != nil)
      recording << breakout_xpath
    end

    if (breakout_rooms_xpath != nil)
      recording << breakout_rooms_xpath
    end

    participants = recording.at_xpath("participants")
    participants.content = BigBlueButton::Events.get_num_participants(@doc)

    ## Remove empty meta
    metadata.search('//recording/meta').each do |meta|
      meta.remove
    end
    ## Add the actual meta
    metadata_with_playback = Nokogiri::XML::Builder.with(metadata.at('recording')) do |xml|
      xml.meta {
        BigBlueButton::Events.get_meeting_metadata("#{target_dir}/events.xml").each { |k,v| xml.method_missing(k,v) }
      }
    end
    ## Write the new metadata.xml
    metadata_file = File.new("#{target_dir}/metadata.xml","w")
    metadata = Nokogiri::XML(metadata.to_xml) { |x| x.noblanks }
    metadata_file.write(metadata.root)
    metadata_file.close
    BigBlueButton.logger.info("Created an updated metadata.xml with start_time and end_time")

    # Start processing raw files
    presentation_text = {}
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
          text = {}
          1.upto(num_pages) do |page|
            BigBlueButton::Presentation.extract_png_page_from_pdf(
              page, pres_pdf, "#{target_pres_dir}/slide-#{page}.png", '1600x1600')
            if File.exist?("#{pres_dir}/textfiles/slide-#{page}.txt") then
              t = File.read("#{pres_dir}/textfiles/slide-#{page}.txt", encoding: 'UTF-8')
              text["slide-#{page}"] = t.encode('UTF-8', invalid: :replace)
              FileUtils.cp("#{pres_dir}/textfiles/slide-#{page}.txt", "#{target_pres_dir}/textfiles")
            end
          end
          presentation_text[pres] = text
        end
      else
        ext = File.extname("#{images[0]}")
        BigBlueButton::Presentation.convert_image_to_png(
          images[0], "#{target_pres_dir}/slide-1.png", '1600x1600')
      end

      # Copy thumbnails from raw files
      FileUtils.cp_r("#{pres_dir}/thumbnails", "#{target_pres_dir}/thumbnails") if File.exist?("#{pres_dir}/thumbnails")
    end

    BigBlueButton.logger.info("Generating closed captions")
    ret = BigBlueButton.exec_ret('utils/gen_webvtt', '-i', raw_archive_dir, '-o', target_dir)
    if ret != 0
      raise "Generating closed caption files failed"
    end
    captions = JSON.load(File.new("#{target_dir}/captions.json", 'r'))

    if not presentation_text.empty?
      # Write presentation_text.json to file
      File.open("#{target_dir}/presentation_text.json","w") { |f| f.puts presentation_text.to_json }
    end

    # We have to decide whether to actually generate the webcams video file
    # We do so if any of the following conditions are true:
    # - There is webcam video present, or
    # - There's broadcast video present, or
    # - There are closed captions present (they need a video stream to be rendered on top of)
    if !Dir["#{raw_archive_dir}/video/*"].empty? or
        !Dir["#{raw_archive_dir}/video-broadcast/*"].empty? or
        captions.length > 0
      webcam_width = presentation_props['video_output_width']
      webcam_height = presentation_props['video_output_height']

      # Use a higher resolution video canvas if there's broadcast video streams
      if !Dir["#{raw_archive_dir}/video-broadcast/*"].empty?
        webcam_width = presentation_props['deskshare_output_width']
        webcam_height = presentation_props['deskshare_output_height']
      end

      processed_audio_file = BigBlueButton::AudioProcessor.get_processed_audio_file("#{temp_dir}/#{meeting_id}", "#{target_dir}/audio")
      BigBlueButton.process_webcam_videos(target_dir, temp_dir, meeting_id, webcam_width, webcam_height, presentation_props['audio_offset'], processed_audio_file, presentation_props['video_formats'])
    end

    if !Dir["#{raw_archive_dir}/deskshare/*"].empty? and presentation_props['include_deskshare']
      deskshare_width = presentation_props['deskshare_output_width']
      deskshare_height = presentation_props['deskshare_output_height']
      BigBlueButton.process_deskshare_videos(target_dir, temp_dir, meeting_id, deskshare_width, deskshare_height, presentation_props['video_formats'])
    end

    # Copy shared notes from raw files
    if !Dir["#{raw_archive_dir}/notes/*"].empty?
      FileUtils.cp_r("#{raw_archive_dir}/notes", target_dir)
    end

    process_done = File.new("#{recording_dir}/status/processed/#{meeting_id}-presentation.done", "w")
    process_done.write("Processed #{meeting_id}")
    process_done.close

    # Update state in metadata.xml
    ## Load metadata.xml
    metadata = Nokogiri::XML(File.read("#{target_dir}/metadata.xml"))
    ## Update status
    recording = metadata.root
    state = recording.at_xpath("state")
    state.content = "processed"
    ## Write the new metadata.xml
    metadata_file = File.new("#{target_dir}/metadata.xml","w")
    metadata_file.write(metadata.root)
    metadata_file.close
    BigBlueButton.logger.info("Created an updated metadata.xml with state=processed")

  rescue Exception => e
    BigBlueButton.logger.error(e.message)
    e.backtrace.each do |traceline|
      BigBlueButton.logger.error(traceline)
    end
    exit 1
  end
end

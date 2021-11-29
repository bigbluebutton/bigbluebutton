# frozen_string_literal: true
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

opts = Trollop.options do
  opt :meeting_id, 'Meeting id to archive', default: '58f4a6b3-cd07-444d-8564-59116cb53974', type: String
end

meeting_id = opts[:meeting_id]

# This script lives in scripts/archive/steps while properties.yaml lives in scripts/
props = BigBlueButton.read_props

recording_dir = props['recording_dir']
raw_archive_dir = "#{recording_dir}/raw/#{meeting_id}"
log_dir = props['log_dir']

target_dir = "#{recording_dir}/process/breakout_pdf/#{meeting_id}"
unless FileTest.directory?(target_dir)
  FileUtils.mkdir_p "#{log_dir}/breakout_pdf"
  logger = Logger.new("#{log_dir}/breakout_pdf/process-#{meeting_id}.log", 'daily')
  BigBlueButton.logger = logger
  BigBlueButton.logger.info('Processing script breakout_pdf.rb')
  FileUtils.mkdir_p target_dir

  begin
    # Create initial metadata.xml
    b = Builder::XmlMarkup.new(indent: 2)
    metaxml = b.recording do
      b.id(meeting_id)
      b.state('processing')
      b.published(false)
      b.start_time
      b.end_time
      b.participants
      b.playback
      b.meta
    end
    metadata_xml = File.new("#{target_dir}/metadata.xml", 'w')
    metadata_xml.write(metaxml)
    metadata_xml.close
    BigBlueButton.logger.info('Created inital metadata.xml')
    events_xml = "#{raw_archive_dir}/events.xml"
    FileUtils.cp(events_xml, target_dir)

    breakout_pdf_dir = "#{raw_archive_dir}/presentation"
    presentations = BigBlueButton::Presentation.get_presentations(events_xml)

    processed_breakout_pdf_dir = "#{target_dir}/presentation"
    FileUtils.mkdir_p processed_breakout_pdf_dir

    # Get the real-time start and end timestamp
    @doc = Nokogiri::XML(File.read("#{raw_archive_dir}/events.xml"))

    meeting_start = BigBlueButton::Events.first_event_timestamp(@doc)
    meeting_end = BigBlueButton::Events.last_event_timestamp(@doc)
    match = /.*-(\d+)$/.match(meeting_id)
    real_start_time = match[1].to_i
    real_end_time = real_start_time + (meeting_end - meeting_start)

    # Add start_time, end_time and meta to metadata.xml
    ## Load metadata.xml
    metadata = Nokogiri::XML(File.read("#{target_dir}/metadata.xml"))
    ## Add start_time and end_time
    recording = metadata.root
    ### Date Format for recordings: Thu Mar 04 14:05:56 UTC 2010
    start_time = recording.at_xpath('start_time')
    start_time.content = real_start_time
    end_time = recording.at_xpath('end_time')
    end_time.content = real_end_time

    ## Copy the breakout and breakout rooms node from
    ## events.xml if present.
    breakout_xpath = @doc.xpath('recording/breakout')
    breakout_rooms_xpath = @doc.xpath('recording/breakoutRooms')
    meeting_xpath = @doc.xpath('recording/meeting')
    is_breakout = @doc.at_xpath('recording/metadata/@isBreakout').text == 'true'

    recording << meeting_xpath unless meeting_xpath.nil?
    recording << breakout_xpath unless breakout_xpath.nil?
    recording << breakout_rooms_xpath unless breakout_rooms_xpath.nil?

    participants = recording.at_xpath('participants')
    participants.content = BigBlueButton::Events.get_num_participants(@doc)

    ## Remove empty meta
    metadata.search('recording/meta').each(&:remove)
    ## Add the actual meta
    Nokogiri::XML::Builder.with(metadata.at('recording')) do |xml|
      xml.meta do
        BigBlueButton::Events.get_meeting_metadata("#{target_dir}/events.xml").each { |k, v| xml.method_missing(k, v) }
      end
    end
    ## Write the new metadata.xml
    metadata_file = File.new("#{target_dir}/metadata.xml", 'w')
    metadata = Nokogiri::XML(metadata.to_xml, &:noblanks)
    metadata_file.write(metadata.root)
    metadata_file.close
    BigBlueButton.logger.info('Created an updated metadata.xml with start_time and end_time')

    # Start processing raw files
    if is_breakout
      presentations.each do |pres|
        pres_dir = "#{breakout_pdf_dir}/#{pres}"
        num_pages = BigBlueButton::Presentation.get_number_of_pages_for(pres_dir)

        target_pres_dir = "#{processed_breakout_pdf_dir}/#{pres}"
        FileUtils.mkdir_p target_pres_dir

        images = Dir.glob("#{pres_dir}/#{pres}.{jpg,jpeg,png,gif,JPG,JPEG,PNG,GIF}")
        if images.empty?
          pres_name = "#{pres_dir}/#{pres}"
          if File.exist?("#{pres_name}.pdf")
            pres_pdf = "#{pres_name}.pdf"
            BigBlueButton.logger.info("Found pdf file for presentation #{pres_pdf}")
          elsif File.exist?("#{pres_name}.PDF")
            pres_pdf = "#{pres_name}.PDF"
            BigBlueButton.logger.info("Found PDF file for presentation #{pres_pdf}")
          elsif File.exist?(pres_name.to_s)
            pres_pdf = pres_name
            BigBlueButton.logger.info("Falling back to old presentation filename #{pres_pdf}")
          else
            pres_pdf = ''
            BigBlueButton.logger.warn("Could not find pdf file for presentation #{pres}")
          end

          unless pres_pdf.empty?
            1.upto(num_pages) do |page|
              BigBlueButton::Presentation.extract_png_page_from_pdf(
                page, pres_pdf, "#{target_pres_dir}/slide-#{page}.png", '1600x1600'
              )
            end
          end
        else
          BigBlueButton::Presentation.convert_image_to_png(
            images[0], "#{target_pres_dir}/slide-1.png", '1600x1600'
          )
        end
      end
    end

    # Generate 'done' file so that publishing script can begin
    breakout_pdf_done = File.new("#{recording_dir}/status/processed/#{meeting_id}-breakout_pdf.done", 'w')
    breakout_pdf_done.write("Processed #{meeting_id}")
    breakout_pdf_done.close

    # Update state in metadata.xml
    ## Load metadata.xml
    metadata = Nokogiri::XML(File.read("#{target_dir}/metadata.xml"))
    ## Update status
    recording = metadata.root
    state = recording.at_xpath('state')
    state.content = 'processed'
    ## Write the new metadata.xml
    metadata_file = File.new("#{target_dir}/metadata.xml", 'w')
    metadata_file.write(metadata.root)
    metadata_file.close
    BigBlueButton.logger.info('Created an updated metadata.xml with state=processed')
  rescue StandardError => e
    BigBlueButton.logger.error(e.message)
    e.backtrace.each do |traceline|
      BigBlueButton.logger.error(traceline)
    end
    exit 1
  end
end

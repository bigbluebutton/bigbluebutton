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
podcast_props = YAML::load(File.open('podcast.yml'))

recording_dir = props['recording_dir']
raw_archive_dir = "#{recording_dir}/raw/#{meeting_id}"
log_dir = props['log_dir']

target_dir = "#{recording_dir}/process/podcast/#{meeting_id}"
if not FileTest.directory?(target_dir)
  FileUtils.mkdir_p "#{log_dir}/podcast"
  logger = Logger.new("#{log_dir}/podcast/process-#{meeting_id}.log", 'daily' )
  BigBlueButton.logger = logger
  BigBlueButton.logger.info("Processing script podcast.rb")
  FileUtils.mkdir_p target_dir

  begin
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

    BigBlueButton::AudioProcessor.process("#{raw_archive_dir}", "#{target_dir}/audio")

    # Get the real-time start and end timestamp
    @doc = Nokogiri::XML(File.open("#{raw_archive_dir}/events.xml"))

    meeting_start = @doc.xpath("//event")[0][:timestamp]
    meeting_end = @doc.xpath("//event").last()[:timestamp]

    match = /.*-(\d+)$/.match(meeting_id)
    real_start_time = match[1]
    real_end_time = (real_start_time.to_i + (meeting_end.to_i - meeting_start.to_i)).to_s


    # Add start_time, end_time and meta to metadata.xml
    ## Load metadata.xml
    metadata = Nokogiri::XML(File.open("#{target_dir}/metadata.xml"))
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
    participants.content = BigBlueButton::Events.get_num_participants("#{raw_archive_dir}/events.xml")

    ## Remove empty meta
    metadata.search('//recording/meta').each do |meta|
      meta.remove
    end
    ## Add the actual meta
    metadata_with_playback = Nokogiri::XML::Builder.with(metadata.at('recording')) do |xml|
      xml.meta {
        BigBlueButton::Events.get_meeting_metadata("#{raw_archive_dir}/events.xml").each { |k,v| xml.method_missing(k,v) }
      }
    end
    ## Write the new metadata.xml
    metadata_file = File.new("#{target_dir}/metadata.xml","w")
    metadata = Nokogiri::XML(metadata.to_xml) { |x| x.noblanks }
    metadata_file.write(metadata.root)
    metadata_file.close
    BigBlueButton.logger.info("Created an updated metadata.xml with start_time and end_time")

    process_done = File.new("#{recording_dir}/status/processed/#{meeting_id}-podcast.done", "w")
    process_done.write("Processed #{meeting_id}")
    process_done.close

    # Update state in metadata.xml
    ## Load metadata.xml
    metadata = Nokogiri::XML(File.open("#{target_dir}/metadata.xml"))
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

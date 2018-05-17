#!/usr/bin/ruby
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


require '../lib/recordandplayback'
require 'logger'
require 'trollop'
require 'yaml'
require "nokogiri"
require "redis"
require "fileutils"

def check_events_xml(raw_dir,meeting_id)
	filepath = "#{raw_dir}/#{meeting_id}/events.xml"
	raise Exception,  "Events file doesn't exists." if not File.exists?(filepath)
	bad_doc = Nokogiri::XML(File.open(filepath)) { |config| config.options = Nokogiri::XML::ParseOptions::STRICT }
end

def check_audio_files(raw_dir,meeting_id)
	#check every file that is in events.xml, it's in audio dir
    doc = Nokogiri::XML(File.open("#{raw_dir}/#{meeting_id}/events.xml"))

    doc.xpath("//event[@eventname='StartRecordingEvent']/filename/text()").each { |fs_audio_file| 
    	audioname = fs_audio_file.content.split("/").last
    	raw_audio_file = "#{raw_dir}/#{meeting_id}/audio/#{audioname}"
    	#checking that the audio file exists in raw directory
    	raise Exception,  "Audio file #{raw_audio_file} doesn't exist in raw directory." if not File.exists?(raw_audio_file)

    	#checking length
        info = BigBlueButton::EDL::Audio.audio_info(raw_audio_file)
        if info[:duration].nil? or info[:duration] == 0
          raise Exception, "Audio file #{raw_audio_file} length is zero."
        end
    }

end

def check_webcam_files(raw_dir, meeting_id)
    meeting_dir = "#{raw_dir}/#{meeting_id}"

    BigBlueButton.logger.info("Repairing red5 serialized streams")
    cp="/usr/share/red5/red5-server.jar:/usr/share/red5/lib/*"
    if File.directory?("#{meeting_dir}/video/#{meeting_id}")
      FileUtils.cd("#{meeting_dir}/video/#{meeting_id}") do
        Dir.glob("*.flv.ser").each do |ser|
          BigBlueButton.logger.info("Repairing #{ser}")
          ret = BigBlueButton.exec_ret('java', '-cp', cp, 'org.red5.io.flv.impl.FLVWriter', ser, '0', '7')
          if ret != 0
            BigBlueButton.logger.warn("Failed to repair #{ser}")
          end
        end
      end
    end
	
    BigBlueButton.logger.info "Checking all webcam recorded streams from events were archived."
    webcams = BigBlueButton::Events.get_start_video_events("#{raw_dir}/#{meeting_id}/events.xml")
    webcams.each do |webcam|
        raw_webcam_file = "#{raw_dir}/#{meeting_id}/video/#{meeting_id}/#{webcam[:stream]}.flv"
        raise Exception, "Webcam file #{webcam[:stream]}.flv was not archived" if not File.exists? raw_webcam_file
    end

    BigBlueButton.logger.info "Checking the length of webcam streams is not zero."
    events_file = "#{meeting_dir}/events.xml"
    events_xml = Nokogiri::XML(File.open(events_file))
    original_num_events = events_xml.xpath("//event").size

    Dir.glob("#{meeting_dir}/video/#{meeting_id}/*").each do |video|
        info = BigBlueButton::EDL::Video.video_info(video)
        if info[:duration].nil? or info[:duration] == 0
            video_name =  File.basename(video,File.extname(video))
            removed_elements = events_xml.xpath("//event[contains(., '#{video_name}')]").remove
            BigBlueButton.logger.info "Removed #{removed_elements.size} events for webcam stream '#{video_name}' ."
            FileUtils.rm video
            BigBlueButton.logger.info "Removing webcam file #{video} from raw dir due to length zero."
        end
    end

    if original_num_events > events_xml.xpath("//event").size
        BigBlueButton.logger.info "Making backup of original events file #{events_file}."
        FileUtils.cp(events_file, "#{meeting_dir}/events.xml.original")

        BigBlueButton.logger.info "Saving changes in #{events_file}."
        File.open("#{raw_dir}/#{meeting_id}/events.xml",'w') {|f| f.write(events_xml) }
    else
	BigBlueButton.logger.info "Webcam streams with length zero were not found."
    end

end

def check_deskshare_files(raw_dir, meeting_id)
    meeting_dir = "#{raw_dir}/#{meeting_id}"

    BigBlueButton.logger.info("Repairing red5 serialized streams")
    cp="/usr/share/red5/red5-server.jar:/usr/share/red5/lib/*"
    if File.directory?("#{meeting_dir}/deskshare")
      FileUtils.cd("#{meeting_dir}/deskshare") do
        Dir.glob("*.flv.ser").each do |ser|
          BigBlueButton.logger.info("Repairing #{ser}")
          ret = BigBlueButton.exec_ret('java', '-cp', cp, 'org.red5.io.flv.impl.FLVWriter', ser, '0', '7')
          if ret != 0
            BigBlueButton.logger.warn("Failed to repair #{ser}")
          end
        end
      end
    end

    desktops = BigBlueButton::Events.get_start_deskshare_events("#{raw_dir}/#{meeting_id}/events.xml")
    desktops.each do |desktop|
        raw_desktop_file = "#{raw_dir}/#{meeting_id}/deskshare/#{desktop[:stream]}"
        raise Exception, "Deskshare file #{desktop[:stream]} was not archived" if not File.exists? raw_desktop_file
    end
end

def check_recording_events(raw_dir, meeting_id)
  duration = BigBlueButton::Events.get_recording_length("#{raw_dir}/#{meeting_id}/events.xml")
  if duration == 0
    raise Exception, "Duration of recorded portion of meeting is 0. You must edit the RecordStatusEvent events in #{raw_dir}/#{meeting_id}/events.xml before this meeting can be processed."
  end
end


opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :default => '58f4a6b3-cd07-444d-8564-59116cb53974', :type => String
end

meeting_id = opts[:meeting_id]

# This script lives in scripts/archive/steps while bigbluebutton.yml lives in scripts/
props = YAML::load(File.open('bigbluebutton.yml'))
log_dir = props['log_dir']
audio_dir = props['raw_audio_src']
recording_dir = props['recording_dir']
raw_archive_dir = "#{recording_dir}/raw"
redis_host = props['redis_host']
redis_port = props['redis_port']

BigBlueButton.logger = Logger.new("#{log_dir}/sanity.log", 'daily' )

begin
	BigBlueButton.logger.info("Starting sanity check for recording #{meeting_id}.")
	BigBlueButton.logger.info("Checking events.xml")
	check_events_xml(raw_archive_dir,meeting_id)
        BigBlueButton.logger.info("Checking recording events")
        check_recording_events(raw_archive_dir, meeting_id)
	BigBlueButton.logger.info("Checking audio")
	check_audio_files(raw_archive_dir,meeting_id)
    BigBlueButton.logger.info("Checking webcam videos")
    check_webcam_files(raw_archive_dir,meeting_id)
    BigBlueButton.logger.info("Checking deskshare videos")
    check_deskshare_files(raw_archive_dir,meeting_id)
	#delete keys
	BigBlueButton.logger.info("Deleting keys")
	redis = BigBlueButton::RedisWrapper.new(redis_host, redis_port)
	events_archiver = BigBlueButton::RedisEventsArchiver.new redis    
    events_archiver.delete_events(meeting_id)

	#create done files for sanity
	BigBlueButton.logger.info("creating sanity done files")
	sanity_done = File.new("#{recording_dir}/status/sanity/#{meeting_id}.done", "w")
	sanity_done.write("sanity check #{meeting_id}")
	sanity_done.close
rescue Exception => e
	BigBlueButton.logger.error("error in sanity check: " + e.message)
	sanity_done = File.new("#{recording_dir}/status/sanity/#{meeting_id}.fail", "w")
        sanity_done.write("error: " + e.message)
        sanity_done.close
end



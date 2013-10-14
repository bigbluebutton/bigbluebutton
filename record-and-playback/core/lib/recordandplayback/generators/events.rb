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
require 'nokogiri'

module BigBlueButton
  module Events
  
    # Get the meeting metadata
    def self.get_meeting_metadata(events_xml)
      BigBlueButton.logger.info("Task: Getting meeting metadata")
      doc = Nokogiri::XML(File.open(events_xml))
      metadata = {}
      doc.xpath("//metadata").each do |e| 
        e.keys.each do |k| 
          metadata[k] = e.attribute(k)
        end
      end  
      metadata
    end
    
    # Get the timestamp of the first event.
    def self.first_event_timestamp(events_xml)
      BigBlueButton.logger.info("Task: Getting the timestamp of the first event.")
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("recording/event").first["timestamp"].to_i
    end
    
    # Get the timestamp of the last event.
    def self.last_event_timestamp(events_xml)
      BigBlueButton.logger.info("Task: Getting the timestamp of the last event")
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("recording/event").last["timestamp"].to_i
    end  
    
    # Determine if the start and stop event matched.
    def self.find_video_event_matched(start_events, stop)      
      BigBlueButton.logger.info("Task: Finding video events that match")
      start_events.each do |start|
        if (start[:stream] == stop[:stream])
          return start
        end      
      end
      return nil
    end
    
    # Match the start and stop events.
    def self.match_start_and_stop_video_events(start_events, stop_events)
      BigBlueButton.logger.info("Task: Matching the start and stop events")
      matched_events = []
      stop_events.each do |stop|
        start_evt = find_video_event_matched(start_events, stop)
        if start_evt
          start_evt[:stop_timestamp] = stop[:stop_timestamp]
          matched_events << start_evt
        else
          matched_events << stop
        end
      end      
      matched_events.sort { |a, b| a[:start_timestamp] <=> b[:start_timestamp] }
    end
      
    # Get start video events  
    def self.get_start_video_events(events_xml)
      BigBlueButton.logger.info("Task: Getting start video events")
      start_events = []
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("//event[@eventname='StartWebcamShareEvent']").each do |start_event|
        start_events << {:start_timestamp => start_event['timestamp'].to_i, :stream => start_event.xpath('stream').text}
      end
      start_events
    end

    # Get stop video events
    def self.get_stop_video_events(events_xml)
      BigBlueButton.logger.info("Task: Getting stop video events")
      stop_events = []
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("//event[@eventname='StopWebcamShareEvent']").each do |stop_event|
        stop_events << {:stop_timestamp => stop_event['timestamp'].to_i, :stream => stop_event.xpath('stream').text}
      end
      stop_events
    end

    # Build a webcam EDL
    def self.create_webcam_edl(archive_dir)
      events = Nokogiri::XML(File.open("#{archive_dir}/events.xml"))

      recording = events.at_xpath('/recording')
      meeting_id = recording['meeting_id']
      event = events.at_xpath('/recording/event[position()=1]')
      initial_timestamp = event['timestamp'].to_i
      event = events.at_xpath('/recording/event[position()=last()]')
      final_timestamp = event['timestamp'].to_i

      video_dir = "#{archive_dir}/video/#{meeting_id}"

      videos = {}
      active_videos = []
      video_edl = []
      
      video_edl << {
        :timestamp => 0,
        :areas => { :webcam => [] } 
      }

      events.xpath('/recording/event[@module="WEBCAM"]').each do |event|
        timestamp = event['timestamp'].to_i - initial_timestamp
        case event['eventname']
        when 'StartWebcamShareEvent'
          stream = event.at_xpath('stream').text
          filename = "#{video_dir}/#{stream}.flv"

          videos[filename] = { :timestamp => timestamp }
          active_videos << filename

          edl_entry = {
            :timestamp => timestamp,
            :areas => { :webcam => [] }
          }
          active_videos.each do |filename|
            edl_entry[:areas][:webcam] << {
              :filename => filename,
              :timestamp => timestamp - videos[filename][:timestamp]
            }
          end
          video_edl << edl_entry
        when 'StopWebcamShareEvent'
          stream = event.at_xpath('stream').text
          filename = "#{video_dir}/#{stream}.flv"

          active_videos.delete(filename)

          edl_entry = {
            :timestamp => timestamp,
            :areas => { :webcam => [] }
          }
          active_videos.each do |filename|
            edl_entry[:areas][:webcam] << {
              :filename => filename,
              :timestamp => timestamp - videos[filename][:timestamp]
            }
          end
          video_edl << edl_entry
        end
      end

      video_edl << {
        :timestamp => final_timestamp - initial_timestamp,
        :areas => { :webcam => [] }
      }

      return video_edl
    end

        
    # Determine if the start and stop event matched.
    def self.deskshare_event_matched?(stop_events, start)
      BigBlueButton.logger.info("Task: Determining if the start and stop DESKSHARE events matched")      
      stop_events.each do |stop|
        if (start[:stream] == stop[:stream])
          start[:matched] = true
          start[:stop_timestamp] = stop[:stop_timestamp]
          return true
        end      
      end
      return false
    end
    
    # Match the start and stop events.
    def self.match_start_and_stop_deskshare_events(start_events, stop_events)
      BigBlueButton.logger.info("Task: Matching start and stop DESKSHARE events")      
      combined_events = []
      start_events.each do |start|
        if not video_event_matched?(stop_events, start) 
          stop_event = {:stop_timestamp => stop[:stop_timestamp], :stream => stop[:stream], :matched => false}
          combined_events << stop_event
        else
          stop_events = stop_events - [stop_event]
        end
      end      
      return combined_events.concat(start_events)
    end    
    
    def self.get_start_deskshare_events(events_xml)
      BigBlueButton.logger.info("Task: Getting start DESKSHARE events")      
      start_events = []
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("//event[@eventname='DeskshareStartedEvent']").each do |start_event|
        s = {:start_timestamp => start_event['timestamp'].to_i, :stream => start_event.xpath('file').text.sub(/(.+)\//, "")}
        start_events << s
      end
      start_events.sort {|a, b| a[:start_timestamp] <=> b[:start_timestamp]}
    end

    def self.get_stop_deskshare_events(events_xml)
      BigBlueButton.logger.info("Task: Getting stop DESKSHARE events")      
      stop_events = []
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("//event[@eventname='DeskshareStoppedEvent']").each do |stop_event|
        s = {:stop_timestamp => stop_event['timestamp'].to_i, :stream => stop_event.xpath('file').text.sub(/(.+)\//, "")}
        stop_events << s
      end
      stop_events.sort {|a, b| a[:stop_timestamp] <=> b[:stop_timestamp]}
    end

    def self.create_deskshare_edl(archive_dir)
      events = Nokogiri::XML(File.open("#{archive_dir}/events.xml"))

      event = events.at_xpath('/recording/event[position()=1]')
      initial_timestamp = event['timestamp'].to_i
      event = events.at_xpath('/recording/event[position()=last()]')
      final_timestamp = event['timestamp'].to_i

      deskshare_edl = []

      deskshare_edl << {
        :timestamp => 0,
        :areas => { :deskshare => [] }
      }

      events.xpath('/recording/event[@module="Deskshare"]').each do |event|
        timestamp = event['timestamp'].to_i - initial_timestamp
        case event['eventname']
        when 'DeskshareStartedEvent'
          filename = event.at_xpath('file').text
          filename = "#{archive_dir}/deskshare/#{File.basename(filename)}"
          deskshare_edl << {
            :timestamp => timestamp,
            :areas => {
              :deskshare => [
                { :filename => filename, :timestamp => 0 }
              ]
            }
          }
        when 'DeskshareStoppedEvent'
          deskshare_edl << {
            :timestamp => timestamp,
            :areas => { :deskshare => [] }
          }
        end
      end

      deskshare_edl << {
        :timestamp => final_timestamp - initial_timestamp,
        :areas => {}
      }

      return deskshare_edl
    end

	def self.linkify( text )
	  generic_URL_regexp = Regexp.new( '(^|[\n ])([\w]+?://[\w]+[^ \"\n\r\t<]*)', Regexp::MULTILINE | Regexp::IGNORECASE )
	  starts_with_www_regexp = Regexp.new( '(^|[\n ])((www)\.[^ \"\t\n\r<]*)', Regexp::MULTILINE | Regexp::IGNORECASE )
	  
	  s = text.to_s
	  s.gsub!( generic_URL_regexp, '\1<a href="\2">\2</a>' )
	  s.gsub!( starts_with_www_regexp, '\1<a href="http://\2">\2</a>' )
	  s
	end
  end
end

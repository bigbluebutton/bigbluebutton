# Set encoding to utf-8
# encoding: UTF-8

#
# BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
#
# Copyright (c) 2017 BigBlueButton Inc. and by respective authors (see below).
#
# This program is free software; you can redistribute it and/or modify it under
# the terms of the GNU Lesser General Public License as published by the Free
# Software Foundation; either version 3.0 of the License, or (at your option)
# any later version.
#
# BigBlueButton is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
# details.
#
# You should have received a copy of the GNU Lesser General Public License along
# with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
#


require 'rubygems'
require 'redis'
require 'builder'
require 'yaml'

module BigBlueButton  
  $bbb_props = YAML::load(File.open('../../core/scripts/bigbluebutton.yml'))
  $recording_dir = $bbb_props['recording_dir']
  $raw_recording_dir = "#{$recording_dir}/raw"

  # Class to wrap Redis so we can mock
  # for testing
  class RedisWrapper
    def initialize(host, port)
      @host, @port = host, port
      @redis = Redis.new(:host => @host, :port => @port)
    end
    
    def connect      
      @redis.client.connect    
    end
    
    def disconnect
      @redis.client.disconnect
    end
    
    def connected?
      @redis.client.connected?
    end
    
    def metadata_for(meeting_id)
      @redis.hgetall("meeting:info:#{meeting_id}")
    end
    
    def has_breakout_metadata_for(meeting_id)
      @redis.exists("meeting:breakout:#{meeting_id}")
    end

    def breakout_metadata_for(meeting_id)
      @redis.hgetall("meeting:breakout:#{meeting_id}")
    end
    
    def has_breakout_rooms_for(meeting_id)
      @redis.exists("meeting:breakout:rooms:#{meeting_id}")
    end

    def breakout_rooms_for(meeting_id)
      @redis.smembers("meeting:breakout:rooms:#{meeting_id}")
    end

    def num_events_for(meeting_id)
      @redis.llen("meeting:#{meeting_id}:recordings")
    end
    
    def events_for(meeting_id)
      @redis.lrange("meeting:#{meeting_id}:recordings", 0, num_events_for(meeting_id))
    end
    
    def event_info_for(meeting_id, event)
      @redis.hgetall("recording:#{meeting_id}:#{event}")
    end

    def delete_event_info_for(meeting_id,event)
      @redis.del("recording:#{meeting_id}:#{event}")
    end

    def delete_events_for(meeting_id)
      @redis.del("meeting:#{meeting_id}:recordings")
    end

    def delete_metadata_for(meeting_id)
      @redis.del("meeting:info:#{meeting_id}")
    end

    def delete_breakout_metadata_for(meeting_id)
      @redis.del("meeting:breakout:#{meeting_id}")
    end

    def delete_breakout_rooms_for(meeting_id)
      @redis.del("meeting:breakout:rooms:#{meeting_id}")
    end

    def build_header(message_type)
      return {
        "timestamp" => BigBlueButton.monotonic_clock, #
        "name" => message_type,
        "current_time" => Time.now.to_i, # unix timestamp
        "version" => "0.0.1"
      }
    end

    def build_message(header, payload)
      return {
        "header" => header,
        "payload" => payload
      }
    end

    RECORDINGS_CHANNEL = "bigbluebutton:from-rap"

    def put_message(message_type, meeting_id, additional_payload = {})
      events_xml = "#{$raw_recording_dir}/#{meeting_id}/events.xml"
      if File.exist?(events_xml)
        additional_payload.merge!({
          "external_meeting_id" => BigBlueButton::Events.get_external_meeting_id(events_xml)
        })
      end

      msg = build_message build_header(message_type), additional_payload.merge({
        "record_id" => meeting_id,
        "meeting_id" => meeting_id
      })
      @redis.publish RECORDINGS_CHANNEL, msg.to_json
    end

    def put_message_workflow(message_type, workflow, meeting_id, additional_payload = {})
      put_message message_type, meeting_id, additional_payload.merge({
        "workflow" => workflow
      })
    end

    def put_archive_started(meeting_id, additional_payload = {})
      put_message "archive_started", meeting_id, additional_payload
    end

    def put_archive_ended(meeting_id, additional_payload = {})
      put_message "archive_ended", meeting_id, additional_payload
    end

    def put_sanity_started(meeting_id, additional_payload = {})
      put_message "sanity_started", meeting_id, additional_payload
    end

    def put_sanity_ended(meeting_id, additional_payload = {})
      put_message "sanity_ended", meeting_id, additional_payload
    end

    def put_process_started(workflow, meeting_id, additional_payload = {})
      put_message_workflow "process_started", workflow, meeting_id, additional_payload
    end

    def put_process_ended(workflow, meeting_id, additional_payload = {})
      put_message_workflow "process_ended", workflow, meeting_id, additional_payload
    end

    def put_publish_started(workflow, meeting_id, additional_payload = {})
      put_message_workflow "publish_started", workflow, meeting_id, additional_payload
    end

    def put_publish_ended(workflow, meeting_id, additional_payload = {})
      put_message_workflow "publish_ended", workflow, meeting_id, additional_payload
    end

    def put_post_archive_started(workflow, meeting_id, additional_payload = {})
      put_message_workflow "post_archive_started", workflow, meeting_id, additional_payload
    end

    def put_post_archive_ended(workflow, meeting_id, additional_payload = {})
      put_message_workflow "post_archive_ended", workflow, meeting_id, additional_payload
    end

    def put_post_process_started(workflow, meeting_id, additional_payload = {})
      put_message_workflow "post_process_started", workflow, meeting_id, additional_payload
    end

    def put_post_process_ended(workflow, meeting_id, additional_payload = {})
      put_message_workflow "post_process_ended", workflow, meeting_id, additional_payload
    end

    def put_post_publish_started(workflow, meeting_id, additional_payload = {})
      put_message_workflow "post_publish_started", workflow, meeting_id, additional_payload
    end

    def put_post_publish_ended(workflow, meeting_id, additional_payload = {})
      put_message_workflow "post_publish_ended", workflow, meeting_id, additional_payload
    end
  end

  class RedisEventsArchiver
    TIMESTAMP = 'timestamp'
    MODULE = 'module'
    EVENTNAME = 'eventName'
    MEETINGID = 'meetingId'
    MEETINGNAME = 'meetingName'
    ISBREAKOUT = 'isBreakout'
    
    def initialize(redis)
      @redis = redis
    end

    def store_events(meeting_id, events_file, break_timestamp)
      version = YAML::load(File.open('../../core/scripts/bigbluebutton.yml'))["bbb_version"]

      if File.exist?(events_file)
        io = File.open(events_file, 'rb')
        events_doc = Nokogiri::XML::Document.parse(events_file)
        io.close
        recording = events_doc.create_element('recording',
                'meeting_id' => meeting_id,
                'bbb_version' => version)
        events_doc.root = recording
      else
        events_doc = Nokogiri::XML::Document.new()
        recording = events_doc.at_xpath('/recording')
        meeting = events_doc.at_xpath('/recording/meeting')
        metadata = events_doc.at_xpath('/recording/metadata')
        breakout = events_doc.at_xpath('/recording/breakout')
        breakoutRooms = events_doc.at_xpath('/recording/breakoutRooms')
      end

      meeting_metadata = @redis.metadata_for(meeting_id)
      return if meeting_metadata.nil?

      # Fill in/update the top-level meeting element
      if meeting.nil?
        meeting = events_doc.create_element('meeting')
        recording << meeting
      end
      meeting['id'] = meeting_id
      meeting['externalId'] = meeting_metadata[MEETINGID]
      meeting['name'] = meeting_metadata[MEETINGNAME]
      meeting['breakout'] = meeting_metadata[ISBREAKOUT]

      # Fill in/update the top-level metadata element
      if metadata.nil?
        metadata = events_doc.create_element('metadata')
        recording << metadata
      end
      meeting_metadata.each do |k, v|
        metadata[k] = v
      end

      # Fill in/update the top-level breakout element
      if @redis.has_breakout_metadata_for(meeting_id)
        if breakout.nil?
          breakout = events_doc.create_element('breakout')
          recording << breakout
        end
        breakout_metadata = @redis.breakout_metadata_for(meeting_id)
        breakout_metadata.each do |k, v|
          breakout[k] = v
        end
      end

      # Fill in/update the top-level breakoutRooms list
      if @redis.has_breakout_rooms_for(meeting_id)
        newBreakoutRooms = events_doc.create_element('breakoutRooms')
        breakout_rooms = @redis.breakout_rooms_for(meeting_id)
        breakout_rooms.each do |breakout_room|
          newBreakoutRooms << events_doc.create_element('breakoutRoom', breakout_room)
        end
        if !breakoutRooms.nil?
          breakoutRooms.replace(newBreakoutRooms)
        else
          recording << newBreakoutRooms
        end
      end

      # Append event elements, up until the break_timestamp if provided
      msgs = @redis.events_for(meeting_id)
      last_index = -1
      msgs.each_with_index do |msg, i|
        res = @redis.event_info_for(meeting_id, msg)
        event = events_doc.create_element('event',
                'timestamp' => res[TIMESTAMP],
                'module' => res[MODULE],
                'eventname' => res[EVENTNAME])
        res.each do |k, v|
          if ![TIMESTAMP, MODULE, EVENTNAME, MEETINGID].include?(k)
            if res[MODULE] == 'PRESENTATION' and key == 'slidesInfo'
              # The slidesInfo value is XML serialized info, just insert it
              # directly into the event
              event << v
            elsif res[MODULE] == 'CHAT' and res[EVENTNAME] == 'PublicChatEvent' and k == 'message'
              # Apply a cleanup that removes certain ranges of special
              # characters from chat messages
              event << events_doc.create_element(k, v.tr("\u0000-\u001f\u007f\u2028",''))
            else
              event << events_doc.create_element(k, v)
            end
          end
        end

        # Stop reading events if we've reached the recording break for this
        # segment
        if res[MODULE] == 'PARTICIPANT' and res[EVENTNAME] == 'RecordChapterBreakEvent' and res['breakTimestamp'] == break_timestamp
          last_index = i
          break
        end
      end

      # And, finally, write the events file.
      io = File.open(events_file, 'wb')
      io.write(events_doc.to_xml(indent: 2, encoding: 'UTF-8'))
      io.close
    end

    
    def store_events(meeting_id)
	Encoding.default_external="UTF-8"
      xml = Builder::XmlMarkup.new( :indent => 2 )
      
            msgs = @redis.events_for(meeting_id)                      
            msgs.each do |msg|
              res = @redis.event_info_for(meeting_id, msg)
              xml.event(:timestamp => res[TIMESTAMP], :module => res[MODULE], :eventname => res[EVENTNAME]) {
                res.each do |key, val|
                  if not [TIMESTAMP, MODULE, EVENTNAME, MEETINGID].include?(key)
                    # a temporary solution for enable a good display of the xml in the presentation module and for add CDATA to chat
                    if res[MODULE] == "PRESENTATION" && key == "slidesInfo"
                      xml.method_missing(key){
                        xml << val
                      }
                    elsif res[MODULE] == "CHAT" && res[EVENTNAME] == "PublicChatEvent" && key == "message"
                      xml.method_missing(key){
                        xml.cdata!(val.tr("\u0000-\u001f\u007f\u2028",''))
                      }
                    else
                      xml.method_missing(key,  val)
                    end
                  end
                end
              }
            end
          }
      end  
      xml.target!
    end

    def delete_events(meeting_id)
      meeting_metadata = @redis.metadata_for(meeting_id)
      if (meeting_metadata != nil)
        msgs = @redis.events_for(meeting_id)                      
        msgs.each do |msg|
          @redis.delete_event_info_for(meeting_id, msg) 
        end
        @redis.delete_events_for(meeting_id)
      end
      @redis.delete_metadata_for(meeting_id) 
      @redis.delete_breakout_metadata_for(meeting_id) 
      @redis.delete_breakout_rooms_for(meeting_id)
    end
    
    def save_events_to_file(directory, result)
      File.open("#{directory}/events.xml", 'w') do |f2|  
        f2.puts result
      end 
    end
  end
end

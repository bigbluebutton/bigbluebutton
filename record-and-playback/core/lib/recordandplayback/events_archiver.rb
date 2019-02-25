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
    
    def store_events(meeting_id, events_file)
      version = YAML::load(File.open('../../core/scripts/bigbluebutton.yml'))["bbb_version"]

      events_doc = Nokogiri::XML::Document.new()
      recording = events_doc.create_element(
        'recording',
        'meeting_id' => meeting_id,
        'bbb_version' => version
      )
      events_doc.root = recording

      meeting_metadata = @redis.metadata_for(meeting_id)
      return if meeting_metadata.nil?

      # Fill in the top-level meeting element
      meeting = events_doc.create_element(
        'meeting',
        'id' => meeting_id,
        'externalId' => meeting_metadata[MEETINGID],
        'name' => meeting_metadata[MEETINGNAME],
        'breakout' => meeting_metadata[ISBREAKOUT]
      )
      recording << meeting

      # Fill in the top-level metadata element
      recording << events_doc.create_element('metadata', meeting_metadata)

      # Fill in the top-level breakout element
      if @redis.has_breakout_metadata_for(meeting_id)
        breakout_metadata = @redis.breakout_metadata_for(meeting_id)
        recording << events_doc.create_element('breakout', breakout_metadata)
      end

      # Fill in the top-level breakoutRooms list
      if @redis.has_breakout_rooms_for(meeting_id)
        breakoutRooms = events_doc.create_element('breakoutRooms')
        recording << breakoutRooms
        breakout_rooms = @redis.breakout_rooms_for(meeting_id)
        breakout_rooms.each do |breakout_room|
          breakoutRooms << events_doc.create_element('breakoutRoom', breakout_room)
        end
      end

      msgs = @redis.events_for(meeting_id)
      msgs.each do |msg|
        res = @redis.event_info_for(meeting_id, msg)
        event = events_doc.create_element(
          'event',
          'timestamp' => res[TIMESTAMP],
          'module' => res[MODULE],
          'eventname' => res[EVENTNAME]
        )
        res.each do |k, v|
          next if [TIMESTAMP, MODULE, EVENTNAME, MEETINGID].include?(k)

          if res[MODULE] == 'PRESENTATION' && k == 'slidesInfo'
            # The slidesInfo value is XML serialized info, just insert it directly into the event
            event << v
          elsif res[MODULE] == 'CHAT' && res[EVENTNAME] == 'PublicChatEvent' && k == 'message'
            # Apply a cleanup that removes certain ranges of special characters from chat messages
            event << events_doc.create_element(k, v.tr("\u0000-\u001f\u007f\u2028", ''))
          else
            event << events_doc.create_element(k, v)
          end
        end

        # Handle out of order events - if this event has an earlier timestamp than the last event
        # in the file, find the correct spot (it's usually no more than 1 or 2 off).
        # Make sure not to change the relative order of two events with the same timestamp.
        previous_event = recording.last_element_child
        while previous_event.name == 'event' && previous_event['timestamp'].to_i > event['timestamp'].to_i
          previous_event = previous_event.previous_element
        end
        previous_event.add_next_sibling(event)
      end

      # Write to the events file
      File.open(events_file, 'wb') do |io|
        io.write(events_doc.to_xml(indent: 2, encoding: 'UTF-8'))
      end
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
  end
end

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
    
    def breakout_metadata_for(meeting_id)
      @redis.hgetall("meeting:breakout:#{meeting_id}")
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
      msg = build_message build_header(message_type), additional_payload.merge({
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
    
    def initialize(redis)
      @redis = redis
    end
    
    def store_events(meeting_id)
	Encoding.default_external="UTF-8"
      xml = Builder::XmlMarkup.new( :indent => 2 )
      result = xml.instruct! :xml, :version => "1.0", :encoding=>"UTF-8"
      
      meeting_metadata = @redis.metadata_for(meeting_id)
      breakout_metadata = @redis.breakout_metadata_for(meeting_id)
      version = YAML::load(File.open('../../core/scripts/bigbluebutton.yml'))["bbb_version"]

      if (meeting_metadata != nil)
          xml.recording(:meeting_id => meeting_id, :bbb_version => version) {
            xml.metadata(meeting_metadata)
            xml.breakout(breakout_metadata)
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
    end
    
    def save_events_to_file(directory, result)
      File.open("#{directory}/events.xml", 'w') do |f2|  
        f2.puts result
      end 
    end
  end
end

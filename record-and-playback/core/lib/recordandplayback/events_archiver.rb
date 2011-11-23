require 'rubygems'
require 'redis'
require 'builder'

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
    
    def num_events_for(meeting_id)
      @redis.llen("meeting:#{meeting_id}:recordings")
    end
    
    def events_for(meeting_id)
      @redis.lrange("meeting:#{meeting_id}:recordings", 0, num_events_for(meeting_id))
    end
    
    def event_info_for(meeting_id, event)
      @redis.hgetall("recording:#{meeting_id}:#{event}")
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
      xml = Builder::XmlMarkup.new( :indent => 2 )
      result = xml.instruct! :xml, :version => "1.0"
      
      meeting_metadata = @redis.metadata_for(meeting_id)

      if (meeting_metadata != nil)
          xml.recording(:meeting_id => meeting_id) {
            xml.metadata(meeting_metadata)
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
							xml.cdata!(val)
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
    
    def save_events_to_file(directory, result)
      File.open("#{directory}/events.xml", 'w') do |f2|  
        f2.puts result
      end 
    end
  end
end
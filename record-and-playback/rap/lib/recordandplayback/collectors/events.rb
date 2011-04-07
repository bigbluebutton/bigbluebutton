require 'rubygems'
require 'redis'
require 'builder'

module BigBlueButton
  class RedisEventsArchiver
    def connect(host, port)
      @redis = Redis.new(:host => host, :port => port)
      @redis.client.connect
    end
    
    def disconnect
      @redis.client.disconnect
    end
    
    def is_connected?
      @redis.client.connected?
    end
    
    # Big NO-NO! But let's do this for now!
    def setup_test_data
      @redis.hset("meeting:ttmg5003:metadata", "prof", "Tony B.")
      @redis.hset("meeting:ttmg5003:metadata", "title", "TIM Prog")
    end
    
    def store_events(meeting_id)
      #@metadata = @redis.hgetall("meeting:metadata:#{meeting_id}")
      @metadata = @redis.hgetall("meeting:ttmg5003:metadata")
      puts @metadata["prof"] @metadata["title"]
      
      start = "timestamp"
      duration = "duration"

      xml = Builder::XmlMarkup.new( :indent => 2 )

      result = xml.instruct! :xml, :version => "1.0"

      timestamp = ( Time::now ).utc.strftime("%Y-%m-%dT%H:%M:%S") 
      xml.tag!("ns2:mediapackage", "duration" => "1000"   , "start" => timestamp, "xmlns:ns2" => "http://mediapackage.opencastproject.org" ){ 
        xml.media{
          xml.track("id" => "track-1", "type" => "presenter/source"){
          }
           xml.track("id" => "track-2", "type" => "presentation/source"){
          }
          xml.track("id" => "track-3", "type" => "presenter/source"){
          }
        }     
        xml.metadata{
          xml.catalog("id" => "catalog-1", "type" => "dublincore/episode"){
            xml.mimetype("text/xml")
            xml.url("dublincore.xml")
          }
        }
      } 
      puts xml.target!
      
    end
  end
end


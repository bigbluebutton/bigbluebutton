require 'rubygems'
require 'redis'
require 'builder'

meeting_id = "8774263b-c4a6-4078-b2e6-46b7d4bc91c1" 
r = Redis.new(:host => "192.168.0.166", :port => 6379)
r.del "meeting:#{meeting_id}:metadata"
r.hmset("meeting:#{meeting_id}:metadata", "prof", "Tony", "title", "Ecosystem", "date", "April 7, 2011", "subject", "TIM 101")
res = r.hgetall "meeting:#{meeting_id}:metadata"
puts res.keys.join(",")
puts res["prof"]
puts res["title"]


xml = Builder::XmlMarkup.new( :indent => 2 )

result = xml.instruct! :xml, :version => "1.0"

meeting_metadata = r.hgetall("meeting:#{meeting_id}:metadata")

if (meeting_metadata != nil)
    xml.recording(:meeting => meeting_id) {
      xml.metadata {
        meeting_metadata.each do |key, val|
          xml.method_missing(key, val)
        end
      }
      
      count = r.llen("meeting:#{meeting_id}:recordings")
      msgs = r.lrange("meeting:#{meeting_id}:recordings", 0, count)
                
      msgs.each do |msg|
        res = r.hgetall("recording:#{meeting_id}:#{msg}")
        timestamp = res['timestamp']
        mod = res['module']
        eventname = res['eventName']
        xml.event(:timestamp => timestamp, :module => mod, :eventname => eventname) {
          res.each do |key, val|
            if not ['timestamp', 'module', 'eventName', 'meetingId'].include?(key)
              xml.method_missing(key,  val)
            end
          end
        }
      end
    }
end

puts xml.target!
 
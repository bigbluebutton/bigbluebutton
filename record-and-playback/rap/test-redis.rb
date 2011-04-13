require 'rubygems'
require 'redis'
require 'builder'

meeting_id = "8774263b-c4a6-4078-b2e6-46b7d4bc91c1" 
r = Redis.new(:host => "192.168.168.128", :port => 6379)
r.del "meeting:#{meeting_id}:metadata"
r.hmset("meeting:#{meeting_id}:metadata", "prof", "Tony", "title", "Ecosystem", "date", "April 7, 2011", "subject", "TIM 101")
res = r.hgetall "meeting:#{meeting_id}:metadata"
puts res.keys.join(",")
puts res["prof"]
puts res["title"]



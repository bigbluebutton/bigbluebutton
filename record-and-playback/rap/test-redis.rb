require 'lib/recordandplayback'
require 'rubygems'
require 'redis'
require 'builder'

redis = BigBlueButton::RedisWrapper.new("192.168.0.166", 6379)
events_archiver = BigBlueButton::RedisEventsArchiver.new redis

puts events_archiver.store_events('58f4a6b3-cd07-444d-8564-59116cb53974')

require 'lib/recordandplayback/generators/audio'


e = 'resources/raw/1b199e88-7df7-4842-a5f1-0e84b781c5c8/events.xml'
g = Generator::AudioEvents.new(e)
puts g.first_event_timestamp
puts g.last_event_timestamp

#puts g.get_first_timestamp_of_session(e)
#puts g.get_last_timestamp_of_session(e)
puts "Start Events"
g.recording_events.each do |ev|
  puts ev
end

af = "/var/freeswitch/meetings/1b199e88-7df7-4842-a5f1-0e84b781c5c8-20110202-041415.wav"
g.determine_length_of_audio_from_file(af)

#sd = g.get_start_audio_recording_events(e)

puts "Stop Events"
#sf = g.get_stop_audio_recording_events(e)

#g.match_start_and_stop_events(sd, sf)
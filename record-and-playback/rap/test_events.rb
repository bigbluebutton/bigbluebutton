require 'lib/recordandplayback/generators/audio'


e = 'resources/raw/1b199e88-7df7-4842-a5f1-0e84b781c5c8/events.xml'
g = Generator::AudioEvents.new
puts g.get_first_timestamp_of_session(e)
puts g.get_last_timestamp_of_session(e)
puts g.get_start_audio_recording_events(e)
puts g.get_stop_audio_recording_events(e)

require 'lib/recordandplayback'
require 'rubygems'
require 'trollop'
require 'yaml'

puts "archiver 0.1 - BigBlueButton"

opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :default => '58f4a6b3-cd07-444d-8564-59116cb53974', :type => String
  opt :config, "Ping all the sites"
end

p opts

meeting_id = opts[:meeting_id]

props = YAML::load(File.open('properties.yaml'))

scripts_home = props['scripts_home']
audio_dir = props['audio_dir']
video_dir = props['video_dir']
deskshare_dir = props['deskshare_dir']
presentation_dir = props['presentation_dir']
archive_dir = props['archive_dir']
redis_host = props['redis_host']
redis_port = props['redis_port']
ingest_dir = props['ingest_dir']
publish_dir = props['publish_dir']
playback_host = props['playback_host']

#BigBlueButton::EventsArchiver.archive('meeting_id')
BigBlueButton::AudioArchiver.archive(meeting_id, audio_dir, archive_dir)  

from_dir = "#{presentation_dir}/#{meeting_id}/#{meeting_id}"
puts from_dir
BigBlueButton::PresentationArchiver.archive(meeting_id, from_dir, archive_dir)

from_dir = "#{video_dir}/#{meeting_id}"
puts from_dir
BigBlueButton::VideoArchiver.archive(meeting_id, from_dir, archive_dir)

from_dir = "#{deskshare_dir}"
puts from_dir
BigBlueButton::DeskshareArchiver.archive(meeting_id, from_dir, archive_dir)
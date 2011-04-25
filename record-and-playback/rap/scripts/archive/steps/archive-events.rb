require '../lib/recordandplayback'
require 'rubygems'
require 'trollop'
require 'yaml'

opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :default => '58f4a6b3-cd07-444d-8564-59116cb53974', :type => String
end

meeting_id = opts[:meeting_id]

# This script lives in scripts/archive/steps while properties.yaml lives in scripts/
props = YAML::load(File.open('properties.yaml'))

redis_host = props['redis_host']
redis_port = props['redis_port']
archive_dir = props['archive_dir']

BigBlueButton::EventsArchiver.archive(archive_dir, meeting_id, redis_host, redis_port) 

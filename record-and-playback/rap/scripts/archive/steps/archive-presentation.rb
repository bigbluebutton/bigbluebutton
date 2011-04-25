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

presentation_dir = props['presentation_dir']
archive_dir = props['archive_dir']

from_dir = "#{presentation_dir}/#{meeting_id}/#{meeting_id}"
BigBlueButton::PresentationArchiver.archive(meeting_id, from_dir, archive_dir)

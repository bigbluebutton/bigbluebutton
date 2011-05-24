require '../../core/lib/recordandplayback'
require 'rubygems'
require 'trollop'
require 'yaml'
require 'builder'

opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :default => '58f4a6b3-cd07-444d-8564-59116cb53974', :type => String
end

meeting_id = opts[:meeting_id]

logger = Logger.new("/var/log/bigbluebutton/simple-publish-#{meeting_id}.log", 'daily' )
BigBlueButton.logger = logger

# This script lives in scripts/archive/steps while properties.yaml lives in scripts/
bbb_props = YAML::load(File.open('../../core/scripts/bigbluebutton.yml'))
simple_props = YAML::load(File.open('simple.yml'))

recording_dir = bbb_props['recording_dir']
process_dir = "#{recording_dir}/process/simple/#{meeting_id}"
publish_dir = simple_props['publish_dir']
playback_host = simple_prop['playback_host']

target_dir = "#{recording_dir}/publish/simple/#{meeting_id}"
if FileTest.directory?(target_dir)
  FileUtils.remove_dir target_dir
end
FileUtils.mkdir_p target_dir

package_dir = "#{target_dir}/#{meeting_id}"
FileUtils.mkdir_p package_dir

audio_dir = "#{package_dir}/audio"
FileUtils.mkdir_p audio_dir

FileUtils.cp("#{process_dir}/audio.ogg", audio_dir)
FileUtils.cp("#{process_dir}/events.xml", package_dir)
FileUtils.cp_r("#{process_dir}/presentation", package_dir)

FileUtils.cp_r(package_dir, publish_dir)
dir_list = Dir.entries(publish_dir) - ['.', '..']
dir_list.each do |d|
  if File::directory?("#{publish_dir}/#{d}")
    puts d
  end
end



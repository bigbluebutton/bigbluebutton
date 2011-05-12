require '../lib/recordandplayback'
require 'rubygems'
require 'trollop'
require 'yaml'

opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :default => '58f4a6b3-cd07-444d-8564-59116cb53974', :type => String
end

meeting_id = opts[:meeting_id]

# This script lives in scripts/archive/steps while matterhorn.yaml lives in scripts/
props = YAML::load(File.open('properties.yaml'))

matt_server = props['matterhorn_server']
matt_inbox = props['matterhorn_inbox']
matt_key = props['matterhorn_key']
recording_dir = props['recording_dir']
process_dir = "#{recording_dir}/process/matterhorn/#{meeting_id}"

target_dir = "#{recording_dir}/publish/matterhorn/#{meeting_id}"
if FileTest.directory?(target_dir)
  FileUtils.remove_dir target_dir
end
FileUtils.mkdir_p target_dir

FileUtils.cp("#{process_dir}/muxed-audio-webcam.flv", target_dir)
FileUtils.cp("#{process_dir}/deskshare.flv", target_dir)
FileUtils.cp("#{process_dir}/manifest.xml", target_dir)
FileUtils.cp("#{process_dir}/dublincore.xml", target_dir)

puts Dir.pwd
Dir.chdir(target_dir) do
  puts Dir.pwd
  BigBlueButton::MatterhornProcessor.zip_artifacts("muxed-audio-webcam.flv", "deskshare.flv", "dublincore.xml", "manifest.xml", "#{meeting_id}.zip")
end
puts Dir.pwd

cmd = "scp -i #{matt_key} #{target_dir}/#{meeting_id}.zip #{matt_server}:#{matt_inbox}"
puts cmd
Open3.popen3(cmd) do | stdin, stdout, stderr|
    p $?.exitstatus 
end

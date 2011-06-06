require '../../core/lib/recordandplayback'
require 'rubygems'
require 'trollop'
require 'yaml'



opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :default => '58f4a6b3-cd07-444d-8564-59116cb53974', :type => String
end

meeting_id = opts[:meeting_id]

match = /(.*)-(.*)/.match meeting_id
meeting_id = match[1]
playback = match[2]

if (playback == "matterhorn")
	logger = Logger.new("/var/log/bigbluebutton/matterhorn-publish-#{meeting_id}.log", 'daily' )
	BigBlueButton.logger = logger

	# This script lives in scripts/archive/steps while matterhorn.yaml lives in scripts/
	bbb_props = YAML::load(File.open('../../core/scripts/bigbluebutton.yml'))
	matt_props = YAML::load(File.open('matterhorn.yml'))
	scp_server = matt_props['scp_server']
	scp_inbox = matt_props['scp_inbox']
	scp_key = matt_props['scp_key']
	scp_user = matt_props['scp_user']
	recording_dir = bbb_props['recording_dir']
	
	process_dir = "#{recording_dir}/process/matterhorn/#{meeting_id}"	
	target_dir = "#{recording_dir}/publish/matterhorn/#{meeting_id}"
	if not FileTest.directory?(target_dir)
		FileUtils.mkdir_p target_dir
		
		FileUtils.cp("#{process_dir}/muxed-audio-webcam.flv", target_dir)
		FileUtils.cp("#{process_dir}/deskshare.flv", target_dir)
		FileUtils.cp("#{process_dir}/manifest.xml", target_dir)
		FileUtils.cp("#{process_dir}/dublincore.xml", target_dir)
		
		Dir.chdir(target_dir) do
		  BigBlueButton::MatterhornProcessor.zip_artifacts("muxed-audio-webcam.flv", "deskshare.flv", "dublincore.xml", "manifest.xml", "#{meeting_id}.zip")
		end
		
		command = "scp -i #{scp_key} #{target_dir}/#{meeting_id}.zip #{scp_user}@#{scp_server}:#{scp_inbox}"
		BigBlueButton.logger.info(command)
		Open3.popen3(command) do | stdin, stdout, stderr|
		    BigBlueButton.logger.info("scp result=#{$?.exitstatus}")
		end
	else
		
	end
end

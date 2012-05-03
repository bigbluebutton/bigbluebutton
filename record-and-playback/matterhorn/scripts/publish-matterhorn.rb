# Set encoding to utf-8
# encoding: UTF-8

require '../../core/lib/recordandplayback'
require 'rubygems'
require 'yaml'

bbb_props = YAML::load(File.open('../../core/scripts/bigbluebutton.yml'))
matt_props = YAML::load(File.open('matterhorn.yml'))
scp_server = matt_props['server']
scp_inbox = matt_props['inbox']
scp_key = matt_props['key']
scp_user = matt_props['user']
recording_dir = bbb_props['recording_dir']

done_files = Dir.glob("#{recording_dir}/status/processed/*.done")
done_files.each do |df|
  match = /(.*)-(.*).done/.match df.sub(/.+\//, "")
  meeting_id = match[1]
  if (match[2] == "matterhorn")
    BigBlueButton.logger = Logger.new("/var/log/bigbluebutton/matterhorn/publish-#{meeting_id}.log", 'daily' )

    process_dir = "#{recording_dir}/process/matterhorn/#{meeting_id}"
    target_dir = "#{recording_dir}/publish/matterhorn/#{meeting_id}"
    if not FileTest.directory?(target_dir)
      FileUtils.mkdir_p target_dir

      WEBCAM = "muxed-audio-webcam.flv"
      DESKSHARE = "deskshare.flv"
      MANIFEST = "manifest.xml"
      DUBLIN = "dublincore.xml"

      [WEBCAM, DESKSHARE, MANIFEST, DUBLIN].each { |file| FileUtils.cp("#{process_dir}/#{file}", target_dir)}

      Dir.chdir(target_dir) do
        BigBlueButton::MatterhornProcessor.zip_artifacts(WEBCAM, DESKSHARE, DUBLIN, MANIFEST, "#{meeting_id}.zip")
      end

      command = "scp -i #{scp_key} -o StrictHostKeyChecking=no -o CheckHostIP=no #{target_dir}/#{meeting_id}.zip #{scp_user}@#{scp_server}:#{scp_inbox}"
      BigBlueButton.logger.info(command)
      Open3.popen3(command) do | stdin, stdout, stderr|
        BigBlueButton.logger.info("scp result=#{$?.exitstatus}")
      end
    end
  end
end

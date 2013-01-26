# Set encoding to utf-8
# encoding: UTF-8
#
# BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
#
# Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
#
# This program is free software; you can redistribute it and/or modify it under the
# terms of the GNU Lesser General Public License as published by the Free Software
# Foundation; either version 3.0 of the License, or (at your option) any later
# version.
#
# BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
# PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License along
# with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
#

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

      files = [WEBCAM, DESKSHARE, MANIFEST, DUBLIN]
      files.select! do |file| 
	if File.exist?("#{process_dir}/#{file}") 
	 FileUtils.cp("#{process_dir}/#{file}", target_dir) 
	 file
	end
      end
	BigBlueButton.logger.info files
      Dir.chdir(target_dir) do
        BigBlueButton::MatterhornProcessor.zip_artifacts(files, "#{meeting_id}.zip")
      end

      command = "scp -i #{scp_key} -o StrictHostKeyChecking=no -o CheckHostIP=no #{target_dir}/#{meeting_id}.zip #{scp_user}@#{scp_server}:#{scp_inbox}"
      BigBlueButton.execute(command)

      BigBlueButton.logger.info("Removing processed files.")
      FileUtils.rm_r(Dir.glob("#{process_dir}/*"))

      BigBlueButton.logger.info("Removing published files.")
      FileUtils.rm_r(Dir.glob("#{target_dir}/*"))

    end
  end
end

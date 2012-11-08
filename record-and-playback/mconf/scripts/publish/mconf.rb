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
require 'cgi'
bbb_props = YAML::load(File.open('../../core/scripts/bigbluebutton.yml'))
simple_props = YAML::load(File.open('mconf.yml'))
recording_dir = bbb_props['recording_dir']
playback_host = simple_props['playback_host']
publish_dir = simple_props['publish_dir']
done_files = Dir.glob("#{recording_dir}/status/processed/*.done")
done_files.each do |df|
  match = /(.*)-(.*).done/.match df.sub(/.+\//, "")
  meeting_id = match[1]
  if (match[2] == "mconf")
    BigBlueButton.logger = Logger.new("/var/log/bigbluebutton/mconf/publish-#{meeting_id}.log", 'daily' )

    process_dir = "#{recording_dir}/process/mconf/#{meeting_id}"
    target_dir = "#{recording_dir}/publish/mconf/#{meeting_id}"
    if not FileTest.directory?(target_dir)
      FileUtils.mkdir_p target_dir

      Dir.chdir(target_dir) do
        BigBlueButton::MconfProcessor.zip_directory(process_dir, "#{meeting_id}.zip")
      

      	metadata = BigBlueButton::Events.get_meeting_metadata("#{process_dir}/#{meeting_id}/events.xml")
      	
	BigBlueButton.logger.info("Verifying events: #{metadata[:keypublic.to_s]}")
	public_key_decoded = CGI::unescape("#{metadata[:keypublic.to_s]}")
      	
	length = 16
      	chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      	password = ''
      	length.times { password << chars[rand(chars.size)] }      
      
      	passfile = File.new("#{meeting_id}.txt", "w")
      	passfile.write "#{password}"
      	passfile.close

      	keypublic = File.new("key-public.pem","w") 
      	keypublic.write  "#{public_key_decoded}"
      	keypublic.close  

      	command = "openssl enc -aes-256-cbc -pass file:#{meeting_id}.txt < #{meeting_id}.zip > #{meeting_id}.dat"
      	BigBlueButton.logger.info(command)
      	Open3.popen3(command) do | stdin, stdout, stderr|
      		BigBlueButton.logger.info("commandresult=")#{$?.exitstatus}")
      	end
      	command = "openssl rsautl -encrypt -pubin -inkey key-public.pem < #{meeting_id}.txt > #{meeting_id}.enc"
      	BigBlueButton.logger.info(command)
      	Open3.popen3(command) do | stdin, stdout, stderr|
      		BigBlueButton.logger.info("commandresult=") #{$?.exitstatus}")
      	end

	BigBlueButton.logger.info("Removing files")
	PUBLICKEY = "key-public.pem"
	PASSFILE = "#{meeting_id}.txt"
	ZIPFILE = "#{meeting_id}.zip"
	
	[PUBLICKEY, PASSFILE, ZIPFILE].each  { |file| FileUtils.rm_f(file)}
	
	BigBlueButton.logger.info("Creating metadata.xml")
	# Create metadata.xml
	b = Builder::XmlMarkup.new(:indent => 2)
	metaxml = b.recording {
		b.id(meeting_id)
		b.state("available")
		b.published(true)
		# Date Format for recordings: Thu Mar 04 14:05:56 UTC 2010
		b.start_time(BigBlueButton::Events.first_event_timestamp("#{process_dir}/#{meeting_id}/events.xml"))
		b.end_time(BigBlueButton::Events.last_event_timestamp("#{process_dir}/#{meeting_id}/events.xml"))
		b.playback {
			b.format("mconf")
		b.link("http://#{playback_host}/mconf/#{meeting_id}/#{meeting_id}.dat")
		}
		b.meta {
			BigBlueButton::Events.get_meeting_metadata("#{process_dir}/#{meeting_id}/events.xml").each { |k,v| b.method_missing(k,v) }
		}
        }

	metadata_xml = File.new("metadata.xml","w")
	metadata_xml.write(metaxml)
	metadata_xml.close
	
	BigBlueButton.logger.info("Removing processed files.")
	FileUtils.rm_r(Dir.glob("#{process_dir}/*"))
	
	BigBlueButton.logger.info("Publishing slides")
	# Now publish this recording    
	if not FileTest.directory?(publish_dir)
		FileUtils.mkdir_p publish_dir
	end
	FileUtils.cp_r(target_dir, publish_dir)
      end

    end
  end
end


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
require 'net/http'
require 'rexml/document'
require 'open-uri'
require 'digest/md5'


#BigBlueButton.logger = Logger.new("/var/log/bigbluebutton/uncrypt.log",'daily' )

BigBlueButton.logger = Logger.new("/var/log/bigbluebutton/uncypt.log",'daily' ) 

bbb_props = YAML::load(File.open('../../core/scripts/bigbluebutton.yml'))
mconf_props = YAML::load(File.open('mconf.yml'))
#private_key = mconf_props['privatekey']
xml_url = mconf_props['get_recordings_url']
recording_dir = bbb_props['recording_dir'] 
rawdir = "#{recording_dir}/raw"
archived_dir = "#{recording_dir}/status/archived"

xml_data = Net::HTTP.get_response(URI.parse(xml_url)).body
doc = REXML::Document.new(xml_data)

files_url = []
types = []
keys_url = []
md5_server_side = []
doc.elements.each('response/recordings/recording/download/format/type') do |type|
   types << type.text
end
doc.elements.each('response/recordings/recording/download/format/url') do |url|
    files_url << url.text
end
doc.elements.each('response/recordings/recording/download/format/md5') do |md5|
    md5_server_side << md5.text
end
doc.elements.each('response/recordings/recording/download/format/key') do |key|
    keys_url << key.text
end

types.each_with_index do |eachtype, idx|
	if (eachtype == "encrypted") then
		url = files_url[idx]
		k_url = keys_url[idx]
		encrypted_file = url.split("/").last
		match = /(.*).dat/.match encrypted_file
		meeting_id = match[1]
		if not File.exist?("#{archived_dir}/#{meeting_id}.done") then
			Dir.chdir(rawdir) do

				writeOut = open(encrypted_file, "wb")
				writeOut.write(open(url).read)
				writeOut.close

				md5sum = Digest::MD5.file(encrypted_file)

				if (md5sum == md5_server_side[idx]) then
					key_file = k_url.split("/").last
					writeOut = open(key_file, "wb")
					writeOut.write(open(k_url).read)
					writeOut.close

					puts "salvo"
	
					command = "openssl rsautl -decrypt -inkey key.pem < #{key_file} > key.txt"
					BigBlueButton.logger.info(command)
					Open3.popen3(command) do | stdin, stdout, stderr|
						BigBlueButton.logger.info("commandresult=") #{$?.exitstatus}")
					end
					command = "openssl enc -aes-256-cbc -d -pass file:key.txt < #{encrypted_file} > #{meeting_id}.zip"
					BigBlueButton.logger.info(command)
					Open3.popen3(command) do | stdin, stdout, stderr|
						BigBlueButton.logger.info("commandresult2") #{$?.exitstatus}")
					end
		
			        	BigBlueButton::MconfProcessor.unzip(rawdir, "#{meeting_id}.zip")


					archived_done = File.new("#{archived_dir}/#{meeting_id}.done", "w")
					archived_done.write("Archived #{meeting_id}")
					archived_done.close
					
					BigBlueButton.logger.info("Removing files")
					ZIPFILE = "#{meeting_id}.zip"
					[encrypted_file, key_file, "key.txt", ZIPFILE].each  { |file| FileUtils.rm_f(file)}
				else
					FileUtils.rm_f(encrypted_file)
				end
				
			end
		end

	end
end


#BigBlueButton.logger.info("DIR: #{recording_dir} ")
=begin
criptfiles = Dir.glob("#{recording_dir}/raw/*.dat")
criptfiles.each do |cf|
  match = /(.*).dat/.match cf.sub(/.+\//, "")
  meeting_id = match[1]
	if File.exist?("#{rawdir}/#{meeting_id}.enc") 
	      Dir.chdir(rawdir) do
		command = "openssl rsautl -decrypt -inkey key.pem < #{meeting_id}.enc > key.txt"
		BigBlueButton.logger.info(command)
		Open3.popen3(command) do | stdin, stdout, stderr|
			#BigBlueButton.logger.info("commandresult=") #{$?.exitstatus}")
		end
		command = "openssl enc -aes-256-cbc -d -pass file:key.txt < #{meeting_id}.dat > #{meeting_id}.zip"
		BigBlueButton.logger.info(command)
		Open3.popen3(command) do | stdin, stdout, stderr|
			#BigBlueButton.logger.info("commandresult2") #{$?.exitstatus}")
		end
		
        	BigBlueButton::MconfProcessor.unzip(rawdir, "#{meeting_id}.zip")

	      end
	end


    BigBlueButton.logger = Logger.new("/var/log/bigbluebutton/mconf/uncrypt-#{meeting_id}.log", 'daily' )
    BigBlueButton.logger.info("teste Meeting id calculated:")
    BigBlueButton.logger = Logger.new("/var/log/bigbluebutton/mconf/uncrypt.log", 'daily' )
    BigBlueButton.logger.info("Meeting id calculated: #{meeting_id}")
end
=end

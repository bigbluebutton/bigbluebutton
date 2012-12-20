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



#BigBlueButton.logger = Logger.new("/var/log/bigbluebutton/uncrypt.log",'daily' )

BigBlueButton.logger = Logger.new("/var/log/bigbluebutton/uncypt.log",'daily' ) 


bbb_props = YAML::load(File.open('../../core/scripts/bigbluebutton.yml'))
mconf_props = YAML::load(File.open('mconf.yml'))
#private_key = mconf_props['privatekey']
recording_dir = bbb_props['recording_dir'] 
rawdir = "#{recording_dir}/raw"
#BigBlueButton.logger.info("DIR: #{recording_dir} ")
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


#    BigBlueButton.logger = Logger.new("/var/log/bigbluebutton/mconf/uncrypt-#{meeting_id}.log", 'daily' )

#BigBlueButton.logger.info("teste Meeting id calculated:")
#    BigBlueButton.logger = Logger.new("/var/log/bigbluebutton/mconf/uncrypt.log", 'daily' )
#    BigBlueButton.logger.info("Meeting id calculated: #{meeting_id}")
end



#!/usr/bin/ruby
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

#
# Tools for post_scripts. 
#


require '../lib/recordandplayback'

logger = Logger.new("/var/log/bigbluebutton/bbb-rap-worker.log",'daily' )
logger.level = Logger::INFO
BigBlueButton.logger = logger


#
# => Compress directory
#

def compress(dir_to_compress, compressed_file)
	BigBlueButton.logger.info "Compressing directory #{dir_to_compress} in #{compressed_file}"

end


#
# => Send by email
#

def send_email(message, dest)
	BigBlueButton.logger.info "Sending email to #{dest}"
end


#
# => SCP file to server
#

def scp_file(file, server, credentials)
	BigBlueButton.logger.info "Sending #{file} via SCP to #{server}"
end


#
# => Send text message
#

def send_text_message(message, number)
	BigBlueButton.logger.info "Sending text message to #{destination}"
end


#
# => Send to S3
#

def send_to_s3(file, bucket)
	BigBlueButton.logger.info "Sending #{file} to #{bucket}"
end


#
# => Make them public for download
#

def expose(file)
	BigBlueButton.logger.info "Exposing #{file} "
end
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
# == Post Publish script ==
#  Manage your published files.
#

require "trollop"
require "./post_scripts/post_phase_tools.rb"

opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :default => '58f4a6b3-cd07-444d-8564-59116cb53974', :type => String
end
meeting_id = opts[:meeting_id]
logger = Logger.new("/var/log/bigbluebutton/bbb-rap-worker.log",'daily' )
logger.level = Logger::INFO
BigBlueButton.logger = logger
published_files = "/var/bigbluebutton/published/presentation/#{meeting_id}"
meeting_metadata = BigBlueButton::Events.get_meeting_metadata("/var/bigbluebutton/recording/raw/#{meeting_id}/events.xml")
post_metadata = Hash[meeting_metadata.select { |key, value| key.to_s.match(/^postpublish+/) }.map{ |k,v| [k.gsub("postpublish",""), v.value]}]


#
# Put your code here
#

=begin
	# Send email
	message = "Your recording #{meeting_id} has been published."
	dest = post_metadata["email"]
	send_email(message,dest)
=end

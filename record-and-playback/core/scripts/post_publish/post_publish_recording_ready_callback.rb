#!/usr/bin/ruby
# encoding: UTF-8

#
# BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
#
# Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
#
# This program is free software; you can redistribute it and/or modify it under
# the terms of the GNU Lesser General Public License as published by the Free
# Software Foundation; either version 3.0 of the License, or (at your option)
# any later version.
#
# BigBlueButton is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
# details.
#
# You should have received a copy of the GNU Lesser General Public License along
# with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
#

require "trollop"
require 'net/http'
require "jwt"
require "java_properties"
require File.expand_path('../../../lib/recordandplayback', __FILE__)

logger = Logger.new("/var/log/bigbluebutton/post_publish.log", 'weekly' )
logger.level = Logger::INFO
BigBlueButton.logger = logger

opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :type => String
end
meeting_id = opts[:meeting_id]

processed_files = "/var/bigbluebutton/recording/process/presentation/#{meeting_id}"
meeting_metadata = BigBlueButton::Events.get_meeting_metadata("/var/bigbluebutton/recording/raw/#{meeting_id}/events.xml")

#
# Main code
#
BigBlueButton.logger.info("Recording Ready Notify for [#{meeting_id}] starts")

begin
  callback_url = meeting_metadata.key?("bbb-recording-ready-url") ? meeting_metadata["bbb-recording-ready-url"].value : nil
  # For compatibility with some 3rd party implementations, look up for bn-recording-ready-url or canvas-recording-ready, when bbb-recording-ready is not included.
  callback_url ||= meeting_metadata.key?("bn-recording-ready-url") ? meeting_metadata["bn-recording-ready-url"].value : nil
  callback_url ||= meeting_metadata.key?("canvas-recording-ready-url") ? meeting_metadata["canvas-recording-ready-url"].value : nil


  unless callback_url.nil?
    BigBlueButton.logger.info("Making callback for recording ready notification")

    props = JavaProperties::Properties.new("/usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties")
    secret = props[:securitySalt]
    external_meeting_id = meeting_metadata["meetingId"].value

    payload = { meeting_id: external_meeting_id, record_id: meeting_id }
    payload_encoded = JWT.encode(payload, secret)

    uri = URI.parse(callback_url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = (uri.scheme == 'https')

    BigBlueButton.logger.info("Sending request to #{uri.scheme}://#{uri.host}#{uri.request_uri}")
    request = Net::HTTP::Post.new(uri.request_uri)
    request.set_form_data({ signed_parameters: payload_encoded })

    response = http.request(request)
    code = response.code.to_i

    if code == 410
      BigBlueButton.logger.info("Notified for deleted meeting: #{meeting_id}")
      # TODO: should we automatically delete the recording here?
    elsif code == 404
      BigBlueButton.logger.info("404 error when notifying for recording: #{meeting_id}, ignoring")
    elsif code < 200 || code >= 300
      BigBlueButton.logger.info("Callback HTTP request failed: #{response.code} #{response.message} (code #{code})")
    else
      BigBlueButton.logger.info("Recording notifier successful: #{meeting_id} (code #{code})")
    end
  end

rescue => e
  BigBlueButton.logger.info("Rescued")
  BigBlueButton.logger.info(e.to_s)
end

BigBlueButton.logger.info("Recording Ready notify ends")

exit 0

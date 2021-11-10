#!/usr/bin/ruby
# frozen_string_literal: true

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

require 'java_properties'
require 'jwt'
require 'net/http'
require 'nokogiri'
require 'trollop'

require File.expand_path('../../../lib/recordandplayback', __FILE__)

logger = Logger.new('/var/log/bigbluebutton/post_publish.log', 'weekly')
logger.level = Logger::INFO
BigBlueButton.logger = logger

opts = Trollop.options do
  opt :meeting_id, 'Meeting id to archive', type: String
  opt :format, 'Playback format name', type: String
end

# Breakout room meeting ID
meeting_id = opts[:meeting_id]

props = JavaProperties::Properties.new('/etc/bigbluebutton/bbb-web.properties')

published_files = "/var/bigbluebutton/published/presentation/#{meeting_id}"
metadata = Nokogiri::XML(File.open("#{published_files}/metadata.xml"))

# Only run script for breakout rooms
exit(0) if metadata.xpath('recording/meeting/@breakout').to_s.eql? 'false'

begin
  room_name = metadata.xpath('recording/meta/meetingName').text
  presentation_upload_token = metadata.xpath('recording/breakout/@presentationUploadToken').to_s
  parent_meeting_id = metadata.xpath('recording/breakout/@parentMeetingId').to_s

  callback_url = "#{props[:"bigbluebutton.web.serverURL"]}/bigbluebutton/presentation/#{presentation_upload_token}/upload"

  unless callback_url.nil?
    BigBlueButton.logger.info("Upload PDF callback for breakout room [#{meeting_id}]")

    file = "#{published_files}/#{room_name}.pdf"

    params = [['presentation_name', "#{room_name}.pdf"],
              ['Filename', "#{room_name}.pdf"],
              ['fileUpload', File.open(file)],
              ['conference', parent_meeting_id],
              ['room', parent_meeting_id],
              %w[pod_id DEFAULT_PRESENTATION_POD],
              %w[is_downloadable false]]

    uri = URI.parse(callback_url)

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = (uri.scheme == 'https')

    BigBlueButton.logger.info("Sending request to #{uri.scheme}://#{uri.host}#{uri.request_uri}")

    request = Net::HTTP::Post.new(uri.request_uri)
    request.set_form(params, 'multipart/form-data')

    response = http.request(request)
    BigBlueButton.logger.info("PDF upload HTTP request for main room #{parent_meeting_id} returned: #{response.code} #{response.message}")
  end
rescue StandardError => e
  BigBlueButton.logger.info('Rescued')
  BigBlueButton.logger.info(e.to_s)
end

BigBlueButton.logger.info('Breakout PDF upload ends')

exit(0)
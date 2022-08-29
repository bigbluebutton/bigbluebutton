# BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
#
# Copyright (c) 2017 BigBlueButton Inc. and by respective authors (see below).
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

require 'rexml/document'
require 'optparse'
require 'uri'
require 'net/http'

#### Start ####

options = {}
OptionParser.new do |opts|
  opts.on("-m", "--machine-readable", "Make the output radable for machine") do |m|
    options[:machine_readable] = m
  end
  opts.on("-uURL_STRING", "--url-string=URL_STRING", "Url string") do |u|
    options[:url_string] = u
  end
end.parse!

url = options[:url_string]
uri = URI(url)
res = Net::HTTP.get_response(uri)

xml_string = res.body if res.is_a?(Net::HTTPSuccess)
xml_object = REXML::Document.new(xml_string)
string_list_internalID = ""

if (!options[:machine_readable])
  string_list_internalID += "|Internal meeting ID | Name | Start time | Moderator count | Viewer count | \\n"
  string_list_internalID += "---------------------------------------------------------------------------\\n"
  xml_object.get_elements("//meeting").each_with_index do |item, index|
    meetingId = item.get_elements("//internalMeetingID")[index].text
    meetingName = item.get_elements("//meetingName")[index].text
    startTime = item.get_elements("//createDate")[index].text
    moderatorCount = item.get_elements("//moderatorCount")[index].text.to_i
    viewerCount = item.get_elements("//participantCount")[index].text.to_i - moderatorCount
    
    string_list_internalID += "|" + meetingId + " | " + meetingName + " | " + startTime + " | " + moderatorCount.to_s + " | " + viewerCount.to_s + " |\\n"
  end
else
  xml_object.get_elements("//internalMeetingID").each do |item|
    string_list_internalID += " " +  item.text
  end 
end

puts string_list_internalID

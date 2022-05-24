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

require 'optimist'
require 'nokogiri'
require 'uri'
require 'net/http'

#### Start ####

opts = Optimist::options do
    opt :url_string, "url string", :type => :string
    opt "machine-readable", "Make the output readable for machine"
end

url = opts[:url_string]
uri = URI(url)
res = Net::HTTP.get_response(uri)

xml_string = res.body if res.is_a?(Net::HTTPSuccess)
xml_object = Nokogiri::XML(xml_string)
string_list_internalID = ""

if (!opts["machine-readable"])
    string_list_internalID += "|Internal meeting ID | Name | Start time | Moderator count | Viewer count | \\n"
    string_list_internalID += "---------------------------------------------------------------------------\\n"
    xml_object.xpath("//meeting").each_with_index do |item, index|
        meetingId = item.xpath("//internalMeetingID")[index].text
        meetingName = item.xpath("//meetingName")[index].text
        startTime = item.xpath("//createDate")[index].text
        moderatorCount = item.xpath("//moderatorCount")[index].text.to_i
        viewerCount = item.xpath("//participantCount")[index].text.to_i - moderatorCount

        string_list_internalID += "|" + meetingId + " | " + meetingName + " | " + startTime + " | " + moderatorCount.to_s + " | " + viewerCount.to_s + " |\\n"
    end
else
    xml_object.xpath("//internalMeetingID").each do |item|
        string_list_internalID += " " +  item.text
    end 
end

puts string_list_internalID
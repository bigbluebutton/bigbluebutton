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

require 'spec_helper'
require 'redis'

module BigBlueButton
  describe Events do       
    context "#success" do
      it "should extract the meeting metadata" do               
        dir = "resources/raw"
        events_xml = "#{dir}/metadata.xml"
        metadata = BigBlueButton::Events.get_meeting_metadata(events_xml)
        puts metadata
        puts metadata['title']
      end
      
      it "should write the meeting metadata" do               
        metadata = { 'title' => "Business Ecosystem",
                      'subject' => "TTMG 5001",
                      'description' => "How to manage your product's ecosystem",
                      'creator' => "Richard Alam",
                      'contributor' => "Popen3", 
                      'language' => "en-US",
                      'identifier' => "ttmg-5001-2"}
        
        xml = Builder::XmlMarkup.new( :indent => 2 )
        result = xml.instruct! :xml, :version => "1.0"
        xml.metadata (metadata)
        puts result
      end
    end
  end
end
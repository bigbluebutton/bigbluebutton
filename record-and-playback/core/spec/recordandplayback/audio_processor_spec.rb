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
require 'digest/md5'

module BigBlueButton
  describe AudioEvents do
    context "#success" do
    
      it "should find the timestamp of the first event" do
        events_xml = 'resources/raw/good_audio_events.xml'
        BigBlueButton::Events.first_event_timestamp(events_xml).should == 50
      end
      
      it "should find the timestamp of the last event" do
        events_xml = 'resources/raw/good_audio_events.xml'
        BigBlueButton::Events.last_event_timestamp(events_xml).should == 1000
      end   

    end
  end
end

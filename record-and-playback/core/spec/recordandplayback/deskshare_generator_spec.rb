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
  describe "DeskshareProcessing" do
    context "#success" do
      it "should get the 2 webcam start events" do
        dir = "resources/raw"
        events_xml = "#{dir}/webcam-events.xml"
        se = BigBlueButton::Events.get_start_video_events(events_xml)
        se.size.should == 2
      end

      it "should get the 2 webcam stop events" do
        dir = "resources/raw"
        events_xml = "#{dir}/webcam-events.xml"
        se = BigBlueButton::Events.get_stop_video_events(events_xml)
        se.size.should == 2       
      end

      it "should match the 2 webcam events" do
        dir = "resources/raw"
        events_xml = "#{dir}/webcam-events.xml"
        start = BigBlueButton::Events.get_start_video_events(events_xml)
        start.size.should == 2       
        stop = BigBlueButton::Events.get_stop_video_events(events_xml)
        stop.size.should == 2
        matched = BigBlueButton::Events.match_start_and_stop_video_events(start, stop)
        matched.size.should == 2
      end
      
      it "should get the 2 deskshare start events" do
        dir = "resources/raw/974a4b8c-5bf7-4382-b4cd-eb26af7dfcc2"
        events_xml = "#{dir}/events.xml"
        BigBlueButton::Events.get_start_deskshare_events(events_xml).size.should == 2
      end

      it "should get the 2 deskshare stop events" do
        dir = "resources/raw/974a4b8c-5bf7-4382-b4cd-eb26af7dfcc2"
        events_xml = "#{dir}/events.xml"
        BigBlueButton::Events.get_stop_deskshare_events(events_xml).size.should == 2
      end
      
      it "should get the webcam start events" do
        dir = "resources/raw"
        events_xml = "#{dir}/webcam-events.xml"
        se = BigBlueButton::Events.get_start_video_events(events_xml)
        se.size.should == 2
      end

      it "should get the webcam stop events" do
        dir = "resources/raw"
        events_xml = "#{dir}/webcam-events.xml"
        se = BigBlueButton::Events.get_stop_video_events(events_xml)
        se.size.should == 2       
      end

      it "should get the deskshare start events" do
        dir = "resources/raw/8774263b-c4a6-4078-b2e6-46b7d4bc91c1"
        events_xml = "#{dir}/events.xml"
        BigBlueButton::Events.get_start_deskshare_events(events_xml).size.should == 1
      end

      it "should get the deskshare stop events" do
        dir = "resources/raw/8774263b-c4a6-4078-b2e6-46b7d4bc91c1"
        events_xml = "#{dir}/events.xml"
        BigBlueButton::Events.get_stop_deskshare_events(events_xml).size.should == 1
      end
      
    end
  end
end

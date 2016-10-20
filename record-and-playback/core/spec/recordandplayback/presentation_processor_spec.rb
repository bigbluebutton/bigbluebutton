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
require 'fileutils'

module BigBlueButton
  describe Presentation do
    context "#success" do
      it "should generate a complete audio file for the recording" do
        dir = "resources/raw/1b199e88-7df7-4842-a5f1-0e84b781c5c8"
        events_xml = "#{dir}/events.xml"
        presentations_dir = "#{dir}/presentations"
        BigBlueButton::Presentation.get_presentations(events_xml).size.should equal(2)
      end
      
      it "should determine the number of pages in a presentation" do
        dir = "resources/raw/1b199e88-7df7-4842-a5f1-0e84b781c5c8"
        events_xml = "#{dir}/events.xml"
        presentations_dir = "#{dir}/presentations/aSimple-Layout"
        BigBlueButton::Presentation.get_number_of_pages_for(presentations_dir).should equal(6)
      end
      
    end
  end
end

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
    end
  end
end
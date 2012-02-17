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
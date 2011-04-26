require 'rubygems'
require 'nokogiri'

module BigBlueButton
  module Events
    # Get the timestamp of the first event.
    def self.first_event_timestamp(events_xml)
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("recording/event").first["timestamp"].to_s
    end
    
    # Get the timestamp of the last event.
    def self.last_event_timestamp(events_xml)
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("recording/event").last["timestamp"].to_s
    end  
  end
end
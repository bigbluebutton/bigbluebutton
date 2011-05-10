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
    
    def self.get_start_video_events(events_xml)
      start_events = []
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("//event[@name='ParticipantStatusChangeEvent']").each do |start_event|
        if (start_event.xpath('status').text == "streamName") and (not start_event.xpath('value').text == "")
          s = {:timestamp => start_event['timestamp'], :stream => start_event.xpath('value').text, :userid => start_event.xpath('userId').text}
          start_events << s
        end
      end
      start_events
    end

    def self.get_stop_video_events(events_xml)
      stop_events = []
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("//event[@name='ParticipantStatusChangeEvent']").each do |stop_event|
        if (stop_event.xpath('status').text == "streamName") and (stop_event.xpath('value').text== "")
          s = {:timestamp => stop_event['timestamp'], :userid => stop_event.xpath('userId').text}
          stop_events << s
        end
      end
      stop_events
    end
    
    def self.get_start_deskshare_events(events_xml)
      start_events = []
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("//event[@name='DeskshareStartedEvent']").each do |start_event|
        s = {:timestamp => start_event['timestamp'], :file => start_event.xpath('file').text}
        start_events << s
      end
      start_events
    end

    def self.get_stop_deskshare_events(events_xml)
      stop_events = []
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("//event[@name='DeskshareStoppedEvent']").each do |stop_event|
        s = {:timestamp => stop_event['timestamp'], :file => stop_event.xpath('file').text}
        stop_events << s
      end
      stop_events
    end    
  end
end
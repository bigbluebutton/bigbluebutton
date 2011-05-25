require 'rubygems'
require 'nokogiri'

module BigBlueButton
  module Events
  
    def self.get_meeting_metadata(events_xml)
      doc = Nokogiri::XML(File.open(events_xml))
      metadata = {}
      doc.xpath("//metadata").each do |e| 
        e.keys.each do |k| 
          metadata[k] = e.attribute(k)
        end
      end  
      metadata
    end
    
    # Get the timestamp of the first event.
    def self.first_event_timestamp(events_xml)
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("recording/event").first["timestamp"].to_i
    end
    
    # Get the timestamp of the last event.
    def self.last_event_timestamp(events_xml)
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("recording/event").last["timestamp"].to_i
    end  
    
    # Determine if the start and stop event matched.
    def self.find_video_event_matched(start_events, stop)      
      start_events.each do |start|
        if (start[:stream] == stop[:stream])
          return start
        end      
      end
      return nil
    end
    
    # Match the start and stop events.
    def self.match_start_and_stop_video_events(start_events, stop_events)
      matched_events = []
      stop_events.each do |stop|
        start_evt = find_video_event_matched(start_events, stop)
        if start_evt
          start_evt[:stop_timestamp] = stop[:stop_timestamp]
          matched_events << start_evt
        else
          matched_events << stop
        end
      end      
      matched_events.sort { |a, b| a[:start_timestamp] <=> b[:start_timestamp] }
    end
            
    def self.get_start_video_events(events_xml)
      start_events = []
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("//event[@eventname='ParticipantStatusChangeEvent']").each do |start_event|
        if (start_event.xpath('status').text == "hasStream") 
          match = /(.+),stream=(.+)/.match start_event.xpath('value').text
          shared = match[1].match(/true$/i) != nil
          if (shared)
            start_events << {:start_timestamp => start_event['timestamp'].to_i, :stream => match[2], :shared => shared, :userid => start_event.xpath('userId').text}
          end
        end
      end
      start_events
    end

    def self.get_stop_video_events(events_xml)
      stop_events = []
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("//event[@eventname='ParticipantStatusChangeEvent']").each do |stop_event|
        if (stop_event.xpath('status').text == "hasStream")
          match = /(.+),stream=(.+)/.match stop_event.xpath('value').text
          not_shared = match[1].match(/false$/i) != nil
          if (not_shared)
            stop_events << {:stop_timestamp => stop_event['timestamp'].to_i, :userid => stop_event.xpath('userId').text, :stream => match[2], :shared => not_shared}
          end
        end
      end
      stop_events
    end
        
    # Determine if the start and stop event matched.
    def self.deskshare_event_matched?(stop_events, start)      
      stop_events.each do |stop|
        if (start[:stream] == stop[:stream])
          start[:matched] = true
          start[:stop_timestamp] = stop[:stop_timestamp]
          return true
        end      
      end
      return false
    end
    
    # Match the start and stop events.
    def self.match_start_and_stop_deskshare_events(start_events, stop_events)
      combined_events = []
      start_events.each do |start|
        if not video_event_matched?(stop_events, start) 
          stop_event = {:stop_timestamp => stop[:stop_timestamp], :stream => stop[:stream], :matched => false}
          combined_events << stop_event
        else
          stop_events = stop_events - [stop_event]
        end
      end      
      return combined_events.concat(start_events)
    end    
    
    def self.get_start_deskshare_events(events_xml)
      start_events = []
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("//event[@eventname='DeskshareStartedEvent']").each do |start_event|
        s = {:start_timestamp => start_event['timestamp'].to_i, :stream => start_event.xpath('file').text.sub(/(.+)\//, "")}
        start_events << s
      end
      start_events.sort {|a, b| a[:start_timestamp] <=> b[:start_timestamp]}
    end

    def self.get_stop_deskshare_events(events_xml)
      stop_events = []
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("//event[@eventname='DeskshareStoppedEvent']").each do |stop_event|
        s = {:stop_timestamp => stop_event['timestamp'].to_i, :stream => stop_event.xpath('file').text.sub(/(.+)\//, "")}
        stop_events << s
      end
      stop_events.sort {|a, b| a[:stop_timestamp] <=> b[:stop_timestamp]}
    end    
  end
end
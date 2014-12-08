# Set encoding to utf-8
# encoding: UTF-8

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


require 'rubygems'
require 'nokogiri'

module BigBlueButton
  module Events
  
    # Get the meeting metadata
    def self.get_meeting_metadata(events_xml)
      BigBlueButton.logger.info("Task: Getting meeting metadata")
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
      BigBlueButton.logger.info("Task: Getting the timestamp of the first event.")
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("recording/event").first["timestamp"].to_i
    end
    
    # Get the timestamp of the last event.
    def self.last_event_timestamp(events_xml)
      BigBlueButton.logger.info("Task: Getting the timestamp of the last event")
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("recording/event").last["timestamp"].to_i
    end  
    
    # Determine if the start and stop event matched.
    def self.find_video_event_matched(start_events, stop)      
      BigBlueButton.logger.info("Task: Finding video events that match")
      start_events.each do |start|
        if (start[:stream] == stop[:stream])
          return start
        end      
      end
      return nil
    end
    
    # Match the start and stop events.
    def self.match_start_and_stop_video_events(start_events, stop_events)
      BigBlueButton.logger.info("Task: Matching the start and stop events")
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
      
    # Get start video events  
    def self.get_start_video_events(events_xml)
      BigBlueButton.logger.info("Task: Getting start video events")
      start_events = []
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("//event[@eventname='StartWebcamShareEvent']").each do |start_event|
        start_events << {:start_timestamp => start_event['timestamp'].to_i, :stream => start_event.xpath('stream').text}
      end
      start_events
    end

    # Get stop video events
    def self.get_stop_video_events(events_xml)
      BigBlueButton.logger.info("Task: Getting stop video events")
      stop_events = []
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("//event[@eventname='StopWebcamShareEvent']").each do |stop_event|
        stop_events << {:stop_timestamp => stop_event['timestamp'].to_i, :stream => stop_event.xpath('stream').text}
      end
      stop_events
    end

    # Build a webcam EDL
    def self.create_webcam_edl(archive_dir)
      events = Nokogiri::XML(File.open("#{archive_dir}/events.xml"))

      recording = events.at_xpath('/recording')
      meeting_id = recording['meeting_id']
      event = events.at_xpath('/recording/event[position()=1]')
      initial_timestamp = event['timestamp'].to_i
      event = events.at_xpath('/recording/event[position()=last()]')
      final_timestamp = event['timestamp'].to_i

      video_dir = "#{archive_dir}/video/#{meeting_id}"

      videos = {}
      active_videos = []
      video_edl = []
      
      video_edl << {
        :timestamp => 0,
        :areas => { :webcam => [] } 
      }

      events.xpath('/recording/event[@module="WEBCAM"]').each do |event|
        timestamp = event['timestamp'].to_i - initial_timestamp
        case event['eventname']
        when 'StartWebcamShareEvent'
          stream = event.at_xpath('stream').text
          filename = "#{video_dir}/#{stream}.flv"

          videos[filename] = { :timestamp => timestamp }
          active_videos << filename

          edl_entry = {
            :timestamp => timestamp,
            :areas => { :webcam => [] }
          }
          active_videos.each do |filename|
            edl_entry[:areas][:webcam] << {
              :filename => filename,
              :timestamp => timestamp - videos[filename][:timestamp]
            }
          end
          video_edl << edl_entry
        when 'StopWebcamShareEvent'
          stream = event.at_xpath('stream').text
          filename = "#{video_dir}/#{stream}.flv"

          active_videos.delete(filename)

          edl_entry = {
            :timestamp => timestamp,
            :areas => { :webcam => [] }
          }
          active_videos.each do |filename|
            edl_entry[:areas][:webcam] << {
              :filename => filename,
              :timestamp => timestamp - videos[filename][:timestamp]
            }
          end
          video_edl << edl_entry
        end
      end

      video_edl << {
        :timestamp => final_timestamp - initial_timestamp,
        :areas => { :webcam => [] }
      }

      return video_edl
    end

        
    # Determine if the start and stop event matched.
    def self.deskshare_event_matched?(stop_events, start)
      BigBlueButton.logger.info("Task: Determining if the start and stop DESKSHARE events matched")      
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
      BigBlueButton.logger.info("Task: Matching start and stop DESKSHARE events")      
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
      BigBlueButton.logger.info("Task: Getting start DESKSHARE events")      
      start_events = []
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("//event[@eventname='DeskshareStartedEvent']").each do |start_event|
        s = {:start_timestamp => start_event['timestamp'].to_i, :stream => start_event.xpath('file').text.sub(/(.+)\//, "")}
        start_events << s
      end
      start_events.sort {|a, b| a[:start_timestamp] <=> b[:start_timestamp]}
    end

    def self.get_stop_deskshare_events(events_xml)
      BigBlueButton.logger.info("Task: Getting stop DESKSHARE events")      
      stop_events = []
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("//event[@eventname='DeskshareStoppedEvent']").each do |stop_event|
        s = {:stop_timestamp => stop_event['timestamp'].to_i, :stream => stop_event.xpath('file').text.sub(/(.+)\//, "")}
        stop_events << s
      end
      stop_events.sort {|a, b| a[:stop_timestamp] <=> b[:stop_timestamp]}
    end

    def self.create_deskshare_edl(archive_dir)
      events = Nokogiri::XML(File.open("#{archive_dir}/events.xml"))

      event = events.at_xpath('/recording/event[position()=1]')
      initial_timestamp = event['timestamp'].to_i
      event = events.at_xpath('/recording/event[position()=last()]')
      final_timestamp = event['timestamp'].to_i

      deskshare_edl = []

      deskshare_edl << {
        :timestamp => 0,
        :areas => { :deskshare => [] }
      }

      events.xpath('/recording/event[@module="Deskshare"]').each do |event|
        timestamp = event['timestamp'].to_i - initial_timestamp
        case event['eventname']
        when 'DeskshareStartedEvent'
          filename = event.at_xpath('file').text
          filename = "#{archive_dir}/deskshare/#{File.basename(filename)}"
          deskshare_edl << {
            :timestamp => timestamp,
            :areas => {
              :deskshare => [
                { :filename => filename, :timestamp => 0 }
              ]
            }
          }
        when 'DeskshareStoppedEvent'
          deskshare_edl << {
            :timestamp => timestamp,
            :areas => { :deskshare => [] }
          }
        end
      end

      deskshare_edl << {
        :timestamp => final_timestamp - initial_timestamp,
        :areas => {}
      }

      return deskshare_edl
    end

    def self.edl_match_recording_marks_audio(edl, archive_dir)
      calculate_entry_files_timestamp = Proc.new do |edl_entry, offset|
        edl_entry[:audio][:timestamp] += offset if edl_entry[:audio]
      end

      empty_entry = {
        :timestamp => nil,
        :audio => nil
      }

      return edl_match_recording_marks(edl, archive_dir, calculate_entry_files_timestamp, empty_entry)
    end

    def self.edl_match_recording_marks_video(edl, archive_dir)
      calculate_entry_files_timestamp = Proc.new do |edl_entry, offset|
        if edl_entry[:areas][:webcam]
          edl_entry[:areas][:webcam].each do |webcam_entry|
            webcam_entry[:timestamp] += offset
          end
        end
        if edl_entry[:areas][:deskshare]
          edl_entry[:areas][:deskshare].each do |deskshare_entry|
            deskshare_entry[:timestamp] += offset
          end
        end
      end

      empty_entry = {
        :timestamp => nil,
        :areas => { :webcam => [], :deskshare => [] }
      }

      return edl_match_recording_marks(edl, archive_dir, calculate_entry_files_timestamp, empty_entry)
    end

    def self.edl_match_recording_marks_deskshare(edl, archive_dir)
      calculate_entry_files_timestamp = Proc.new do |edl_entry, offset|
        edl_entry[:areas][:deskshare].each do |webcam_entry|
          webcam_entry[:timestamp] += offset
        end
      end

      empty_entry = {
        :timestamp => nil,
        :areas => { :deskshare => [] }
      }

      return edl_match_recording_marks(edl, archive_dir, calculate_entry_files_timestamp, empty_entry)
    end

    def self.edl_match_recording_marks(edl, archive_dir, calculate_entry_files_timestamp, empty_entry)
      events = Nokogiri::XML(File.open("#{archive_dir}/events.xml"))
      event = events.at_xpath('/recording/event[position()=1]')
      initial_timestamp = event['timestamp'].to_i

      start_stop_events = BigBlueButton::Events.match_start_and_stop_rec_events(BigBlueButton::Events.get_start_and_stop_rec_events("#{archive_dir}/events.xml"))
      # translated the timestamps to the recording timestamp
      start_stop_events.each do |record_event|
        record_event[:start_timestamp] -= initial_timestamp
        record_event[:stop_timestamp] -= initial_timestamp
      end
      BigBlueButton.logger.debug "start_stop_events:\n#{BigBlueButton.hash_to_str(start_stop_events)}"

      # add duration to EDL
      edl.each_with_index do |edl_entry, i|
        if i == edl.length-1
          edl_entry[:duration] = 0
        else
          edl_entry[:duration] = edl[i+1][:timestamp] - edl_entry[:timestamp]
        end
      end

      BigBlueButton.logger.debug "edl with duration:\n#{BigBlueButton.hash_to_str(edl)}"

      edl_postprocessed = []
      start_stop_events.each do |record_event|
        edl.each do |edl_entry|
          edl_copy = Marshal.load(Marshal.dump(edl_entry))

          edl_start = edl_entry[:timestamp]
          edl_stop = edl_entry[:timestamp] + edl_entry[:duration]
          rec_start = record_event[:start_timestamp]
          rec_stop = record_event[:stop_timestamp]

          # edl doesn't match with the recording marks
          if (edl_start < rec_start and edl_stop < rec_start) or (edl_start > rec_stop and edl_stop > rec_stop)
            next
          end

          # adjust the beginning timestamp
          if edl_start < rec_start
            edl_copy[:timestamp] = rec_start
            edl_copy[:duration] -= rec_start - edl_start
            calculate_entry_files_timestamp.call(edl_copy, rec_start - edl_start)
            # edl_copy[:audio][:timestamp] = rec_start - edl_start
          end

          # adjust the duration
          if edl_stop > rec_stop
            edl_copy[:duration] -= edl_stop - rec_stop
          end

          edl_postprocessed << edl_copy
        end
      end

      # trim the intervals
      next_timestamp = 0
      edl_postprocessed.each do |edl_entry|
        edl_entry[:timestamp] = next_timestamp
        next_timestamp += edl_entry[:duration]
      end
      empty_entry[:timestamp] = next_timestamp
      edl_postprocessed << empty_entry
#      edl_postprocessed << {
#        :timestamp => next_timestamp,
#        media_symbol => nil
#      }
      BigBlueButton.logger.debug "edl_postprocessed:\n#{BigBlueButton.hash_to_str(edl_postprocessed)}"
      return edl_postprocessed
    end

    def self.linkify( text )
      generic_URL_regexp = Regexp.new( '(^|[\n ])([\w]+?://[\w]+[^ \"\n\r\t<]*)', Regexp::MULTILINE | Regexp::IGNORECASE )
      starts_with_www_regexp = Regexp.new( '(^|[\n ])((www)\.[^ \"\t\n\r<]*)', Regexp::MULTILINE | Regexp::IGNORECASE )

      s = text.to_s
      s.gsub!( generic_URL_regexp, '\1<a href="\2">\2</a>' )
      s.gsub!( starts_with_www_regexp, '\1<a href="http://\2">\2</a>' )
      s.gsub!('href="event:', 'href="')
      s
    end

    def self.get_record_status_events(events_xml)
      BigBlueButton.logger.info "Getting record status events"
      doc = Nokogiri::XML(File.open(events_xml))
      rec_events = []
      doc.xpath("//event[@eventname='RecordStatusEvent']").each do |event|
        s = { :timestamp => event['timestamp'].to_i }
        rec_events << s
      end
      rec_events.sort_by {|a| a[:timestamp]}
    end

    # Get events when the moderator wants the recording to start or stop
    def self.get_start_and_stop_rec_events(events_xml)
      BigBlueButton.logger.info "Getting start and stop rec button events"
      rec_events = BigBlueButton::Events.get_record_status_events(events_xml)
      if rec_events.empty?
        # old recording generated in a version without the record button
        rec_events << { :timestamp => BigBlueButton::Events.first_event_timestamp(events_xml) }
      end
      if rec_events.size.odd?
        # user did not click on the record button to stop the recording
        rec_events << { :timestamp => BigBlueButton::Events.last_event_timestamp(events_xml) }
      end
      rec_events.sort_by {|a| a[:timestamp]}
    end
    
    # Match recording start and stop events
    def self.match_start_and_stop_rec_events(rec_events)
      BigBlueButton.logger.info ("Matching record events")
      matched_rec_events = []
      rec_events.each_with_index do |evt,i|
        if i.even?
          matched_rec_events << {
            :start_timestamp => evt[:timestamp],
            :stop_timestamp => rec_events[i + 1][:timestamp]
          }
        end
      end
      matched_rec_events
    end

    # Version of the bbb server where it was recorded
    def self.bbb_version(events_xml)
      events = Nokogiri::XML(File.open(events_xml))      
      recording = events.at_xpath('/recording')
      recording['bbb_version']      
    end

  end
end

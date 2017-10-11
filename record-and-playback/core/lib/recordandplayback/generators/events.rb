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
  
    # Get the total number of participants
    def self.get_num_participants(events_xml)
      BigBlueButton.logger.info("Task: Getting num participants")
      doc = Nokogiri::XML(File.open(events_xml))
      participants_ids = []

      doc.xpath("//event[@eventname='ParticipantJoinEvent']").each do |joinEvent|
         userId = joinEvent.xpath(".//userId").text

         #removing "_N" at the end of userId
         userId.gsub!(/_\d*/, "")

         if !participants_ids.include? userId
            BigBlueButton.logger.info("Counting id = #{userId}")
            participants_ids << userId
         end
      end

      BigBlueButton.logger.info("get_num_participants = #{participants_ids.length}")
      participants_ids.length
    end

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

    # Get the external meeting id
    def self.get_external_meeting_id(events_xml)
      BigBlueButton.logger.info("Task: Getting external meeting id")
      metadata = get_meeting_metadata(events_xml)
      external_meeting_id = {}
      external_meeting_id = metadata['meetingId'] if !metadata['meetingId'].nil?
      external_meeting_id
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

    def self.get_matched_start_and_stop_deskshare_events(events_path)
      last_timestamp = BigBlueButton::Events.last_event_timestamp(events_path)
      deskshare_start_events = BigBlueButton::Events.get_start_deskshare_events(events_path)
      deskshare_stop_events = BigBlueButton::Events.get_stop_deskshare_events(events_path)
      return BigBlueButton::Events.match_start_and_stop_deskshare_events(
        deskshare_start_events,
        deskshare_stop_events,
        last_timestamp)
    end

    # Match the start and stop events.
    def self.match_start_and_stop_deskshare_events(start_events, stop_events, last_timestamp)
      BigBlueButton.logger.info("Task: Matching the start and stop deskshare events")
      matched_events = []
      start_events.each do |start|
        stop = find_video_event_matched(stop_events, start)
        if stop
          start[:stop_timestamp] = stop[:stop_timestamp]
        else
          start[:stop_timestamp] = last_timestamp
        end
        matched_events << start
      end
      matched_events.sort { |a, b| a[:start_timestamp] <=> b[:start_timestamp] }
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
          # Fill in the original/expected video duration when available
          duration = event.at_xpath('duration')
          if !duration.nil?
            duration = duration.text.to_i
            filename = event.at_xpath('file').text
            filename = "#{archive_dir}/deskshare/#{File.basename(filename)}"
            deskshare_edl.each do |entry|
              if !entry[:areas][:deskshare].nil?
                entry[:areas][:deskshare].each do |file|
                  if file[:filename] == filename
                    file[:original_duration] = duration * 1000
                  end
                end
              end
            end
          end

          # Terminating entry
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
      edl_entry_offset = Proc.new do |edl_entry, offset|
        new_entry = { :audio => nil }
        if edl_entry[:audio]
          new_entry[:audio] = {
            :filename => edl_entry[:audio][:filename],
            :timestamp => edl_entry[:audio][:timestamp] + offset
          }
        end
        if edl_entry[:original_duration]
          new_entry[:original_duration] = edl_entry[:original_duration]
        end
        new_entry
      end
      edl_empty_entry = Proc.new do
        { :audio => nil }
      end
      return BigBlueButton::Events.edl_match_recording_marks(edl, archive_dir,
                      edl_entry_offset, edl_empty_entry)
    end

    def self.edl_match_recording_marks_video(edl, archive_dir)
      edl_entry_offset = Proc.new do |edl_entry, offset|
        new_entry = { :areas => {} }
        edl_entry[:areas].each do |area, videos|
          new_entry[:areas][area] = []
          videos.each do |video|
            new_entry[:areas][area] << {
              :filename => video[:filename],
              :timestamp => video[:timestamp] + offset,
              :original_duration => video[:original_duration]
            }
          end
        end
        new_entry
      end
      edl_empty_entry = Proc.new do
        { :areas => {} }
      end
      return BigBlueButton::Events.edl_match_recording_marks(edl, archive_dir,
                      edl_entry_offset, edl_empty_entry)
    end

    def self.get_start_stop_events_for_edl(archive_dir)
      initial_timestamp = BigBlueButton::Events.first_event_timestamp(
              "#{archive_dir}/events.xml")
      start_stop_events = BigBlueButton::Events.match_start_and_stop_rec_events(
              BigBlueButton::Events.get_start_and_stop_rec_events(
                     "#{archive_dir}/events.xml"))
      start_stop_events.each do |record_event|
        record_event[:start_timestamp] -= initial_timestamp
        record_event[:stop_timestamp] -= initial_timestamp
      end
      return start_stop_events
    end

    def self.edl_match_recording_marks(edl, archive_dir, edl_entry_offset, edl_empty_entry)
      start_stop_events = BigBlueButton::Events.get_start_stop_events_for_edl(archive_dir)

      last_stop_timestamp = 0
      offset = 0

      new_edl = [ edl_empty_entry.call ]

      # Do a sanity check on the values
      if edl.first[:timestamp] > start_stop_events.first[:start_timestamp]
        raise "Recording start event is before first EDL entry"
      end
      if edl.last[:timestamp] < start_stop_events.last[:stop_timestamp]
        raise "Recording stop event is after last EDL entry"
      end

      output_i = 0

      # Loop over all the recorded intervals to build the new edl
      start_stop_events.each do |start_stop_event|
        BigBlueButton.logger.debug("Recording interval: #{start_stop_event[:start_timestamp]} to #{start_stop_event[:stop_timestamp]}")
        offset += start_stop_event[:start_timestamp] - last_stop_timestamp
        BigBlueButton.logger.debug("Offset is now #{offset}")

        input_i = 0

        # Find the last EDL event from before or at the recording start
        loop do
          break if input_i + 1 >= edl.length
          break if edl[input_i+1][:timestamp] > start_stop_event[:start_timestamp]
          input_i += 1
        end

        BigBlueButton.logger.debug("Found last event prior to recording start:")
        BigBlueButton.logger.debug(BigBlueButton.hash_to_str(edl[input_i]))

        # Add the first event, trimming the start as needed.
        initial_trim = start_stop_event[:start_timestamp] - edl[input_i][:timestamp]
        BigBlueButton.logger.debug("Have to trim #{initial_trim}")
        new_edl[output_i] = edl_entry_offset.call(edl[input_i], initial_trim)
        new_edl[output_i][:timestamp] = start_stop_event[:start_timestamp] - offset
        BigBlueButton.logger.debug("New event at recording start:")
        BigBlueButton.logger.debug(BigBlueButton.hash_to_str(new_edl[output_i]))
        output_i += 1

        # Add the intervening events up to the stop
        loop do
          input_i += 1
          break if input_i >= edl.length
          break if edl[input_i][:timestamp] >= start_stop_event[:stop_timestamp]

          new_edl[output_i] = edl_entry_offset.call(edl[input_i], 0)
          new_edl[output_i][:timestamp] = edl[input_i][:timestamp] - offset

          output_i += 1
        end

        # Add a terminating event at the stop timestamp
        new_edl[output_i] = edl_empty_entry.call
        new_edl[output_i][:timestamp] = start_stop_event[:stop_timestamp] - offset

        # Note that output_i isn't incremented here
        # In the next loop iteration, the terminating entry will be replaced
        # with the next video start.

        last_stop_timestamp = start_stop_event[:stop_timestamp]
      end

      return new_edl
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

    # Calculate the length of the final recording from the start/stop events
    def self.get_recording_length(rec_events)
      duration = 0
      start_stop_events = BigBlueButton::Events.match_start_and_stop_rec_events(
              BigBlueButton::Events.get_start_and_stop_rec_events(rec_events))
      start_stop_events.each do |start_stop|
        duration += start_stop[:stop_timestamp] - start_stop[:start_timestamp]
      end
      duration
    end

    # Check whether any webcams were shared during the recording
    # This can be used to e.g. skip webcam processing or change the layout
    # of the final recording
    def self.have_webcam_events(events_xml)
      BigBlueButton.logger.debug("Checking if webcams were used...")
      webcam_events = events_xml.xpath('/recording/event[@module="WEBCAM"]')
      if webcam_events.length > 0
        BigBlueButton.logger.debug("Webcam events seen in recording")
        return true
      else
        BigBlueButton.logger.debug("No webcam events were seen in recording")
        return false
      end
    end

    # Check whether any of the presentation features were used in the recording
    # This can be used to e.g. skip presentation processing or change the
    # layout of the final recording.
    def self.have_presentation_events(events_xml)
      BigBlueButton.logger.debug("Checking if presentation area was used...")
      pres_events = events_xml.xpath('/recording/event[@module="PRESENTATION" or @module="WHITEBOARD"]')
      seen_share_presentation = false
      pres_events.each do |event|
        case event['eventname']
        # The following events are considered to indicate that the presentation
        # area was actively used during the session.
        when 'AddShapeEvent', 'ModifyTextEvent', 'UndoShapeEvent',
            'ClearPageEvent'
        BigBlueButton.logger.debug("Seen a #{event['eventname']} event, presentation area used.")
          return true
        # We ignore the first SharePresentationEvent, since it's the default
        # presentation
        when 'SharePresentationEvent'
          if seen_share_presentation
            BigBlueButton.logger.debug("Have a non-default SharePresentation")
            return true
          else
            BigBlueButton.logger.debug("Skipping default SharePresentation")
            seen_share_presentation = true
          end
        # We ignore the 'GotoSlideEvent' for page 0 (first page)
        when 'GotoSlideEvent'
          slide = event.at_xpath('./slide').content.to_i
          if slide != 0
            BigBlueButton.logger.debug("Switched to slide #{slide}")
            return true
          end
          BigBlueButton.logger.debug("Ignoring GotoSlide with default slide #")
        end
      end
      BigBlueButton.logger.debug("No important presentation events found")
      return false
    end

    # Version of the bbb server where it was recorded
    def self.bbb_version(events_xml)
      events = Nokogiri::XML(File.open(events_xml))      
      recording = events.at_xpath('/recording')
      recording['bbb_version']      
    end

    # Compare version numbers
    # Returns true if version is newer than requested version
    def self.bbb_version_compare(events_xml, major, minor=nil, micro=nil)
      bbb_version = self.bbb_version(events_xml)
      if bbb_version.nil?
        # BigBlueButton 0.81 or earler
        return false
      end

      # Split the version string
      match = /^(\d+)\.(\d+)\.(\d+)/.match(bbb_version)
      if !match
        raise "bbb_version #{bbb_version} is not in the correct format"
      end

      # Check major version mismatch
      if match[1].to_i > major
        return true
      end
      if match[1].to_i < major
        return false
      end

      # Check minor version mismatch
      if minor.nil?
        return true
      else
        if match[2].to_i > minor
          return true
        end
        if match[2].to_i < minor
          return false
        end
      end

      # Check micro version mismatch
      if micro.nil?
        return true
      else
        if match[3].to_i >= micro
          return true
        else
          return false
        end
      end
    end

  end
end

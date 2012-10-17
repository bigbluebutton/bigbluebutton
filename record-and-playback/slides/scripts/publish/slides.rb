# Set encoding to utf-8
# encoding: UTF-8

require '../../core/lib/recordandplayback'
require 'rubygems'
require 'trollop'
require 'yaml'
require 'builder'

opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :default => '58f4a6b3-cd07-444d-8564-59116cb53974', :type => String
end

meeting_id = opts[:meeting_id]
puts meeting_id
match = /(.*)-(.*)/.match meeting_id
meeting_id = match[1]
playback = match[2]

puts meeting_id
puts playback
if (playback == "slides")
	logger = Logger.new("/var/log/bigbluebutton/slides/publish-#{meeting_id}.log", 'daily' )
	BigBlueButton.logger = logger
        BigBlueButton.logger.info("Publishing #{meeting_id}")
	# This script lives in scripts/archive/steps while properties.yaml lives in scripts/
	bbb_props = YAML::load(File.open('../../core/scripts/bigbluebutton.yml'))
	simple_props = YAML::load(File.open('slides.yml'))
	
	recording_dir = bbb_props['recording_dir']
	process_dir = "#{recording_dir}/process/slides/#{meeting_id}"
	publish_dir = simple_props['publish_dir']
	playback_host = simple_props['playback_host']
	
	target_dir = "#{recording_dir}/publish/slides/#{meeting_id}"
	if not FileTest.directory?(target_dir)
		FileUtils.mkdir_p target_dir
		
		package_dir = "#{target_dir}/#{meeting_id}"
		FileUtils.mkdir_p package_dir
		
		audio_dir = "#{package_dir}/audio"
		FileUtils.mkdir_p audio_dir
		
		FileUtils.cp("#{process_dir}/audio.ogg", audio_dir)
		FileUtils.cp("#{process_dir}/temp/#{meeting_id}/audio/recording.wav", audio_dir)
		FileUtils.cp("#{process_dir}/events.xml", package_dir)
		FileUtils.cp_r("#{process_dir}/presentation", package_dir)

                BigBlueButton.logger.info("Creating metadata.xml")
		# Create metadata.xml
		b = Builder::XmlMarkup.new(:indent => 2)		 
		metaxml = b.recording {
		  b.id(meeting_id)
		  b.state("available")
		  b.published(true)
		  # Date Format for recordings: Thu Mar 04 14:05:56 UTC 2010
		  b.start_time(BigBlueButton::Events.first_event_timestamp("#{process_dir}/events.xml"))
		  b.end_time(BigBlueButton::Events.last_event_timestamp("#{process_dir}/events.xml"))
		  b.playback {
		  	b.format("slides")
		  	b.link("http://#{playback_host}/playback/slides/playback.html?meetingId=#{meeting_id}")
	  	}
		  b.meta {
		  	BigBlueButton::Events.get_meeting_metadata("#{process_dir}/events.xml").each { |k,v| b.method_missing(k,v) }
	  	}			
		}
		
		metadata_xml = File.new("#{package_dir}/metadata.xml","w")
		metadata_xml.write(metaxml)
		metadata_xml.close		
    BigBlueButton.logger.info("Generating xml for slides and chat")		
    #Create slides.xml
    #presentation_url = "http://" + playback_host + "/slides/" + meeting_id + "/presentation"
    presentation_url = "/slides/" + meeting_id + "/presentation"
  	@doc = Nokogiri::XML(File.open("#{process_dir}/events.xml"))
	  meeting_start = @doc.xpath("//event[@eventname='ParticipantJoinEvent']")[0]['timestamp']
	  meeting_end = @doc.xpath("//event[@eventname='EndAndKickAllEvent']").last()['timestamp']
	  
	  first_presentation_start_node = @doc.xpath("//event[@eventname='SharePresentationEvent']")
	  first_presentation_start = meeting_end
      if not first_presentation_start_node.empty?
		first_presentation_start = first_presentation_start_node[0]['timestamp']
      end
      first_slide_start = (first_presentation_start.to_i - meeting_start.to_i) / 1000
	  
	  
    slides_events = @doc.xpath("//event[@eventname='GotoSlideEvent' or @eventname='SharePresentationEvent']")
    chat_events = @doc.xpath("//event[@eventname='PublicChatEvent']")
	  presentation_name = ""

    #Create slides.xml and chat.
    slides_doc = Nokogiri::XML::Builder.new do |xml|
      xml.popcorn {
        xml.timeline {
          xml.image(:in => 0, :out => first_slide_start, :src => "logo.png", :target => "slide", :width => 200, :width => 200 )
          slides_events.each do |node|
            eventname =  node['eventname']
            if eventname == "SharePresentationEvent"
              presentation_name = node.xpath(".//presentationName")[0].text()
            else
              slide_timestamp =  node['timestamp']
              slide_start = (slide_timestamp.to_i - meeting_start.to_i) / 1000
              slide_number = node.xpath(".//slide")[0].text()
              slide_src = "#{presentation_url}/#{presentation_name}/slide-#{slide_number.to_i + 1}.png"
              current_index = slides_events.index(node)
              if( current_index + 1 < slides_events.length)
                slide_end = ( slides_events[current_index + 1]['timestamp'].to_i - meeting_start.to_i ) / 1000
              else
                slide_end = ( meeting_end.to_i - meeting_start.to_i ) / 1000
              end
              xml.image(:in => slide_start, :out => slide_end, :src => slide_src, :target => "slide", :width => 200, :width => 200 )
              puts "#{slide_src} : #{slide_start} -> #{slide_end}"
            end
          end
        }
        chat_events.each do |node|
          chat_timestamp =  node['timestamp']
          chat_sender = node.xpath(".//sender")[0].text()
          chat_message =  node.xpath(".//message")[0].text()
          chat_start = (chat_timestamp.to_i - meeting_start.to_i) / 1000
          xml.timeline(:in => chat_start, :direction => "down",  :innerHTML => "<span><strong>#{chat_sender}:</strong> #{chat_message}</span>", :target => "chat" )
        end
      }
    end
          
	  File.open("#{package_dir}/slides.xml", 'w') { |f| f.puts slides_doc.to_xml }    
  
          BigBlueButton.logger.info("Publishing slides")
		# Now publish this recording	
		if not FileTest.directory?(publish_dir)
			FileUtils.mkdir_p publish_dir
		end
		FileUtils.cp_r(package_dir, publish_dir)
			
	end
end

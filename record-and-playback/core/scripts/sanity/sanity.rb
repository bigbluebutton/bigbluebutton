require "nokogiri"

def check_events_xml(filepath)
	raise Exception,  "Events file doesn't exists." if not File.exists?(filepath)
	bad_doc = Nokogiri::XML(filepath) { |config| config.options = Nokogiri::XML::ParseOptions::STRICT }
end

def check_audio_files(raw_dir,meeting_id)
	#check every file that is in events.xml, it's in audio dir
    doc = Nokogiri::XML(File.open("#{raw_dir}/#{meeting_id}/events.xml"))

    doc.xpath("//event[@eventname='StartRecordingEvent']/filename/text()").each { |fs_audio_file| 
    	audioname = fs_audio_file.content.split("/").last
    	raw_audio_file = "#{raw_dir}/#{meeting_id}/audio/#{audioname}"
    	#checking that the audio file exists in raw directory
    	raise Exception,  "Audio file doesn't exists in raw directory." if not File.exists?(raw_audio_file)

    	#checking length
    	raise Exception,  "Audio file length is zero." if BigBlueButton::AudioEvents.determine_length_of_audio_from_file(raw_audio_file) <= 0 
    }

end

def check_video_files()
	
end

check_events_xml()
check_audio_files()
check_video_files()



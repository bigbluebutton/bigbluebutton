require 'fileutils'

module Collector
    class NoSuchDirectoryException < RuntimeError
    end
    class NoAudioFileException < RuntimeError
    end
    
    class Audio        
        def initialize(log=nil)
            @log = log
        end
        
        def location_exist?(location)
            if not FileTest.directory?(location)
                @log.error "FAILED!: #{location} directory does not exist!"
                raise NoSuchDirectoryException, location
            end
        end
        
        def audio_is_present?(meeting_id, location)
            if Dir.glob("#{location}/#{meeting_id}*.wav").empty?
                @log.error "FAILED!: No audio recordings for meeting #{meeting_id}"
                raise NoAudioFileException, "No audio recording for #{meeting_id}"
            end
        end
        
        def archive_audio_recording(meeting_id, from, to)
            if (location_exist? from) and (location_exist? to)
                if (audio_is_present? meeting_id, from)
                    Dir.glob("#{from}/#{meeting_id}*.wav").each { |file|
                        #@log.info "Archiving #{file}"
                        FileUtils.mv(file, to)
                    }
                    #@log.info "Archiving done."
                end
            end            
        end
    end
end
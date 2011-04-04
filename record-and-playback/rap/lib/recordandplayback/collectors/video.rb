require 'fileutils'

module Collector
    class NoSuchDirectoryException < RuntimeError
    end
    class NoAudioFileException < RuntimeError
    end
    
    class Video             
        def location_exist?(location)
            FileTest.directory?(location)
        end
        
        def video_present?(meeting_id, location)
            Dir.glob("#{location}/*.flv").empty?
        end
        
        
        def collect_video(meeting_id, from_dir, to_dir)         
            if not location_exist?(from_dir) 
                raise NoSuchDirectoryException, "Directory not found #{from_dir}"
            end
            
            if not location_exist?(to_dir)
                raise NoSuchDirectoryException, "Directory not found #{to_dir}"
            end
            
            if (audio_present?(meeting_id, from_dir))
                raise NoAudioFileException, "No audio recording for #{meeting_id} in #{from_dir}"
            end
                       
            Dir.glob("#{from_dir}/*.flv").each { |file|
                FileUtils.cp(file, to_dir)
            }         
        end
        
    end
end
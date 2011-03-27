require 'fileutils'

module Collector
  class NoSuchDirectoryException < RuntimeError
  end
  
  class NoAudioFileException < RuntimeError
  end
  
  class NoVideoFileException < RuntimeError
  end

  class NoPresentationException < RuntimeError
  end

  class NoDeskshareException < RuntimeError
  end
  
  class Audio             
    def self.location_exist?(location)
      FileTest.directory?(location)
    end
        
    def self.audio_present?(meeting_id, location)
      Dir.glob("#{location}/#{meeting_id}*.wav").empty?
    end
    
    # Copies the audio recordings specified by meeting_id
    # from a directory to a target directory.
    def self.collect_audio(meeting_id, from_dir, to_dir)         
      if not location_exist?(from_dir) 
        raise NoSuchDirectoryException, "Directory not found #{from_dir}"
      end
            
      if not location_exist?(to_dir)
        raise NoSuchDirectoryException, "Directory not found #{to_dir}"
      end
            
      if (audio_present?(meeting_id, from_dir))
        raise NoAudioFileException, "No audio recording for #{meeting_id} in #{from_dir}"
      end
                       
      Dir.glob("#{from_dir}/#{meeting_id}*.wav").each { |file|
        FileUtils.cp(file, to_dir)
      }         
    end
        
  end
    
  class Video      		
    def self.location_exist?(location)
      FileTest.directory?(location)
    end
        
    def self.video_present?(meeting_id, location)
      Dir.glob("#{location}").empty?
    end
                
    def self.collect_video(meeting_id, from_dir, to_dir)         
      if not location_exist?(from_dir) 
        raise NoSuchDirectoryException, "Directory not found #{from_dir}"
      end
            
      if not location_exist?(to_dir)
        raise NoSuchDirectoryException, "Directory not found #{to_dir}"
      end
            
      if (video_present?(meeting_id, from_dir))
        raise NoVideoFileException, "No video recording for #{meeting_id} in #{from_dir}"
      end
                       
      Dir.glob("#{from_dir}/*").each { |file|
        FileUtils.cp_r(file, to_dir)
      }         
    end        
  end

  class Presentation      		
    def self.location_exist?(location)
      FileTest.directory?(location)
    end
        
    def self.presentation_present?(meeting_id, location)
      Dir.glob("#{location}").empty?
    end
                
    def self.collect_presentation(meeting_id, from_dir, to_dir)         
      if not location_exist?(from_dir) 
        raise NoSuchDirectoryException, "Directory not found #{from_dir}"
      end
            
      if not location_exist?(to_dir)
        raise NoSuchDirectoryException, "Directory not found #{to_dir}"
      end
            
      if (presentation_present?(meeting_id, from_dir))
        raise NoPresentationException, "No presentation for #{meeting_id} in #{from_dir}"
      end
                       
      Dir.glob("#{from_dir}/*").each { |file|
        FileUtils.cp_r(file, to_dir)
      }         
    end        
  end
  
  class Deskshare      		
    def self.location_exist?(location)
      FileTest.directory?(location)
    end
        
    def self.deskshare_present?(meeting_id, location)
      Dir.glob("#{location}").empty?
    end
                
    def self.collect_deskshare(meeting_id, from_dir, to_dir)         
      if not location_exist?(from_dir) 
        raise NoSuchDirectoryException, "Directory not found #{from_dir}"
      end
            
      if not location_exist?(to_dir)
        raise NoSuchDirectoryException, "Directory not found #{to_dir}"
      end
            
      if (deskshare_present?(meeting_id, from_dir))
        raise NoDeskshareException, "No video recording for #{meeting_id} in #{from_dir}"
      end
                       
      Dir.glob("#{from_dir}/#{meeting_id}-*.flv").each { |file|
        FileUtils.cp(file, to_dir)
      }         
    end        
  end
end

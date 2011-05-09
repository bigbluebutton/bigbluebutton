require 'fileutils'

module BigBlueButton
  class DeskshareArchiver   		
    def self.location_exist?(location)
      FileTest.directory?(location)
    end
        
    def self.deskshare_present?(meeting_id, location)
      Dir.glob("#{location}").empty?
    end
                
    def self.archive(meeting_id, from_dir, to_dir)         
      if not BigBlueButton.dir_exists?(from_dir)
        raise MissingDirectoryException, "Directory not found #{from_dir}"
      end
            
      if not BigBlueButton.dir_exists?(to_dir)
        raise MissingDirectoryException, "Directory not found #{to_dir}"
      end
            
      if Dir.glob("#{from_dir}").empty?
        raise FileNotFoundException, "No recording for #{meeting_id} in #{from_dir}"
      end
                       
      Dir.glob("#{from_dir}/#{meeting_id}-*.flv").each { |file|
        FileUtils.cp(file, to_dir)
      }         
    end        
  end
end
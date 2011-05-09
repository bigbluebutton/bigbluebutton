require 'fileutils'
  
module BigBlueButton
  class PresentationArchiver      		         
    def self.archive(meeting_id, from_dir, to_dir)         
      if not BigBlueButton.dir_exists?(from_dir)
        raise MissingDirectoryException, "Directory not found #{from_dir}"
      end
            
      if not BigBlueButton.dir_exists?(to_dir)
        raise MissingDirectoryException, "Directory not found #{to_dir}"
      end
            
      if Dir.glob("#{from_dir}").empty?
        raise FileNotFoundException, "No presentation for #{meeting_id} in #{from_dir}"
      end
                       
      Dir.glob("#{from_dir}/*").each { |file|
        FileUtils.cp_r(file, to_dir)
      }         
    end        
  end
end
  
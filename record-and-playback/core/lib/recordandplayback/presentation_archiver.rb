require 'fileutils'
  
module BigBlueButton
  class PresentationArchiver      		         
    def self.archive(meeting_id, from_dir, to_dir) 
      raise MissingDirectoryException, "Directory not found #{from_dir}" if not BigBlueButton.dir_exists?(from_dir)
      raise MissingDirectoryException, "Directory not found #{to_dir}" if not BigBlueButton.dir_exists?(to_dir)
      raise FileNotFoundException, "No presentation for #{meeting_id} in #{from_dir}" if Dir.glob("#{from_dir}").empty?
                                   
      Dir.glob("#{from_dir}/*").each { |file|
        puts "Presentation from #{file} to #{to_dir}"
        FileUtils.cp_r(file, to_dir)
      }         
    end        
  end
end
  
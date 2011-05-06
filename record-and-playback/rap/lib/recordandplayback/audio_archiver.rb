require 'fileutils'

module BigBlueButton  
  class AudioArchiver  
    def initialize(logger)
        @log = logger
    end
    
    def archive(meeting_id, from_dir, to_dir)
      if BigBlueButton.dir_exists?(from_dir) 
        @log.info("#{from_dir} exists")
          if BigBlueButton.dir_exists?(to_dir)
              @log.info("#{to_dir} exists")
              if not Dir.glob("#{from_dir}/#{meeting_id}*.wav").empty?
                  Dir.glob("#{from_dir}/#{meeting_id}*.wav").each do |file|
                    @log.info("Copying file #{file} to #{to_dir}")
                    FileUtils.cp(file, to_dir)
                  end   
              else
                @log.warn("Audio for #{meeting-id} not found.")
              end
          else
            @log.warn("#{to_dir} directory not found.")
            raise MissingDirectoryException, "Directory not found: [#{to_dir}]"
          end          
      else
        @log.warn("#{from_dir} directory not found.")
        raise MissingDirectoryException, "Directory not found: [#{from_dir}]"
      end
    end
  end
end
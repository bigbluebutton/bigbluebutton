# Set encoding to utf-8
# encoding: UTF-8

require 'fileutils'

module BigBlueButton  
  class AudioArchiver     
    def self.archive(meeting_id, from_dir, to_dir)
      raise MissingDirectoryException, "Directory not found: [#{from_dir}]" if not BigBlueButton.dir_exists?(from_dir) 
      raise MissingDirectoryException, "Directory not found: [#{to_dir}]" if not BigBlueButton.dir_exists?(to_dir)
      raise FileNotFoundException, "No recording for #{meeting_id} in #{from_dir}" if Dir.glob("#{from_dir}/#{meeting_id}*.wav").empty?
      
      Dir.glob("#{from_dir}/#{meeting_id}*.wav").each do |file|
        BigBlueButton.logger.debug("Copying #{file} to #{to_dir}")
        FileUtils.cp(file, to_dir)
      end
    end
  end
end
# Set encoding to utf-8
# encoding: UTF-8

path = File.expand_path(File.join(File.dirname(__FILE__), '../lib'))
$LOAD_PATH << path

require 'recordandplayback/audio_archiver'
require 'recordandplayback/events_archiver'
require 'recordandplayback/video_archiver'
require 'recordandplayback/presentation_archiver'
require 'recordandplayback/deskshare_archiver'
require 'recordandplayback/generators/events'
require 'recordandplayback/generators/audio'
require 'recordandplayback/generators/video'
require 'recordandplayback/generators/matterhorn_processor'
require 'recordandplayback/generators/audio_processor'
require 'recordandplayback/generators/presentation'
require 'open4'

module BigBlueButton
  class MissingDirectoryException < RuntimeError
  end
  
  class FileNotFoundException < RuntimeError
  end
  
  # BigBlueButton logs information about its progress.
  # Replace with your own logger if you desire.
  #
  # @param [Logger] log your own logger
  # @return [Logger] the logger you set
  def self.logger=(log)
    @logger = log
  end
  
  # Get BigBlueButton logger.
  #
  # @return [Logger]
  def self.logger
    return @logger if @logger
    logger = Logger.new(STDOUT)
    logger.level = Logger::INFO
    @logger = logger
  end
  
  def self.dir_exists?(dir)
    FileTest.directory?(dir)
  end
    
  def self.execute(command)
    output=""
    status = Open4::popen4(command) do | pid, stdin, stdout, stderr|
        BigBlueButton.logger.info("Executing: #{command}")

	output = stdout.readlines
        BigBlueButton.logger.info( "Output: #{output} ") unless output.empty?
 
        errors = stderr.readlines
        unless errors.empty?
          BigBlueButton.logger.error( "Error: stderr: #{errors}")
 #         raise errors.to_s 
        end
    end
    BigBlueButton.logger.info("Success ?:  #{status.success?}")
    BigBlueButton.logger.info("Process exited? #{status.exited?}")
    BigBlueButton.logger.info("Exit status: #{status.exitstatus}")
    output
  end
end

path = File.expand_path(File.join(File.dirname(__FILE__), '../lib'))
$LOAD_PATH << path
require 'recordandplayback/archiver'
require 'recordandplayback/collectors/events'
require 'recordandplayback/collectors/audio'
require 'recordandplayback/generators/events'
require 'recordandplayback/generators/audio'
require 'recordandplayback/generators/matterhorn_processor'
require 'recordandplayback/generators/audio_processor'
require 'recordandplayback/generators/deskshare'

module BigBlueButton
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
  
  module Archive
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
  end
  
  module Process
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
  end
  
  
end
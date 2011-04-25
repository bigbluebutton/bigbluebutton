path = File.expand_path(File.join(File.dirname(__FILE__), '../lib'))
$LOAD_PATH << path
require 'recordandplayback/archiver'
require 'recordandplayback/collectors/events'
require 'recordandplayback/collectors/audio'
require 'recordandplayback/generators/audio'
require 'recordandplayback/generators/matterhorn_processor'
require 'recordandplayback/generators/audio_processor'
require 'recordandplayback/generators/deskshare'

require 'lib/recordandplayback'
require 'rubygems'
require 'trollop'
require 'yaml'

opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :default => '58f4a6b3-cd07-444d-8564-59116cb53974', :type => String
  opt :config, "Ping all the sites"
end

meeting_id = opts[:meeting_id]
props = YAML::load(File.open('properties.yaml'))

archive_dir = props['archive_dir']

audio_dir = "#{archive_dir}/audio"
FileUtils.cp_r("#{archive_dir}/audio", matterhorn_dir)            
wav_file = "#{matterhorn_dir}/audio/*.wav"
ogg_file = "#{matterhorn_dir}/audio.ogg"
proc = IO.popen("oggenc -Q --resample 44100 -o #{ogg_file} #{wav_file} 2>&1", "w+")
Process.wait()
      
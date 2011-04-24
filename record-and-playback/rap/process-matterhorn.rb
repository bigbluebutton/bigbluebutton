require 'lib/recordandplayback'
require 'rubygems'
require 'trollop'
require 'yaml'

puts "archiver 0.1 - BigBlueButton"

opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :default => '58f4a6b3-cd07-444d-8564-59116cb53974', :type => String
  opt :config, "Ping all the sites"
end

meeting_id = opts[:meeting_id]

props = YAML::load(File.open('properties.yaml'))

archive_dir = props['archive_dir']

BigBlueButton::MatterhornProcessor.process("#{archive_dir}/#{meeting_id}", meeting_id)
matterhorn = "#{archive_dir}/#{meeting_id}/matterhorn"
BigBlueButton::MatterhornProcessor.create_manifest_xml("#{matterhorn}/audio.ogg", "#{matterhorn}/video.flv", "#{matterhorn}/deskshare.flv", "#{matterhorn}/manifest.xml")
BigBlueButton::MatterhornProcessor.create_dublincore_xml("#{matterhorn}/dublincore.xml",
							{:title => "Business Ecosystem",
                                                         :subject => "TTMG 5001",
                                                         :description => "How to manage your product's ecosystem",
                                                         :creator => "Richard Alam",
                                                         :contributor => "Tony B.",
                                                         :language => "En-US",
                                                         :identifier => "ttmg-5001-2"})
                                                              
puts Dir.pwd
Dir.chdir(matterhorn) do
  puts Dir.pwd
  BigBlueButton::MatterhornProcessor.zip_artifacts("audio.ogg", "video.flv", "deskshare.flv", "dublincore.xml", "manifest.xml", "tosend.zip")
end
puts Dir.pwd

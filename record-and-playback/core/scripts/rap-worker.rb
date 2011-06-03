require '../lib/recordandplayback'
require 'rubygems'
require 'yaml'
require 'fileutils'


def archive_recorded_meeting(meeting_id, archive_dir)
  if not FileTest.directory?("#{archive_dir}/#{meeting_id}")
    puts "#{archive_dir}/#{meeting_id} does not exist."
    `ruby archive/master.rb -m #{meeting_id}`
    `ruby process/matterhorn.rb -m #{meeting_id}`
    `ruby publish/matterhorn.rb -m #{meeting_id}`
  else
    puts "#{archive_dir}/#{meeting_id} exists."
    `ruby process/simple.rb -m #{meeting_id}`
  end
  
end

props = YAML::load(File.open('bigbluebutton.yml'))
recording_dir = props['recording_dir']
archive_dir = "#{recording_dir}/raw"

done_files = Dir.glob("#{recording_dir}/status/recorded/*.done")

done_files.each do |df|
  match = /(.*).done/.match df.sub(/.+\//, "")
  archive_recorded_meeting(match[1], archive_dir)
end

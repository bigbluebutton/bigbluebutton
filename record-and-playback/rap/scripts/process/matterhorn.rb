require '../lib/recordandplayback'
require 'rubygems'
require 'trollop'
require 'yaml'

opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :default => '58f4a6b3-cd07-444d-8564-59116cb53974', :type => String
end

meeting_id = opts[:meeting_id]

# This script lives in scripts/archive/steps while properties.yaml lives in scripts/
props = YAML::load(File.open('properties.yaml'))

recording_dir = props['recording_dir']
raw_archive_dir = "#{recording_dir}/raw/#{meeting_id}"

target_dir = "#{recording_dir}/process/matterhorn/#{meeting_id}"
if FileTest.directory?(target_dir)
  FileUtils.remove_dir target_dir
end
FileUtils.mkdir_p target_dir

# Create a copy of the raw archives
temp_dir = "#{target_dir}/temp"
FileUtils.mkdir_p temp_dir
FileUtils.cp_r(raw_archive_dir, temp_dir)

BigBlueButton::AudioProcessor.process("#{temp_dir}/#{meeting_id}", "#{target_dir}/audio.ogg")

# Process video
video = Dir.glob("#{temp_dir}/#{meeting_id}/video/#{meeting_id}/*.flv")[0]
stripped_flv = "#{temp_dir}/stripped.flv"
BigBlueButton.strip_audio_from_video(video, stripped_flv)
vid_width = BigBlueButton.get_video_width(video)
vid_height = BigBlueButton.get_video_height(video)
blank_canvas = "#{temp_dir}/canvas.jpg"
BigBlueButton.create_blank_canvas(vid_width, vid_height, "white", blank_canvas)

blank1 = "#{temp_dir}/blank1.flv"
blank2 = "#{temp_dir}/blank2.flv"
concat_vid = "#{target_dir}/webcam.flv"
               
events_xml = "#{temp_dir}/#{meeting_id}/events.xml"
first_timestamp = BigBlueButton::Events.first_event_timestamp(events_xml)
last_timestamp = BigBlueButton::Events.last_event_timestamp(events_xml)
start_evt = BigBlueButton::Events.get_start_video_events(events_xml)

stop_evt = BigBlueButton::Events.get_stop_video_events(events_xml)

first_gap_duration = start_evt[0][:timestamp].to_i - first_timestamp.to_i
puts "First gap = " + first_gap_duration.to_s
end_gap_duration = last_timestamp.to_i - stop_evt[0][:timestamp].to_i
puts "End gap = " + end_gap_duration.to_s
BigBlueButton.create_blank_video(first_gap_duration/1000, 1000, blank_canvas, blank1)
BigBlueButton.create_blank_video(end_gap_duration/1000, 1000, blank_canvas, blank2)
BigBlueButton.concatenate_videos([blank1, stripped_flv, blank2], concat_vid)
BigBlueButton.multiplex_audio_and_video("#{target_dir}/audio.ogg", concat_vid, "#{target_dir}/muxed-audio-webcam.flv")

# Process deskshare
deskshare = Dir.glob("#{temp_dir}/#{meeting_id}/deskshare/*.flv")[0]
ds_stripped_flv = "#{temp_dir}/ds-stripped.flv"
BigBlueButton.strip_audio_from_video(deskshare, ds_stripped_flv)
ds_width = BigBlueButton.get_video_width(deskshare)
ds_height = BigBlueButton.get_video_height(deskshare)
ds_blank_canvas = "#{temp_dir}/ds-canvas.jpg"
BigBlueButton.create_blank_canvas(ds_width, ds_height, "white", ds_blank_canvas)

dsblank1 = "#{temp_dir}/ds-blank1.flv"
dsblank2 = "#{temp_dir}/ds-blank2.flv"
dsconcat_vid = "#{target_dir}/deskshare.flv"
               
events_xml = "#{temp_dir}/#{meeting_id}/events.xml"
first_timestamp = BigBlueButton::Events.first_event_timestamp(events_xml)
last_timestamp = BigBlueButton::Events.last_event_timestamp(events_xml)
start_evt = BigBlueButton::Events.get_start_deskshare_events(events_xml)

stop_evt = BigBlueButton::Events.get_stop_deskshare_events(events_xml)

first_gap_duration = start_evt[0][:timestamp].to_i - first_timestamp.to_i
puts "First gap = " + first_gap_duration.to_s
end_gap_duration = last_timestamp.to_i - stop_evt[0][:timestamp].to_i
puts "End gap = " + end_gap_duration.to_s
BigBlueButton.create_blank_deskshare_video(first_gap_duration/1000, 1000, ds_blank_canvas, dsblank1)
BigBlueButton.create_blank_deskshare_video(end_gap_duration/1000, 1000, ds_blank_canvas, dsblank2)
BigBlueButton.concatenate_videos([dsblank1, ds_stripped_flv, dsblank2], dsconcat_vid)



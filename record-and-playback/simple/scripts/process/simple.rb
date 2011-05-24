require '../../core/lib/recordandplayback'
require 'rubygems'
require 'trollop'
require 'yaml'

opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :default => '58f4a6b3-cd07-444d-8564-59116cb53974', :type => String
end

meeting_id = opts[:meeting_id]

# This script lives in scripts/archive/steps while properties.yaml lives in scripts/
props = YAML::load(File.open('../../core/scripts/bigbluebutton.yml'))

logger = Logger.new("/var/log/bigbluebutton/simple-process-#{meeting_id}.log", 'daily' )
BigBlueButton.logger = logger

recording_dir = props['recording_dir']
raw_archive_dir = "#{recording_dir}/raw/#{meeting_id}"

target_dir = "#{recording_dir}/process/simple/#{meeting_id}"
if FileTest.directory?(target_dir)
  FileUtils.remove_dir target_dir
end
FileUtils.mkdir_p target_dir

# Create a copy of the raw archives
temp_dir = "#{target_dir}/temp"
FileUtils.mkdir_p temp_dir
FileUtils.cp_r(raw_archive_dir, temp_dir)

BigBlueButton::AudioProcessor.process("#{temp_dir}/#{meeting_id}", "#{target_dir}/audio.ogg")
events_xml = "#{temp_dir}/#{meeting_id}/events.xml"
FileUtils.cp(events_xml, target_dir)

presentation_dir = "#{temp_dir}/#{meeting_id}/presentation"
presentations = BigBlueButton::Presentation.get_presentations(events_xml)

processed_pres_dir = "#{target_dir}/presentation"
FileUtils.mkdir_p processed_pres_dir

presentations.each do |pres|
  pres_dir = "#{presentation_dir}/#{pres}"
  num_pages = BigBlueButton::Presentation.get_number_of_pages_for(pres_dir)
  pres_pdf = "#{pres_dir}/#{pres}.pdf"
  
  target_pres_dir = "#{processed_pres_dir}/#{pres}"
  FileUtils.mkdir_p target_pres_dir
  
  1.upto(num_pages) do |page|
    pdf_page = "#{pres_dir}/slide-#{page}.pdf"
    BigBlueButton::Presentation.extract_page_from_pdf(page, pres_pdf, pdf_page)
    BigBlueButton::Presentation.convert_pdf_to_png(pdf_page, "#{target_pres_dir}/slide-#{page}.png")
  end  
end
	 	

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

recording_dir = props['recording_dir']
raw_archive_dir = "#{recording_dir}/raw/#{meeting_id}"

target_dir = "#{recording_dir}/process/slides/#{meeting_id}"
if not FileTest.directory?(target_dir)
	logger = Logger.new("/var/log/bigbluebutton/slides/process-#{meeting_id}.log", 'daily' )
	BigBlueButton.logger = logger
  
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

    images=Dir.glob("#{pres_dir}/#{pres}.{jpg,png,gif}")
    if images.empty?
         1.upto(num_pages) do |page|
           pdf_page = "#{pres_dir}/slide-#{page}.pdf"
           BigBlueButton::Presentation.extract_page_from_pdf(page, pres_pdf, pdf_page)
           BigBlueButton::Presentation.convert_pdf_to_png(pdf_page, "#{target_pres_dir}/slide-#{page}.png")
         end
    else
        ext = File.extname("#{images[0]}")
	BigBlueButton::Presentation.convert_image_to_png(images[0],"#{target_pres_dir}/slide-1.png")
    end
  
  end
  
	process_done = File.new("#{recording_dir}/status/processed/#{meeting_id}-slides.done", "w")
  process_done.write("Processed #{meeting_id}")
  process_done.close
#else
#	BigBlueButton.logger.debug("Skipping #{meeting_id} as it has already been processed.")  
end
    

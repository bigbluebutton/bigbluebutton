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

audio_dir = props['audio_dir']
archive_dir = props['archive_dir']

BigBlueButton::AudioProcessor.process(meeting_id, audio_dir, archive_dir) 
presentationNames = []	 	
    tree = etree.parse(meetingArchiveDir + '/events.xml')
	 	
    presentations = tree.xpath("//event[@name='SharePresentationEvent']")
	 	
    for p in presentations:
	 	
       pname = p.find('presentationName').text
	 	
       presentationNames.append(pname)

    def main()
        presentationSrcDir = ""
        pdfFilename = ""
        
        numPages = determine_number_of_pages(presentationSrcDir)
        if (numPages > 0)
            i = 1
            while i <= numPages 
                extract_page_from_pdf(i, presentationSrcDir + "/" + pdfFilename, presentationSrcDir)
                fileToConvert = presentationSrcDir + "/slide-" + str(i)
                convert_pdf_to_png(fileToConvert + ".pdf", fileToConvert + ".png")
                i += 1
            end
        end
    end
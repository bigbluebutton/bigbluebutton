require 'rubygems'
require 'nokogiri'

module BigBlueButton
  class Presentation
    OPTIONS = "-sDEVICE=pdfwrite -dNOPAUSE -dQUIET -dBATCH";
    FIRSTPAGE = "-dFirstPage";
    LASTPAGE = "-dLastPage";
    NO_PDF_MARK_WORKAROUND = "/etc/bigbluebutton/nopdfmark.ps";
    OUTPUTFILE = "-sOutputFile";

    # Get the presentations.
    def self.start_audio_recording_events(events_xml)
      start_events = []
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("//event[@name='SharePresentationEvent']").each do |presentation_event|
        ae = AudioRecordingEvent.new
        ae.start_event_timestamp = start_event[TIMESTAMP]
        ae.bridge = start_event.xpath(BRIDGE).text
        ae.file = start_event.xpath(FILE).text
        ae.start_record_timestamp = start_event.xpath(RECORD_TIMESTAMP).text
        start_events << ae
      end
      return start_events.sort {|a,b| a.start_event_timestamp <=> b.start_event_timestamp}
    end    

    # Determine the number pages in a presentation by looking at the number of
    # swf files in a directory.
    def determine_number_of_pages(presentationDir)

        dirList = os.listdir(presentationDir)
        numFiles = 0
        for fname in dirList:
            if fname.endswith('.swf'):
                numFiles += 1
                
        return numFiles
    end

    # Extract a page from the pdf file.    
    def extract_page_from_pdf(page, pdfFile, presentationDir)
    #    command = "ghostscript " + OPTIONS + " " + FIRSTPAGE + str(page) + " " + LASTPAGE + str(page) + " " + OUTPUTFILE + presentationDir + "/slide-" + str(page) + ".pdf" + " " + NO_PDF_MARK_WORKAROUND + " " + pdfFile
        command = "ghostscript #{OPTIONS} #{FIRSTPAGE}=#{page} #{LASTPAGE}=#{page} #{OUTPUTFILE}=#{presentationDir}/slide-#{page}.pdf #{NO_PDF_MARK_WORKAROUND} #{pdfFile}"
        puts command
        IO.popen(command,"w+")
        # Wait for the process to finish
        Process.wait()
    end

    # Convert a pdf page to a png.
    def convert_pdf_to_png(pdfPage, pngOut)
        command = "convert -density 600x600 -resize 800x560 -quality 90 #{pdfPage} #{pngOut}"
        proc = subprocess.Popen(command, shell=True)
        # Wait for the process to finish
        proc.wait()    
    end
  end
end
require 'rubygems'
require 'nokogiri'

module BigBlueButton
  class Presentation
    OPTIONS = "-sDEVICE=pdfwrite -dNOPAUSE -dQUIET -dBATCH"
    FIRSTPAGE = "-dFirstPage"
    LASTPAGE = "-dLastPage"
    NO_PDF_MARK_WORKAROUND = "/etc/bigbluebutton/nopdfmark.ps"
    OUTPUTFILE = "-sOutputFile"

    # Get the presentations.
    def self.get_presentations(events_xml)
      presentations = []
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("//event[@eventname='SharePresentationEvent']").each do |presentation_event|
        presentations << presentation_event.xpath("presentationName").text
      end
      presentations
    end

    # Determine the number pages in a presentation.
    def self.get_number_of_pages_for(presentation_dir)
      Dir.glob("#{presentation_dir}/*.swf").size
    end

    # Extract a page from the pdf file.    
    def self.extract_page_from_pdf(page_num, pdf_presentation, pdf_out)
        command = "ghostscript #{OPTIONS} #{FIRSTPAGE}=#{page_num} #{LASTPAGE}=#{page_num} #{OUTPUTFILE}=#{pdf_out} #{NO_PDF_MARK_WORKAROUND} #{pdf_presentation}"
        BigBlueButton.logger.info(command)
        IO.popen(command)
        Process.wait
    end
    
    # Convert a pdf page to a png.
    def self.convert_pdf_to_png(pdf_page, png_out)
        command = "convert -density 600x600 -resize 800x560 -quality 90 #{pdf_page} #{png_out}"
        BigBlueButton.logger.info(command)
        IO.popen(command)
        Process.wait  
    end
  end
end
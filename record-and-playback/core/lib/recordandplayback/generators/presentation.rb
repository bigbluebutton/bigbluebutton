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
      BigBlueButton.logger.info("Task: Getting presentations from events")      
      presentations = []
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("//event[@eventname='SharePresentationEvent']").each do |presentation_event|
        presentations << presentation_event.xpath("presentationName").text
      end
      presentations
    end

    # Determine the number pages in a presentation.
    def self.get_number_of_pages_for(presentation_dir)
      BigBlueButton.logger.info("Task: Getting number of pages in presentation")      
      Dir.glob("#{presentation_dir}/*.swf").size
    end

    # Extract a page from the pdf file.    
    def self.extract_page_from_pdf(page_num, pdf_presentation, pdf_out)
        BigBlueButton.logger.info("Task: Extracting a page from pdf file")      
        command = "ghostscript #{OPTIONS} #{FIRSTPAGE}=#{page_num} #{LASTPAGE}=#{page_num} #{OUTPUTFILE}=#{pdf_out} #{NO_PDF_MARK_WORKAROUND} #{pdf_presentation}"
        BigBlueButton.execute(command)
 #       Process.wait
    end
    
    # Convert a pdf page to a png.
    def self.convert_pdf_to_png(pdf_page, png_out)
        BigBlueButton.logger.info("Task: Converting .pdf to .png")      
        command = "convert -density 300x300 -resize 800x600 -quality 90 +dither -depth 8 -colors 256 #{pdf_page} #{png_out}"
        BigBlueButton.execute(command)
#        Process.wait  
    end

    #Convert an image to a png	
    def self.convert_image_to_png(image,png_image)
        BigBlueButton.logger.info("Task: Converting image to .png")      
        command="convert -resize 800x600 #{image} #{png_image}"
        BigBlueButton.execute(command)
    end

  end
end

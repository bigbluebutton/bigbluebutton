# Set encoding to utf-8
# encoding: UTF-8

#
# BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
#
# Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
#
# This program is free software; you can redistribute it and/or modify it under the
# terms of the GNU Lesser General Public License as published by the Free Software
# Foundation; either version 3.0 of the License, or (at your option) any later
# version.
#
# BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
# PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License along
# with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
#


require 'rubygems'
require 'nokogiri'

module BigBlueButton
  class Presentation
    OPTIONS = "-sDEVICE=pdfwrite -dNOPAUSE -dQUIET -dBATCH -dUseCropBox"
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
        temp_out = "/tmp/#{File.basename(pdf_out)}"
        command = "ghostscript #{OPTIONS} #{FIRSTPAGE}=#{page_num} #{LASTPAGE}=#{page_num} #{OUTPUTFILE}=#{temp_out} #{NO_PDF_MARK_WORKAROUND} #{pdf_presentation}"
        BigBlueButton.execute(command)
        FileUtils.mv(temp_out,pdf_out)
 #       Process.wait
    end

    # Extract a page from a pdf file as a png image
    def self.extract_png_page_from_pdf(page_num, pdf_presentation, png_out, resize = '800x600')
      BigBlueButton.logger.info("Task: Extracting a page from pdf file as png image")
      temp_out = "/tmp/#{File.basename(png_out)}"
      command = "ghostscript -dSAFER -dBATCH -dNOPAUSE -dQUIET -dFirstPage=#{page_num} -dLastPage=#{page_num} -sDEVICE=png16m -dUseCropBox -dGraphicsAlphaBits=4 -dTextAlphaBits=4 -r300 -sOutputFile=#{temp_out} #{NO_PDF_MARK_WORKAROUND} #{pdf_presentation}"
      status = BigBlueButton.execute(command, false)
      if status.success?
        # Resize to the requested size
        command = "convert #{temp_out} -resize #{resize} -quality 90 +dither -depth 8 -colors 256 #{png_out}"
        BigBlueButton.execute(command)
      else
        # If page extraction failed, generate a blank white image at requested size
        command = "convert -size #{resize} xc:white -quality 90 +dither -depth 8 -colors 256 #{png_out}"
        BigBlueButton.execute(command)
      end
    ensure
      FileUtils.rm_f(temp_out)
    end
    
    # Convert a pdf page to a png.
    def self.convert_pdf_to_png(pdf_page, png_out)
        BigBlueButton.logger.info("Task: Converting .pdf to .png")      
        command = "convert -density 300x300 #{pdf_page} -background white -flatten -resize 800x600 -quality 90 +dither -depth 8 -colors 256 #{png_out}"
        BigBlueButton.execute(command)
#        Process.wait  
    end

    #Convert an image to a png	
    def self.convert_image_to_png(image,png_image)
        BigBlueButton.logger.info("Task: Converting image to .png")      
        command="convert #{image} -resize 800x600 -background white -flatten #{png_image}"
        BigBlueButton.execute(command)
    end

  end
end

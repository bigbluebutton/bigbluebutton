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
      Dir.glob("#{presentation_dir}/thumbnails/*.png").size
    end

    # Extract a page from a pdf file as a png image
    def self.extract_png_page_from_pdf(page_num, pdf_presentation, png_out, resize = '800x600')
      # In order to handle portrait docs better, scale to a square based on
      # the larger of height, width in the resize parameter.
      scale = resize.split('x').map(&:to_i).max
      BigBlueButton.logger.info("Task: Extracting a page from pdf file as png image")
      temp_out = "#{File.dirname(png_out)}/temp-#{File.basename(png_out, '.png')}"
      command = "pdftocairo -png -f #{page_num} -l #{page_num} -scale-to #{scale} -singlefile #{pdf_presentation} #{temp_out}"
      status = BigBlueButton.execute(command, false)
      temp_out += ".png"
      if status.success? and File.exist?(temp_out)
        # Resize to the requested size
        command = "convert #{temp_out} -resize #{scale}x#{scale} -quality 90 +dither -depth 8 -colors 256 #{png_out}"
        status = BigBlueButton.execute(command, false)
      end
      if !status.success? or !File.exist?(png_out)
        # If page extraction failed, generate a blank white image
        command = "convert -size #{resize} xc:white -quality 90 +dither -depth 8 -colors 256 #{png_out}"
        BigBlueButton.execute(command)
      end
    ensure
      FileUtils.rm_f(temp_out)
    end
    
    # Convert a pdf page to a png.
    def self.convert_pdf_to_png(pdf_page, png_out)
      self.extract_png_page_from_pdf(1, pdf_page, png_out, '800x600')
    end

    # Convert an image to a png
    def self.convert_image_to_png(image, png_image, resize = '800x600')
      # In order to handle portrait docs better, scale to a square based on
      # the larger of height, width in the resize parameter.
      scale = resize.split('x').map(&:to_i).max
      BigBlueButton.logger.info("Task: Converting image to .png")
      command = "convert #{image} -resize #{scale}x#{scale} -background white -flatten #{png_image}"
      status = BigBlueButton.execute(command, false)
      if !status.success? or !File.exist?(png_image)
        # If image conversion failed, generate a blank white image
        command = "convert -size #{resize} xc:white -quality 90 +dither -depth 8 -colors 256 #{png_image}"
        BigBlueButton.execute(command)
      end
    end

    # Gathers the text from the slide
    def self.get_text_from_slide(textfiles_dir, slide_num)
      text_from_slide = nil
      begin
        text_from_slide = File.open("#{textfiles_dir}/slide-#{slide_num}.txt") {|f| f.readline}
        text_from_slide = text_from_slide.strip.encode(:xml => :text) unless text_from_slide == nil
      rescue Exception => e
        #do nothing
      end
      text_from_slide
    end

    # Get from events the presentation that will be used for preview.
    def self.get_presentation_for_preview(process_dir)
      events_xml = "#{process_dir}/events.xml"
      BigBlueButton.logger.info("Task: Getting from events the presentation to be used for preview")
      presentation = {}
      doc = Nokogiri::XML(File.open(events_xml))
      doc.xpath("//event[@eventname='SharePresentationEvent']").each do |presentation_event|
        # Extract presentation data from events
        presentation_id = presentation_event.xpath("presentationName").text
        presentation_filename = presentation_event.xpath("originalFilename").text
        # Set textfile directory
        textfiles_dir = "#{process_dir}/presentation/#{presentation_id}/textfiles"
        # Set presentation hashmap to be returned
        unless presentation_filename == "default.pdf"
          presentation[:id] = presentation_id
          presentation[:filename] = presentation_filename
          presentation[:slides] = {}
          for i in 1..3
            if File.file?("#{textfiles_dir}/slide-#{i}.txt")
              text_from_slide = self.get_text_from_slide(textfiles_dir, i)
              presentation[:slides][i] = { :alt => text_from_slide == nil ? '' : text_from_slide }
            end
          end
          # Break because something else than default.pdf was found
          break
        end
      end
      presentation
    end
  end

end

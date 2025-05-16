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

class Range
  def intersection(other)
    raise ArgumentError, 'value must be a Range' unless other.kind_of?(Range)
    new_min = self.cover?(other.min) ? other.min : other.cover?(min) ? min : nil
    new_max = self.cover?(other.max) ? other.max : other.cover?(max) ? max : nil
    new_min && new_max ? new_min..new_max : nil
  end
  alias_method :&, :intersection
end

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
      BigBlueButton.logger.info('Task: Extracting a page from pdf file as png image')
      temp_out = "#{File.dirname(png_out)}/temp-#{File.basename(png_out, '.png')}"
      status = BigBlueButton.execute(
        [
          'pdftocairo', '-png', '-f', page_num.to_s, '-l', page_num.to_s, '-scale-to', scale.to_s, '-singlefile', '-cropbox',
          pdf_presentation, temp_out,
        ],
        false
      )
      temp_out += '.png'
      if status.success? && File.exist?(temp_out)
        # Resize to the requested size
        status = BigBlueButton.execute(
          [
            'convert', temp_out, '-resize', "#{scale}x#{scale}", '-quality', '90', '+dither', '-depth', '8', '-colors', '256',
            png_out,
          ],
          false
        )
      end
      if !status.success? || !File.exist?(png_out)
        # If page extraction failed, generate a blank white image
        BigBlueButton.execute(
          ['convert', '-size', resize, 'xc:white', '-quality', '90', '+dither', '-depth', '8', '-colors', '256', png_out]
        )
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
    def self.get_presentation_for_preview(process_dir, heuristic_thumbnails, number_thumbnails)
      events_xml = "#{process_dir}/events.xml"
      BigBlueButton.logger.info("Task: Getting from events the presentation to be used for preview")
      presentation = []
      doc = Nokogiri::XML(File.open(events_xml))
      presentation_filenames = {}
      doc.xpath("//event[@eventname='ConversionCompletedEvent']").each do |conversion_event|
        presentation_filenames[conversion_event.xpath("presentationName").text] = conversion_event.xpath("originalFilename").text
      end
      sesseion_end = doc.xpath('//event[last()]')[0].attributes['timestamp'].value.to_i
      slide_events = doc.xpath("//event[@eventname='GotoSlideEvent']")
      slide_time = {}
      current_slide = nil
      current_ts = nil
      slide_events.each_with_index do |e, i|
        if i > 0
          time_shown = current_ts..e.attributes["timestamp"].value.to_i
          if slide_time[current_slide]
            slide_time[current_slide].push(time_shown)
          else
            slide_time[current_slide] = [time_shown]
          end
        end
        current_slide = e.at('id').text
        current_ts = e.attributes["timestamp"].value.to_i
      end
      if current_ts
        time_shown = current_ts..sesseion_end
        if slide_time[current_slide]
          slide_time[current_slide].push(time_shown)
        else
          slide_time[current_slide] = [time_shown]
        end
      end
      #BigBlueButton.logger.info("slide_time: #{slide_time}")

      record_time = []
      record_events = doc.xpath("//event[@eventname='RecordStatusEvent']")
      record_events.each_with_index do |e, i|
        if i.odd?
          record_time.push(record_events[i-1].attributes["timestamp"].value.to_i..e.attributes["timestamp"].value.to_i)
        end
      end
      if record_events.size.odd?
        record_time.push(record_events[-1].attributes["timestamp"].value.to_i..sesseion_end)
      end
      #BigBlueButton.logger.info("record_time: #{record_time}")

      # Intersect with the recorded periods
      slide_time_recorded = {}
      slide_time.each do |id, periods|
        periods.each do |period|
          record_time.each do |record|
            intersected_period = period.intersection(record)
            if slide_time_recorded[id]
              slide_time_recorded[id].push(intersected_period)
            else
              slide_time_recorded[id] = [intersected_period]
            end
          end
        end
        slide_time_recorded[id].compact! if slide_time_recorded[id]
      end
      #BigBlueButton.logger.info("slide_time_recorded: #{slide_time_recorded}")

      slide_time_sort = slide_time_recorded.map{|k, v| [k, v.inject(0){|s, n| s += n.size}] }.sort_by{|_, v| -v} if heuristic_thumbnails
      BigBlueButton.logger.info("Thumbnail candidates: #{slide_time_sort}")
      slide_time_sort.each do |st|
        break if presentation.size >= number_thumbnails
        p, s = st[0].split('/')
        presentation_filename = presentation_filenames[p]
        next if presentation_filename == "default.pdf"
        textfiles_dir = "#{process_dir}/presentation/#{p}/textfiles"
        text_from_slide = self.get_text_from_slide(textfiles_dir, s) if File.file?("#{textfiles_dir}/slide-#{s}.txt")
        presentation.push({ :id => p, :filename => presentation_filename, :i => s, :alt => text_from_slide == nil ? '' : text_from_slide, :duration => st[1] })
      end
      presentation
    end
  end

end

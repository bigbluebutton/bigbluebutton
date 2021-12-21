#!/usr/bin/env ruby
# frozen_string_literal: false

require 'base64'
require 'builder'
require 'combine_pdf'
require 'csv'
require 'fileutils'
require 'loofah'
require 'nokogiri'
require 'optimist'
require 'yaml'

# For PRODUCTION
require File.expand_path('../../lib/recordandplayback/interval_tree', __FILE__)
require File.expand_path('../../lib/recordandplayback', __FILE__)

# For DEVELOPMENT
# require File.expand_path('../../../../core/lib/recordandplayback', __FILE__)
# require File.expand_path('../../../../core/lib/recordandplayback/interval_tree', __FILE__)

include IntervalTree

opts = Optimist.options do
  opt :meeting_id, 'Meeting id to archive', type: String
  opt :format, 'Playback format name', type: String
end

meeting_id = opts[:meeting_id]

# Only run after the presentation format finished
exit(0) unless opts[:format].eql?('presentation')

logger = Logger.new('/var/log/bigbluebutton/post_publish.log', 'weekly')
logger.level = Logger::INFO
BigBlueButton.logger = logger

BigBlueButton.logger.info("Started exporting PDF for [#{meeting_id}]")

@published_files = "/var/bigbluebutton/published/presentation/#{meeting_id}"

# Creates scratch directories
FileUtils.mkdir_p(["#{@published_files}/presentation", "/var/bigbluebutton/published/document/#{meeting_id}"])

# Setting the SVGZ option to true will write less data on the disk.
SVGZ_COMPRESSION = false

FILE_EXTENSION = SVGZ_COMPRESSION ? 'svgz' : 'svg'

# Leave it as false for BBB >= 2.3 as it stopped supporting live whiteboard
REMOVE_REDUNDANT_SHAPES = false

WhiteboardElement = Struct.new(:begin, :end, :value, :id)
WhiteboardSlide = Struct.new(:href, :begin, :end, :width, :height)

def add_greenlight_buttons(metadata)
  bbb_props = File.open(File.join(__dir__, '../bigbluebutton.yml')) { |f| YAML.safe_load(f) }
  playback_protocol = bbb_props['playback_protocol']
  playback_host = bbb_props['playback_host']

  meeting_id = metadata.xpath('recording/id').inner_text

  metadata.xpath('recording/playback/format').children.first.content = 'document'
  metadata.xpath('recording/playback/link').children.first.content = "#{playback_protocol}://#{playback_host}/presentation/#{meeting_id}/annotated_slides.pdf"

  File.open("/var/bigbluebutton/published/document/#{meeting_id}/metadata.xml", 'w') do |file|
    file.write(metadata)
  end
end

def base64_encode(path)
  return '' if File.directory?(path)

  data = File.open(path).read
  "data:image/#{File.extname(path).delete('.')};base64,#{Base64.strict_encode64(data)}"
end

def convert_whiteboard_shapes(whiteboard)
  # Find shape elements
  whiteboard.xpath('svg/g/g').each do |annotation|
    # Make all annotations visible
    style = annotation.attr('style')
    style.sub! 'visibility:hidden', ''
    annotation.set_attribute('style', style)

    shape = annotation.attribute('shape').to_s

    if shape.include? 'poll'
      poll = annotation.element_children.first

      path = "#{@published_files}/#{poll.attribute('href')}"
      poll.remove_attribute('href')
      poll.add_namespace_definition('xlink', 'http://www.w3.org/1999/xlink')

      poll.set_attribute('xlink:href', base64_encode(path))
    end

    # Convert XHTML to SVG so that text can be shown
    next unless shape.include? 'text'

    # Turn style attributes into a hash
    style_values = Hash[*CSV.parse(style, col_sep: ':', row_sep: ';').flatten]

    text_color = style_values['color']
    font_size = style_values['font-size'].to_f

    annotation.set_attribute('style', "#{style};fill:currentcolor")

    foreign_object = annotation.xpath('switch/foreignObject')

    # Obtain X and Y coordinates of the text
    x = foreign_object.attr('x').to_s
    y = foreign_object.attr('y').to_s
    text_box_width = foreign_object.attr('width').to_s.to_f

    text = foreign_object.children.children

    builder = Builder::XmlMarkup.new
    builder.text(x: x, y: y, fill: text_color, 'xml:space' => 'preserve') do
      previous_line_was_text = true

      text.each do |line|
        line = line.to_s

        if line == '<br/>'
          if previous_line_was_text
            previous_line_was_text = false
          else
            builder.tspan(x: x, dy: '1.0em') { builder << '<br/>' }
          end
        else
          line = Loofah.fragment(line).scrub!(:strip).text.unicode_normalize

          line_breaks = pack_up_string(line, ' ', font_size, text_box_width)

          line_breaks.each do |row|
            safe_message = Loofah.fragment(row).scrub!(:escape)
            builder.tspan(x: x, dy: '1.0em') { builder << safe_message }
          end

          previous_line_was_text = true
        end
      end
    end

    annotation.add_child(builder.target!)

    # Remove the <switch> tag
    annotation.xpath('switch').remove
  end

  # Save new shapes.svg copy
  File.open("#{@published_files}/shapes_modified.svg", 'w', 0o600) do |file|
    file.write(whiteboard)
  end
end

def measure_string(s, font_size)
  # https://stackoverflow.com/a/4081370
  # DejaVuSans, the default truefont of Debian, can be used here
  # /usr/share/fonts/truetype/dejavu/DejaVuSans.ttf
  # use ImageMagick to measure the string in pixels
  command = "convert xc: -font /usr/share/fonts/truetype/msttcorefonts/Arial.ttf -pointsize #{font_size} -debug annotate -annotate 0 #{Shellwords.escape(s)} null: 2>&1"
  _, output = run_command(command, true)
  output.match(/; width: (\d+);/)[1].to_f
end

def pack_up_string(s, separator, font_size, text_box_width)
  # Split the line on whitespaces, and measure the line to fit into the text_box_width
  line_breaks = []
  queued_words = []
  s.split(separator).each do |word|
    # First consider queued word and the current word in the line
    test_string = (queued_words + [word]).join(separator)

    width = measure_string(test_string, font_size)

    if width > text_box_width
      # Line exceeded, so consider the queued words as a line break and queue the current word
      line_breaks += [queued_words.join(separator)]
      if measure_string(word, font_size) > text_box_width
        # If the word alone exceeds the box width, then we pack the word maximizing the amount of characters on each line
        res = pack_up_string(word, '', font_size, text_box_width)
        # Queue last line break, other words might fit
        queued_words = [res.pop]
        line_breaks += res
      else
        queued_words = [word]
      end
    else
      # Current word fits the text box, so keep enqueueing new words
      queued_words += [word]
    end
  end
  # Make sure we release the final queued words as the final line break
  line_breaks += [queued_words.join(separator)] unless queued_words.empty?

  line_breaks
end

def parse_whiteboard_shapes(shape_reader)
  slide_in = 0
  slide_out = 0

  shapes = []
  slides = []

  shape_reader.each do |node|
    next unless node.node_type == Nokogiri::XML::Reader::TYPE_ELEMENT

    node_name = node.name
    node_class = node.attribute('class')

    if node_name == 'image' && node_class == 'slide'
      slide_in = node.attribute('in').to_f
      slide_out = node.attribute('out').to_f

      path = "#{@published_files}/#{node.attribute('href')}"
      next if path.include?('deskshare')

      slides << WhiteboardSlide.new(path, slide_in, slide_out, node.attribute('width').to_f, node.attribute('height'))
    end

    next unless node_name == 'g' && node_class == 'shape'

    shape_timestamp = node.attribute('timestamp').to_f
    shape_undo = node.attribute('undo').to_f

    shape_undo = slide_out if shape_undo.negative?

    shape_enter = [shape_timestamp, slide_in].max
    shape_leave = [[shape_undo, slide_in].max, slide_out].min

    xml = "<g style=\"#{node.attribute('style')}\">#{node.inner_xml}</g>"
    id = node.attribute('shape').split('-').last

    shapes << WhiteboardElement.new(shape_enter, shape_leave, xml, id)
  end

  [shapes, slides]
end

def remove_adjacent(array)
  index = 0

  until array[index + 1].nil?
    array[index] = nil if array[index].id == array[index + 1].id
    index += 1
  end

  array.compact! || array
end

def render_whiteboard(slides, shapes)
  shapes_interval_tree = IntervalTree::Tree.new(shapes)
  frame_number = 0

  merged = CombinePDF.new

  slides.each do |slide|
    draw = shapes_interval_tree.search(slide.end - 0.05, unique: false, sort: false)
    draw = [] if draw.nil?

    draw = remove_adjacent(draw) if REMOVE_REDUNDANT_SHAPES && !draw.empty?

    svg_export(draw, slide.href, slide.width, slide.height, frame_number)

    pdf = run_command("rsvg-convert -f pdf -o #{@published_files}/presentation/frame#{frame_number}.pdf " \
                      "#{@published_files}/presentation/frame#{frame_number}.#{FILE_EXTENSION}")

    unless pdf
      warn("An error occurred generating the PDF for slide #{frame_number}")
      exit(false)
    end

    merged << CombinePDF.load("#{@published_files}/presentation/frame#{frame_number}.pdf")

    frame_number += 1
  end

  merged.save "#{@published_files}/annotated_slides.pdf"
end

def run_command(command, silent = false)
  BigBlueButton.logger.info("Running: #{command}") unless silent
  output = `#{command}`
  [$CHILD_STATUS.success?, output]
end

def svg_export(draw, slide_href, width, height, frame_number)
  # Builds SVG frame
  builder = Builder::XmlMarkup.new

  builder.svg(width: width, height: height, viewBox: "0 0 #{width} #{height}",
              'xmlns:xlink' => 'http://www.w3.org/1999/xlink', 'xmlns' => 'http://www.w3.org/2000/svg') do
    # Display background image
    builder.image('xlink:href': slide_href, width: width, height: height)

    # Adds annotations
    draw.each do |shape|
      builder << shape.value
    end
  end

  File.open("#{@published_files}/presentation/frame#{frame_number}.#{FILE_EXTENSION}", 'w', 0o600) do |svg|
    if SVGZ_COMPRESSION
      svgz = Zlib::GzipWriter.new(svg, Zlib::BEST_SPEED)
      svgz.write(builder.target!)
      svgz.close
    else
      svg.write(builder.target!)
    end
  end
end

def unique_slides(slides)
  # Only keep the last state of the slides, maintaining original order
  slides_size = slides.size - 1

  (0..slides_size).each do |i|
    ((i + 1)..slides_size).each do |j|
      next if slides[i].nil? || slides[j].nil?

      if slides[i].href == slides[j].href
        slides[i] = slides[j]
        slides[j] = nil
      end
    end
  end

  slides.compact! || slides
end

def export_pdf
  # Benchmark
  start = Time.now

  convert_whiteboard_shapes(File.open("#{@published_files}/shapes.svg") { |f| Nokogiri::XML(f).remove_namespaces! })

  metadata = File.open("#{@published_files}/metadata.xml") { |f| Nokogiri::XML(f) }

  shapes, slides = parse_whiteboard_shapes(Nokogiri::XML::Reader(File.read("#{@published_files}/shapes_modified.svg")))

  slides = unique_slides(slides)

  render_whiteboard(slides, shapes)

  BigBlueButton.logger.info("Finished exporting PDF. Total: #{Time.now - start}")

  add_greenlight_buttons(metadata)
end

export_pdf

exit(0)

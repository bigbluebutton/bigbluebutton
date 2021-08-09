#!/usr/bin/env ruby
# frozen_string_literal: false

require "trollop"
require File.expand_path('../../../lib/recordandplayback', __FILE__)

require "nokogiri"
require "base64"
require "builder"
require "csv"
require "fileutils"
require "json"
require "loofah"
require File.expand_path('../../../lib/recordandplayback/interval_tree', __FILE__)

include IntervalTree

opts = Trollop.options do
  opt :meeting_id, "Meeting id to archive", type: String
  opt :format, "Playback format name", type: String
end

meeting_id = opts[:meeting_id]

logger = Logger.new("/var/log/bigbluebutton/post_publish.log", 'weekly')
logger.level = Logger::INFO
BigBlueButton.logger = logger

BigBlueButton.logger.info("Started exporting presentation for [#{meeting_id}]")

# Track how long the code is taking
start = Time.now

@published_files = "/var/bigbluebutton/published/presentation/#{meeting_id}"

# Creates scratch directories
Dir.mkdir("#{@published_files}/chats") unless File.exist?("#{@published_files}/chats")
Dir.mkdir("#{@published_files}/cursor") unless File.exist?("#{@published_files}/cursor")
Dir.mkdir("#{@published_files}/frames") unless File.exist?("#{@published_files}/frames")
Dir.mkdir("#{@published_files}/timestamps") unless File.exist?("#{@published_files}/timestamps")

# Setting the SVGZ option to true will write less data on the disk.
SVGZ_COMPRESSION = false

# Set this to true if you've recompiled FFmpeg to enable external references. Writes less data on disk and is faster.
FFMPEG_REFERENCE_SUPPORT = false
BASE_URI = FFMPEG_REFERENCE_SUPPORT ? "-base_uri #{@published_files}" : ""

# Video output quality: 0 is lossless, 51 is the worst. Default 23, 18 - 28 recommended
CONSTANT_RATE_FACTOR = 23

FILE_EXTENSION = SVGZ_COMPRESSION ? "svgz" : "svg"
VIDEO_EXTENSION = File.file?("#{@published_files}/video/webcams.mp4") ? "mp4" : "webm"

# Set this to true if the whiteboard supports whiteboard animations
REMOVE_REDUNDANT_SHAPES = false

BENCHMARK_FFMPEG = false
BENCHMARK = BENCHMARK_FFMPEG ? "-benchmark " : ""

THREADS = 4

# Output video size
OUTPUT_WIDTH = 1920
OUTPUT_HEIGHT = 1080

# Playback layout
WEBCAMS_WIDTH = 320
WEBCAMS_HEIGHT = 240

CHAT_WIDTH = WEBCAMS_WIDTH
CHAT_HEIGHT = OUTPUT_HEIGHT - WEBCAMS_HEIGHT

# Assumes a monospaced font with a width to aspect ratio of 3:5
CHAT_FONT_SIZE = 15
CHAT_FONT_SIZE_X = (0.6 * CHAT_FONT_SIZE).to_i

# Max. dimensions supported: 8032 x 32767
CHAT_CANVAS_WIDTH = (8032 / CHAT_WIDTH) * CHAT_WIDTH
CHAT_CANVAS_HEIGHT = (32_767 / CHAT_FONT_SIZE) * CHAT_FONT_SIZE

# Dimensions of the whiteboard area
SLIDES_WIDTH = OUTPUT_WIDTH - WEBCAMS_WIDTH
SLIDES_HEIGHT = OUTPUT_HEIGHT

# Input deskshare dimensions. Is scaled to fit whiteboard area keeping aspect ratio
DESKSHARE_INPUT_WIDTH = 1280
DESKSHARE_INPUT_HEIGHT = 720

# Center the deskshare
DESKSHARE_Y_OFFSET = ((SLIDES_HEIGHT - ([SLIDES_WIDTH.to_f / DESKSHARE_INPUT_WIDTH,
                                         SLIDES_HEIGHT.to_f / DESKSHARE_INPUT_HEIGHT].min * DESKSHARE_INPUT_HEIGHT)) / 2).to_i

WhiteboardElement = Struct.new(:begin, :end, :value, :id)
WhiteboardSlide = Struct.new(:href, :begin, :end, :width, :height)

def add_captions
  json = JSON.parse(File.read("#{@published_files}/captions.json"))

  return if json.length.zero?

  caption_input = ""
  maps = ""
  language_names = ""

  (0..json.length - 1).each do |i|
     caption_input << "-i #{@published_files}/caption_#{json[i]['locale']}.vtt "
     maps << "-map #{i + 1} "
     language_names << "-metadata:s:s:#{i} language=#{json[i]['localeName'].downcase[0..2]} "
  end

  render = "ffmpeg -i #{@published_files}/meeting.mp4 #{caption_input} " \
            "-map 0:v -map 0:a #{maps} -c:v copy -c:a copy -c:s mov_text #{language_names} " \
            "-y #{@published_files}/meeting_captioned.mp4"

  ffmpeg = system(render)

  if ffmpeg
    FileUtils.mv("#{@published_files}/meeting_captioned.mp4", "#{@published_files}/meeting.mp4")
  else
      warn("An error occurred adding the captions to the video.")
      exit(false)
  end
end

def add_chapters(duration, slides)
  # Extract metadata
  ffmpeg = system("ffmpeg -i #{@published_files}/meeting.mp4 -y -f ffmetadata #{@published_files}/meeting_metadata")

  unless ffmpeg
    warn("An error occurred extracting the video's metadata.")
    exit(false)
  end

  slide_number = 1
  deskshare_number = 1

  chapter = ""
  slides.each do |slide|
    chapter_start = slide.begin
    chapter_end = slide.end

    break if chapter_start >= duration

    next if (chapter_end - chapter_start) <= 0.25

    if slide.href.include?("deskshare")
      title = "Screen sharing #{deskshare_number}"
      deskshare_number += 1
    else
      title = "Slide #{slide_number}"
      slide_number += 1
    end

    chapter << "[CHAPTER]\nSTART=#{chapter_start * 1e9}\nEND=#{chapter_end * 1e9}\ntitle=#{title}\n\n"
  end

  File.open("#{@published_files}/meeting_metadata", "a") do |file|
    file << chapter
  end

  ffmpeg = system("ffmpeg -i #{@published_files}/meeting.mp4 -i #{@published_files}/meeting_metadata -map_metadata 1 -map_chapters 1 -codec copy -y -t #{duration} #{@published_files}/meeting_chapters.mp4")
  if ffmpeg
    FileUtils.mv("#{@published_files}/meeting_chapters.mp4", "#{@published_files}/meeting.mp4")
  else
    warn("Failed to add the chapters to the video.")
    exit(false)
  end
end

def base64_encode(path)
  return "" if File.directory?(path)

  data = File.open(path).read
  "data:image/#{File.extname(path).delete('.')};base64,#{Base64.strict_encode64(data)}"
end

def convert_whiteboard_shapes(whiteboard)
  # Find shape elements
  whiteboard.xpath("svg/g/g").each do |annotation|
    # Make all annotations visible
    style = annotation.attr("style")
    style.sub! "visibility:hidden", ""
    annotation.set_attribute("style", style)

    shape = annotation.attribute("shape").to_s
    # Convert polls to data schema
    if shape.include? "poll"
      poll = annotation.element_children.first

      path = "#{@published_files}/#{poll.attribute('href')}"
      poll.remove_attribute("href")

      # Namespace xmlns:xlink is required by FFmpeg
      poll.add_namespace_definition("xlink", "http://www.w3.org/1999/xlink")

      data = FFMPEG_REFERENCE_SUPPORT ? "file:///#{path}" : base64_encode(path)

      poll.set_attribute("xlink:href", data)
    end

    # Convert XHTML to SVG so that text can be shown
    next unless shape.include? "text"

    # Turn style attributes into a hash
    style_values = Hash[*CSV.parse(style, col_sep: ":", row_sep: ";").flatten]

    # The text_color variable may not be required depending on your FFmpeg version
    text_color = style_values["color"]
    font_size = style_values["font-size"].to_f

    annotation.set_attribute("style", "#{style};fill:currentcolor")

    foreign_object = annotation.xpath("switch/foreignObject")

    # Obtain X and Y coordinates of the text
    x = foreign_object.attr("x").to_s
    y = foreign_object.attr("y").to_s
    text_box_width = foreign_object.attr("width").to_s.to_f

    text = foreign_object.children.children

    builder = Builder::XmlMarkup.new
    builder.text(x: x, y: y, fill: text_color, "xml:space" => "preserve") do
      text.each do |line|
        line = line.to_s

        if line == "<br/>"
          builder.tspan(x: x, dy: "0.9em") { builder << "<br/>" }
        else
          # Assumes a width to height aspect ratio of 0.52 for Arial
          line_breaks = line.chars.each_slice((text_box_width / (font_size * 0.52)).to_i).map(&:join)

          line_breaks.each do |row|
            safe_message = Loofah.fragment(row).scrub!(:escape).text.unicode_normalize
            builder.tspan(x: x, dy: "0.9em") { builder << safe_message }
          end
        end
      end
    end

    annotation.add_child(builder.target!)

    # Remove the <switch> tag
    annotation.xpath("switch").remove
  end

  # Save new shapes.svg copy
  File.open("#{@published_files}/shapes_modified.svg", "w", 0o600) do |file|
    file.write(whiteboard)
  end
end

def parse_panzooms(pan_reader, timestamps)
  panzooms = []
  timestamp = 0

  pan_reader.each do |node|
    next unless node.node_type == Nokogiri::XML::Reader::TYPE_ELEMENT
    node_name = node.name

    timestamp = node.attribute("timestamp").to_f if node_name == "event"

    if node_name == "viewBox"
      panzooms << [timestamp, node.inner_xml]
      timestamps << timestamp
    end
  end

  [panzooms, timestamps]
end

def parse_whiteboard_shapes(shape_reader)
  slide_in = 0
  slide_out = 0

  shapes = []
  slides = []
  timestamps = []

  shape_reader.each do |node|
    next unless node.node_type == Nokogiri::XML::Reader::TYPE_ELEMENT

    node_name = node.name
    node_class = node.attribute("class")

    if node_name == "image" && node_class == "slide"
      slide_in = node.attribute("in").to_f
      slide_out = node.attribute("out").to_f

      timestamps << slide_in
      timestamps << slide_out

      # Image paths need to follow the URI Data Scheme (for slides and polls)
      path = "#{@published_files}/#{node.attribute('href')}"

      data = FFMPEG_REFERENCE_SUPPORT ? "file:///#{path}" : base64_encode(path)

      slides << WhiteboardSlide.new(data, slide_in, slide_out, node.attribute("width").to_f, node.attribute("height"))
    end

    next unless node_name == "g" && node_class == "shape"

    shape_timestamp = node.attribute("timestamp").to_f
    shape_undo = node.attribute("undo").to_f

    shape_undo = slide_out if shape_undo.negative?

    shape_enter = [[shape_timestamp, slide_in].max, slide_out].min
    shape_leave = [[shape_undo, slide_in].max, slide_out].min

    timestamps << shape_enter
    timestamps << shape_leave

    xml = "<g style=\"#{node.attribute('style')}\">#{node.inner_xml}</g>"
    id = node.attribute("shape").split("-").last

    shapes << WhiteboardElement.new(shape_enter, shape_leave, xml, id)
  end

  [shapes, slides, timestamps]
end

def remove_adjacent(array)
  index = 0

  until array[index + 1].nil?
    array[index] = nil if array[index].id == array[index + 1].id
    index += 1
  end

  array.compact
end

def render_chat(chat_reader)
  messages = []

  chat_reader.each do |node|
    unless node.name == "chattimeline" &&
           node.attribute("target") == "chat" &&
           node.node_type == Nokogiri::XML::Reader::TYPE_ELEMENT
      next
    end

    messages << [node.attribute("in").to_f, node.attribute("name"), node.attribute("message")]
  end

  # Text coordinates on the SVG file
  svg_x = 0
  svg_y = CHAT_HEIGHT + CHAT_FONT_SIZE

  # Chat viewbox coordinates
  chat_x = 0
  chat_y = 0

  overlay_position = []

  # Create SVG chat with all messages
  # Add 'xmlns' => 'http://www.w3.org/2000/svg' for visual debugging
  builder = Builder::XmlMarkup.new
  builder.instruct!
  builder.svg(width: CHAT_CANVAS_WIDTH, height: CHAT_CANVAS_HEIGHT, 'xmlns' => 'http://www.w3.org/2000/svg') do
    builder.style { builder << "text{font-family: monospace; font-size: #{CHAT_FONT_SIZE}}" }

    messages.each do |timestamp, name, chat|
      # Strip HTML tags e.g. from links so it only displays the inner text
      chat = Loofah.fragment(chat).scrub!(:strip).text.unicode_normalize

      max_message_length = (CHAT_WIDTH / CHAT_FONT_SIZE_X) - 1

      line_breaks = [-1]
      line_index = 0
      last_linebreak_pos = 0

      (0..chat.length - 1).each do |chat_index|
        last_linebreak_pos = chat_index if chat[chat_index] == " "

        if line_index >= max_message_length
          last_linebreak_pos = last_linebreak_pos <= chat_index - max_message_length ? chat_index : last_linebreak_pos

          line_breaks << last_linebreak_pos

          line_index = chat_index - last_linebreak_pos - 1
        end

        line_index += 1
      end

      line_wraps = []
      line_breaks.each_cons(2) do |(a, b)|
        line_wraps << [a + 1, b]
      end

      line_wraps << [line_breaks.last + 1, chat.length - 1]

      # Message height equals the line break amount + the line for the name / time + the empty line afterwards
      message_height = (line_wraps.size + 2) * CHAT_FONT_SIZE

      if svg_y + message_height > CHAT_CANVAS_HEIGHT
        svg_y = CHAT_HEIGHT + CHAT_FONT_SIZE
        svg_x += CHAT_WIDTH

        chat_x += CHAT_WIDTH
        chat_y = message_height
      else
        chat_y += message_height
      end

      overlay_position << [timestamp, chat_x, chat_y]

      # Username and chat timestamp
      builder.text(x: svg_x, y: svg_y, "font-weight" => "bold") {
        builder << "#{name}    #{Time.at(timestamp.to_f.round(0)).utc.strftime('%H:%M:%S')}"
      }
      svg_y += CHAT_FONT_SIZE

      # Message text
      line_wraps.each do |a, b|
        safe_message = Loofah.fragment(chat[a..b]).scrub!(:escape)

        builder.text(x: svg_x, y: svg_y) { builder << safe_message }
        svg_y += CHAT_FONT_SIZE
      end

      svg_y += CHAT_FONT_SIZE
    end
  end

  # Saves chat as SVG / SVGZ file
  File.open("#{@published_files}/chats/chat.svg", "w", 0o600) do |file|
    file.write(builder.target!)
  end

  File.open("#{@published_files}/timestamps/chat_timestamps", "w", 0o600) do |file|
    file.puts "0 overlay@msg x 0, overlay@msg y 0;" if overlay_position.empty?

    overlay_position.each do |timestamp, x, y|
      file.puts "#{timestamp} crop@c x #{x}, crop@c y #{y};"
    end
  end
end

def render_cursor(panzooms, cursor_reader)
  # Create the mouse pointer SVG
  builder = Builder::XmlMarkup.new

  # Add 'xmlns' => 'http://www.w3.org/2000/svg' for visual debugging, remove for faster exports
  builder.svg(width: "16", height: "16") do
    builder.circle(cx: "8", cy: "8", r: "8", fill: "red")
  end

  File.open("#{@published_files}/cursor/cursor.svg", "w", 0o600) do |svg|
    svg.write(builder.target!)
  end

  cursor = []
  timestamps = []
  view_box = ""

  cursor_reader.each do |node|
    node_name = node.name
    next unless node.node_type == Nokogiri::XML::Reader::TYPE_ELEMENT

    timestamps << node.attribute("timestamp").to_f if node_name == "event"

    cursor << node.inner_xml if node_name == "cursor"
  end

  panzoom_index = 0
  File.open("#{@published_files}/timestamps/cursor_timestamps", "w", 0o600) do |file|
    timestamps.each.with_index do |timestamp, frame_number|
      panzoom = panzooms[panzoom_index]

      if panzoom_index < panzooms.length && timestamp >= panzoom.first
        _, view_box = panzoom
        panzoom_index += 1
        view_box = view_box.split
      end

      # Get cursor coordinates
      pointer = cursor[frame_number].split

      width = view_box[2].to_f
      height = view_box[3].to_f

      # Calculate original cursor coordinates
      cursor_x = pointer[0].to_f * width
      cursor_y = pointer[1].to_f * height

      # Scaling required to reach target dimensions
      x_scale = SLIDES_WIDTH / width
      y_scale = SLIDES_HEIGHT / height

      # Keep aspect ratio
      scale_factor = [x_scale, y_scale].min

      # Scale
      cursor_x *= scale_factor
      cursor_y *= scale_factor

      # Translate given difference to new on-screen dimensions
      x_offset = (SLIDES_WIDTH - scale_factor * width) / 2
      y_offset = (SLIDES_HEIGHT - scale_factor * height) / 2

      # Center cursor
      cursor_x -= 8
      cursor_y -= 8

      cursor_x += x_offset
      cursor_y += y_offset

      # Move whiteboard to the right, making space for the chat and webcams
      cursor_x += WEBCAMS_WIDTH

      # Writes the timestamp and position down
      file.puts "#{timestamp} overlay@m x #{cursor_x.round(3)}, overlay@m y #{cursor_y.round(3)};"
    end
  end
end

def render_video(duration, meeting_name)
  # Determine if video had screensharing
  deskshare = File.file?("#{@published_files}/deskshare/deskshare.#{VIDEO_EXTENSION}")

  render = "ffmpeg -f lavfi -i color=c=white:s=#{OUTPUT_WIDTH}x#{OUTPUT_HEIGHT} " \
          "-f concat -safe 0 #{BASE_URI} -i #{@published_files}/timestamps/whiteboard_timestamps " \
          "-framerate 10 -loop 1 -i #{@published_files}/cursor/cursor.svg " \
          "-framerate 1 -loop 1 -i #{@published_files}/chats/chat.svg " \
          "-i #{@published_files}/video/webcams.#{VIDEO_EXTENSION} "

  render << if deskshare
    "-i #{@published_files}/deskshare/deskshare.#{VIDEO_EXTENSION} -filter_complex " \
    "'[2]sendcmd=f=#{@published_files}/timestamps/cursor_timestamps[cursor];" \
    "[3]sendcmd=f=#{@published_files}/timestamps/chat_timestamps,crop@c=w=#{CHAT_WIDTH}:h=#{CHAT_HEIGHT}:x=0:y=0[chat];" \
    "[4]scale=w=#{WEBCAMS_WIDTH}:h=#{WEBCAMS_HEIGHT}[webcams];[5]scale=w=#{SLIDES_WIDTH}:h=#{SLIDES_HEIGHT}:force_original_aspect_ratio=1[deskshare];" \
    "[0][deskshare]overlay=x=#{WEBCAMS_WIDTH}:y=#{DESKSHARE_Y_OFFSET}[screenshare];" \
    "[screenshare][1]overlay=x=#{WEBCAMS_WIDTH}[slides];" \
    "[slides][cursor]overlay@m[whiteboard];" \
    "[whiteboard][chat]overlay=y=#{WEBCAMS_HEIGHT}[chats];" \
    "[chats][webcams]overlay' "
  else
    "-filter_complex '[2]sendcmd=f=#{@published_files}/timestamps/cursor_timestamps[cursor];" \
    "[3]sendcmd=f=#{@published_files}/timestamps/chat_timestamps,crop@c=w=#{CHAT_WIDTH}:h=#{CHAT_HEIGHT}:x=0:y=0[chat];" \
    "[4]scale=w=#{WEBCAMS_WIDTH}:h=#{WEBCAMS_HEIGHT}[webcams];" \
    "[0][1]overlay=x=#{WEBCAMS_WIDTH}[slides];" \
    "[slides][cursor]overlay@m[whiteboard];" \
    "[whiteboard][chat]overlay=y=#{WEBCAMS_HEIGHT}[chats];[chats][webcams]overlay' "
  end

  render << "-c:a aac -crf #{CONSTANT_RATE_FACTOR} -shortest -y -t #{duration} -threads #{THREADS} "
  render << "-metadata title='#{meeting_name}' #{BENCHMARK} #{@published_files}/meeting.mp4"

  ffmpeg = system(render)

  unless ffmpeg
    warn("An error occurred rendering the video.")
    exit(false)
  end
end

def render_whiteboard(panzooms, slides, shapes, timestamps)
  shapes_interval_tree = IntervalTree::Tree.new(shapes)

  # Create frame intervals with starting time 0
  intervals = timestamps.uniq.sort
  intervals = intervals.drop(1) if intervals.first == -1

  frame_number = 0

  # Render the visible frame for each interval
  File.open("#{@published_files}/timestamps/whiteboard_timestamps", "w", 0o600) do |file|
    slide_number = 0
    slide = slides[slide_number]
    view_box = ""

    intervals.each_cons(2).each do |interval_start, interval_end|
      # Get view_box parameter of the current slide
      _, view_box = panzooms.shift if !panzooms.empty? && interval_start >= panzooms.first.first

      if slide_number < slides.size && interval_start >= slides[slide_number].begin
        slide = slides[slide_number]
        slide_number += 1
      end

      draw = shapes_interval_tree.search(interval_start, unique: false, sort: false)

      draw = [] if draw.nil?
      draw = remove_adjacent(draw) if REMOVE_REDUNDANT_SHAPES && !draw.empty?

      svg_export(draw, view_box, slide.href, slide.width, slide.height, frame_number)

      # Write the frame's duration down
      file.puts "file ../frames/frame#{frame_number}.#{FILE_EXTENSION}"
      file.puts "duration #{(interval_end - interval_start).round(1)}"

      frame_number += 1
    end

    # The last image needs to be specified twice, without specifying the duration (FFmpeg quirk)
    file.puts "file ../frames/frame#{frame_number - 1}.#{FILE_EXTENSION}" if frame_number.positive?
  end
end

def svg_export(draw, view_box, slide_href, width, height, frame_number)
  # Builds SVG frame
  builder = Builder::XmlMarkup.new

  # FFmpeg requires the xmlns:xmlink namespace. Add 'xmlns' => 'http://www.w3.org/2000/svg' for visual debugging
  builder.svg(width: SLIDES_WIDTH, height: SLIDES_HEIGHT, viewBox: view_box,
              "xmlns:xlink" => "http://www.w3.org/1999/xlink", 'xmlns' => 'http://www.w3.org/2000/svg') do
    # Display background image
    builder.image('xlink:href': slide_href, width: width, height: height, preserveAspectRatio: "xMidYMid slice")

    # Adds annotations
    draw.each do |shape|
      builder << shape.value
    end
  end

  File.open("#{@published_files}/frames/frame#{frame_number}.#{FILE_EXTENSION}", "w", 0o600) do |svg|
    if SVGZ_COMPRESSION
      svgz = Zlib::GzipWriter.new(svg)
      svgz.write(builder.target!)
      svgz.close
    else
      svg.write(builder.target!)
    end
  end
end

def export_presentation
  # Benchmark
  start = Time.now

  # Convert whiteboard assets to a format compatible with FFmpeg
  convert_whiteboard_shapes(Nokogiri::XML(File.open("#{@published_files}/shapes.svg")).remove_namespaces!)

  metadata = Nokogiri::XML(File.open("#{@published_files}/metadata.xml"))

  # Playback duration in seconds
  duration = metadata.xpath('recording/playback/duration').inner_text.to_f / 1000
  meeting_name = metadata.xpath('recording/meta/meetingName').inner_text

  shapes, slides, timestamps = parse_whiteboard_shapes(Nokogiri::XML::Reader(File.open("#{@published_files}/shapes_modified.svg")))
  panzooms, timestamps = parse_panzooms(Nokogiri::XML::Reader(File.open("#{@published_files}/panzooms.xml")),
                                        timestamps)

  # Ensure correct recording length - shapes.svg may have incorrect slides after recording ends
  timestamps << duration
  timestamps = timestamps.select { |t| t <= duration }

  # Create video assets
  render_chat(Nokogiri::XML::Reader(File.open("#{@published_files}/slides_new.xml")))
  render_cursor(panzooms, Nokogiri::XML::Reader(File.open("#{@published_files}/cursor.xml")))
  render_whiteboard(panzooms, slides, shapes, timestamps)

  BigBlueButton.logger.info("Finished composing presentation. Time: #{Time.now - start}")

  start = Time.now
  BigBlueButton.logger.info("Starting to export video")

  render_video(duration, meeting_name)
  add_chapters(duration, slides)
  # add_captions

  BigBlueButton.logger.info("Exported recording available at #{@published_files}/meeting.mp4. Rendering took: #{Time.now - start}")
end

export_presentation

# Delete the contents of the scratch directories
FileUtils.rm_rf(["#{@published_files}/chats", "#{@published_files}/cursor", "#{@published_files}/frames",
                 "#{@published_files}/timestamps", "#{@published_files}/shapes_modified.svg",
                 "#{@published_files}/meeting_metadata"])

exit(0)

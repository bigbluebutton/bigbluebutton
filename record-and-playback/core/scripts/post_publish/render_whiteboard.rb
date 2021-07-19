#!/usr/bin/ruby
# frozen_string_literal: true

#
# BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
#
# Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
#
# This program is free software; you can redistribute it and/or modify it under
# the terms of the GNU Lesser General Public License as published by the Free
# Software Foundation; either version 3.0 of the License, or (at your option)
# any later version.
#
# BigBlueButton is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
# details.
#
# You should have received a copy of the GNU Lesser General Public License along
# with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
#

require "trollop"
require 'nokogiri'
require 'base64'
require 'zlib'
require File.expand_path('../../../lib/recordandplayback', __FILE__)

opts = Trollop.options do
  opt :meeting_id, "Meeting id to archive", type: String
  opt :format, "Playback format name", type: String
end

meeting_id = opts[:meeting_id]

logger = Logger.new("/var/log/bigbluebutton/post_publish.log", 'weekly')
logger.level = Logger::INFO
BigBlueButton.logger = logger

published_files = "/var/bigbluebutton/published/presentation/#{meeting_id}"

#
# Main code
#

# Track how long the code is taking
start = Time.now
BigBlueButton.logger.info("Starting render_whiteboard.rb for [#{meeting_id}]")

# Opens shapes.svg
@doc = Nokogiri::XML(File.open("#{published_files}/shapes.svg"))

# Opens panzooms.xml
@pan = Nokogiri::XML(File.open("#{published_files}/panzooms.xml"))

# Get intervals to display the frames
ins = @doc.xpath('//@in')
outs = @doc.xpath('//@out')
timestamps = @doc.xpath('//@timestamp')
undos = @doc.xpath('//@undo')
images = @doc.xpath('//xmlns:image', 'xmlns' => 'http://www.w3.org/2000/svg')
zooms = @pan.xpath('//@timestamp')

intervals = (ins + outs + timestamps + undos + zooms).to_a.map(&:to_s).map(&:to_f).uniq.sort

# Image paths need to follow the URI Data Scheme (for slides and polls)
images.each do |image|
  path = "#{published_files}/#{image.attr('xlink:href')}"

  # Open the image
  data = File.open(path).read

  image.set_attribute('xlink:href', "data:image/#{File.extname(path).delete('.')};base64,#{Base64.encode64(data)}")
  image.set_attribute('style', 'visibility:visible')
end

# Convert XHTML to SVG so that text can be shown
xhtml = @doc.xpath('//xmlns:g/xmlns:switch/xmlns:foreignObject', 'xmlns' => 'http://www.w3.org/2000/svg')

xhtml.each do |foreign_object|
  # Get and set style of corresponding group container
  g = foreign_object.parent.parent

  text = foreign_object.children.children

  # Obtain X and Y coordinates of the text
  x = foreign_object.attr('x').to_s
  y = foreign_object.attr('y').to_s
  text_color = g.attr('style').split(';').first.split(':')[1]

  # Preserve the whitespace (seems to be ignored by FFmpeg)
  svg = "<text x=\"#{x}\" y=\"#{y}\" xml:space=\"preserve\" fill=\"#{text_color}\">"

  # Add line breaks as <tspan> elements
  text.each do |line|
    if line.to_s == "<br/>"

      svg += "<tspan x=\"#{x}\" dy=\"0.9em\"><br/></tspan>"

    else

      # Make a new line every 40 characters (arbitrary value, SVG does not support auto wrap)
      line_breaks = line.to_s.chars.each_slice(40).map(&:join)

      line_breaks.each do |row|
        svg += "<tspan x=\"#{x}\" dy=\"0.9em\">#{row}</tspan>"
      end

    end
  end

  svg += "</text>"

  g.add_child(svg)

  # Remove the <switch> tag
  foreign_object.parent.remove
end

# Creates directory for the temporary assets
Dir.mkdir("#{published_files}/frames") unless File.exist?("#{published_files}/frames")

# Creates new file to hold the timestamps of the whiteboard
File.open("#{published_files}/timestamps/whiteboard_timestamps", 'w') {}

# Intervals with a value of -1 do not correspond to a timestamp
intervals = intervals.drop(1) if intervals.first == -1

# Obtain interval range that each frame will be shown for
frame_number = 0
frames = []

intervals.each_cons(2) do |(a, b)|
  frames << [a, b]
end

# Render the visible frame for each interval
frames.each do |frame|
  interval_start = frame[0]
  interval_end = frame[1]

  # Query slide we're currently on
  slide = @doc.xpath("//xmlns:image[@in <= #{interval_start} and #{interval_end} <= @out]", 'xmlns' => 'http://www.w3.org/2000/svg')

  # Query current viewbox parameter
  view_box = @pan.xpath("(//event[@timestamp <= #{interval_start}]/viewBox/text())[last()]")

  # Get slide information
  slide_id = slide.attr('id').to_s

  width = slide.attr('width').to_s
  height = slide.attr('height').to_s
  x = slide.attr('x').to_s
  y = slide.attr('y').to_s

  draw = @doc.xpath(
    "//xmlns:g[@class=\"canvas\" and @image=\"#{slide_id}\"]/xmlns:g[@timestamp < \"#{interval_end}\" and (@undo = \"-1\" or @undo >= \"#{interval_end}\")]", 'xmlns' => 'http://www.w3.org/2000/svg'
  )

  # Builds SVG frame
  builder = Nokogiri::XML::Builder.new(encoding: 'UTF-8') do |xml|
    xml.doc.create_internal_subset('svg', '-//W3C//DTD SVG 1.1//EN', 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd')

    xml.svg(width: "1600", height: "1080", x: x, y: y, version: '1.1', viewBox: view_box, 'xmlns' => 'http://www.w3.org/2000/svg', 'xmlns:xlink' => 'http://www.w3.org/1999/xlink') do
      # Display background image
      xml.image('xlink:href': slide.attr('href'), width: width, height: height, preserveAspectRatio: "xMidYMid slice", x: x, y: y, style: slide.attr('style'))

      # Add annotations
      draw.each do |shape|
        # Make shape visible
        style = shape.attr('style')
        style.sub! 'hidden', 'visible'

        xml.g(style: style) do
          xml << shape.xpath('./*').to_s
        end
      end
    end
  end

  # Saves frame as SVG file (for debugging purposes)
  # File.open("#{published_files}/frames/frame#{frame_number}.svg", 'w') do |file|
  # file.write(builder.to_xml)
  # end

  # Writes its duration down
  # File.open("#{published_files}/timestamps/whiteboard_timestamps", 'a') do |file|
  # file.puts "file #{published_files}/frames/frame#{frame_number}.svg"
  # file.puts "duration #{(interval_end - interval_start).round(1)}"
  # end

  # Saves frame as SVGZ file
  File.open("#{published_files}/frames/frame#{frame_number}.svgz", 'w') do |file|
    svgz = Zlib::GzipWriter.new(file)
    svgz.write(builder.to_xml)
    svgz.close
  end

  # Writes its duration down
  File.open("#{published_files}/timestamps/whiteboard_timestamps", 'a') do |file|
    file.puts "file ../frames/frame#{frame_number}.svgz"
    file.puts "duration #{(interval_end - interval_start).round(1)}"
  end

  frame_number += 1
  # puts frame_number
end

# The last image needs to be specified twice, without specifying the duration (FFmpeg quirk)
File.open("#{published_files}/timestamps/whiteboard_timestamps", 'a') do |file|
  file.puts "file #{published_files}/frames/frame#{frame_number - 1}.svgz"
end

# Benchmark
finish = Time.now

BigBlueButton.logger.info("Finished render_whiteboard.rb for [#{meeting_id}]. Total: #{finish - start}")

start = Time.now

# Determine file extensions used
extension = if File.file?("#{published_files}/video/webcams.mp4")
  "mp4"
else
  "webm"
            end

# Determine if video had screensharing
deskshare = File.file?("#{published_files}/deskshare/deskshare.#{extension}")

if deskshare
  render = "ffmpeg -f lavfi -i color=c=white:s=1920x1080 " \
 "-f concat -safe 0 -i #{published_files}/timestamps/whiteboard_timestamps " \
 "-f concat -safe 0 -i #{published_files}/timestamps/cursor_timestamps " \
 "-f concat -safe 0 -i #{published_files}/timestamps/chat_timestamps " \
 "-i #{published_files}/video/webcams.#{extension} " \
 "-i #{published_files}/deskshare/deskshare.#{extension} -filter_complex " \
"'[4]scale=w=320:h=240[webcams];[5]scale=w=1600:h=1080:force_original_aspect_ratio=1[deskshare];[0][deskshare]overlay=x=320[screenshare];[screenshare][1]overlay=x=320[whiteboard];[whiteboard][2]overlay=x=320[cursor];[cursor][3]overlay[chat];[chat][webcams]overlay' " \
"-c:a aac -shortest -y #{published_files}/meeting.mp4"
else
  render = "ffmpeg -f lavfi -i color=c=white:s=1920x1080 " \
"-f concat -safe 0 -i #{published_files}/timestamps/whiteboard_timestamps " \
 "-f concat -safe 0 -i #{published_files}/timestamps/cursor_timestamps " \
 "-f concat -safe 0 -i #{published_files}/timestamps/chat_timestamps " \
 "-i #{published_files}/video/webcams.#{extension} -filter_complex " \
 "'[4]scale=w=320:h=240[webcams];[0][1]overlay=x=320[slides];[slides][2]overlay=x=320[cursor];[cursor][3]overlay=y=240[chat];[chat][webcams]overlay' " \
 "-c:a aac -shortest -y #{published_files}/meeting.mp4"
end

BigBlueButton.logger.info("Beginning to render video for [#{meeting_id}]")
system(render)

finish = Time.now
BigBlueButton.logger.info("Exported recording available at #{published_files}/meeting.mp4 . Render time: #{finish - start}")

# Delete the contents of the scratch directories (race conditions)
# FileUtils.rm_rf("#{published_files}/chats")
# FileUtils.rm_rf("#{published_files}/cursor")
# FileUtils.rm_rf("#{published_files}/frames")
# FileUtils.rm_rf("#{published_files}/timestamps")

exit 0

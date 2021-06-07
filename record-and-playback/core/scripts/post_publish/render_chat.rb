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

BigBlueButton.logger.info("Starting render_chat.rb for [#{meeting_id}]")

# Opens slides_new.xml
@chat = Nokogiri::XML(File.open("#{published_files}/slides_new.xml"))
@meta = Nokogiri::XML(File.open("#{published_files}/metadata.xml"))

# Get chat messages and timings
recording_duration = (@meta.xpath('//duration').text.to_f / 1000).round(0)

ins = @chat.xpath('//@in').to_a.map(&:to_s).unshift(0).push(recording_duration)

# Creates directory for the temporary assets
Dir.mkdir("#{published_files}/chats") unless File.exist?("#{published_files}/chats")
Dir.mkdir("#{published_files}/timestamps") unless File.exist?("#{published_files}/timestamps")

# Creates new file to hold the timestamps of the chat
File.open("#{published_files}/timestamps/chat_timestamps", 'w') {}

chat_intervals = []

ins.each_cons(2) do |(a, b)|
  chat_intervals << [a, b]
end

messages = @chat.xpath("//chattimeline[@target=\"chat\"]")

# Line break offset
dy = 0

# Empty string to build <text>...</text> tag from
text = ""
message_heights = [0]

messages.each do |message|
    # User name and chat timestamp
    text += "<text x=\"2.5\" y=\"12.5\" dy=\"#{dy}em\" font-family=\"monospace\" font-size=\"15\" font-weight=\"bold\">#{message.attr('name')}</text>"
    text += "<text x=\"2.5\" y=\"12.5\" dx=\"#{message.attr('name').length}em\" dy=\"#{dy}em\" font-family=\"monospace\" font-size=\"15\" fill=\"grey\" opacity=\"0.5\">#{Time.at(message.attr('in').to_f.round(0)).utc.strftime('%H:%M:%S')}</text>"

    line_breaks = message.attr('message').chars.each_slice(35).map(&:join)
    message_heights.push(line_breaks.size + 2)

    dy += 1

    # Message text
    line_breaks.each do |line|
        text += "<text x=\"2.5\" y=\"12.5\" dy=\"#{dy}em\" font-family=\"monospace\" font-size=\"15\">#{line}</text>"
        dy += 1
    end

    dy += 1
end

base = -840

# Create SVG chat with all messages for debugging purposes
# builder = Nokogiri::XML::Builder.new(encoding: 'UTF-8') do |xml|
#     xml.doc.create_internal_subset('svg', '-//W3C//DTD SVG 1.1//EN', 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd')
#     xml.svg(width: '320', height: dy * 15, version: '1.1', 'xmlns' => 'http://www.w3.org/2000/svg', 'xmlns:xlink' => 'http://www.w3.org/1999/xlink') do
#         xml << text
#     end
# end

# File.open("#{published_files}/chats/chat.svg", 'w') do |file|
#     file.write(builder.to_xml)
# end

chat_intervals.each.with_index do |frame, chat_number|
    interval_start = frame[0]
    interval_end = frame[1]

    base += message_heights[chat_number] * 15

    # Create SVG chat window
    builder = Nokogiri::XML::Builder.new(encoding: 'UTF-8') do |xml|
        xml.doc.create_internal_subset('svg', '-//W3C//DTD SVG 1.1//EN', 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd')
        xml.svg(width: '320', height: '840', viewBox: "0 #{base} 320 840", version: '1.1', 'xmlns' => 'http://www.w3.org/2000/svg', 'xmlns:xlink' => 'http://www.w3.org/1999/xlink') do
            xml << text
        end
    end

    # Saves frame as SVGZ file
    File.open("#{published_files}/chats/chat#{chat_number}.svgz", 'w') do |file|
        svgz = Zlib::GzipWriter.new(file)
        svgz.write(builder.to_xml)
        svgz.close
    end

    # # Saves frame as SVG file (for debugging purposes)
    # File.open("#{published_files}/chats/chat#{chat_number}.svg", 'w') do |file|
    #     file.write(builder.to_xml)
    # end

    File.open("#{published_files}/timestamps/chat_timestamps", 'a') do |file|
        file.puts "file #{published_files}/chats/chat#{chat_number}.svgz"
        file.puts "duration #{(interval_end.to_f - interval_start.to_f).round(1)}"
    end
end

# Benchmark
finish = Time.now
BigBlueButton.logger.info("Finished render_chat.rb for [#{meeting_id}]. Total: #{finish - start}")

exit 0

#!/usr/bin/ruby

# Copyright © 2019 BigBlueButton Inc. and by respective authors.
#
# This file is part of BigBlueButton open source conferencing system.
#
# BigBlueButton is free software: you can redistribute it and/or modify it
# under the terms of the GNU Lesser General Public License as published by the
# Free Software Foundation, either version 3 of the License, or (at your
# option) any later version.
#
# BigBlueButton is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
# details.
#
# You should have received a copy of the GNU Lesser General Public License
# along with BigBlueButton.  If not, see <http://www.gnu.org/licenses/>.

require "rubygems"
require "bundler/setup"

require File.expand_path("../../lib/recordandplayback", __FILE__)

require "journald-logger"
require "locale"
require "rb-inotify"
require "yaml"

# Read configuration and set up logger

props = YAML::load(File.open(File.expand_path("../bigbluebutton.yml", __FILE__)))

log_dir = props["log_dir"]
logger = Journald::Logger.new("bbb-rap-caption-inbox")
BigBlueButton.logger = logger

captions_dir = props["captions_dir"]
unless captions_dir
  logger.error("captions_dir was not defined in bigbluebutton.yml")
  exit(1)
end
captions_inbox_dir = File.join(captions_dir, "inbox")

# Internal error classes

# Base class for internal errors
class CaptionError < StandardError
end

# Indicates that uploaded caption files are invalid (unrecoverable)
class InvalidCaptionError < CaptionError
end

# Implementation

def caption_file_notify(json_filename)
  # There's a possible race condition where we can be notified twice for a new
  # file. That's fine, just do nothing the second time.
  return unless File.exist?(json_filename)

  logger.info("Found new caption index file #{json_filename}")

  # TODO: Rather than do anything directly in this script, it should create a
  # queue job (resque?) that does the actual work.

  new_caption_info = File.open(json_filename) { |file| JSON.parse(file) }
  logger.tag(record_id: new_caption_info["record_id"]) do

    # TODO: This is racy if multiple tools are editing the captions.json file
    captions_info = begin
      File.open(
        File.join(captions_dir, new_caption_info["record_id"], "captions.json")
      ) do |file|
        JSON.parse(file)
      end
    rescue
      # No captions file or cannot be read, assume none present
      []
    end

    langtag = Locale::Tag::Rfc.parse(new_caption_info["lang"])
    raise InvalidCaptionError, "Language tag is not well-formed" unless langtag

    # Remove the info for an existing matching track
    captions_info.delete_if do |caption_info|
      caption_info["lang"] == new_caption_info["lang"] &&
        caption_info["kind"] == new_caption_info["kind"]
    end

    captions_info << {
      "kind"   => new_caption_info["kind"],
      "label"  => new_caption_info["label"],
      "lang"   => langtag.to_s,
      "source" => "upload",
    }

    dest_filename = "#{captions_info["kind"]}_#{captions_info["lang"]}.vtt"

  end
end

logger.info("Setting up inotify watch on #{captions_inbox_dir}")
notifier = INotify::Notifier.new
notifier.watch(captions_inbox_dir, :moved_to, :create) do |event|
  next unless event.name.end_with?("-track.json")

  handle_caption_file(event.absolute_name)
end

logger.info("Checking for missed/skipped caption files")
Dir.glob(File.join(captions_inbox_dir, "*-track.json")).each do |filename|
  caption_file_notify(filename)
end

logger.info("Waiting for new caption files...")
notifier.run

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
require "rb-inotify"
require "yaml"
require "logger"

props = YAML::load(File.open("bigbluebutton.yml"))

log_dir = props["log_dir"]
logger = Logger.new(STDERR)
logger.level = Logger::INFO
# TODO: I need to set the Bigbluebutton logger here if I load the other rap code

def handle_caption_file(filename)
  # There's a possible race condition where we can be notified twice for a new
  # file. That's fine, just do nothing the second time.
  return unless File.exist?(filename)

  logger.info("Found new caption index file #{filename}")
end

captions_dir = props["captions_dir"]
unless captions_dir
  logger.error("captions_dir was not defined in bigbluebutton.yml")
  exit(1)
end
captions_inbox_dir = File.join(captions_dir, "inbox")

logger.info("Setting up inotify watch on #{captions_inbox_dir}")
notifier = INotify::Notifier.new
notifier.watch(captions_inbox_dir, :moved_to, :create) do |event|
  next unless event.name.end_with?("-track.json")

  handle_caption_file(event.absolute_name)
end

logger.info("Checking for missed/skipped caption files")
Dir.glob(File.join(captions_inbox_dir, "*-track.json")).each do |filename|
  handle_caption_file(filename)
end

logger.info("Waiting for new caption files...")
notifier.run

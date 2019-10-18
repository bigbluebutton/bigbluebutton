# frozen_string_literal: true

# BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
#
# Copyright (c) 2019 BigBlueButton Inc. and by respective authors (see below).
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

# For DEVELOPMENT
# Allows us to run the script manually
# require File.expand_path('../../../core/lib/recordandplayback', __dir__)

# For PRODUCTION
require File.expand_path('../../lib/recordandplayback', __dir__)

require 'rubygems'
require 'trollop'
require 'yaml'
require 'json'

opts = Trollop.options do
  opt :meeting_id, 'Meeting id to archive', type: String
end

meeting_id = opts[:meeting_id]

# This script lives in scripts/archive/steps while properties.yaml lives in scripts/
props = YAML.safe_load(File.open('../../core/scripts/bigbluebutton.yml'))

recording_dir = props['recording_dir']
raw_archive_dir = "#{recording_dir}/raw/#{meeting_id}"
target_dir = "#{recording_dir}/process/captions/#{meeting_id}"
captions_dir = "#{props['captions_dir']}/#{meeting_id}"
log_dir = props['log_dir']
logger = BigBlueButton.logger = Logger.new("#{log_dir}/captions.log")

begin
  # Clean up and re-create the work directory
  FileUtils.rm_rf(target_dir)
  FileUtils.mkdir_p(target_dir)
  # And ensure the captions directory exists
  FileUtils.mkdir_p(captions_dir)

  logger.info("Generating closed captions for #{meeting_id}")
  BigBlueButton.exec_ret('utils/gen_webvtt', '-i', raw_archive_dir, '-o', target_dir) \
    || raise('Generating closed caption files failed')

  logger.info('Merging captions with uploaded captions directory')
  # Read the caption index files for any existing uploads and for the newly created captions
  captions = \
    begin
      JSON.parse(IO.read("#{captions_dir}/captions.json"))
    rescue StandardError
      # No existing captions for this recording
      []
    end
  new_captions = JSON.parse(IO.read("#{target_dir}/captions.json"))

  new_captions.each do |new_caption|
    # Don't replace any captions captions with source != live (they might be edited, uploaded, better quality).
    next if captions.any? do |caption|
      caption['kind'] == new_caption['kind'] &&
      caption['lang'] == new_caption['lang'] &&
      caption['source'] != 'live'
    end

    logger.info("Adding #{new_caption['kind']} for #{new_caption['lang']}")

    # Remove any old matching caption from the list
    captions.delete_if { |caption| caption['kind'] == new_caption['kind'] && caption['lang'] == new_caption['locale'] }
    # Add the new caption file
    FileUtils.copy_file("#{target_dir}/#{new_caption['kind']}_#{new_caption['lang']}.vtt", cpations_dir)
    captions << new_caption
  end

  # Write out the new captions index
  IO.write("#{captions_dir}/captions.json", JSON.pretty_generate(captions))

  # Clean up the working directory
  FileUtils.rm_rf(target_dir)
rescue StandardError => e
  BigBlueButton.logger.error(e.message)
  e.backtrace.each do |traceline|
    BigBlueButton.logger.error(traceline)
  end
  exit 1
end

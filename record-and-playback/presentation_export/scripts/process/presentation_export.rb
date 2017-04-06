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

require File.expand_path('../../../lib/recordandplayback', __FILE__)
require 'rubygems'
require 'trollop'
require 'yaml'

opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :default => '58f4a6b3-cd07-444d-8564-59116cb53974', :type => String
end

meeting_id = opts[:meeting_id]

# This script lives in scripts/archive/steps while properties.yaml lives in scripts/
bbb_props = YAML::load(File.open('../../core/scripts/bigbluebutton.yml'))
recording_dir = bbb_props['recording_dir']

props = YAML::load(File.open('presentation_export.yml'))
presentation_published_dir = props['presentation_published_dir']
presentation_unpublished_dir = props['presentation_unpublished_dir']
playback_dir = props['playback_dir']

target_dir = "#{recording_dir}/process/presentation_export/#{meeting_id}"
if not FileTest.directory?(target_dir)
  # this recording has never been processed

  logger = Logger.new("/var/log/bigbluebutton/presentation_export/process-#{meeting_id}.log", 'daily' )
  BigBlueButton.logger = logger

  if not File.exists? "#{recording_dir}/status/published/#{meeting_id}-presentation.done"
    BigBlueButton.logger.info "Presentation not published yet, aborting"
    abort
  end

  FileUtils.mkdir_p "/var/log/bigbluebutton/presentation_export"

  publish_dir = "#{recording_dir}/publish/presentation/#{meeting_id}"
  if FileTest.directory?(publish_dir)
    # this recording has already been published (or publish processed), need to
    # figure out if it's published or unpublished

    meeting_published_dir = "#{presentation_published_dir}/#{meeting_id}"
    if not FileTest.directory?(meeting_published_dir)
      meeting_published_dir = "#{presentation_unpublished_dir}/#{meeting_id}"
      if not FileTest.directory?(meeting_published_dir)
        meeting_published_dir = nil
      end
    end

    if meeting_published_dir
      BigBlueButton.logger.info("Processing script presentation_export.rb")
      FileUtils.mkdir_p target_dir

      resources_dir = "#{target_dir}/resources"
      FileUtils.mkdir_p resources_dir
      FileUtils.cp_r Dir.glob("#{meeting_published_dir}/*"), resources_dir

      player_dir = "#{target_dir}/playback"
      FileUtils.mkdir_p player_dir
      FileUtils.cp_r Dir.glob("#{playback_dir}/*"), player_dir

      process_done = File.new("#{recording_dir}/status/processed/#{meeting_id}-presentation_export.done", "w")
      process_done.write("Processed #{meeting_id}")
      process_done.close
    end
  end
end
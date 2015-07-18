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


require '../../core/lib/recordandplayback'
require 'rubygems'
require 'trollop'
require 'yaml'

opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :default => '58f4a6b3-cd07-444d-8564-59116cb53974', :type => String
end

meeting_id = opts[:meeting_id]

#Mconf process log file
logger = Logger.new("/var/log/bigbluebutton/mconf_encrypted/process-#{meeting_id}.log", 'daily' )
BigBlueButton.logger = logger

# This script lives in scripts/archive/steps while bigbluebutton.yml lives in scripts/
props = YAML::load(File.open('../../core/scripts/bigbluebutton.yml'))

recording_dir = props['recording_dir']
raw_presentation_src = props['raw_presentation_src']

meeting_raw_dir = "#{recording_dir}/raw/#{meeting_id}"
meeting_raw_presentation_dir = "#{raw_presentation_src}/#{meeting_id}"
meeting_process_dir = "#{recording_dir}/process/mconf_encrypted/#{meeting_id}"

if not FileTest.directory?(meeting_process_dir)
  FileUtils.mkdir_p "#{meeting_process_dir}"

  # We used to copy the raw files to the process directory, but it takes extra
  # unnecessary disk space, so we create the process dir but leave it empty. The
  # publish phase will use the data from the raw dir

  process_done = File.new("#{recording_dir}/status/processed/#{meeting_id}-mconf_encrypted.done", "w")
  process_done.write("Processed #{meeting_id}")
  process_done.close
end

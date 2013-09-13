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
require 'fileutils'

Given /^a set of audio recordings in the archive$/ do
  @tmp_archive_dir = "/tmp/archive"
  if FileTest.directory?(@tmp_archive_dir)
    FileUtils.remove_dir @tmp_archive_dir
  end
  FileUtils.mkdir_p @tmp_archive_dir
  
  @meeting_id = "1b199e88-7df7-4842-a5f1-0e84b781c5c8"
  
  @raw_dir = "resources/raw/#{@meeting_id}" 
  FileUtils.cp_r(@raw_dir, @tmp_archive_dir)
end

Given /^the list of events in the recording$/ do  
  Dir.glob("#{@tmp_archive_dir}/#{@meeting_id}/audio/#{@meeting_id}*.wav").empty?.should be_false
end

When /^an audio is processed for playback$/ do
  @processor = BigBlueButton::AudioProcessor.process("#{@tmp_archive_dir}/#{@meeting_id}")
end

Then /^all raw audio files should be combined to create one audio file$/ do
  #pending # express the regexp above with the code you wish you had
end

Then /^converted from wav to ogg$/ do
 # pending # express the regexp above with the code you wish you had
end

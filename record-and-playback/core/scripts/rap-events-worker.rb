#!/usr/bin/ruby
# encoding: UTF-8

# Copyright ⓒ 2017 BigBlueButton Inc. and by respective authors.
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

require '../lib/recordandplayback'
require 'rubygems'
require 'yaml'
require 'fileutils'

def run_post_events_script(meeting_id)
  Dir.glob("post_events/*.rb").sort.each do |post_event_script|
    match = /([^\/]*).rb$/.match(post_event_script)
    post_type = match[1]
    BigBlueButton.logger.info("Running post event script #{post_type}")

    step_start_time = BigBlueButton.monotonic_clock
    ret = BigBlueButton.exec_ret("ruby", post_event_script, "-m", meeting_id)
    step_stop_time = BigBlueButton.monotonic_clock
    step_time = step_stop_time - step_start_time
    step_succeeded = (ret == 0)

    if not step_succeeded
      BigBlueButton.logger.warn("Post event script #{post_event_script} failed")
    end
  end
end

def keep_meeting_events(recording_dir, ended_done_file)
  ended_done_base = File.basename(ended_done_file, '.done')
  meeting_id = nil
  break_timestamp = nil
  
  if match = /^([0-9a-f]+-[0-9]+)$/.match(ended_done_base)
    meeting_id = match[1]
  elsif match = /^([0-9a-f]+-[0-9]+)-([0-9]+)$/.match(ended_done_base)
    meeting_id = match[1]
    break_timestamp = match[2]
  else
    BigBlueButton.logger.warn("Ended done file for #{ended_done_base} has invalid format")
  end

  if meeting_id != nil
    if !break_timestamp.nil?
      ret = BigBlueButton.exec_ret("ruby", "events/events.rb", "-m", meeting_id, '-b', break_timestamp)
    else
      ret = BigBlueButton.exec_ret("ruby", "events/events.rb", "-m", meeting_id)

      # Need to only run post events scripts after meeting ends not during
      # segments. 
      run_post_events_script(meeting_id)
    end
  end
end

begin
  props = YAML::load(File.open('bigbluebutton.yml'))
  redis_host = props['redis_host']
  redis_port = props['redis_port']
  redis_password = props['redis_password']
  BigBlueButton.redis_publisher = BigBlueButton::RedisWrapper.new(redis_host, redis_port, redis_password)

  log_dir = props['log_dir']
  recording_dir = props['recording_dir']
  raw_archive_dir = "#{recording_dir}/raw"
  events_dir = props['events_dir']

  logger = Logger.new("#{log_dir}/bbb-rap-worker.log")
  #logger = Logger.new(STDOUT)
  logger.level = Logger::INFO
  BigBlueButton.logger = logger

  BigBlueButton.logger.info("Running rap-events-worker...")
  ended_done_files = Dir.glob("#{recording_dir}/status/ended/*.done")
  ended_done_files.each do |ended_done|
    ended_done_base = File.basename(ended_done, '.done')
    keep_meeting_events(recording_dir, ended_done)
  end
  BigBlueButton.logger.debug("rap-events-worker done")

rescue Exception => e
  BigBlueButton.logger.error(e.message)
  e.backtrace.each do |traceline|
    BigBlueButton.logger.error(traceline)
  end
end
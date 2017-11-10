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
require 'custom_hash'

def publish_processed_meetings(recording_dir)
  processed_done_files = Dir.glob("#{recording_dir}/status/processed/*.done")

  FileUtils.mkdir_p("#{recording_dir}/status/published")
  # TODO sort by timestamp(s)
  processed_done_files.each do |processed_done|
    done_base = File.basename(processed_done, '.done')
    meeting_id = nil
    break_timestamp = nil
    publish_type = nil

    if match = /^([0-9a-f]+-[0-9]+)-([0-9]+)-(.+)$/.match(done_base)
      meeting_id = match[1]
      break_timestamp = match[2]
      publish_type = match[3]
    elsif match = /^([0-9a-f]+-[0-9]+)-(.+)$/.match(done_base)
      meeting_id = match[1]
      publish_type = match[2]
    else
      BigBlueButton.logger.warn("Processed done file for #{done_base} has invalid format")
      next
    end
    if !break_timestamp.nil?
      done_base = "#{meeting_id}-#{break_timestamp}"
    else
      done_base = meeting_id
    end

    step_succeeded = false

    published_done = "#{recording_dir}/status/published/#{done_base}-#{publish_type}.done"
    next if File.exists?(published_done)

    published_fail = "#{recording_dir}/status/published/#{done_base}-#{publish_type}.fail"
    next if File.exists?(published_fail)

    publish_script = "publish/#{publish_type}.rb"
    if File.exists?(publish_script)
      BigBlueButton.redis_publisher.put_publish_started(publish_type, meeting_id)

      # If the publish directory exists, the script does nothing
      process_dir = "#{recording_dir}/process/#{publish_type}/#{done_base}"
      publish_dir = "#{recording_dir}/publish/#{publish_type}/#{done_base}"
      FileUtils.rm_rf(publish_dir)

      step_start_time = BigBlueButton.monotonic_clock
      # For legacy reasons, the meeting ID passed to the publish script contains
      # the playback format name.
      if !break_timestamp.nil?
        ret = BigBlueButton.exec_ret('ruby', publish_script,
                                     '-m', "#{meeting_id}-#{publish_type}",
                                     '-b', break_timestamp)
      else
        ret = BigBlueButton.exec_ret('ruby', publish_script,
                                     '-m', "#{meeting_id}-#{publish_type}")
      end
      step_stop_time = BigBlueButton.monotonic_clock
      step_time = step_stop_time - step_start_time

      step_succeeded = (ret == 0 and File.exists?(published_done))

      props = YAML::load(File.open('bigbluebutton.yml'))
      published_dir = props['published_dir']

      playback = {}
      metadata = {}
      download = {}
      raw_size = {}
      start_time = {}
      end_time = {}
      metadata_xml_path = "#{published_dir}/#{publish_type}/#{done_base}/metadata.xml"
      if File.exists? metadata_xml_path
        begin
          doc = Hash.from_xml(File.open(metadata_xml_path))
          playback = doc[:recording][:playback] if !doc[:recording][:playback].nil?
          metadata = doc[:recording][:meta] if !doc[:recording][:meta].nil?
          download = doc[:recording][:download] if !doc[:recording][:download].nil?
          raw_size = doc[:recording][:raw_size] if !doc[:recording][:raw_size].nil?
          start_time = doc[:recording][:start_time] if !doc[:recording][:start_time].nil?
          end_time = doc[:recording][:end_time] if !doc[:recording][:end_time].nil?
        rescue Exception => e
          BigBlueButton.logger.warn "An exception occurred while loading the extra information for the publish event"
          BigBlueButton.logger.warn e.message
          e.backtrace.each do |traceline|
            BigBlueButton.logger.warn traceline
          end
        end
      else
        BigBlueButton.logger.warn "Couldn't find the metadata file at #{metadata_xml_path}"
      end

      BigBlueButton.redis_publisher.put_publish_ended(publish_type, meeting_id, {
        "success" => step_succeeded,
        "step_time" => step_time,
        "playback" => playback,
        "metadata" => metadata,
        "download" => download,
        "raw_size" => raw_size,
        "start_time" => start_time,
        "end_time" => end_time
      })
    else
      BigBlueButton.logger.warn("Processed recording found for type #{publish_type}, but no publish script exists")
      step_succeeded = true
    end

    if step_succeeded
      BigBlueButton.logger.info("Publish format #{publish_type} succeeded for #{meeting_id} break #{break_timestamp}")
      FileUtils.rm_f(processed_done)
      FileUtils.rm_rf(process_dir)
      FileUtils.rm_rf(publish_dir)
      
      # Check if this is the last format to be published
      if Dir.glob("#{recording_dir}/status/processed/#{meeting_id}-*.done").length == 0
        post_publish(meeting_id)
      end
    else
      BigBlueButton.logger.info("Publish format #{publish_type} failed for #{meeting_id} break #{break_timestamp}")
      FileUtils.touch(published_fail)
    end

  end
end

def post_publish(meeting_id)
  Dir.glob("post_publish/*.rb").sort.each do |post_publish_script|
    match = /([^\/]*).rb$/.match(post_publish_script)
    post_type = match[1]
    BigBlueButton.logger.info("Running post publish script #{post_type}")

    BigBlueButton.redis_publisher.put_post_publish_started post_type, meeting_id

    step_start_time = BigBlueButton.monotonic_clock
    ret = BigBlueButton.exec_ret("ruby", post_publish_script, "-m", meeting_id)
    step_stop_time = BigBlueButton.monotonic_clock
    step_time = step_stop_time - step_start_time
    step_succeeded = (ret == 0)

    BigBlueButton.redis_publisher.put_post_publish_ended post_type, meeting_id, {
      "success" => step_succeeded,
      "step_time" => step_time
    }

    if not step_succeeded
      BigBlueButton.logger.warn("Post publish script #{post_publish_script} failed")
    end
  end
end

begin
  props = YAML::load(File.open('bigbluebutton.yml'))
  redis_host = props['redis_host']
  redis_port = props['redis_port']
  BigBlueButton.redis_publisher = BigBlueButton::RedisWrapper.new(redis_host, redis_port)

  log_dir = props['log_dir']
  recording_dir = props['recording_dir']

  logger = Logger.new("#{log_dir}/bbb-rap-worker.log")
  logger.level = Logger::INFO
  BigBlueButton.logger = logger

  BigBlueButton.logger.debug("Running rap-publish-worker...")
  
  publish_processed_meetings(recording_dir)

  BigBlueButton.logger.debug("rap-publish-worker done")

rescue Exception => e
  BigBlueButton.logger.error(e.message)
  e.backtrace.each do |traceline|
    BigBlueButton.logger.error(traceline)
  end
end


#!/usr/bin/ruby
# frozen_string_literal: true

# Copyright © 2019 BigBlueButton Inc. and by respective authors.
#
# This file is part of the BigBlueButton open source conferencing system.
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
# along with BigBlueButton.  If not, see <https://www.gnu.org/licenses/>.

require 'rubygems'
require 'bundler/setup'

require File.expand_path('../lib/recordandplayback', __dir__)

require 'journald/logger'
require 'locale'
require 'rb-inotify'
require 'yaml'

# Read configuration and set up logger

props = File.open(File.expand_path('bigbluebutton.yml', __dir__)) do |bbb_yml|
  YAML.safe_load(bbb_yml)
end

logger = Journald::Logger.new('bbb-rap-caption-inbox')
BigBlueButton.logger = logger

captions_dir = props['captions_dir']
unless captions_dir
  logger.error('captions_dir was not defined in bigbluebutton.yml')
  exit(1)
end
captions_inbox_dir = File.join(captions_dir, 'inbox')

# Internal error classes

# Base class for internal errors
class CaptionError < StandardError
end

# Indicates that uploaded caption files are invalid (unrecoverable)
class InvalidCaptionError < CaptionError
end

# Implementation

caption_file_notify = proc do |json_filename|
  # There's a possible race condition where we can be notified twice for a new
  # file. That's fine, just do nothing the second time.
  return unless File.exist?(json_filename)

  logger.info("Found new caption index file #{json_filename}")

  # TODO: Rather than do anything directly in this script, it should create a
  # queue job (resque?) that does the actual work.

  captions_work_base = File.join(props['recording_dir'], 'caption', 'inbox')
  new_caption_info = File.open(json_filename) { |file| JSON.parse(file.read) }
  record_id = new_caption_info['record_id']
  logger.tag(record_id: record_id) do
    begin
      # Read the existing captions index file
      # TODO: This is racy if multiple tools are editing the captions.json file
      index_filename = File.join(captions_dir, record_id, 'captions.json')
      captions_info =
        begin
          File.open(index_filename) { |file| JSON.parse(file.read) }
        rescue StandardError
          # No captions file or cannot be read, assume none present
          []
        end

      temp_filename = new_caption_info['temp_filename']
      raise InvalidCaptionError, 'Temp filename is blank' if temp_filename.nil? || temp_filename.empty?

      src_filename = File.join(captions_inbox_dir, temp_filename)

      langtag = Locale::Tag::Rfc.parse(new_caption_info['lang'])
      raise InvalidCaptionError, 'Language tag is not well-formed' unless langtag

      # Remove the info for an existing matching track, and add the new one
      captions_info.delete_if do |caption_info|
        caption_info['lang'] == new_caption_info['lang'] &&
          caption_info['kind'] == new_caption_info['kind']
      end
      captions_info << {
        'kind'   => new_caption_info['kind'],
        'label'  => new_caption_info['label'],
        'lang'   => langtag.to_s,
        'source' => 'upload',
      }

      captions_work = File.join(captions_work_base, record_id)
      FileUtils.mkdir_p(captions_work)
      dest_filename = "#{new_caption_info['kind']}_#{new_caption_info['lang']}.vtt"
      tmp_dest = File.join(captions_work, dest_filename)
      final_dest_dir = File.join(captions_dir, record_id)
      final_dest = File.join(final_dest_dir, dest_filename)
        
      presentation_dir = props['presentation_dir']
      presentation_dest_dir = "#{presentation_dir}/#{record_id}/caption_en-US.vtt"
      caption_json_file = "#{presentation_dir}/#{record_id}/captions.json"
      
      # en-US need by presentation 
      new_caption_info['lang'] = new_caption_info['lang'].sub('_', '-')
        
      file =  File.open(caption_json_file, 'w')
      file.puts "[{\"localeName\": \"#{new_caption_info['label']}\", \"locale\": \"#{new_caption_info['lang']}\"}]"
      file.close
        
      # resetting en-US to en_US
      new_caption_info['lang'] = new_caption_info['lang'].sub('-', '_')

      
      # Convert the received caption file to WebVTT
      ffmpeg_cmd = [
        'ffmpeg', '-y', '-v', 'warning', '-nostats', '-nostdin',
        '-i', src_filename, '-map', '0:s',
        '-f', 'webvtt', tmp_dest,
      ]
      ret = BigBlueButton.exec_ret(*ffmpeg_cmd)
      raise InvalidCaptionError, 'FFmpeg could not read input' unless ret.zero?

      FileUtils.mkdir_p(final_dest_dir)
      FileUtils.mv(tmp_dest, final_dest)
      FileUtils.cp(final_dest, presentation_dest_dir)

      # Finally, save the updated index file that references the new caption
      File.open(index_filename, 'w') do |file|
        file.write(JSON.pretty_generate(captions_info))
      end

      Dir.glob(File.expand_path('captions/*', __dir__)) do |caption_script|
        next unless File.file?(caption_script) && File.executable?(caption_script)

        logger.info("Running caption integration script #{caption_script}")
        ret = BigBlueButton.exec_ret(caption_script, '--record-id', record_id)
        logger.warn('Caption integration script failed') unless ret.zero?
      end

      logger.info('Removing files from inbox directory')
      FileUtils.rm_f(src_filename) if src_filename
      FileUtils.rm_f(json_filename)
    rescue InvalidCaptionError => e
      logger.exception(e)

      logger.info('Deleting invalid files from inbox directory')
      FileUtils.rm_f(src_filename) if src_filename
      FileUtils.rm_f(json_filename)
    ensure
      FileUtils.rm_rf(File.join(captions_work_base, record_id))
    end
  end
end

logger.info("Setting up inotify watch on #{captions_inbox_dir}")
notifier = INotify::Notifier.new
notifier.watch(captions_inbox_dir, :moved_to, :create) do |event|
  next unless event.name.end_with?('-track.json')

  caption_file_notify.call(event.absolute_name)
end

logger.info('Checking for missed/skipped caption files')
Dir.glob(File.join(captions_inbox_dir, '*-track.json')).each do |filename|
  caption_file_notify.call(filename)
end

logger.info('Waiting for new caption files...')
notifier.run

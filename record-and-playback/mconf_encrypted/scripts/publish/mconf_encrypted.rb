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
require 'yaml'
require 'cgi'
require 'digest/md5'

bbb_props = YAML::load(File.open('../../core/scripts/bigbluebutton.yml'))

recording_dir = bbb_props['recording_dir']
playback_host = bbb_props['playback_host']
published_dir = bbb_props['published_dir']
raw_presentation_src = bbb_props['raw_presentation_src']

done_files = Dir.glob("#{recording_dir}/status/processed/*.done")
done_files.each do |df|
  match = /(.*)-(.*).done/.match df.sub(/.+\//, "")
  meeting_id = match[1]
  if (match[2] == "mconf_encrypted")
    BigBlueButton.logger = Logger.new("/var/log/bigbluebutton/mconf_encrypted/publish-#{meeting_id}.log", 'daily' )

    meeting_process_dir = "#{recording_dir}/process/mconf_encrypted/#{meeting_id}"
    meeting_publish_dir = "#{recording_dir}/publish/mconf_encrypted/#{meeting_id}"
    meeting_published_dir = "#{recording_dir}/published/mconf_encrypted/#{meeting_id}"
    meeting_raw_dir = "#{recording_dir}/raw/#{meeting_id}"
    meeting_raw_presentation_dir = "#{raw_presentation_src}/#{meeting_id}"

    if not FileTest.directory?(meeting_publish_dir)
      FileUtils.mkdir_p meeting_publish_dir

      Dir.chdir(meeting_publish_dir) do
        BigBlueButton::MconfProcessor.zip_directory(meeting_process_dir, "#{meeting_id}.zip")

        metadata = BigBlueButton::Events.get_meeting_metadata("#{meeting_process_dir}/events.xml")

        length = 16
        chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
        password = ''
        length.times { password << chars[rand(chars.size)] }      

        passfile = File.new("#{meeting_id}.txt", "w")
        passfile.write "#{password}"
        passfile.close

        # encrypt files 
        command = "openssl enc -aes-256-cbc -pass file:#{meeting_id}.txt < #{meeting_id}.zip > #{meeting_id}.dat"
        status = BigBlueButton.execute(command)
        if not status.success?
          raise "Couldn't encrypt the recording file using the random key"
        end

        FileUtils.rm_f "#{meeting_id}.zip"

        key_filename = ""
        if metadata.has_key?('mconflb-rec-server-key') and not metadata['mconflb-rec-server-key'].to_s.empty?
          key_filename = "#{meeting_id}.enc"
          # The key is already unescaped in the metadata!!
          #BigBlueButton.logger.info("Unescaping public key")
          #public_key_decoded = CGI::unescape("#{metadata['public-key'].to_s}")
          public_key_decoded = "#{metadata['mconflb-rec-server-key'].to_s}"
          public_key_filename = "public-key.pem"
          public_key = File.new("#{public_key_filename}", "w") 
          public_key.write "#{public_key_decoded}"
          public_key.close

=begin
          # Test: print the public key
          public_key = File.new("#{public_key_filename}", "r")
          counter = 0
          while (line = public_key.gets)
            BigBlueButton.logger.info "#{counter}: #{line}"
            counter = counter + 1
          end
          public_key.close          
=end

          command = "openssl rsautl -encrypt -pubin -inkey #{public_key_filename} < #{meeting_id}.txt > #{meeting_id}.enc"
          status = BigBlueButton.execute(command)
          if not status.success?
            raise "Couldn't encrypt the random key using the server public key passed as metadata"
          end

        # Comment it for testing
          FileUtils.rm_f ["#{meeting_id}.txt", "#{public_key_filename}"]
        else
          key_filename = "#{meeting_id}.txt"
          BigBlueButton.logger.warn "No public key was found in the meeting's metadata"
        end
          
        # generate md5 checksum
        md5sum = Digest::MD5.file("#{meeting_id}.dat")

        BigBlueButton.logger.info("Creating metadata.xml")

        # Create metadata.xml
        b = Builder::XmlMarkup.new(:indent => 2)
        metaxml = b.recording {
          b.id(meeting_id)
          b.state("available")
          b.published(true)
          # Date Format for recordings: Thu Mar 04 14:05:56 UTC 2010
          b.start_time(BigBlueButton::Events.first_event_timestamp("#{meeting_process_dir}/events.xml"))
          b.end_time(BigBlueButton::Events.last_event_timestamp("#{meeting_process_dir}/events.xml"))
          b.download {
            b.format("encrypted")
            b.link("http://#{playback_host}/mconf_encrypted/#{meeting_id}/#{meeting_id}.dat")
            b.md5(md5sum)
            b.key("http://#{playback_host}/mconf_encrypted/#{meeting_id}/#{key_filename}")
          }
          b.meta {
            BigBlueButton::Events.get_meeting_metadata("#{meeting_process_dir}/events.xml").each { |k,v| b.method_missing(k,v) }
          }
        }

        metadata_xml = File.new("metadata.xml","w")
        metadata_xml.write(metaxml)
        metadata_xml.close

        BigBlueButton.logger.info("Publishing mconf_encrypted")

        # Now publish this recording    
        if not FileTest.directory?("#{published_dir}/mconf_encrypted")
          FileUtils.mkdir_p "#{published_dir}/mconf_encrypted"
        end
        BigBlueButton.logger.info("Publishing files")
        FileUtils.cp_r(meeting_publish_dir, "#{published_dir}/mconf_encrypted")

        # it doesn't work since video and deskshare files are owned by red5, 
        # freeswitch files are owned by freeswitch, and this script is ran by
        # tomcat6, so it can just remove files owned by tomcat6
        FileUtils.rm_r [ "/usr/share/red5/webapps/video/streams/#{meeting_id}",
                         "/usr/share/red5/webapps/deskshare/streams/#{meeting_id}",
                         Dir.glob("/var/freeswitch/meetings/#{meeting_id}*.wav") ], :force => true

        # Remove all the recording flags
        FileUtils.rm_f [ "#{recording_dir}/status/sanity/#{meeting_id}.done",
                         "#{recording_dir}/status/recorded/#{meeting_id}.done",
                         "#{recording_dir}/status/archived/#{meeting_id}.done" ]

        # Comment it for testing
        BigBlueButton.logger.info("Removing the recording raw files: #{meeting_raw_dir}")
        FileUtils.rm_r meeting_raw_dir, :force => true
        BigBlueButton.logger.info("Removing the recording presentation: #{meeting_raw_presentation_dir}")
        FileUtils.rm_r meeting_raw_presentation_dir, :force => true

        publish_done = File.new("#{recording_dir}/status/published/#{meeting_id}-mconf_encrypted.done", "w")
        publish_done.write("Published #{meeting_id}")
        publish_done.close
      end
    end
  end
end
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


require 'rubygems'
require 'fileutils'
require 'builder'
require 'mime/types'
require 'digest/md5'
require 'zip'

module BigBlueButton

  class MconfProcessor    
    def self.zip_directory (directory, zipped_file)
      BigBlueButton.logger.info("Task: Zipping directory... #{zipped_file} #{directory}")
      #files = [webcam, deskshare, dublincore, manifest]
      Zip::File.open(zipped_file, Zip::File::CREATE) do |zipfile|
        Dir["#{directory}/**/**"].reject{|f|f==zipped_file}.each do |file|  
          zipfile.add(file.sub(directory+'/', ''), file) 
        end
      end
    end
    
    def self.unzip(unzip_dir, zipfile)
      Zip::File.open(zipfile) do |zip_file|
        zip_file.each do |f|
          f_path=File.join(unzip_dir, f.name)
          FileUtils.mkdir_p(File.dirname(f_path))
          zip_file.extract(f, f_path) unless File.exist?(f_path)
        end
      end
    end

  end
end

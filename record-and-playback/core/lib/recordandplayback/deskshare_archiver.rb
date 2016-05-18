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


require 'fileutils'

module BigBlueButton
  class DeskshareArchiver   		         
    def self.archive(meeting_id, from_dir, to_dir)       
      raise MissingDirectoryException, "Directory not found #{from_dir}" if not BigBlueButton.dir_exists?(from_dir)
      raise MissingDirectoryException, "Directory not found #{to_dir}" if not BigBlueButton.dir_exists?(to_dir)
      raise FileNotFoundException, "No recording for #{meeting_id} in #{from_dir}" if Dir.glob("#{from_dir}").empty?
           
      Dir.glob("#{from_dir}/#{meeting_id}-*.flv").each { |file|
        puts "deskshare #{file} to #{to_dir}"
        FileUtils.cp(file, to_dir)
      }         
    end        
  end
end

# -------------------------------------------------------------
# To run this script we need:
# --------------------------------------------------------------
# - Mediapackage parameters like title, creator and subject
#   to search  workflows in Matterhorn and get their status.
#
# - Matterhorn server url, user and password.
#
# -------------------------------------------------------------
# Script output:
# --------------------------------------------------------------
# STATUS: INSTANTIATED
# STATUS: RUNNING
# STATUS: SUCCEEDED
#

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



require "rubygems"
require "curb"
require "nokogiri"
require "cgi"
require 'trollop'
require 'yaml'

opts = Trollop::options do
  opt :title, :type => String
  opt :creator, :type => String
  opt :subject, :type => String
end

title = opts[:title]
creator = opts[:creator]
subject = opts[:subject]

# This script lives in scripts while matterhorn.yml lives in scripts/
matt_props = YAML::load(File.open('matterhorn.yml'))
rest_server = matt_props['rest_server']

#Zipped file parameters to search a workflow in Matterhorn
title = "Business Ecosystem"
creator = "Richard Alam"
subject = "TTMG 5001"

#Create URI
encoded_params = CGI.escape("sort=DATE_CREATED_DESC&title=#{title}&creator=#{creator}&subject=#{subject}")

#Request Authentication
c = Curl::Easy.new("#{rest_server}/workflow/instances.xml?#{encoded_params}")
c.http_auth_types = :digest
c.username = 'matterhorn_system_account'
c.password = 'CHANGE_ME'
c.headers["X-Requested-Auth"] = "Digest"

#Ask for workflow status to Matterhorn.
#Stops when status is SUCCEEDED.
state = ""
begin  
  sleep 20
  tmp = state
  c.perform
  xml_response = c.body_str
  xml_doc  = Nokogiri::XML(xml_response)
  workflow  = xml_doc.xpath("//workflow")
  state = workflow[-1].attribute('state')
  if !tmp.to_str.eql? state.to_str
    puts "STATUS:  " + state
  end
end while !state.to_str.eql? "SUCCEEDED"

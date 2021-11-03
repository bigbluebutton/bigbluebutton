#!/usr/bin/ruby
# frozen_string_literal: true

# Copyright © 2021 BigBlueButton Inc. and by respective authors.
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

require_relative '../lib/recordandplayback'

require 'recordandplayback/workers'
require 'rubygems'
require 'yaml'
require 'resque'

def meeting_id_valid?(meeting_id)
  /\A[0-9a-f]+-[0-9]+\z/.match?(meeting_id)
end

begin
  if ARGV.length < 2
    warn 'Usage: rap-enqueue.rb STEP[:FORMAT] MEETING_ID [MEETING_ID ...]'
    warn ''
    warn 'Enqueue a recording task for MEETING_ID, starting at step STEP,'
    warn 'optionally with processing format FORMAT (required for the process'
    warn 'and publish steps)'
    exit 1
  end

  props = BigBlueButton.read_props

  redis_host = props['redis_workers_host'] || props['redis_host']
  redis_port = props['redis_workers_port'] || props['redis_port']
  Resque.redis = "#{redis_host}:#{redis_port}"

  common_opts = {
    'single_step': false
  }

  step = ARGV.shift
  step_name, step_format = step.split(':')
  common_opts['format_name'] = step_format unless step_format.nil?

  klass = \
    begin
      Object.const_get("BigBlueButton::Resque::#{step_name.capitalize}Worker")
    rescue NameError
      warn "Worker for step name #{step_name} was not found."
      exit 1
    end

  ARGV.each do |meeting_id|
    unless meeting_id_valid?(meeting_id)
      warn "Meeting ID #{meeting_id} is not correctly formatted"
      next
    end

    opts = common_opts.merge('meeting_id': meeting_id)

    warn "Enqueing #{step_name} worker with #{opts.inspect}"
    ::Resque.enqueue(klass, opts)
  end
end

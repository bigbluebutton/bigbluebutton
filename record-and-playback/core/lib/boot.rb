# frozen_string_literal: true

# Copyright © 2019 BigBlueButton Inc. and by respective authors.
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

# Set up the load path for requiring recordandplayback modules
$LOAD_PATH.unshift(__dir__) unless $LOAD_PATH.include?(__dir__)

require 'date'
require 'yaml'

module BigBlueButton
  # Classes permitted when loading recording configuration files.
  #
  # Psych 4 (Ruby 3.1+) redefined YAML.load as YAML.safe_load with
  # permitted_classes: [Symbol] and aliases disabled. Anchors, merge keys and
  # unquoted dates that Psych 3 accepted now raise there, so the same config
  # can load on one Ubuntu release and fail on the next. Permitting these
  # explicitly keeps loading consistent across both, and keeps the symbol keys
  # screenshare.yml has used since 0.9 working.
  YAML_PERMITTED_CLASSES = [Symbol, Date, Time].freeze

  # Load a recording configuration file.
  #
  # A file with no document -- empty or entirely commented out -- yields
  # +fallback+. Override files may legitimately be empty, so those callers pass
  # fallback: {}; a required config that parses as nil keeps failing loudly
  # rather than silently yielding empty settings.
  def self.load_yaml(path, fallback: nil)
    YAML.safe_load_file(path, permitted_classes: YAML_PERMITTED_CLASSES, aliases: true, fallback: fallback)
  end
end

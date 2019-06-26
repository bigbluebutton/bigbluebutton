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

require File.expand_path('../../edl', __FILE__)

module BigBlueButton

  # Convert a caption file in some format to WebVTT.
  #
  # content_type is optional - if provided it should be the mime type of
  # the caption file format. Automatic probing will be performed if it is
  # null.
  #
  # Returns true on success, and false on failure. If conversion fails, the
  # out_filename file will be deleted.
  def self.convert_caption_webvtt(in_filename, content_type, out_filename)
    ffmpeg_cmd = [*FFMPEG]
    # Input. For now ignore content type and use only automatic probing.
    ffmpeg_cmd += ["-i", in_filename]
    # Select only the first subtitle track. This makes ffmpeg error out if
    # it doesn't find a subtitle track.
    ffmpeg_cmd += ["-map", "0:s"]
    # Output.
    ffmpeg_cmd += ["-f", "webvtt", out_filename]
    Dir.chdir(File.dirname(out_filename)) do
      exitstatus = exec_ret(*ffmpeg_cmd)
      return true if exitstatus == 0
    end

    # FFmpeg creates the output file even if conversion fails. Clean it up.
    FileUtils.rm_f(out_filename)
    return false
  end

end

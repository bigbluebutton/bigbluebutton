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
require 'fileutils'
require 'json'
require 'tempfile'

module BigBlueButton

  # Language tags as they appear in caption file names (caption_<lang>.vtt)
  SAFE_CAPTION_LANG = /\A[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*\z/.freeze

  # The tracks listed in a captions API index (captions/<record_id>/captions.json),
  # [] if there is none or it cannot be read.
  def self.read_caption_index(captions_meeting_dir)
    JSON.parse(File.read(File.join(captions_meeting_dir, 'captions.json')))
  rescue StandardError
    []
  end

  # The caption tracks uploaded for a recording (putRecordingTextTrack) that the
  # presentation playback can show: kind "captions", with their file present.
  def self.uploaded_caption_tracks(captions_meeting_dir)
    read_caption_index(captions_meeting_dir).select do |track|
      track['source'] == 'upload' && track['kind'] == 'captions' &&
        SAFE_CAPTION_LANG.match?(track['lang'].to_s) &&
        File.exist?(File.join(captions_meeting_dir, "captions_#{track['lang']}.vtt"))
    end
  end

  # Updates the captions API index of a recording (captions/<record_id>/captions.json)
  # and its files with the live tracks generate_webvtt wrote to live_dir. The API
  # names the files <kind>_<lang>.vtt, like uploaded tracks; an uploaded track is
  # kept, even where a live track of the same kind and language exists, and so is
  # its entry in the index.
  def self.update_api_captions(captions_meeting_dir, live_dir)
    logger.info('Generating closed captions for API')

    previous = read_caption_index(captions_meeting_dir)
    uploads = previous.reject { |track| track['source'] == 'live' }
    uploaded = lambda do |lang|
      uploads.any? { |track| track['kind'] == 'captions' && track['lang'] == lang }
    end

    # Live tracks of the previous processing (caption_<lang>.vtt before the files
    # were named like uploads); the new ones are added below
    previous.select { |track| track['source'] == 'live' }.each do |track|
      next if uploaded.call(track['lang']) || !SAFE_CAPTION_LANG.match?(track['lang'].to_s)

      FileUtils.rm_f(File.join(captions_meeting_dir, "captions_#{track['lang']}.vtt"))
      FileUtils.rm_f(File.join(captions_meeting_dir, "caption_#{track['lang']}.vtt"))
    end

    live = []
    JSON.parse(File.read(File.join(live_dir, 'captions.json'))).each do |track|
      lang = track['locale']
      if uploaded.call(lang)
        logger.info("Keeping the uploaded captions track for #{lang}")
        next
      end
      FileUtils.mv(File.join(live_dir, "caption_#{lang}.vtt"), File.join(captions_meeting_dir, "captions_#{lang}.vtt"))
      live << { 'kind' => 'captions', 'label' => track['localeName'], 'lang' => lang, 'source' => 'live' }
    end

    File.write(File.join(captions_meeting_dir, 'captions.json'), (live + uploads).to_json)
  end

  # Adds the uploaded caption tracks of a recording to playback caption files
  # written by generate_webvtt in out_dir (caption_<lang>.vtt and captions.json).
  # An upload replaces the live track of its language, as it does when it is
  # uploaded after the recording was published; so a rebuild keeps uploads.
  def self.add_uploaded_captions(captions_meeting_dir, out_dir)
    uploads = uploaded_caption_tracks(captions_meeting_dir)
    return if uploads.empty?

    playback_index = File.join(out_dir, 'captions.json')
    playback = JSON.parse(File.read(playback_index))
    uploads.each do |track|
      lang = track['lang']
      FileUtils.cp(File.join(captions_meeting_dir, "captions_#{lang}.vtt"), File.join(out_dir, "caption_#{lang}.vtt"))
      playback.reject! { |caption| caption['locale'] == lang }
      playback << { 'kind' => 'captions', 'locale' => lang, 'localeName' => track['label'] }
    end
    File.write(playback_index, JSON.generate(playback))
  end

  # Runs utils/gen_webvtt on a raw recording: writes caption_<locale>.vtt and
  # captions.json to out_dir. The speaker labels of the cues are the participant
  # names, anonymized like the chat (see BigBlueButton::Events.anonymize_settings).
  #
  # events is the parsed events.xml, bbb_props the bigbluebutton.yml settings.
  # Returns the exit status of gen_webvtt.
  def self.generate_webvtt(raw_archive_dir, out_dir, events, bbb_props)
    speaker_names = Tempfile.new(['caption_speakers', '.json'])
    begin
      speaker_names.write(BigBlueButton::Events.participant_name_map(events, bbb_props).to_json)
      speaker_names.close
      exec_ret('utils/gen_webvtt', '-i', raw_archive_dir, '-o', out_dir, '--speaker-names', speaker_names.path)
    ensure
      speaker_names.close!
    end
  end

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

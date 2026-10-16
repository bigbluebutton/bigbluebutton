# frozen_string_literal: true

require 'minitest/autorun'
require 'fileutils'
require 'json'
require 'open3'
require 'rbconfig'
require 'tmpdir'
require 'yaml'

require 'recordandplayback'

# The caption tracks of a recording outside of the meeting: the API index and files the
# captions step keeps in captions/<record_id>/ (getRecordingTextTracks, putRecordingTextTrack),
# and what the presentation playback gets from them. The scripts run as on a server, from a
# temporary tree laid out like /usr/local/bigbluebutton/core.
class TestCaptions < Minitest::Test
  CORE = File.expand_path('../../..', __dir__)
  RAP_ROOT = File.expand_path('..', CORE)
  RECORD_ID = 'fixture-1790000000000'
  EVENTS = File.join(CORE, 'test', 'gen_webvtt', 'fixtures', 'legacy-single-speaker', 'events.xml')
  LIVE_TEXT = 'the birch canoe slid on the smooth planks'

  def setup
    @dir = Dir.mktmpdir('rap')
    @core = File.join(@dir, 'core')
    scripts = File.join(@core, 'scripts')
    FileUtils.mkdir_p([File.join(scripts, 'utils'), File.join(scripts, 'caption')])
    File.symlink(File.join(CORE, 'lib'), File.join(@core, 'lib'))
    FileUtils.cp(File.join(CORE, 'scripts', 'utils', 'captions.rb'), File.join(scripts, 'utils'))
    FileUtils.cp(File.join(CORE, 'scripts', 'utils', 'gen_webvtt'), File.join(scripts, 'utils'))
    FileUtils.cp(File.join(RAP_ROOT, 'presentation', 'scripts', 'caption', 'presentation'), File.join(scripts, 'caption'))

    @recording_dir = File.join(@dir, 'recording')
    @captions_dir = File.join(@dir, 'captions', RECORD_ID)
    @published_dir = File.join(@dir, 'published', RECORD_ID)
    FileUtils.mkdir_p([File.join(@recording_dir, 'raw', RECORD_ID), @captions_dir, File.join(@dir, 'log')])
    FileUtils.cp(EVENTS, File.join(@recording_dir, 'raw', RECORD_ID, 'events.xml'))
    File.write(File.join(scripts, 'bigbluebutton.yml'), {
      'recording_dir' => @recording_dir,
      'captions_dir' => File.join(@dir, 'captions'),
      'log_dir' => File.join(@dir, 'log'),
    }.to_yaml)
    File.write(File.join(scripts, 'presentation.yml'), { 'publish_dir' => File.join(@dir, 'published') }.to_yaml)
  end

  def teardown
    FileUtils.rm_rf(@dir)
  end

  def run_script(*command)
    output, status = Open3.capture2e(RbConfig.ruby, *command, chdir: File.join(@core, 'scripts'))
    assert(status.success?, "#{command.join(' ')} failed:\n#{output}")
    output
  end

  # The captions step, first processing or rebuild: publishing removed the processed
  # directory, and bbb-record --rebuild runs the step again
  def run_captions_step
    FileUtils.rm_rf(File.join(@recording_dir, 'process', 'presentation', RECORD_ID))
    run_script('utils/captions.rb', '-m', RECORD_ID)
  end

  def vtt(text)
    "WEBVTT\n\n00:00:01.000 --> 00:00:03.000\n#{text}\n"
  end

  # The cue text of a WebVTT file as one line
  def cue_text(path)
    File.readlines(path, chomp: true)
        .reject { |line| line.empty? || line == 'WEBVTT' || line.include?(' --> ') }
        .join(' ')
  end

  def index(dir = @captions_dir)
    path = File.join(dir, 'captions.json')
    File.exist?(path) ? JSON.parse(File.read(path)) : []
  end

  # What rap-caption-inbox does with an upload: the file, and its entry in place of any
  # track of the same kind and language
  def upload(lang, label, text)
    File.write(File.join(@captions_dir, "captions_#{lang}.vtt"), vtt(text))
    tracks = index.reject { |track| track['kind'] == 'captions' && track['lang'] == lang }
    tracks << { 'kind' => 'captions', 'label' => label, 'lang' => lang, 'source' => 'upload' }
    File.write(File.join(@captions_dir, 'captions.json'), tracks.to_json)
  end

  def test_live_tracks_are_named_like_the_api_links
    run_captions_step
    assert_equal(['captions.json', 'captions_en-US.vtt'], Dir.children(@captions_dir).sort)
    assert_equal([{ 'kind' => 'captions', 'label' => 'English (United States)', 'lang' => 'en-US', 'source' => 'live' }], index)
    assert_includes(cue_text(File.join(@captions_dir, 'captions_en-US.vtt')), LIVE_TEXT)
  end

  def test_rebuild_keeps_an_uploaded_track_of_the_same_language
    run_captions_step
    upload('en-US', 'English (uploaded)', 'uploaded by the user')
    run_captions_step
    assert_equal(vtt('uploaded by the user'), File.read(File.join(@captions_dir, 'captions_en-US.vtt')))
    assert_equal([{ 'kind' => 'captions', 'label' => 'English (uploaded)', 'lang' => 'en-US', 'source' => 'upload' }], index)
  end

  def test_rebuild_keeps_an_uploaded_track_of_another_language
    run_captions_step
    upload('de-DE', 'Deutsch', 'hochgeladen')
    run_captions_step
    assert_equal(%w[de-DE/upload en-US/live], index.map { |track| "#{track['lang']}/#{track['source']}" }.sort)
    assert_equal(vtt('hochgeladen'), File.read(File.join(@captions_dir, 'captions_de-DE.vtt')))
    assert_includes(cue_text(File.join(@captions_dir, 'captions_en-US.vtt')), LIVE_TEXT)
  end

  def test_rebuild_of_a_recording_processed_before_uses_the_api_names
    # live tracks used to be stored as caption_<lang>.vtt
    File.write(File.join(@captions_dir, 'caption_en-US.vtt'), vtt('old live track'))
    File.write(File.join(@captions_dir, 'captions.json'),
               [{ 'kind' => 'captions', 'label' => 'English (United States)', 'lang' => 'en-US', 'source' => 'live' }].to_json)
    run_captions_step
    assert_equal(['captions.json', 'captions_en-US.vtt'], Dir.children(@captions_dir).sort)
    assert_includes(cue_text(File.join(@captions_dir, 'captions_en-US.vtt')), LIVE_TEXT)
  end

  def test_uploaded_tracks_are_added_to_the_playback
    playback = File.join(@dir, 'process')
    FileUtils.mkdir_p(playback)
    File.write(File.join(playback, 'caption_en-US.vtt'), vtt('live track'))
    File.write(File.join(playback, 'captions.json'), [{ 'locale' => 'en-US', 'localeName' => 'English' }].to_json)
    File.write(File.join(@captions_dir, 'captions_en-US.vtt'), vtt('uploaded english'))
    File.write(File.join(@captions_dir, 'captions_de-DE.vtt'), vtt('deutsch'))
    File.write(File.join(@captions_dir, 'subtitles_fr-FR.vtt'), vtt('francais'))
    File.write(File.join(@captions_dir, 'captions.json'), [
      { 'kind' => 'captions', 'label' => 'English (uploaded)', 'lang' => 'en-US', 'source' => 'upload' },
      { 'kind' => 'captions', 'label' => 'Deutsch', 'lang' => 'de-DE', 'source' => 'upload' },
      { 'kind' => 'subtitles', 'label' => 'Francais', 'lang' => 'fr-FR', 'source' => 'upload' },
      { 'kind' => 'captions', 'label' => 'Not a language', 'lang' => '../../x', 'source' => 'upload' },
    ].to_json)

    BigBlueButton.add_uploaded_captions(@captions_dir, playback)

    assert_equal(%w[caption_de-DE.vtt caption_en-US.vtt captions.json], Dir.children(playback).sort)
    assert_equal(vtt('uploaded english'), File.read(File.join(playback, 'caption_en-US.vtt')))
    assert_equal(
      [
        { 'kind' => 'captions', 'locale' => 'en-US', 'localeName' => 'English (uploaded)' },
        { 'kind' => 'captions', 'locale' => 'de-DE', 'localeName' => 'Deutsch' },
      ],
      index(playback),
    )
  end

  def test_playback_without_uploads_is_left_as_it_is
    playback = File.join(@dir, 'process')
    FileUtils.mkdir_p(playback)
    File.write(File.join(playback, 'captions.json'), [{ 'locale' => 'en-US', 'localeName' => 'English' }].to_json)
    run_captions_step
    BigBlueButton.add_uploaded_captions(@captions_dir, playback)
    assert_equal([{ 'locale' => 'en-US', 'localeName' => 'English' }], index(playback))
  end

  def test_upload_is_published_next_to_the_live_track
    run_captions_step
    FileUtils.mkdir_p(@published_dir)
    File.write(File.join(@published_dir, 'caption_en-US.vtt'), vtt('published live track'))
    File.write(File.join(@published_dir, 'captions.json'), [{ 'locale' => 'en-US', 'localeName' => 'English (United States)' }].to_json)
    upload('de-DE', 'Deutsch', 'hochgeladen')

    run_script('caption/presentation', "--record-id=#{RECORD_ID}")

    assert_equal(%w[de-DE en-US], index(@published_dir).map { |caption| caption['locale'] }.sort)
    assert_equal(vtt('hochgeladen'), File.read(File.join(@published_dir, 'caption_de-DE.vtt')))
  end

  def test_upload_for_an_old_playback_without_captions_json
    # very old playback formats have no captions.json: nothing to update, a rebuild
    # brings the captions in
    FileUtils.mkdir_p(@published_dir)
    upload('de-DE', 'Deutsch', 'hochgeladen')

    output = run_script('caption/presentation', "--record-id=#{RECORD_ID}")

    refute_includes(output, 'Errno::ENOENT')
    assert_empty(Dir.children(@published_dir))
  end
end

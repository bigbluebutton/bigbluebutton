# frozen_string_literal: true

require 'minitest/autorun'
require 'tmpdir'

require 'boot'

# Guards the YAML dialect that recording configuration files are allowed to use.
#
# These files are loaded by every format's process/publish script, and admins
# override some of them under /etc/bigbluebutton/recording/. The dialect has to
# stay stable across the Psych 3 / Psych 4+ split, where plain YAML.load and
# bare YAML.safe_load each accept a different subset.
class TestConfigYaml < Minitest::Test
  RAP_ROOT = File.expand_path('../../..', __dir__)

  SHIPPED_CONFIGS = %w[
    core/scripts/bigbluebutton.yml
    notes/scripts/notes.yml
    podcast/scripts/podcast.yml
    presentation/scripts/presentation.yml
    screenshare/scripts/screenshare.yml
    video/scripts/video.yml
  ].freeze

  def config_path(relative)
    File.join(RAP_ROOT, relative)
  end

  def with_yaml(content)
    Dir.mktmpdir do |dir|
      path = File.join(dir, 'test.yml')
      File.write(path, content)
      yield path
    end
  end

  # Every file we ship must load. Bare YAML.safe_load fails this on
  # screenshare.yml, on both Psych 3 and Psych 4+.
  def test_every_shipped_config_loads
    SHIPPED_CONFIGS.each do |relative|
      path = config_path(relative)
      assert(File.exist?(path), "missing shipped config #{relative}")

      props = BigBlueButton.load_yaml(path)

      assert_kind_of(Hash, props, "#{relative} did not load as a Hash")
      refute_empty(props, "#{relative} loaded empty")
    end
  end

  # screenshare.yml has used symbol keys since 0.9, and EDL.encode indexes them
  # with symbols. They must survive loading as symbols.
  def test_screenshare_format_keys_stay_symbols
    props = BigBlueButton.load_yaml(config_path('screenshare/scripts/screenshare.yml'))
    format = props['formats'].first

    assert_equal('webm', format[:extension])
    refute_nil(format[:mimetype])
    assert_nil(format['extension'], 'format keys must be symbols, not strings')
  end

  # EDL::Video.render requires symbol keys on the layout and area hashes, and
  # raises if they are missing.
  def test_screenshare_layout_keys_stay_symbols
    layout = BigBlueButton.load_yaml(config_path('screenshare/scripts/screenshare.yml'))['layout']

    assert(%i[width height framerate areas].all? { |prop| layout.include?(prop) })
    assert_kind_of(Integer, layout[:width])
    assert_kind_of(Integer, layout[:height])
  end

  # Anchors and merge keys are core YAML and worked under Psych 3. Psych 4+
  # disables aliases by default, so they need to be re-enabled explicitly.
  def test_anchors_and_merge_keys_resolve
    with_yaml("base: &base\n  width: 1280\nderived:\n  <<: *base\n  height: 720\n") do |path|
      props = BigBlueButton.load_yaml(path)

      assert_equal(1280, props['derived']['width'])
      assert_equal(720, props['derived']['height'])
    end
  end

  # Unquoted dates and timestamps are rejected by Psych 4+ YAML.load and by
  # bare safe_load. Date and Time are separate permitted classes.
  def test_unquoted_dates_and_times_load
    with_yaml("released: 2026-05-21\n") do |path|
      assert_equal(Date.new(2026, 5, 21), BigBlueButton.load_yaml(path)['released'])
    end

    with_yaml("at: 2026-05-21 10:00:00\n") do |path|
      assert_kind_of(Time, BigBlueButton.load_yaml(path)['at'])
    end
  end

  # Arbitrary ruby object instantiation stays blocked -- that is the part of
  # the old YAML.load we do not want back.
  def test_ruby_object_tags_are_rejected
    with_yaml("evil: !ruby/object:Gem::Version {}\n") do |path|
      assert_raises(Psych::DisallowedClass) { BigBlueButton.load_yaml(path) }
    end
  end

  # An override file that is empty or entirely commented out parses as nil.
  # Those callers ask for {} so the merge that follows still works.
  def test_empty_override_returns_requested_fallback
    with_yaml("# nothing enabled here\n") do |path|
      assert_equal({}, BigBlueButton.load_yaml(path, fallback: {}))
    end

    with_yaml('') do |path|
      assert_equal({}, BigBlueButton.load_yaml(path, fallback: {}))
    end
  end

  # A required config that parses as nil must not be silently treated as empty:
  # that would turn a broken install into wrong paths instead of a crash.
  def test_empty_required_config_is_not_masked
    with_yaml("# nothing enabled here\n") do |path|
      assert_nil(BigBlueButton.load_yaml(path))
    end
  end

  # The fallback applies only when there is no document. A file that parses to
  # an explicit false is a value, not an absence, and must survive.
  def test_explicit_false_document_is_not_replaced
    with_yaml("false\n") do |path|
      assert_equal(false, BigBlueButton.load_yaml(path, fallback: {}))
    end
  end

  # load_yaml must not leave the file descriptor open -- recording cleanup
  # deletes these directories, and a leaked handle breaks rmdir on NFS.
  def test_load_yaml_does_not_leak_a_file_descriptor
    skip('needs /proc') unless File.directory?('/proc/self/fd')

    path = config_path('core/scripts/bigbluebutton.yml')
    before = Dir.children('/proc/self/fd').size

    10.times { BigBlueButton.load_yaml(path) }

    assert_equal(before, Dir.children('/proc/self/fd').size, 'load_yaml leaked a file descriptor')
  end
end

# frozen_string_literal: true

require 'minitest/autorun'
require 'tmpdir'

require 'recordandplayback'

# The status messages published to Redis follow the recording configuration,
# including what the admin set in the recording.yml override.
class TestEventsArchiver < Minitest::Test
  class FakeRedis
    attr_reader :published, :pushed

    def initialize
      @published = []
      @pushed = []
    end

    def publish(*args)
      @published << args
    end

    def lpush(*args)
      @pushed << args
    end
  end

  def setup
    @saved_props = BigBlueButton.instance_variable_get(:@props)
    @redis = FakeRedis.new
    @wrapper = BigBlueButton::RedisWrapper.allocate
    @wrapper.instance_variable_set(:@redis, @redis)
  end

  def teardown
    BigBlueButton.instance_variable_set(:@props, @saved_props)
  end

  def with_props(props)
    BigBlueButton.instance_variable_set(:@props, props)
    yield
  end

  def test_status_is_stored_when_the_configuration_enables_it
    Dir.mktmpdir do |dir|
      with_props('recording_dir' => dir, 'store_recording_status' => true) do
        @wrapper.put_message('archive_started', 'meeting-1')
      end
    end

    assert_equal(1, @redis.published.size)
    assert_equal(1, @redis.pushed.size)
    assert_equal(BigBlueButton::RedisWrapper::RAP_STATUS_LIST, @redis.pushed.first.first)
  end

  def test_status_is_not_stored_when_the_configuration_disables_it
    Dir.mktmpdir do |dir|
      with_props('recording_dir' => dir, 'store_recording_status' => false) do
        @wrapper.put_message('archive_started', 'meeting-1')
      end
    end

    assert_equal(1, @redis.published.size)
    assert_empty(@redis.pushed)
  end

  def test_external_meeting_id_comes_from_the_configured_raw_dir
    Dir.mktmpdir do |dir|
      FileUtils.mkdir_p(File.join(dir, 'raw', 'meeting-1'))
      File.write(File.join(dir, 'raw', 'meeting-1', 'events.xml'),
                 '<recording><metadata meetingId="ext-1"/></recording>')
      with_props('recording_dir' => dir, 'store_recording_status' => false) do
        @wrapper.put_message('archive_started', 'meeting-1')
      end
    end

    assert_equal('ext-1', JSON.parse(@redis.published.first.last)['payload']['external_meeting_id'])
  end
end

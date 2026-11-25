# frozen_string_literal: true

require 'minitest/autorun'
require 'minitest/mock'
require 'logger'
require 'stringio'
require 'tmpdir'

require 'recordandplayback'
require 'redis'

# Precedence of the recording configuration: environment variables over the
# recording.yml override over the packaged bigbluebutton.yml, and the shared
# secret from SHARED_SECRET over bbb-web's properties.
class TestEnvProps < Minitest::Test
  OVERRIDE = '/etc/bigbluebutton/recording/recording.yml'
  VARIABLES = %w[REDIS_HOST REDIS_PORT REDIS_PASSWORD PLAYBACK_HOST BN_NOTES_ENDPOINT SHARED_SECRET].freeze
  DEFAULTS = {
    'redis_host' => '127.0.0.1',
    'redis_port' => 6379,
    'playback_host' => 'default.example',
    'bn_notes_endpoint' => 'http://127.0.0.1:8787/notes',
  }.freeze

  def setup
    @saved_props = BigBlueButton.instance_variable_get(:@props)
    @saved_logger = BigBlueButton.instance_variable_get(:@logger)
    @saved_env = VARIABLES.to_h { |name| [name, ENV.fetch(name, nil)] }
    VARIABLES.each { |name| ENV.delete(name) }
    BigBlueButton.instance_variable_set(:@props, nil)
    @log = StringIO.new
    BigBlueButton.logger = Logger.new(@log)
  end

  def teardown
    BigBlueButton.instance_variable_set(:@props, @saved_props)
    BigBlueButton.instance_variable_set(:@logger, @saved_logger)
    @saved_env.each { |name, value| value.nil? ? ENV.delete(name) : ENV[name] = value }
  end

  # read_props with the packaged file and, when given, the override, without touching /etc.
  def props(override: nil, env: {})
    env.each { |name, value| ENV[name] = value }
    file_file = ->(path) { path == OVERRIDE ? !override.nil? : File.exist?(path) }
    load_yaml = ->(path, fallback: nil) { path == OVERRIDE ? override : DEFAULTS.dup }
    File.stub(:file?, file_file) do
      BigBlueButton.stub(:load_yaml, load_yaml) do
        BigBlueButton.instance_variable_set(:@props, nil)
        BigBlueButton.read_props
      end
    end
  end

  def test_default
    assert_equal DEFAULTS, props
  end

  def test_override_wins_over_default
    assert_equal '10.0.0.1', props(override: { 'redis_host' => '10.0.0.1' })['redis_host']
  end

  def test_environment_wins_over_override
    p = props(override: { 'redis_host' => '10.0.0.1', 'playback_host' => 'file.example',
                          'bn_notes_endpoint' => 'http://file/notes' },
              env: { 'REDIS_HOST' => '10.0.0.2', 'PLAYBACK_HOST' => 'env.example',
                     'BN_NOTES_ENDPOINT' => 'http://env/notes' })
    assert_equal '10.0.0.2', p['redis_host']
    assert_equal 'env.example', p['playback_host']
    assert_equal 'http://env/notes', p['bn_notes_endpoint']
  end

  def test_empty_variable_is_ignored
    p = props(override: { 'redis_host' => '10.0.0.1' }, env: { 'REDIS_HOST' => '', 'REDIS_PORT' => '' })
    assert_equal '10.0.0.1', p['redis_host']
    assert_equal 6379, p['redis_port']
  end

  def test_redis_port_becomes_an_integer
    assert_equal 6380, props(env: { 'REDIS_PORT' => '6380' })['redis_port']
  end

  # Kubernetes injects REDIS_PORT=tcp://<ip>:6379 for a Service named redis.
  def test_redis_port_that_is_not_a_number_keeps_the_file_value
    p = props(override: { 'redis_port' => 6390 }, env: { 'REDIS_PORT' => 'tcp://10.0.0.1:6379' })
    assert_equal 6390, p['redis_port']
    assert_match(/REDIS_PORT/, @log.string)
  end

  def test_redis_password_from_the_environment
    assert_equal 'env-secret', props(override: { 'redis_password' => 'file-secret' },
                                     env: { 'REDIS_PASSWORD' => 'env-secret' })['redis_password']
  end

  # The resque workers prefer redis_workers_* from the files (Rakefile), whatever REDIS_HOST says.
  def test_redis_workers_host_is_kept
    p = props(override: { 'redis_workers_host' => '10.0.0.9', 'redis_workers_port' => 6391 },
              env: { 'REDIS_HOST' => '10.0.0.2' })
    assert_equal '10.0.0.9', p['redis_workers_host']
    assert_equal 6391, p['redis_workers_port']
  end

  def test_resque_uses_the_workers_settings_then_the_redis_ones
    redis = Struct.new(:options)
    props = { 'redis_host' => 'h', 'redis_port' => 1, 'redis_password' => 'p',
              'redis_workers_host' => 'wh', 'redis_workers_port' => 2 }
    Redis.stub(:new, ->(**o) { redis.new(o) }) do
      # a queue on another host does not get the main Redis' password
      assert_equal({ host: 'wh', port: 2, password: nil }, BigBlueButton.resque_redis(props).options)
      assert_equal({ host: 'wh', port: 2, password: 'wp' },
                   BigBlueButton.resque_redis(props.merge('redis_workers_password' => 'wp')).options)
      assert_equal({ host: 'h', port: 1, password: 'p' },
                   BigBlueButton.resque_redis(props.except('redis_workers_host', 'redis_workers_port')).options)
      # only the port changed: the same host, so the main password
      assert_equal({ host: 'h', port: 2, password: 'p' },
                   BigBlueButton.resque_redis(props.except('redis_workers_host')).options)
      # the same host on another port with a password of its own
      assert_equal({ host: 'h', port: 2, password: 'wp' },
                   BigBlueButton.resque_redis(props.except('redis_workers_host').merge('redis_workers_password' => 'wp')).options)
    end
  end

  def test_shared_secret_from_the_environment
    ENV['SHARED_SECRET'] = 'env-secret'
    assert_equal 'env-secret', BigBlueButton.shared_secret
  end

  def test_empty_shared_secret_falls_back_to_the_properties
    ENV['SHARED_SECRET'] = ''
    BigBlueButton.stub(:read_bbb_web_props, { securitySalt: 'props-secret' }) do
      assert_equal 'props-secret', BigBlueButton.shared_secret
    end
  end

  def test_read_bbb_web_props_override_wins
    Dir.mktmpdir do |dir|
      defaults = File.join(dir, 'bigbluebutton.properties')
      override = File.join(dir, 'bbb-web.properties')
      File.write(defaults, "securitySalt=packaged\nbigbluebutton.web.serverURL=http://a\n")
      File.write(override, "securitySalt=admin\n")
      props = BigBlueButton.read_bbb_web_props([defaults, override])
      assert_equal 'admin', props[:securitySalt]
      assert_equal 'http://a', props[:'bigbluebutton.web.serverURL']
      assert_equal 'packaged', BigBlueButton.read_bbb_web_props([defaults, File.join(dir, 'missing')])[:securitySalt]
    end
  end

  def test_no_secret_anywhere_is_nil
    File.stub(:file?, false) { assert_nil BigBlueButton.shared_secret }
  end
end

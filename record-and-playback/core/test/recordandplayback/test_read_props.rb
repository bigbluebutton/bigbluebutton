# frozen_string_literal: true

require 'minitest/autorun'
require 'recordandplayback'

class TestReadProps < Minitest::Test
  DEFAULT_PROPS_PATH = File.join('/tmp', 'rap', 'scripts', 'bigbluebutton.yml')
  OVERRIDE_PROPS_PATH = '/etc/bigbluebutton/recording/recording.yml'

  def test_read_props_reloads_recording_override_on_each_call
    BigBlueButton.instance_variable_set(:@props, nil)

    BigBlueButton.stub(:rap_scripts_path, '/tmp/rap/scripts') do
      File.stub(:file?, ->(path) { path == OVERRIDE_PROPS_PATH }) do
        override_hosts = ['first.example.com', 'second.example.com']
        override_read_count = 0
        File.stub(:read, lambda { |path|
          case path
          when DEFAULT_PROPS_PATH
            "playback_protocol: http\nplayback_host: default.example.com\n"
          when OVERRIDE_PROPS_PATH
            host = override_hosts.fetch(override_read_count, override_hosts.last)
            override_read_count += 1
            "playback_protocol: https\nplayback_host: #{host}\n"
          else
            raise "Unexpected path: #{path}"
          end
        }) do
          first_read = BigBlueButton.read_props
          second_read = BigBlueButton.read_props

          assert_equal('https', first_read['playback_protocol'])
          assert_equal('first.example.com', first_read['playback_host'])
          assert_equal('https', second_read['playback_protocol'])
          assert_equal('second.example.com', second_read['playback_host'])
        end
      end
    end
  ensure
    BigBlueButton.instance_variable_set(:@props, nil)
  end
end

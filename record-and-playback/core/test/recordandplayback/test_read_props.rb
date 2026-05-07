# frozen_string_literal: true

require 'minitest/autorun'
require 'recordandplayback'

class TestReadProps < Minitest::Test
  def test_read_props_reloads_recording_override_on_each_call
    default_props_path = '/tmp/rap/scripts/bigbluebutton.yml'
    override_props_path = '/etc/bigbluebutton/recording/recording.yml'
    BigBlueButton.instance_variable_set(:@props, nil)

    BigBlueButton.stub(:rap_scripts_path, '/tmp/rap/scripts') do
      File.stub(:file?, ->(path) { path == override_props_path }) do
        override_hosts = ['first.example.com', 'second.example.com']
        File.stub(:read, lambda { |path|
          case path
          when default_props_path
            "playback_protocol: http\nplayback_host: default.example.com\n"
          when override_props_path
            "playback_protocol: https\nplayback_host: #{override_hosts.shift}\n"
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

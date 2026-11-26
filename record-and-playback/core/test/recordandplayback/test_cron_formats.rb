# frozen_string_literal: true

require 'minitest/autorun'
require 'open3'

# The formats cron.daily waits for before it removes a raw recording directory
class TestCronFormats < Minitest::Test
  CRON = File.expand_path('../../../../bigbluebutton-config/cron.daily/bigbluebutton', __dir__)
  SCRIPTS = File.expand_path('../../scripts', __dir__)

  def formats(env = {})
    function = File.read(CRON)[/^formats_in_steps\(\)\{\n.*?^\}\n/m]
    refute_nil function, 'formats_in_steps is not in cron.daily/bigbluebutton'
    env = { 'RAP_SCRIPTS_DIR' => SCRIPTS, 'JOURNAL_STREAM' => nil }.merge(env)
    out, status = Open3.capture2(env, 'bash', '-c', "#{function}\nformats_in_steps")
    assert status.success?, "formats_in_steps exited #{status.exitstatus}"
    out.lines.map(&:chomp)
  end

  def test_the_formats_the_steps_publish
    assert_equal ['presentation'], formats('REDIS_PORT' => nil)
  end

  # Without a journal the recording's logger writes to stdout: the warning about a REDIS_PORT
  # that is not a number (Kubernetes sets REDIS_PORT=tcp://<address>:6379) is not a format
  def test_a_log_line_on_stdout_is_not_a_format
    assert_equal ['presentation'], formats('REDIS_PORT' => 'tcp://10.0.0.1:6379')
  end
end

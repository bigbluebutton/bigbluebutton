# frozen_string_literal: true

require 'minitest/autorun'
require 'stringio'

require 'recordandplayback'

# The recording scripts log through journald on package installs (systemd sets
# JOURNAL_STREAM for the units). Where there is no journal (containers), the
# same lines have to reach stdout instead of being dropped.
class TestLogger < Minitest::Test
  def setup
    @saved_journal_stream = ENV.fetch('JOURNAL_STREAM', nil)
    @saved_stdout = $stdout
    @out = StringIO.new
  end

  def teardown
    $stdout = @saved_stdout
    if @saved_journal_stream.nil?
      ENV.delete('JOURNAL_STREAM')
    else
      ENV['JOURNAL_STREAM'] = @saved_journal_stream
    end
  end

  def stdout_logger
    ENV.delete('JOURNAL_STREAM')
    $stdout = @out
    BigBlueButton.system_logger('bbb-rap-test')
  end

  def test_without_journal_stream_logs_to_stdout
    logger = stdout_logger

    logger.info('reached stdout')

    assert_match(/INFO -- bbb-rap-test: reached stdout/, @out.string)
  end

  def test_stdout_logger_is_synced
    ENV.delete('JOURNAL_STREAM')
    $stdout = File.open(File::NULL, 'w')
    BigBlueButton.system_logger('bbb-rap-test')
    assert($stdout.sync, 'stdout must be synced so lines are not lost when the process is killed')
  end

  def test_with_journal_stream_logs_to_journald
    ENV['JOURNAL_STREAM'] = '8:12345'

    assert_kind_of(Journald::Logger, BigBlueButton.system_logger('bbb-rap-test'))
  end

  def test_tag_adds_fields_inside_the_block_only
    logger = stdout_logger

    logger.tag(record_id: 'rec-1') { logger.info('inside') }
    logger.info('outside')

    lines = @out.string.lines
    assert_match(/inside record_id=rec-1$/, lines[0])
    assert_match(/outside$/, lines[1])
  end

  def test_tag_without_block_keeps_the_fields
    logger = stdout_logger

    logger.tag(record_id: 'rec-1')
    logger.info('first')
    logger.info('second')

    lines = @out.string.lines
    assert_equal(2, lines.size)
    lines.each { |line| assert_match(/ record_id=rec-1$/, line) }
  end

  def test_exception_logs_class_message_and_backtrace
    logger = stdout_logger
    begin
      raise ArgumentError, 'bad caption'
    rescue ArgumentError => e
      logger.exception(e)
    end

    assert_match(/ERROR -- bbb-rap-test: ArgumentError: bad caption/, @out.string)
    assert_includes(@out.string, e.backtrace.first)
  end
end

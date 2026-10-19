# frozen_string_literal: true

# Container logging for the recording scripts, loaded into every Ruby process (RUBYOPT).
#
# On bare metal the scripts log to the systemd journal (journald-logger) and to files below
# /var/log/bigbluebutton. A container has no journal socket, and its log is its stdout, so:
# - Journald::Logger writes each message as one line to stdout instead of the journal;
# - a Logger opened on a file below /var/log/bigbluebutton (by path or as an open File) writes
#   to stdout, named after the file (`archive-<record id>`, `sanity`,
#   `presentation/process-<record id>`, `post_events_analytics_callback` ...).
# Anything written below /var/log/bigbluebutton in another way stays there (a tmpfs). The
# scripts log only through these two; the analytics callback's file is still created, empty.
#
# Nothing is required here: the scripts load the gems through bundler, and an early
# `require 'logger'` would activate another version of the logger gem than Gemfile.lock's. The
# changes are applied when the classes are defined.

module BBBContainerLogging
  LOG_DIR = '/var/log/bigbluebutton/'

  # Severity names for the journal priorities that Journald::Logger uses.
  PRIORITY_NAMES = %w[EMERG ALERT CRIT ERROR WARN NOTICE INFO DEBUG].freeze

  # Replaces Journald::Logger#real_send: the message, its identifier and its other fields on
  # one line of stdout.
  module JournaldStdout
    private

    def real_send(hash)
      fields = hash.reject { |_, v| v.nil? }.transform_keys { |k| k.to_s.downcase }
      priority = fields.delete('priority').to_i
      return 0 if priority > @min_priority

      ident = fields.delete('syslog_identifier')
      message = fields.delete('message')
      extra = fields.map { |k, v| "#{k}=#{v}" }.join(' ')
      line = +"#{PRIORITY_NAMES[priority] || priority} #{ident}: #{message}"
      line << " (#{extra})" unless extra.empty?
      $stdout.write("#{line}\n")
      0
    end
  end

  # Logger.new(path below LOG_DIR, ...) or Logger.new(a File opened below LOG_DIR, ...) logs to
  # stdout; log rotation arguments do not apply.
  module LoggerToStdout
    def new(logdev = nil, *args, **kwargs, &block)
      path = logdev.is_a?(String) ? logdev : (logdev.path if logdev.is_a?(::File))
      if equal?(::Logger) && path&.start_with?(LOG_DIR)
        kwargs[:progname] ||= path.delete_prefix(LOG_DIR).delete_suffix('.log')
        return super($stdout, **kwargs, &block)
      end
      super
    end
  end

  def self.journald_defined(mod)
    mod.prepend(JournaldStdout)
  end

  def self.logger_defined(mod)
    mod.singleton_class.prepend(LoggerToStdout)
  end
end

$stdout.sync = true

# Hooks that apply the changes once the classes exist (Ruby >= 3.2: Module#const_added).
module Journald
  def self.const_added(name)
    super
    BBBContainerLogging.journald_defined(const_get(name)) if name == :Logger
  end
end

class Object
  def self.const_added(name)
    super
    BBBContainerLogging.logger_defined(::Logger) if name == :Logger && equal?(::Object)
  end
end

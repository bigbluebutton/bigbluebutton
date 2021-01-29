/**
 * Logger used througouht the application to allow configuration of
 * the log level required for the messages.
 */
export declare class Logger {
    /**
     * No log
     */
    static readonly NoneLogLevel = 0;
    /**
     * Only message logs
     */
    static readonly MessageLogLevel = 1;
    /**
     * Only warning logs
     */
    static readonly WarningLogLevel = 2;
    /**
     * Only error logs
     */
    static readonly ErrorLogLevel = 4;
    /**
     * All logs
     */
    static readonly AllLogLevel = 7;
    private static _LogCache;
    /**
     * Gets a value indicating the number of loading errors
     * @ignorenaming
     */
    static errorsCount: number;
    /**
     * Callback called when a new log is added
     */
    static OnNewCacheEntry: (entry: string) => void;
    private static _AddLogEntry;
    private static _FormatMessage;
    private static _LogDisabled;
    private static _LogEnabled;
    private static _WarnDisabled;
    private static _WarnEnabled;
    private static _ErrorDisabled;
    private static _ErrorEnabled;
    /**
     * Log a message to the console
     */
    static Log: (message: string) => void;
    /**
     * Write a warning message to the console
     */
    static Warn: (message: string) => void;
    /**
     * Write an error message to the console
     */
    static Error: (message: string) => void;
    /**
     * Gets current log cache (list of logs)
     */
    static get LogCache(): string;
    /**
     * Clears the log cache
     */
    static ClearLogCache(): void;
    /**
     * Sets the current log level (MessageLogLevel / WarningLogLevel / ErrorLogLevel)
     */
    static set LogLevels(level: number);
}

/*
 * Copyright (c) 2006, 2010, Oracle and/or its affiliates. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * -Redistribution of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *
 * -Redistribution in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation
 *  and/or other materials provided with the distribution.
 *
 * Neither the name of Oracle nor the names of contributors may
 * be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * This software is provided "AS IS," without a warranty of any kind. ALL
 * EXPRESS OR IMPLIED CONDITIONS, REPRESENTATIONS AND WARRANTIES, INCLUDING
 * ANY IMPLIED WARRANTY OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
 * OR NON-INFRINGEMENT, ARE HEREBY EXCLUDED. SUN MICROSYSTEMS, INC. ("SUN")
 * AND ITS LICENSORS SHALL NOT BE LIABLE FOR ANY DAMAGES SUFFERED BY LICENSEE
 * AS A RESULT OF USING, MODIFYING OR DISTRIBUTING THIS SOFTWARE OR ITS
 * DERIVATIVES. IN NO EVENT WILL SUN OR ITS LICENSORS BE LIABLE FOR ANY LOST
 * REVENUE, PROFIT OR DATA, OR FOR DIRECT, INDIRECT, SPECIAL, CONSEQUENTIAL,
 * INCIDENTAL OR PUNITIVE DAMAGES, HOWEVER CAUSED AND REGARDLESS OF THE THEORY
 * OF LIABILITY, ARISING OUT OF THE USE OF OR INABILITY TO USE THIS SOFTWARE,
 * EVEN IF SUN HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
 *
 * You acknowledge that this software is not designed, licensed or intended
 * for use in the design, construction, operation or maintenance of any
 * nuclear facility.
 */

package jnlp.sample.servlet;
import java.text.MessageFormat;
import java.util.*;
import java.io.*;
import javax.servlet.*;

/* A loging object used by the servlets */
public class Logger {
    // Logging levels
    public final static int NONE                 = 0;
    public static final String NONE_KEY          = "NONE";
    public final static int FATAL                = 1;
    public static final String FATAL_KEY         = "FATAL";
    public final static int WARNING              = 2;
    public static final String WARNING_KEY       = "WARNING";
    public final static int INFORMATIONAL        = 3;
    public static final String INFORMATIONAL_KEY = "INFORMATIONAL";
    public final static int DEBUG                = 4;
    public static final String DEBUG_KEY         = "DEBUG";

    // Configuration parameters
    private final static String LOG_LEVEL = "logLevel";
    private final static String LOG_PATH  = "logPath";

    private int _loggingLevel = FATAL;
    private ServletContext _servletContext = null;
    private String _logFile = null;
    private String _servletName = null;

    // Localization
    ResourceBundle  _resources = null;


    /** Initialize logging object. It reads the logLevel and pathLevel init parameters.
     *  Default is logging level FATAL, and logging using the ServletContext.log
     */
    public Logger(ServletConfig config, ResourceBundle resources) {
        _resources = resources;
        _servletContext = config.getServletContext();
        _servletName = config.getServletName();
        _logFile = config.getInitParameter(LOG_PATH);
        if (_logFile != null) {
            _logFile = _logFile.trim();
            if (_logFile.length() == 0) _logFile = null;
        }
        String level = config.getInitParameter(LOG_LEVEL);
        if (level != null) {
            level = level.trim().toUpperCase();
            if (level.equals(NONE_KEY)) _loggingLevel = NONE;
            if (level.equals(FATAL_KEY)) _loggingLevel = FATAL;
            if (level.equals(WARNING_KEY)) _loggingLevel = WARNING;
            if (level.equals(INFORMATIONAL_KEY)) _loggingLevel = INFORMATIONAL;
            if (level.equals(DEBUG_KEY)) _loggingLevel = DEBUG;
        }
    }

    // Logging API. Fatal, Warning, and Informational are localized
    public void addFatal(String key, Throwable throwable) {
        logEvent(FATAL, getString(key), throwable);
    }

    public void addWarning(String key, String arg) {
        logL10N(WARNING, key, arg, (Throwable)null);
    }

    public void addWarning(String key, String arg, Throwable t) {
        logL10N(WARNING, key, arg, t);
    }

    public void addWarning(String key, String arg1, String arg2) {
        logL10N(WARNING, key, arg1, arg2);
    }

    public void addWarning(String key, String arg1, String arg2, String arg3) {
        logL10N(WARNING, key, arg1, arg2, arg3);
    }

    public void addInformational(String key) {
        logEvent(INFORMATIONAL, getString(key), (Throwable)null);
    }

    public void addInformational(String key, String arg) {
        logL10N(INFORMATIONAL, key, arg, (Throwable)null);
    }

    public void addInformational(String key, String arg1, String arg2, String arg3) {
        logL10N(INFORMATIONAL, key, arg1, arg2, arg3);
    }

    // Debug messages are not localized
    public void addDebug(String msg)   { logEvent(DEBUG, msg, null); }

    public void addDebug(String msg, Throwable throwable) {
        logEvent(DEBUG, msg, throwable);
    }

    // Query to test for level
    boolean isNoneLevel() { return _loggingLevel >= NONE; }
    boolean isFatalevel() { return _loggingLevel >= FATAL; }
    boolean isWarningLevel() { return _loggingLevel >= WARNING; }
    boolean isInformationalLevel() { return _loggingLevel >= INFORMATIONAL; }
    boolean isDebugLevel() { return _loggingLevel >= DEBUG; }

    // Returns a string from the resources
    private String getString(String key) {
        try {
            return _resources.getString(key);
        } catch (MissingResourceException mre) {
            return "Missing resource for: " + key;
        }
    }

    private void logL10N(int level, String key, String arg, Throwable e) {
        Object[] messageArguments = { arg };
        logEvent(level, applyPattern(key, messageArguments), e);
    }

    private void logL10N(int level, String key, String arg1, String arg2) {
        Object[] messageArguments = { arg1, arg2 };
        logEvent(level, applyPattern(key, messageArguments), null);
    }

    private void logL10N(int level, String key, String arg1, String arg2, String arg3) {
        Object[] messageArguments = { arg1, arg2, arg3 };
        logEvent(level, applyPattern(key, messageArguments), null);
    }

    /** Helper function that applies the messageArguments to a message from the resource object */
    private String applyPattern(String key, Object[] messageArguments) {
        String message = getString(key);
        MessageFormat formatter = new MessageFormat(message);
        String output = formatter.format(message, messageArguments);
        return output;
    }

    // The method that actually does the logging */
    private synchronized void logEvent(int level, String string, Throwable throwable) {
        // Check if the event should be logged
        if (level > _loggingLevel) return;

        if (_logFile != null) {
            // No logfile specified, log using servlet context
            PrintWriter pw = null;
            try {
                pw = new PrintWriter(new FileWriter(_logFile, true));
                pw.println(_servletName + "(" + level + "): " + string);
                if (throwable != null) {
                    throwable.printStackTrace(pw);
                }
                pw.close();
                // Do a return here. An exception will cause a fall through to
                // do _servletContex logging API
                return;
            } catch (IOException ioe) {
                /* just ignore */
            }
        }

        // Otherwise, write to servlet context log
        if (throwable == null) {
            _servletContext.log(string);
        } else {
            _servletContext.log(string, throwable);
        }
    }
}

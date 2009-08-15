/*
 *  Copyright 2004-2006 Stefan Reuter
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package org.asteriskjava.util;

import org.asteriskjava.util.internal.JavaLoggingLog;
import org.asteriskjava.util.internal.Log4JLogger;
import org.asteriskjava.util.internal.NullLog;

/**
 * Facade to hide details of the underlying logging system.<p>
 * If you want to reuse Asterisk-Java's logging abstraction layer
 * add a private attribute to your class like this:
 * <pre>
 * private final Log logger = LogFactory.getLog(getClass());
 * </pre>
 * and then use the methods defined in {@link org.asteriskjava.util.Log}:
 * <pre>
 * logger.error("Unable to create new instance of " + eventClass, ex);
 * </pre>
 * Asterisk-Java's logging abstraction layer uses log4j when available
 * and falls back to java.util.logging otherwise.
 * 
 * @author srt
 * @version $Id: LogFactory.java 959 2008-02-02 23:56:59Z srt $
 */
public final class LogFactory
{
    /**
     * Indicates if log4j is available on the classpath or not. If the
     * check has not yet performed this is <code>null</code>.
     */
    private static Boolean log4jLoggingAvailable = null;

    /**
     * Indicates if java.util.logging is available on the classpath or not. If the
     * check has not yet performed this is <code>null</code>.
     */
    private static Boolean javaLoggingAvailable = null;
    
    /**
     * Returns an instance of Log suitable for logging from the given class.
     * 
     * @param clazz the class to create the logger for.
     * @return the created logger.
     */
    public static Log getLog(Class clazz)
    {
        if (log4jLoggingAvailable == null)
        {
            try
            {
                Class.forName("org.apache.log4j.Logger");
                log4jLoggingAvailable = Boolean.TRUE;
            }
            catch (Exception e)
            {
                log4jLoggingAvailable = Boolean.FALSE;
            }
        }
        if (log4jLoggingAvailable)
        {
            return new Log4JLogger(clazz);
        }
        else
        {
            if (javaLoggingAvailable == null)
            {
                try
                {
                    Class.forName("java.util.logging.Logger");
                    javaLoggingAvailable = Boolean.TRUE;
                }
                catch (Exception e)
                {
                    javaLoggingAvailable = Boolean.FALSE;
                }
            }
            if (javaLoggingAvailable)
            {
                return new JavaLoggingLog(clazz);
            }
            else
            {
                return new NullLog();
            }
        }
    }
}

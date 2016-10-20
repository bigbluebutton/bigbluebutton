/*
 * Copyright (C) 2014-2015 Samuel Audet
 *
 * Licensed either under the Apache License, Version 2.0, or (at your option)
 * under the terms of the GNU General Public License as published by
 * the Free Software Foundation (subject to the "Classpath" exception),
 * either version 2, or any later version (collectively, the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *     http://www.gnu.org/licenses/
 *     http://www.gnu.org/software/classpath/license.html
 *
 * or as provided in the LICENSE.txt file that accompanied this code.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.bytedeco.javacpp.tools;

/**
 * A simple but extensible logging interface that dumps messages to the "standard" output streams by default.
 *
 * @author Samuel Audet
 */
public class Logger {
    /** If the "org.bytedeco.javacpp.logger" system property is set to "slf4j",
     *  returns new {@link Slf4jLogger#Slf4jLogger(Class)}, else returns new {@link #Logger()}. */
    public static Logger create(Class cls) {
        String s = System.getProperty("org.bytedeco.javacpp.logger", "").toLowerCase();
        return new Logger();
    }

    static boolean debug = false;
    static {
        String s = System.getProperty("org.bytedeco.javacpp.logger.debug", "false").toLowerCase();
        debug = s.equals("true") || s.equals("t") || s.equals("");
    }

    /** Returns the "org.bytedeco.javacpp.logger.debug" system property. */
    public boolean isDebugEnabled() { return debug; }
    /** Returns true. */
    public boolean isInfoEnabled()  { return true; }
    /** Returns true. */
    public boolean isWarnEnabled()  { return true; }
    /** Returns true. */
    public boolean isErrorEnabled() { return true; }

    /** Calls {@code System.out.println(s)}. */
    public void debug(String s) { System.out.println(s); }
    /** Calls {@code System.out.println(s)}. */
    public void info(String s)  { System.out.println(s); }
    /** Calls {@code System.err.println("Warning: " + s)}. */
    public void warn(String s)  { System.err.println("Warning: " + s); }
    /** Calls {@code System.err.println("Error: " + s)}. */
    public void error(String s) { System.err.println("Error: " + s); }
}

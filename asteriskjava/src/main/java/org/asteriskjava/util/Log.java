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

/**
 * Main interface used for logging throughout Asterisk-Java.<p>
 * Concrete instances of this interface are obtained by calling
 * {@link org.asteriskjava.util.LogFactory#getLog(Class)}.
 * 
 * @author srt
 * @see org.asteriskjava.util.LogFactory
 */
public interface Log
{
    void debug(Object obj);
    void info(Object obj);
    void warn(Object obj);
    void warn(Object obj, Throwable exception);
    void error(Object obj);
    void error(Object obj, Throwable exception);
}

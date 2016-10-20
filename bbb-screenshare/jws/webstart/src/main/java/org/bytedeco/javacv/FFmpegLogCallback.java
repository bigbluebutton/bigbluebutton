/*
 * Copyright (C) 2015 Samuel Audet
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

package org.bytedeco.javacv;

import org.bytedeco.javacpp.BytePointer;
import org.bytedeco.javacpp.tools.Logger;

import static org.bytedeco.javacpp.avutil.*;

/**
 * A utility class to redirect to Java log messages from FFmpeg.
 *
 * @see Logger
 *
 * @author Samuel Audet
 */
public class FFmpegLogCallback extends LogCallback {

    private static final Logger logger = Logger.create(FFmpegLogCallback.class);

    static final FFmpegLogCallback instance = new FFmpegLogCallback();

    /** Returns an instance that can be used with {@link #setLogCallback(LogCallback)}. */
    public static FFmpegLogCallback getInstance() {
        return instance;
    }

    /** Calls {@code avutil.setLogCallback(getInstance())}. */
    public static void set() {
        setLogCallback(getInstance());
    }

    @Override public void call(int level, BytePointer msg) {
        switch (level) {
            case AV_LOG_PANIC:
            case AV_LOG_FATAL:
            case AV_LOG_ERROR:
                logger.error(msg.getString());
                break;
            case AV_LOG_WARNING:
                logger.warn(msg.getString());
                break;
            case AV_LOG_INFO:
                logger.info(msg.getString());
            case AV_LOG_VERBOSE:
            case AV_LOG_DEBUG:
            case AV_LOG_TRACE:
                logger.debug(msg.getString());
                break;
            default:
                assert false;
        }
    }
}

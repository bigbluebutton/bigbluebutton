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
package org.asteriskjava.config;

import java.util.Map;
import java.util.List;

/**
 * An Asterisk configuration file.
 *
 * @author srt
 * @version $Id: ConfigFile.java 992 2008-03-08 23:31:13Z srt $
 * @since 1.0.0
 */
public interface ConfigFile
{
    /**
     * Returns the filename.
     *
     * @return the filename, for example "voicemail.conf".
     */
    String getFilename();

    /**
     * Returns the lines per category.
     *
     * @return the lines per category.
     */
    Map<String, List<String>> getCategories();

    String getValue(String category, String key);

    List<String> getValues(String category, String key);
}
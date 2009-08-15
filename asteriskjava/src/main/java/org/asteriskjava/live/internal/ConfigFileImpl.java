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
package org.asteriskjava.live.internal;

import org.asteriskjava.config.ConfigFile;

import java.util.Map;
import java.util.List;

/**
 * ConfigFile implementation based on the config actions of the Manager API.
 *
 * @author srt
 * @version $Id: ConfigFileImpl.java 992 2008-03-08 23:31:13Z srt $
 * @since 1.0.0
 */
public class ConfigFileImpl implements ConfigFile
{
    private final String filename;
    private final Map<String, List<String>> categories;

    public ConfigFileImpl(String filename, Map<String, List<String>> categories)
    {
        this.filename = filename;
        this.categories = categories;
    }

    public String getFilename()
    {
        return filename;
    }

    public Map<String, List<String>> getCategories()
    {
        return categories;
    }

    public String getValue(String category, String key)
    {
        throw new UnsupportedOperationException("Not yet inmplemented");
    }

    public List<String> getValues(String category, String key)
    {
        throw new UnsupportedOperationException("Not yet inmplemented");
    }
}
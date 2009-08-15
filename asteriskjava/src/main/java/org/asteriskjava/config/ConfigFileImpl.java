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
import java.util.TreeMap;
import java.util.ArrayList;

/**
 * An Asterisk configuration file read from the filesystem.
 *
 * @author srt
 * @version $Id: ConfigFileImpl.java 1044 2008-05-05 23:45:09Z msmith $
 * @since 1.0.0
 */
public class ConfigFileImpl implements ConfigFile
{
    private final String filename;
    protected final Map<String, Category> categories;

    public ConfigFileImpl(String filename, Map<String, Category> categories)
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
        final Map<String, List<String>> c;

        c = new TreeMap<String, List<String>>();

        synchronized (categories)
        {
            for (Category category : categories.values())
            {
                List<String> lines;

                lines = new ArrayList<String>();
                for (ConfigElement element : category.getElements())
                {
                    if (element instanceof ConfigVariable)
                    {
                        ConfigVariable cv = (ConfigVariable) element;
                        lines.add(cv.getName() + "=" + cv.getValue());
                    }
                }
                c.put(category.getName(), lines);
            }
        }

        return c;
    }

    public String getValue(String categoryName, String key)
    {
        final Category category;

        category = getCategory(categoryName);
        if (category == null)
        {
            return null;
        }

        for (ConfigElement element : category.getElements())
        {
            if (element instanceof ConfigVariable)
            {
                ConfigVariable cv = (ConfigVariable) element;

                if (cv.getName().equals(key))
                {
                    return cv.getValue();
                }
            }
        }
        return null;
    }

    public List<String> getValues(String categoryName, String key)
    {
        final Category category;
        final List<String> result;

        category = getCategory(categoryName);
        result = new ArrayList<String>();
        if (category == null)
        {
            return result;
        }

        for (ConfigElement element : category.getElements())
        {
            if (element instanceof ConfigVariable)
            {
                ConfigVariable cv = (ConfigVariable) element;

                if (cv.getName().equals(key))
                {
                    result.add(cv.getValue());
                }
            }
        }
        return result;
    }

    protected Category getCategory(String name)
    {
        synchronized (categories)
        {
            return categories.get(name);
        }
    }
}

package org.asteriskjava.config.dialplan;

import java.util.Collection;
import java.util.Map;

import org.asteriskjava.config.Category;
import org.asteriskjava.config.ConfigFileImpl;

public class ExtensionsConfigFile extends ConfigFileImpl
{
    public ExtensionsConfigFile(String filename, Map<String, Category> categories)
    {
        super(filename, categories);
    }

    public Collection<Category> getContexts()
    {
        return categories.values();
    }
}

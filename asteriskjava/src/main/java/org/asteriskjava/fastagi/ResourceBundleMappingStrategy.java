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
package org.asteriskjava.fastagi;

import java.util.*;

/**
 * A MappingStrategy that is configured via a resource bundle.<p>
 * The resource bundle contains the script part of the url as key and the fully
 * qualified class name of the corresponding AgiScript as value.<p>
 * Example:
 * 
 * <pre>
 * leastcostdial.agi = com.example.fastagi.LeastCostDialAgiScript
 * hello.agi = com.example.fastagi.HelloAgiScript
 * </pre>
 * 
 * LeastCostDialAgiScript and HelloAgiScript must both implement the AgiScript
 * interface and have a default constructor with no parameters.<p>
 * The resource bundle (properties) file is called
 * <code>fastagi-mapping.properties</code> by default and must be available on 
 * the classpath.
 * 
 * @author srt
 * @version $Id: ResourceBundleMappingStrategy.java 1140 2008-08-18 18:49:36Z srt $
 */
public class ResourceBundleMappingStrategy extends AbstractMappingStrategy
{
    private static final String DEFAULT_RESOURCE_BUNDLE_NAME = "fastagi-mapping";
    private String resourceBundleName;
    private Map<String, String> mappings;
    private Map<String, AgiScript> instances;
    private boolean shareInstances;

    /**
     * Creates a new ResourceBundleMappingStrategy using shared instances..
     */
    public ResourceBundleMappingStrategy()
    {
        this(DEFAULT_RESOURCE_BUNDLE_NAME);
    }

    /**
     * Creates a new ResourceBundleMappingStrategy with the given basename
     * of the resource bundle to use.
     * 
     * @param resourceBundleName basename of the resource bundle to use
     */
    public ResourceBundleMappingStrategy(String resourceBundleName)
    {
        this(resourceBundleName, true);
    }

    /**
     * Creates a new ResourceBundleMappingStrategy indicating whether to use shared
     * instances or not.
     * 
     * @param shareInstances <code>true</code> to use shared instances,
     *                       <code>false</code> to create a new instance for
     *                       each request.
     * @since 0.3
     */
    public ResourceBundleMappingStrategy(boolean shareInstances)
    {
        this(DEFAULT_RESOURCE_BUNDLE_NAME, shareInstances);
    }

    /**
     * Creates a new ResourceBundleMappingStrategy with the given basename
     * of the resource bundle to use and indicating whether to use shared
     * instances or not.
     * 
     * @param resourceBundleName basename of the resource bundle to use
     * @param shareInstances <code>true</code> to use shared instances,
     *                       <code>false</code> to create a new instance for
     *                       each request.
     * @since 0.3
     */
    public ResourceBundleMappingStrategy(String resourceBundleName, boolean shareInstances)
    {
        super();
        this.resourceBundleName = resourceBundleName;
        this.shareInstances = shareInstances;
    }

    /**
     * Sets the basename of the resource bundle to use.<p>
     * Default is "fastagi-mapping".
     * 
     * @param resourceBundleName basename of the resource bundle to use
     */
    public void setResourceBundleName(String resourceBundleName)
    {
        this.resourceBundleName = resourceBundleName;
        synchronized (this)
        {
            this.mappings = null;
            this.instances = null;
        }
    }

    /**
     * Sets whether to use shared instances or not. If set to <code>true</code>
     * all AgiRequests are served by the same instance of an
     * AgiScript, if set to <code>false</code> a new instance is created for
     * each request.<p>
     * Default is <code>true</code>.
     * 
     * @param shareInstances <code>true</code> to use shared instances,
     *                       <code>false</code> to create a new instance for
     *                       each request.
     * @since 0.3
     */
    public synchronized void setShareInstances(boolean shareInstances)
    {
        this.shareInstances = shareInstances;
    }

    private synchronized void loadResourceBundle()
    {
        ResourceBundle resourceBundle;
        Enumeration keys;

        mappings = new HashMap<String, String>();
        if (shareInstances)
        {
            instances = new HashMap<String, AgiScript>();
        }

        try
        {
            resourceBundle = ResourceBundle.getBundle(resourceBundleName, Locale.getDefault(), getClassLoader());
        }
        catch (MissingResourceException e)
        {
            logger.info("Resource bundle '" + resourceBundleName + "' not found.");
            return;
        }

        keys = resourceBundle.getKeys();

        while (keys.hasMoreElements())
        {
            String scriptName;
            String className;
            AgiScript agiScript;

            scriptName = (String) keys.nextElement();
            className = resourceBundle.getString(scriptName);

            mappings.put(scriptName, className);

            if (shareInstances)
            {
                agiScript = createAgiScriptInstance(className);
                if (agiScript == null)
                {
                    continue;
                }
                instances.put(scriptName, agiScript);
            }

            logger.info("Added mapping for '" + scriptName + "' to class " + className);
        }
    }

    public synchronized AgiScript determineScript(AgiRequest request)
    {
        if (mappings == null || (shareInstances && instances == null))
        {
            loadResourceBundle();
        }

        if (shareInstances)
        {
            return instances.get(request.getScript());
        }
        else
        {
            return createAgiScriptInstance(mappings.get(request.getScript()));
        }
    }
}

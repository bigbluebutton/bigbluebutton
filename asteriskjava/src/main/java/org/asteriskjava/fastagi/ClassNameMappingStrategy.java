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

import java.util.HashMap;
import java.util.Map;

/**
 * A MappingStrategy that determines the AGIScript based on the fully
 * qualified class name given in the AGI URL.<p>
 * To use this ClassNameMappingStrategy the calls to your 
 * {@link org.asteriskjava.fastagi.AgiScript} in
 * your dialplan should look like this:
 * <pre>
 * exten => 123,1,AGI(agi://your.server.com/com.example.agi.MyScript)
 * </pre>
 * Where com.example.agi.MyScript is the fully qualified name of your
 * AgiScript.
 * 
 * @author srt
 * @version $Id: ClassNameMappingStrategy.java 1140 2008-08-18 18:49:36Z srt $
 */
public class ClassNameMappingStrategy extends AbstractMappingStrategy
{
    private Map<String, AgiScript> instances;
    private boolean shareInstances;

    /**
     * Creates a new ClassNameMappingStrategy using shared instances.
     */
    public ClassNameMappingStrategy()
    {
        this(true);
    }

    /**
     * Creates a new ClassNameMappingStrategy indicating whether to use shared
     * instances or not.
     * 
     * @param shareInstances <code>true</code> to use shared instances,
     *                       <code>false</code> to create a new instance for
     *                       each request.
     * @since 0.3
     */
    public ClassNameMappingStrategy(boolean shareInstances)
    {
        super();
        this.instances = new HashMap<String, AgiScript>();
        this.shareInstances = shareInstances;
    }

    /**
     * Sets whether to use shared instances or not. If set to <code>true</code>
     * all AGIRequests are served by the same instance of an
     * AGIScript, if set to <code>false</code> a new instance is created for
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

    public synchronized AgiScript determineScript(AgiRequest request)
    {
        AgiScript script;

        if (shareInstances)
        {
            script = instances.get(request.getScript());
            if (script != null)
            {
                return script;
            }
        }

        script = createAgiScriptInstance(request.getScript());
        if (script == null)
        {
            return null;
        }

        if (shareInstances)
        {
            instances.put(request.getScript(), script);
        }

        return script;
    }
}

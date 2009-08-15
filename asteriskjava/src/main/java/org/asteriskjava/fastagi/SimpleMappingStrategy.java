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

import java.util.Map;

/**
 * A MappingStrategy that is configured via a fixed set of properties.<p>
 * This mapping strategy is most useful when used with the Spring framework.<p>
 * Example (using Spring):
 * 
 * <pre>
 * &lt;beans&gt;
 *    &lt;bean id="mapping"
 *          class="org.asteriskjava.fastagi.SimpleMappingStrategy"&gt;
 *        &lt;property name="mappings"&gt;
 *            &lt;map&gt;
 *                &lt;entry&gt;
 *                    &lt;key&gt;&lt;value&gt;hello.agi&lt;/value&gt;&lt;/key&gt;
 *                    &lt;ref local="hello"/&gt;
 *                &lt;/entry&gt;
 *                &lt;entry&gt;
 *                    &lt;key&gt;&lt;value&gt;leastcostdial.agi&lt;/value&gt;&lt;/key&gt;
 *                    &lt;ref local="leastCostDial"/&gt;
 *                &lt;/entry&gt;
 *            &lt;/map&gt;
 *        &lt;/property&gt;
 *    &lt;/bean&gt;
 *
 *    &lt;bean id="hello"
 *          class="com.example.fastagi.HelloAgiScript"/&gt;
 *
 *    &lt;bean id="leastCostDial"
 *          class="com.example.fastagi.LeastCostDialAgiScript"&gt;
 *        &lt;property name="rates"&gt;&lt;value&gt;rates.txt&lt;/value&gt;&lt;/property&gt;
 *    &lt;/bean&gt;
 * &lt;beans&gt;
 * </pre>
 * 
 * LeastCostDialAgiScript and HelloAgiScript must both implement the AgiScript.<p>
 * 
 * @author srt
 * @version $Id: SimpleMappingStrategy.java 938 2007-12-31 03:23:38Z srt $
 * @since 0.2
 */
public class SimpleMappingStrategy implements MappingStrategy
{
    private Map<String, AgiScript> mappings;

    /**
     * Set the "path to AgiScript" mapping.<p>
     * Use the path (for example <code>hello.agi</code>) as key and your
     * AgiScript (for example <code>new HelloAgiScript()</code>) as value of
     * this map. 
     * 
     * @param mappings the path to AgiScript mapping.
     */
    public void setMappings(Map<String, AgiScript> mappings)
    {
        this.mappings = mappings;
    }

    public AgiScript determineScript(AgiRequest request)
    {
        if (mappings == null)
        {
            return null;
        }

        return mappings.get(request.getScript());
    }
}

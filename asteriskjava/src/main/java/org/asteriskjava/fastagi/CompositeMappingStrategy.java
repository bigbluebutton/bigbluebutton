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

import java.util.ArrayList;
import java.util.List;
import java.util.Arrays;

/**
 * A mapping strategy that tries a sequence of other mapping strategies to find
 * an AgiScript matching the request. The first strategy that returns a result wins,
 * so the order of the mapping strategies passed to the CompositeMappingStrategy
 * matters.<p>
 * Example:
 * <pre>
 * new CompositeMappingStrategy(
 *       new ResourceBundleMappingStrategy(),
 *       new ClassNameMappingStrategy());
 * </pre>
 * This creates a new mapping strategy that first tries to look up the script
 * in <code>fastagi-mapping.properties</code> and - if the properties file is
 * not present on the classpath or contains no mapping for the request - uses
 * a {@link ClassNameMappingStrategy} to get the script.
 * 
 * @see ResourceBundleMappingStrategy
 * @see ClassNameMappingStrategy
 * @author srt
 * @since 0.3
 * @version $Id: CompositeMappingStrategy.java 1015 2008-04-04 21:56:36Z srt $
 */
public class CompositeMappingStrategy implements MappingStrategy
{
    private List<MappingStrategy> strategies;

    /**
     * Creates a new empty CompositeMappingStrategy.
     */
    public CompositeMappingStrategy()
    {
        super();
    }

    /**
     * Creates a new CompositeMappingStrategy.
     * 
     * @param strategies the strategies to use.
     */
    public CompositeMappingStrategy(MappingStrategy... strategies)
    {
        super();
        this.strategies = new ArrayList<MappingStrategy>(Arrays.asList(strategies));
    }

    /**
     * Creates a new CompositeMappingStrategy.
     * 
     * @param strategies the strategies to use.
     */
    public CompositeMappingStrategy(List<MappingStrategy> strategies)
    {
        super();
        this.strategies = new ArrayList<MappingStrategy>(strategies);
    }

    /**
     * Adds a strategy (at the end of the list).
     * 
     * @param strategy the strategy to add.
     */
    public void addStrategy(MappingStrategy strategy)
    {
        if (strategies == null)
        {
            strategies = new ArrayList<MappingStrategy>();
        }
        strategies.add(strategy);
    }

    /**
     * Sets the strategies to use.
     * 
     * @param strategies the strategies to use.
     */
    public void setStrategies(List<MappingStrategy> strategies)
    {
        this.strategies = new ArrayList<MappingStrategy>(strategies);
    }

    public AgiScript determineScript(AgiRequest request)
    {
        AgiScript script = null;

        if (strategies == null)
        {
            return null;
        }

        for (MappingStrategy strategy : strategies)
        {
            script = strategy.determineScript(request);
            if (script != null)
            {
                break;
            }
        }

        return script;
    }
}

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


import junit.framework.TestCase;

import org.asteriskjava.fastagi.AgiRequest;
import org.asteriskjava.fastagi.AgiScript;
import org.asteriskjava.fastagi.ResourceBundleMappingStrategy;

public class ResourceBundleMappingStrategyTest extends TestCase
{
    private ResourceBundleMappingStrategy mappingStrategy;

    @Override
   protected void setUp() throws Exception
    {
        super.setUp();
        this.mappingStrategy = new ResourceBundleMappingStrategy();
        this.mappingStrategy.setResourceBundleName("test-mapping");
    }

    public void testDetermineScript()
    {
        AgiScript scriptFirstPass;
        AgiScript scriptSecondPass;
        AgiRequest request;

        request = new SimpleAgiRequest();

        scriptFirstPass = mappingStrategy.determineScript(request);
        scriptSecondPass = mappingStrategy.determineScript(request);

        assertNotNull("no script determined", scriptFirstPass);
        assertEquals("incorrect script determined",
                scriptFirstPass.getClass(), HelloAgiScript.class);

        assertTrue("script instances are not cached",
                scriptFirstPass == scriptSecondPass);
    }

    public void testDetermineScriptWithResourceBundleUnavailable()
    {
        AgiRequest request;

        request = new SimpleAgiRequest();

        mappingStrategy
                .setResourceBundleName("net.sf.asterisk.fastagi.unavailable");
        assertNull(mappingStrategy.determineScript(request));
    }

    public void testDetermineScriptWithNonSharedInstance()
    {
        AgiScript scriptFirstPass;
        AgiScript scriptSecondPass;
        AgiRequest request;

        mappingStrategy.setShareInstances(false);
        request = new SimpleAgiRequest();

        scriptFirstPass = mappingStrategy.determineScript(request);
        scriptSecondPass = mappingStrategy.determineScript(request);

        assertEquals("incorrect script determined",
                scriptFirstPass.getClass(), HelloAgiScript.class);

        assertTrue("returned a shared instance",
                scriptFirstPass != scriptSecondPass);
    }
}

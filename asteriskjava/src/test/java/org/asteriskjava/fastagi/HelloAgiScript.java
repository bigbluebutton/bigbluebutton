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

/**
 * Test script for use with the ResourceBundleMappingStrategyTest.
 * 
 * @author srt
 * @version $Id: HelloAgiScript.java 952 2008-01-31 04:29:51Z srt $
 */
public class HelloAgiScript implements AgiScript
{
    public HelloAgiScript()
    {

    }

    public void service(AgiRequest request, AgiChannel channel) throws AgiException
    {
        channel.streamFile("tt-monkeysintro");
    }
}

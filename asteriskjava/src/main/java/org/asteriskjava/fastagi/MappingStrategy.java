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
 * A MappingStrategy determines which {@link org.asteriskjava.fastagi.AgiScript}
 * is called to service a given {@link org.asteriskjava.fastagi.AgiRequest}.<p>
 * A MappingStrategy can use any of the properties
 * of an AgiRequest to do this. However most MappingStrategies will just use 
 * the script property, that is the name of the invoked AGI script as passed
 * from Asterisk's dialplan.<p>
 * Asterisk-Java ships with several mapping strategies that are available out
 * of the box. If you have some special requirements that are not satisfied by
 * any of the available strategies feel free to implement this interface and
 * use your own strategy.
 * 
 * @author srt
 * @version $Id: MappingStrategy.java 938 2007-12-31 03:23:38Z srt $
 */
public interface MappingStrategy
{
    /**
     * Returns the AgiScript instance that is responsible to handle 
     * the given request.
     * 
     * @param request the request to lookup.
     * @return the AgiScript instance to handle this request 
     *         or <code>null</code> if none could be determined by this strategy.
     */
    AgiScript determineScript(AgiRequest request);
}

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
package org.asteriskjava.live;

/**
 * Represents an Asterisk agent
 * <p>
 * PropertyChangeEvents are fired for the following properties:
 * <ul>
 * <li>state</li>
 * </ul>
 * 
 * </p>
 * 
 * @since 0.3.1
 * @author <a href="mailto:patrick.breucking{@nospam}gonicus.de">Patrick Breucking</a>
 * @version $Id: AsteriskAgent.java 966 2008-02-03 07:00:58Z srt $
 */
public interface AsteriskAgent extends LiveObject
{
    String PROPERTY_STATE = "state";

    /**
     * @return the name
     */
    public String getName();

    /**
     * @return the agentId
     */
    public String getAgentId();

    /**
     * Returns the state of this agent.
     *
     * @return the state the state of this agent.
     */
    public AgentState getState();

}

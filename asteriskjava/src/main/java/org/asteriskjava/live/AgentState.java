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
 * The lifecycle status of an {@link org.asteriskjava.live.AsteriskAgent}.
 * 
 * @since 0.3.1
 * @author <a href="mailto:patrick.breucking{@nospam}gonicus.de">Patrick Breucking</a>
 * @version $Id: AgentState.java 962 2008-02-03 03:34:11Z srt $
 */
public enum AgentState
{
    /**
     * Agent isn't logged in.
     */
    AGENT_LOGGEDOFF,

    /**
     * Agent is logged in and waiting for call.
     */
    AGENT_IDLE,

    /**
     * Agent is logged in and on a call.
     */
    AGENT_ONCALL,

    /**
     * Don't know anything about agent. Shouldn't ever get this.
     */
    AGENT_UNKNOWN,

    /**
     * Agent is logged in and a call is waiting for connect.
     */
    AGENT_RINGING
}

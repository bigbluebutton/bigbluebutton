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
package org.asteriskjava.manager.event;

/**
 * An AgentCallbackLoginEvent is triggered when an agent is successfully logged in using
 * AgentCallbackLogin.<p>
 * It is implemented in <code>channels/chan_agent.c</code>
 * 
 * @see org.asteriskjava.manager.event.AgentCallbackLogoffEvent
 * @author srt
 * @version $Id: AgentCallbackLoginEvent.java 938 2007-12-31 03:23:38Z srt $
 */
public class AgentCallbackLoginEvent extends ManagerEvent
{
    /**
     * Serializable version identifier
     */
    private static final long serialVersionUID = -3510642916347427230L;
    private String agent;
    private String loginChan;
    private String uniqueId;

    /**
     * @param source
     */
    public AgentCallbackLoginEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the name of the agent that logged in.
     */
    public String getAgent()
    {
        return agent;
    }

    /**
     * Sets the name of the agent that logged in.
     */
    public void setAgent(String agent)
    {
        this.agent = agent;
    }

    public String getLoginChan()
    {
        return loginChan;
    }

    public void setLoginChan(String loginChan)
    {
        this.loginChan = loginChan;
    }

    public String getUniqueId()
    {
        return uniqueId;
    }

    public void setUniqueId(String uniqueId)
    {
        this.uniqueId = uniqueId;
    }
}

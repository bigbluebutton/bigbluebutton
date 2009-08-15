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
 * An AgentLoginEvent is triggered when an agent is successfully logged in using AgentLogin.<p>
 * It is implemented in <code>channels/chan_agent.c</code>
 * 
 * @see org.asteriskjava.manager.event.AgentLogoffEvent
 * @author srt
 * @version $Id: AgentLoginEvent.java 938 2007-12-31 03:23:38Z srt $
 */
public class AgentLoginEvent extends ManagerEvent
{
    /**
     * Serializable version identifier
     */
    private static final long serialVersionUID = 7125917930904957919L;
    private String agent;
    private String channel;
    private String uniqueId;

    /**
     * @param source
     */
    public AgentLoginEvent(Object source)
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

    /**
     * Returns the name of the channel associated with the logged in agent.
     * 
     * @deprecated use {@link #getChannel()} instead.
     */
    public String getLoginChan()
    {
        return channel;
    }

    /**
     * Returns the name of the channel associated with the logged in agent.
     * 
     * @return the name of the channel associated with the logged in agent.
     * @since 0.3
     */
    public String getChannel()
    {
        return channel;
    }

    /**
     * Sets the name of the channel associated with the logged in agent.
     * 
     * @param channel the name of the channel associated with the logged in agent.
     * @since 0.3
     */
    public void setChannel(String channel)
    {
        this.channel = channel;
    }

    /**
     * Returns the unique id of the channel associated with the logged in agent.
     * 
     * @return the unique id of the channel associated with the logged in agent.
     */
    public String getUniqueId()
    {
        return uniqueId;
    }

    /**
     * Sets the unique id of the channel associated with the logged in agent.
     * 
     * @param uniqueId the unique id of the channel associated with the logged in agent.
     */
    public void setUniqueId(String uniqueId)
    {
        this.uniqueId = uniqueId;
    }
}

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
 * An AgentCallbackLogoffEvent is triggered when an agent that previously logged in using AgentLogin
 * is logged of.<p>
 * It is implemented in <code>channels/chan_agent.c</code>
 * 
 * @see org.asteriskjava.manager.event.AgentLoginEvent
 * @author srt
 * @version $Id: AgentLogoffEvent.java 938 2007-12-31 03:23:38Z srt $
 */
public class AgentLogoffEvent extends ManagerEvent
{
    /**
     * Serializable version identifier
     */
    private static final long serialVersionUID = -3482474719161350942L;

    /**
     * The name of the agent that logged off.
     */
    private String agent;
    private String loginTime;
    private String uniqueId;

    /**
     * @param source
     */
    public AgentLogoffEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the name of the agent that logged off.
     * 
     * @return the name of the agent that logged off.
     */
    public String getAgent()
    {
        return agent;
    }

    /**
     * Sets the name of the agent that logged off.
     * 
     * @param agent the name of the agent that logged off.
     */
    public void setAgent(String agent)
    {
        this.agent = agent;
    }

    public String getLoginTime()
    {
        return loginTime;
    }

    public void setLoginTime(String loginTime)
    {
        this.loginTime = loginTime;
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

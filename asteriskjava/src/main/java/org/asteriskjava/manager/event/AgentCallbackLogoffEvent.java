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
 * An AgentCallbackLogoffEvent is triggered when an agent that previously logged in using
 * AgentCallbackLogin is logged of.
 * <p>
 * It is implemented in <code>channels/chan_agent.c</code>
 * 
 * @see org.asteriskjava.manager.event.AgentCallbackLoginEvent
 * @author srt
 * @version $Id: AgentCallbackLogoffEvent.java 938 2007-12-31 03:23:38Z srt $
 */
public class AgentCallbackLogoffEvent extends ManagerEvent
{
    /**
     * Serializable version identifier
     */
    private static final long serialVersionUID = 8458799161502800576L;
    private String agent;
    private String loginChan;
    private Long loginTime;
    private String reason;
    private String uniqueId;

    /**
     * @param source
     */
    public AgentCallbackLogoffEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the name of the agent that logged off.
     */
    public String getAgent()
    {
        return agent;
    }

    /**
     * Sets the name of the agent that logged off.
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

    public Long getLoginTime()
    {
        return loginTime;
    }

    public void setLoginTime(Long loginTime)
    {
        this.loginTime = loginTime;
    }

    /**
     * Returns the reason for the logoff. The reason is set to Autologoff if the agent has been
     * logged off due to not answering the phone in time. Autologoff is configured by setting
     * <code>autologoff</code> to the appropriate number of seconds in <code>agents.conf</code>.
     */
    public String getReason()
    {
        return reason;
    }

    /**
     * Sets the reason for the logoff.
     */
    public void setReason(String reason)
    {
        this.reason = reason;
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

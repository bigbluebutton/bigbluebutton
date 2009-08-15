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
 * An AgentsEvent is triggered for each agent in response to an AgentsAction.
 * <p>
 * Available since Asterisk 1.2
 * 
 * @see org.asteriskjava.manager.action.AgentsAction
 * @author srt
 * @version $Id: AgentsEvent.java 1076 2008-06-23 03:25:29Z srt $
 * @since 0.2
 */
public class AgentsEvent extends ResponseEvent
{
    /**
     * Serial version identifier
     */
    private static final long serialVersionUID = 0L;

    /**
     * Agent isn't logged in.
     */
    public static final String AGENT_STATUS_LOGGEDOFF = "AGENT_LOGGEDOFF";

    /**
     * Agent is logged in and waiting for call.
     */
    public static final String AGENT_STATUS_IDLE = "AGENT_IDLE";

    /**
     * Agent is logged in and on a call.
     */
    public static final String AGENT_STATUS_ONCALL = "AGENT_ONCALL";

    /**
     * Don't know anything about agent. Shouldn't ever get this.
     */
    public static final String AGENT_STATUS_UNKNOWN = "AGENT_UNKNOWN";

    private String agent;
    private String name;
    private String status;
    private String loggedInChan;
    private Long loggedInTime;
    private String talkingTo;
    private String talkingToChan;

    /**
     * @param source
     */
    public AgentsEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the agentid.
     */
    public String getAgent()
    {
        return agent;
    }

    /**
     * Sets the agentid.
     */
    public void setAgent(String agent)
    {
        this.agent = agent;
    }

    /**
     * Returns the name of this agent.
     * 
     * @return the name of this agent
     */
    public String getName()
    {
        return name;
    }

    /**
     * Sets the name of this agent.
     * 
     * @param name the name of this agent
     */
    public void setName(String name)
    {
        this.name = name;
    }

    /**
     * Returns the status of this agent.
     * <p>
     * This is one of
     * <dl>
     * <dt>"AGENT_LOGGEDOFF"</dt>
     * <dd>Agent isn't logged in</dd>
     * <dt>"AGENT_IDLE"</dt>
     * <dd>Agent is logged in and waiting for call</dd>
     * <dt>"AGENT_ONCALL"</dt>
     * <dd>Agent is logged in and on a call</dd>
     * <dt>"AGENT_UNKNOWN"</dt>
     * <dd>Don't know anything about agent. Shouldn't ever get this.</dd>
     * </dl>
     * 
     * @return the status of this agent
     * @see #AGENT_STATUS_LOGGEDOFF
     * @see #AGENT_STATUS_IDLE
     * @see #AGENT_STATUS_ONCALL
     * @see #AGENT_STATUS_UNKNOWN
     */
    public String getStatus()
    {
        return status;
    }

    /**
     * Sets the status of this agent.
     * 
     * @param status the status of this agent
     */
    public void setStatus(String status)
    {
        this.status = status;
    }

    /**
     * Returns the name of channel this agent logged in from.
     * 
     * @return the name of the channel this agent logged in from or "n/a" if the
     *         agent is not logged in.
     */
    public String getLoggedInChan()
    {
        return loggedInChan;
    }

    /**
     * Sets the name of channel this agent logged in from.
     * 
     * @param loggedInChan the name of channel this agent logged in from
     */
    public void setLoggedInChan(String loggedInChan)
    {
        this.loggedInChan = loggedInChan;
    }

    /**
     * Returns the time (in seconds since 01/01/1970) when the agent logged in.
     * 
     * @return the time when the agent logged in or 0 if the user is not logged
     *         in.
     */
    public Long getLoggedInTime()
    {
        return loggedInTime;
    }

    /**
     * Sets the time when the agent logged in.
     * 
     * @param loggedInTime the time when the agent logged in
     */
    public void setLoggedInTime(Long loggedInTime)
    {
        this.loggedInTime = loggedInTime;
    }

    /**
     * Returns the numerical Caller*ID of the channel this agent is talking to.
     * 
     * @return the numerical Caller*ID of the channel this agent is talking to
     *         or "n/a" if this agent is talking to nobody.
     */
    public String getTalkingTo()
    {
        return talkingTo;
    }

    /**
     * Sets the numerical Caller*ID of the channel this agent is talking to.
     * 
     * @param talkingTo the numerical Caller*ID of the channel this agent is
     *            talking to
     */
    public void setTalkingTo(String talkingTo)
    {
        this.talkingTo = talkingTo;
    }

    /**
     * Returns the name of the channel this agent is talking to.<p>
     * Available since Asterisk 1.6.
     * 
     * @return the name of the channel this agent is talking to.
     * @since 1.0.0
     */
    public String getTalkingToChan()
    {
        return talkingToChan;
    }

    public void setTalkingToChan(String talkingToChan)
    {
        this.talkingToChan = talkingToChan;
    }
}

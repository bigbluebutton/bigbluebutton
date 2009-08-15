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

import java.util.Map;

/**
 * An AgentCalledEvent is triggered when an agent is rung.
 * <p/>
 * To enable AgentCalledEvents you have to set
 * <code>eventwhencalled = yes</code> in <code>queues.conf</code>.
 * <p/>
 * This event is implemented in <code>apps/app_queue.c</code>
 *
 * @author srt
 * @version $Id: AgentCalledEvent.java 1154 2008-08-24 02:05:26Z srt $
 */
public class AgentCalledEvent extends ManagerEvent
{
    /**
     * Serializable version identifier.
     */
    private static final long serialVersionUID = 1L;
    private String queue;
    private String agentCalled;
    private String agentName;
    private String channelCalling;
    private String destinationChannel;
    private String callerIdNum;
    private String callerIdName;
    private String context;
    private String extension;
    private String priority;
    private String uniqueId;
    private Map<String, String> variables;

    /**
     * @param source
     */
    public AgentCalledEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the name of the queue.<p>
     * Available since Asterisk 1.6.
     *
     * @return the name of the queue.
     * @since 1.0.0
     */
    public String getQueue()
    {
        return queue;
    }

    public void setQueue(String queue)
    {
        this.queue = queue;
    }

    /**
     * Returns the member interface of the agent that has been called.
     *
     * @return the member interface of the agent that has been called.
     * @see QueueMemberEvent#getLocation()
     */
    public String getAgentCalled()
    {
        return agentCalled;
    }

    /**
     * Sets the member interface of the agent that has been called.
     *
     * @param agentCalled the member interface of the agent that has been
     *                    called.
     */
    public void setAgentCalled(String agentCalled)
    {
        this.agentCalled = agentCalled;
    }

    /**
     * Returns the name of the agent that has been called.<p>
     * Available since Asterisk 1.6.
     *
     * @return the name of the agent that has been called.
     * @since 1.0.0
     */
    public String getAgentName()
    {
        return agentName;
    }

    public void setAgentName(String agentName)
    {
        this.agentName = agentName;
    }

    /**
     * Returns the name of the caller's channel that is about to be handled by
     * the agent.
     *
     * @return the name of the caller's channel.
     */
    public String getChannelCalling()
    {
        return channelCalling;
    }

    /**
     * Sets the name of the caller's channel.
     *
     * @param channelCalling the name of the caller's channel.
     */
    public void setChannelCalling(String channelCalling)
    {
        this.channelCalling = channelCalling;
    }

    /**
     * Returns the name of the channel calling the agent.<p>
     * Available since Asterisk 1.6
     *
     * @return the name of the channel calling the agent.
     * @since 1.0.0
     */
    public String getDestinationChannel()
    {
        return destinationChannel;
    }

    public void setDestinationChannel(String destinationChannel)
    {
        this.destinationChannel = destinationChannel;
    }

    /**
     * Returns the Caller ID number of the caller's channel.
     *
     * @return the Caller ID number of the caller's channel or "unknown" of none has been set.
     * @since 1.0.0
     */
    public String getCallerIdNum()
    {
        return callerIdNum;
    }

    public void setCallerIdNum(String callerIdNum)
    {
        this.callerIdNum = callerIdNum;
    }

    /**
     * Returns the Caller ID number of the caller's channel.
     *
     * @return the Caller ID number of the caller's channel.
     * @deprecated as of 1.0.0, use {@link #getCallerIdNum()} instead.
     */
    public String getCallerId()
    {
        return callerIdNum;
    }

    /**
     * Sets the Caller ID number of the caller's channel.
     *
     * @param callerId the Caller ID number of the caller's channel.
     */
    public void setCallerId(String callerId)
    {
        this.callerIdNum = callerId;
    }

    /**
     * Returns the Caller ID name of the caller's channel.
     *
     * @return the Caller ID name of the caller's channel or "unknown" if none has been set.
     * @since 0.2
     */
    public String getCallerIdName()
    {
        return callerIdName;
    }

    /**
     * Sets the Caller ID name of the caller's channel.
     *
     * @param callerIdName the Caller ID name of the caller's channel.
     * @since 0.2
     */
    public void setCallerIdName(String callerIdName)
    {
        this.callerIdName = callerIdName;
    }

    public String getContext()
    {
        return context;
    }

    public void setContext(String context)
    {
        this.context = context;
    }

    public String getExtension()
    {
        return extension;
    }

    public void setExtension(String extension)
    {
        this.extension = extension;
    }

    public String getPriority()
    {
        return priority;
    }

    public void setPriority(String priority)
    {
        this.priority = priority;
    }

    /**
     * Returns the unique id of the caller's channel that is about to be handled by
     * the agent. This corresponds to {@link #getChannelCalling()}.<p>
     * Available since Asterisk 1.6
     *
     * @return the unique id of the caller's channel.
     * @since 1.0.0
     */
    public String getUniqueId()
    {
        return uniqueId;
    }

    public void setUniqueId(String uniqueId)
    {
        this.uniqueId = uniqueId;
    }

    /**
     * Returns the channel variables if <code>eventwhencalled</code> is set to <code>vars</code>
     * in <code>queues.conf</code>.<p>
     * Available since Asterisk 1.6
     *
     * @return the channel variables.
     * @since 1.0.0
     */
    public Map<String, String> getVariables()
    {
        return variables;
    }

    /**
     * Sets the channel variables.<p>
     * Available since Asterisk 1.6
     *
     * @param variables the channel variables.
     * @since 1.0.0
     */
    public void setVariables(Map<String, String> variables)
    {
        this.variables = variables;
    }
}

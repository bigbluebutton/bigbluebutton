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
 * Abstract base class for several agent related events.
 *
 * @author srt
 * @author martins
 * @version $Id: AbstractAgentEvent.java 1154 2008-08-24 02:05:26Z srt $
 * @since 0.2
 */
public abstract class AbstractAgentEvent extends ManagerEvent
{
    private static final long serialVersionUID = 1L;
    private String channel;
    private String uniqueId;
    private String queue;
    private String member;
    private String memberName;
    private Map<String, String> variables;

    protected AbstractAgentEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the name of the channel.
     *
     * @return the name of the channel.
     */
    public String getChannel()
    {
        return channel;
    }

    public void setChannel(String channel)
    {
        this.channel = channel;
    }

    /**
     * Returns the unique id of the channel.
     *
     * @return the unique id of the channel.
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
     * Returns the name of the queue.
     *
     * @return the name of the queue.
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
     * Returns the name of the member's interface.
     *
     * @return the name of the member's interface.
     */
    public String getMember()
    {
        return member;
    }

    public void setMember(String member)
    {
        this.member = member;
    }

    /**
     * Returns the member name supplied for logging when the member is added.
     * <p/>
     * Available since Asterisk 1.4.
     *
     * @return the member name supplied for logging when the member is added.
     */
    public String getMemberName()
    {
        return memberName;
    }

    public void setMemberName(String memberName)
    {
        this.memberName = memberName;
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

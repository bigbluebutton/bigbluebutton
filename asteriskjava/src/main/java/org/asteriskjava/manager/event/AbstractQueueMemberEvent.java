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
 * Abstract base class for several queue member related events.
 * 
 * @author srt
 * @version $Id: AbstractQueueMemberEvent.java 938 2007-12-31 03:23:38Z srt $
 * @since 0.2
 */
public abstract class AbstractQueueMemberEvent extends ManagerEvent
{
    /**
     * Serializable version identifier
     */
    private static final long serialVersionUID = -7437833328723536814L;
    private String queue;
    private String location;
    private String memberName;

    /**
     * @param source
     */
    protected AbstractQueueMemberEvent(Object source)
    {
        super(source);
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

    /**
     * Sets the name of the queue.
     * 
     * @param queue the name of the queue.
     */
    public void setQueue(String queue)
    {
        this.queue = queue;
    }

    /**
     * Returns the name of the member's interface.<p>
     * E.g. the channel name or agent group.
     * 
     * @return the name of the member's interface.
     */
    public String getLocation()
    {
        return location;
    }

    /**
     * Sets the name of the member's interface.
     * 
     * @param member the name of the member's interface.
     */
    public void setLocation(String member)
    {
        this.location = member;
    }

    /**
     * Retruns the name of the queue member.
     * <p>
     * Available since Asterisk 1.4
     * 
     * @return the name of the queue member.
     * @since 0.3
     */
    public String getMemberName()
    {
        return memberName;
    }

    /**
     * Sets the name of the queue member.
     * <p>
     * Available since Asterisk 1.4
     * 
     * @param memberName the name of the queue member.
     * @since 0.3
     */
    public void setMemberName(String memberName)
    {
        this.memberName = memberName;
    }
}

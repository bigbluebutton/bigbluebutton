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
 * A QueueMemberPenaltyEvent is triggered when a queue member is assigned a
 * new penalty.<p>
 * It is implemented in <code>apps/app_queue.c</code>.<p>
 * Available since Asterisk 1.6
 *
 * @author srt
 * @version $Id: QueueMemberPenaltyEvent.java 965 2008-02-03 06:47:03Z srt $
 * @since 1.0.0
 */
public class QueueMemberPenaltyEvent extends ManagerEvent
{
    /**
     * Serializable version identifier.
     */
    private static final long serialVersionUID = 0L;
    private String queue;
    private String location;
    private Integer penalty;

    /**
     * Creates a new instance.
     *
     * @param source
     */
    public QueueMemberPenaltyEvent(Object source)
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
     * Returns the new penalty.
     *
     * @return the new penalty.
     */
    public Integer getPenalty()
    {
        return penalty;
    }

    /**
     * Sets the new penalty.
     *
     * @param penalty the new penalty.
     */
    public void setPenalty(Integer penalty)
    {
        this.penalty = penalty;
    }
}
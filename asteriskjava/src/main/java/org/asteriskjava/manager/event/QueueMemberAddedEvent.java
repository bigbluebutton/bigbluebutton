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
 * A QueueMemberAddedEvent is triggered when a queue member is added to a queue.<p>
 * It is implemented in <code>apps/app_queue.c</code>.<p>
 * Available since Asterisk 1.2
 * 
 * @author srt
 * @version $Id: QueueMemberAddedEvent.java 938 2007-12-31 03:23:38Z srt $
 * @since 0.2
 */
public class QueueMemberAddedEvent extends AbstractQueueMemberEvent
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 2108033737226142194L;

    private String membership;
    private Integer penalty;
    private Integer callsTaken;
    private Long lastCall;
    private Integer status;
    private Boolean paused;

    public QueueMemberAddedEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns if the added member is a dynamic or static queue member.
     * 
     * @return "dynamic" if the added member is a dynamic queue member, "static"
     *         if the added member is a static queue member.
     */
    public String getMembership()
    {
        return membership;
    }

    /**
     * Sets if the added member is a dynamic or static queue member.
     * 
     * @param membership "dynamic" if the added member is a dynamic queue
     *            member, "static" if the added member is a static queue member.
     */
    public void setMembership(String membership)
    {
        this.membership = membership;
    }

    /**
     * Returns the penalty for the added member. When calls are distributed
     * members with higher penalties are considered last.
     * 
     * @return the penalty for the added member.
     */
    public Integer getPenalty()
    {
        return penalty;
    }

    /**
     * Sets the penalty for this member.
     * 
     * @param penalty the penalty for this member.
     */
    public void setPenalty(Integer penalty)
    {
        this.penalty = penalty;
    }

    /**
     * Returns the number of calls answered by the member.
     * 
     * @return the number of calls answered by the member.
     */
    public Integer getCallsTaken()
    {
        return callsTaken;
    }

    /**
     * Sets the number of calls answered by the added member.
     * 
     * @param callsTaken the number of calls answered by the added member.
     */
    public void setCallsTaken(Integer callsTaken)
    {
        this.callsTaken = callsTaken;
    }

    /**
     * Returns the time the last successful call answered by the added member
     * was hungup.
     * 
     * @return the time (in seconds since 01/01/1970) the last successful call
     *         answered by the added member was hungup.
     */
    public Long getLastCall()
    {
        return lastCall;
    }

    /**
     * Sets the time the last successful call answered by this member was
     * hungup.
     * 
     * @param lastCall the time (in seconds since 01/01/1970) the last
     *            successful call answered by the added member was hungup.
     */
    public void setLastCall(Long lastCall)
    {
        this.lastCall = lastCall;
    }

    /**
     * Returns the status of this queue member.<p>
     * Valid status codes are:
     * <dl>
     * <dt>AST_DEVICE_UNKNOWN (0)</dt>
     * <dd>Queue member is available</dd>
     * <dt>AST_DEVICE_NOT_INUSE (1)</dt>
     * <dd>?</dd>
     * <dt>AST_DEVICE_INUSE (2)</dt>
     * <dd>?</dd>
     * <dt>AST_DEVICE_BUSY (3)</dt>
     * <dd>?</dd>
     * <dt>AST_DEVICE_INVALID (4)</dt>
     * <dd>?</dd>
     * <dt>AST_DEVICE_UNAVAILABLE (5)</dt>
     * <dd>?</dd>
     * </dl>
     * 
     * @return the status of this queue member.
     */
    public Integer getStatus()
    {
        return status;
    }

    /**
     * Sets the status of this queue member.
     * 
     * @param status the status of this queue member
     */
    public void setStatus(Integer status)
    {
        this.status = status;
    }

    /**
     * Returns if this queue member is paused (not accepting calls).<p>
     * 
     * @return <code>Boolean.TRUE</code> if this member has been paused or
     *         <code>Boolean.FALSE</code> if not.
     */
    public Boolean getPaused()
    {
        return paused;
    }

    /**
     * Sets if this member is paused.
     * 
     * @param paused <code>Boolean.TRUE</code> if this member has been paused
     *            or <code>Boolean.FALSE</code> if not.
     */
    public void setPaused(Boolean paused)
    {
        this.paused = paused;
    }
}

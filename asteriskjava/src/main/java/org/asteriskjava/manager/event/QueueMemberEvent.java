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
 * A QueueMemberEvent is triggered in response to a QueueStatusAction and
 * contains information about a member of a queue.
 * <p>
 * It is implemented in <code>apps/app_queue.c</code>
 * 
 * @see org.asteriskjava.manager.action.QueueStatusAction
 * @author srt
 * @version $Id: QueueMemberEvent.java 1291 2009-04-27 21:56:44Z srt $
 */
public class QueueMemberEvent extends ResponseEvent
{
    public static final int AST_DEVICE_UNKNOWN = 0;

    /**
     * Queue member is available.
     */
    public static final int AST_DEVICE_NOT_INUSE = 1;
    public static final int AST_DEVICE_INUSE = 2;
    public static final int AST_DEVICE_BUSY = 3;
    public static final int AST_DEVICE_INVALID = 4;
    public static final int AST_DEVICE_UNAVAILABLE = 5;
    public static final int AST_DEVICE_RINGING = 6;
    public static final int AST_DEVICE_RINGINUSE = 7;
    public static final int AST_DEVICE_ONHOLD = 8;

    public static final String MEMBERSHIP_STATIC = "static";
    public static final String MEMBERSHIP_DYNAMIC = "dynamic";

    /**
     * Serializable version identifier.
     */
    private static final long serialVersionUID = 0L;
    private String queue;
    private String location;
    private String membership;
    private String name;
    private Integer penalty;
    private Integer callsTaken;
    private Long lastCall;
    private Integer status;
    private Boolean paused;

    /**
     * @param source
     */
    public QueueMemberEvent(Object source)
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
     * Returns the name of the member's interface.
     * <p>
     * E.g. the channel name or agent group (for example "Agent/@1").
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
     * @param location the name of the member's interface.
     */
    public void setLocation(String location)
    {
        this.location = location;
    }

    /**
     * Returns if this member has been dynamically added by the QueueAdd command
     * (in the dialplan or via the Manager API) or if this member is has been
     * statically defined in <code>queues.conf</code>.
     * 
     * @return "dynamic" if the added member is a dynamic queue member, "static"
     *         if the added member is a static queue member.
     */
    public String getMembership()
    {
        return membership;
    }

    /**
     * Convenience method that checks whether this member has been statically
     * defined in <code>queues.conf</code>.
     * 
     * @return <code>true</code> if this member has been statically defined in
     *         <code>queues.conf</code>, <code>false</code> otherwise.
     * @since 0.3
     */
    public boolean isStatic()
    {
        return MEMBERSHIP_STATIC.equals(membership);
    }

    /**
     * Convenience method that checks whether this member has been dynamically
     * added by the QueueAdd command.
     * 
     * @return <code>true</code> if this member has been dynamically added by
     *         the QueueAdd command, <code>false</code> otherwise.
     * @since 0.3
     */
    public boolean isDynamic()
    {
        return MEMBERSHIP_DYNAMIC.equals(membership);
    }

    /**
     * Sets if this member has been dynamically or statically added.
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
     * Returns the status of this queue member.
     * <p>
     * Available since Asterisk 1.2
     * <p>
     * Valid status codes are:
     * <dl>
     * <dt>AST_DEVICE_UNKNOWN (0)</dt>
     * <dd>Device valid but unknown channel state</dd>
     * <dt>AST_DEVICE_NOT_INUSE (1)</dt>
     * <dd>Device is not used</dd>
     * <dt>AST_DEVICE_INUSE (2)</dt>
     * <dd>Device is in use</dd>
     * <dt>AST_DEVICE_BUSY (3)</dt>
     * <dd>Device is Busy</dd>
     * <dt>AST_DEVICE_INVALID (4)</dt>
     * <dd>Device is invalid</dd>
     * <dt>AST_DEVICE_UNAVAILABLE (5)</dt>
     * <dd>Device is unavaiable</dd>
     * <dt>AST_DEVICE_RINGING (6)</dt>
     * <dd>Device is ringing</dd>
     * <dt>AST_DEVICE_RINGINUSE (7)</dt>
     * <dd>Device is ringing and in use</dd>
     * <dt>AST_DEVICE_ONHOLD (8)</dt>
     * <dd>Device is on hold</dd>

     * </dl>
     * 
     * @return the status of this queue member or <code>null</code> if this
     *         attribute is not supported by your version of Asterisk.
     * @since 0.2
     */
    public Integer getStatus()
    {
        return status;
    }

    /**
     * Sets the status of this queue member.
     * 
     * @param status the status of this queue member
     * @since 0.2
     */
    public void setStatus(Integer status)
    {
        this.status = status;
    }

    /**
     * Is this queue member paused (not accepting calls)?
     * <p>
     * Available since Asterisk 1.2.
     * 
     * @return <code>Boolean.TRUE</code> if this member has been paused,
     *         <code>Boolean.FALSE</code> if not or <code>null</code> if
     *         pausing is not supported by your version of Asterisk.
     * @since 0.2
     */
    public Boolean getPaused()
    {
        return paused;
    }

    /**
     * Sets if this member has been paused.
     * 
     * @since 0.2
     */
    public void setPaused(Boolean paused)
    {
        this.paused = paused;
    }

    /**
     * Returns the name of the member.
     *
     * @return the name of the member supplied for logging when the member is added
     * @since 1.0.0
     */
    public String getName()
    {
        return name;
    }

    public void setName(String name)
    {
        this.name = name;
    }

    /**
     * Returns the name of the member.
     *
     * @return the name of the member supplied for logging when the member is added
     * @deprecated since 1.0.0. Use {@link #getName()} instead.
     */
    public String getMemberName()
    {
        return name;
    }

    // Renamed to "name" in Asterisk 1.6
    public void setMemberName(String memberName)
    {
        this.name = memberName;
    }
}

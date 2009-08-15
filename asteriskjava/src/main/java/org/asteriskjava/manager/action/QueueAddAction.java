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
package org.asteriskjava.manager.action;

/**
 * The QueueAddAction adds a new member to a queue.<p>
 * It is implemented in <code>apps/app_queue.c</code><p>
 * The <code>memberName</code> property was added in Asterisk 1.4, the
 * <code>stateInterface</code> property in Asterisk 1.6.
 *
 * @author srt
 * @version $Id: QueueAddAction.java 1145 2008-08-20 16:57:45Z srt $
 */
public class QueueAddAction extends AbstractManagerAction
{
    private static final long serialVersionUID = 2L;
    private String queue;
    private String iface;
    private Integer penalty;
    private Boolean paused;
    private String memberName;
    private String stateInterface;

    /**
     * Creates a new empty QueueAddAction.
     */
    public QueueAddAction()
    {

    }

    /**
     * Creates a new QueueAddAction that adds a new member on the given
     * interface to the given queue.
     *
     * @param queue the name of the queue the new member will be added to
     * @param iface Sets the interface to add. To add a specific channel just
     *              use the channel name, e.g. "SIP/1234".
     * @since 0.2
     */
    public QueueAddAction(String queue, String iface)
    {
        this.queue = queue;
        this.iface = iface;
    }

    /**
     * Creates a new QueueAddAction that adds a new member on the given
     * interface to the given queue with the given penalty.
     *
     * @param queue   the name of the queue the new member will be added to
     * @param iface   Sets the interface to add. To add a specific channel just
     *                use the channel name, e.g. "SIP/1234".
     * @param penalty the penalty for this member. The penalty must be a
     *                positive integer or 0 for no penalty. When calls are
     *                distributed members with higher penalties are considered last.
     * @since 0.2
     */
    public QueueAddAction(String queue, String iface, Integer penalty)
    {
        this.queue = queue;
        this.iface = iface;
        this.penalty = penalty;
    }

    /**
     * Returns the name of this action, i.e. "QueueAdd".
     */
    @Override
    public String getAction()
    {
        return "QueueAdd";
    }

    /**
     * Returns the name of the queue the new member will be added to.
     *
     * @return the name of the queue the new member will be added to.
     */
    public String getQueue()
    {
        return queue;
    }

    /**
     * Sets the name of the queue the new member will be added to.<p>
     * This property is mandatory.
     *
     * @param queue the name of the queue the new member will be added to.
     */
    public void setQueue(String queue)
    {
        this.queue = queue;
    }

    /**
     * Returns the name of the channel to dial to reach this member.
     *
     * @return the name of the channel to dial to reach this member.
     */
    public String getInterface()
    {
        return iface;
    }

    /**
     * Sets the name of the channel (Technology/Location) to dial to reach this member.<p>
     * This property is mandatory.
     *
     * @param iface the name of the channel to dial to reach this member, e.g. "SIP/1234".
     */
    public void setInterface(String iface)
    {
        this.iface = iface;
    }

    /**
     * Returns the penalty for this member.
     *
     * @return the penalty for this member.
     */
    public Integer getPenalty()
    {
        return penalty;
    }

    /**
     * Sets the penalty for this member.<p>
     * The penalty must be a positive integer or 0 for no penalty. If it is
     * not set 0 is assumed.<p>
     * When calls are distributed members with higher penalties are considered
     * last.
     *
     * @param penalty the penalty for this member.
     */
    public void setPenalty(Integer penalty)
    {
        this.penalty = penalty;
    }

    /**
     * Returns if the queue member should be paused when added.
     *
     * @return Boolean.TRUE if the queue member should be paused when added.
     * @since 0.2
     */
    public Boolean getPaused()
    {
        return paused;
    }

    /**
     * Sets if the queue member should be paused when added.
     *
     * @param paused Boolean.TRUE if the queue member should be paused when
     *               added.
     * @since 0.2
     */
    public void setPaused(Boolean paused)
    {
        this.paused = paused;
    }

    /**
     * Returns the name of the queue memeber (agent name).<p>
     * Available since Asterisk 1.4
     *
     * @return the name of the queue memeber (agent name).
     * @since 1.0.0
     */
    public String getMemberName()
    {
        return memberName;
    }

    /**
     * Sets the name of the queue memeber (agent name).<p>
     * Available since Asterisk 1.4
     *
     * @param memberName the name of the queue memeber (agent name).
     * @since 1.0.0
     */
    public void setMemberName(String memberName)
    {
        this.memberName = memberName;
    }

    /**
     * Returns the name of the channel from which to read devicestate changes.<p>
     * Available since Asterisk 1.6
     *
     * @return the name of the channel from which to read devicestate changes.
     * @since 1.0.0
     */
    public String getStateInterface()
    {
        return stateInterface;
    }

    /**
     * Sets the name of the channel (Technology/Location) from which to read devicestate changes.<p>
     * Available since Asterisk 1.6
     *
     * @param stateInterface the name of the channel from which to read devicestate changes.
     * @since 1.0.0
     */
    public void setStateInterface(String stateInterface)
    {
        this.stateInterface = stateInterface;
    }
}

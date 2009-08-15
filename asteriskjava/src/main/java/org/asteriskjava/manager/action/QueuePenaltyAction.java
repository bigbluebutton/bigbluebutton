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
 * The QueuePenaltyAction sets the penalty for a queue member.<p>
 * It is implemented in <code>apps/app_queue.c</code><p>
 * Available since Asterisk 1.6.
 *
 * @author srt
 * @version $Id: QueuePenaltyAction.java 963 2008-02-03 06:25:21Z srt $
 * @since 1.0.0
 */
public class QueuePenaltyAction extends AbstractManagerAction
{
    /**
     * Serializable version identifier.
     */
    private static final long serialVersionUID = 0L;

    private String iface;
    private Integer penalty;
    private String queue;

    /**
     * Creates a new empty QueuePenaltyAction.
     */
    public QueuePenaltyAction()
    {

    }

    /**
     * Creates a new QueuePenaltyAction that sets the penalty for the given
     * interface on all queues.
     *
     * @param iface   the interface of the member to set the penalty for
     * @param penalty new penalty value.
     */
    public QueuePenaltyAction(String iface, int penalty)
    {
        this.iface = iface;
        this.penalty = penalty;
    }

    /**
     * Creates a new QueuePenaltyAction that sets the penalty for the given
     * interface on the given queue.
     *
     * @param iface   the interface of the member to set the penalty for
     * @param penalty new penalty value.
     * @param queue   the queue the member is assigned the penalty for
     */
    public QueuePenaltyAction(String iface, int penalty, String queue)
    {
        this.iface = iface;
        this.penalty = penalty;
        this.queue = queue;
    }

    /**
     * Returns the name of this action, i.e. "QueuePenalty".
     *
     * @return the name of this action.
     */
    @Override
    public String getAction()
    {
        return "QueuePenalty";
    }

    /**
     * Returns the interface of the member to set the penalty for.
     *
     * @return the interface of the member to to set the penalty for.
     */
    public String getInterface()
    {
        return iface;
    }

    /**
     * Sets the interface of the member to set the penalty for.<p>
     * This property is mandatory.
     *
     * @param iface the interface of the member to to set the penalty for.
     */
    public void setInterface(String iface)
    {
        this.iface = iface;
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
     * Sets the new penalty.<p>
     * This property is mandatory.
     *
     * @param penalty the new penalty.
     */
    public void setPenalty(Integer penalty)
    {
        this.penalty = penalty;
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
     * @param queue the name of the queue or <code>null</code> for all queues.
     */
    public void setQueue(String queue)
    {
        this.queue = queue;
    }
}
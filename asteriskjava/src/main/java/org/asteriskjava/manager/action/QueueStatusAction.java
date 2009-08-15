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

import org.asteriskjava.manager.event.QueueStatusCompleteEvent;
import org.asteriskjava.manager.event.ResponseEvent;

/**
 * The QueueStatusAction requests the state of all defined queues their members
 * (agents) and entries (callers).<p>
 * For each queue a QueueParamsEvent is generated, followed by a
 * QueueMemberEvent for each member of that queue and a QueueEntryEvent for each
 * entry in the queue.<p>
 * Since Asterisk 1.2 a QueueStatusCompleteEvent is sent to denote the end of
 * the generated dump.<p>
 * This action is implemented in <code>apps/app_queue.c</code>
 * 
 * @see org.asteriskjava.manager.event.QueueParamsEvent
 * @see org.asteriskjava.manager.event.QueueMemberEvent
 * @see org.asteriskjava.manager.event.QueueEntryEvent
 * @see org.asteriskjava.manager.event.QueueStatusCompleteEvent
 * @author srt
 * @version $Id: QueueStatusAction.java 1121 2008-08-16 20:54:12Z srt $
 */
public class QueueStatusAction extends AbstractManagerAction
        implements
            EventGeneratingAction
{
    /**
     * Serializable version identifier
     */
    private static final long serialVersionUID = -8599401015517232869L;

    private String queue;
    private String member;

    /**
     * Creates a new QueueStatusAction.
     */
    public QueueStatusAction()
    {

    }

    /**
     * Returns the name of this action, i.e. "QueueStatus".
     */
    @Override
   public String getAction()
    {
        return "QueueStatus";
    }

    /**
     * Returns the queue filter.
     * 
     * @return the queue filter.
     * @since 0.2
     */
    public String getQueue()
    {
        return queue;
    }

    /**
     * Sets the queue filter. If set QueueParamEvents are only generated for the
     * given queue name.
     * 
     * @param queue the queue filter.
     * @since 0.2
     */
    public void setQueue(String queue)
    {
        this.queue = queue;
    }

    /**
     * Returns the member filter.
     * 
     * @return the member filter.
     * @since 0.2
     */
    public String getMember()
    {
        return member;
    }

    /**
     * Sets the member filter. If set QueueMemberEvents are only generated for the
     * given member name.
     * 
     * @param member the member filter.
     * @since 0.2
     */
    public void setMember(String member)
    {
        this.member = member;
    }

    public Class<? extends ResponseEvent> getActionCompleteEventClass()
    {
        return QueueStatusCompleteEvent.class;
    }
}

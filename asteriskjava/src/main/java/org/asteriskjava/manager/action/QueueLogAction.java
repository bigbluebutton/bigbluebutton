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
 * The QueueLogAction adds a custom log entry to the <code>queue_log</code>.<p>
 * It is implemented in <code>apps/app_queue.c</code><p>
 * Available since Asterisk 1.6.
 *
 * @author srt
 * @version $Id: QueueLogAction.java 1138 2008-08-18 15:44:13Z srt $
 * @since 1.0.0
 */
public class QueueLogAction extends AbstractManagerAction
{
    private static final long serialVersionUID = 1L;

    private String iface;
    private String queue;
    private String uniqueId;
    private String event;
    private String message;

    /**
     * Creates a new empty QueueLogAction.
     */
    public QueueLogAction()
    {

    }

    /**
     * Creates a new QueueLogAction with the mandatory properties queue and event.
     *
     * @param queue the name of the queue to log the event for.
     * @param event the event to log.
     */
    public QueueLogAction(String queue, String event)
    {
        this.queue = queue;
        this.event = event;
    }

    /**
     * Creates a new QueueLogAction with the mandatory properties queue and event.
     *
     * @param queue    the name of the queue to log the event for.
     * @param event    the event to log.
     * @param message  the message to log, may be <code>null</code>.
     * @param iface    the interface of the member to log the event for, may be <code>null</code>.
     * @param uniqueId the unique id of the channel to log the event for, may be <code>null</code>.
     */
    public QueueLogAction(String queue, String event, String message, String iface, String uniqueId)
    {
        this.queue = queue;
        this.event = event;
        this.message = message;
        this.iface = iface;
        this.uniqueId = uniqueId;
    }

    /**
     * Returns the name of this action, i.e. "QueueLog".
     *
     * @return the name of this action.
     */
    @Override
    public String getAction()
    {
        return "QueueLog";
    }

    /**
     * Returns the interface of the member to log the event for.
     *
     * @return the interface of the member to log the event for.
     */
    public String getInterface()
    {
        return iface;
    }

    /**
     * Sets the interface of the member to log the event for.
     *
     * @param iface the interface of the member to log the event for.
     */
    public void setInterface(String iface)
    {
        this.iface = iface;
    }

    /**
     * Returns the name of the queue to log the event for.
     *
     * @return the name of the queue to log the event for.
     */
    public String getQueue()
    {
        return queue;
    }

    /**
     * Sets the name of the queue to log the event for.<p>
     * This property is mandatory.
     *
     * @param queue the name of the queue to log the event for.
     */
    public void setQueue(String queue)
    {
        this.queue = queue;
    }

    /**
     * Returns the unique id of the channel to log the event for.
     *
     * @return the unique id of the channel to log the event for.
     */
    public String getUniqueId()
    {
        return uniqueId;
    }

    /**
     * Sets the unique id of the channel to log the event for.
     *
     * @param uniqueId the unique id of the channel to log the event for.
     */
    public void setUniqueId(String uniqueId)
    {
        this.uniqueId = uniqueId;
    }

    /**
     * Returns the event to log.
     *
     * @return the event to log.
     */
    public String getEvent()
    {
        return event;
    }

    /**
     * Sets the event to log.<p>
     * This property is mandatory.
     *
     * @param event the event to log.
     */
    public void setEvent(String event)
    {
        this.event = event;
    }

    /**
     * Returns the message to log.
     *
     * @return the message to log.
     */
    public String getMessage()
    {
        return message;
    }

    /**
     * Sets the message to log.
     *
     * @param message the message to log.
     */
    public void setMessage(String message)
    {
        this.message = message;
    }
}
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
 * Abstract base class providing common properties for JoinEvent and LeaveEvent.
 * 
 * @author srt
 * @version $Id: QueueEvent.java 938 2007-12-31 03:23:38Z srt $
 */
public abstract class QueueEvent extends ManagerEvent
{
    /**
     * Serializable version identifier
     */
    static final long serialVersionUID = -8554382298783676181L;

    private String uniqueId;
    private String channel;
    private String queue;
    private Integer count;

    /**
     * @param source
     */
    public QueueEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the unique id of the channel that joines or leaves the queue.<p>
     * This property is only available since Asterisk 1.4. Up to Asterisk 1.2
     * this method always returns <code>null</code>.<p>
     * See Asterisk issues 6458 and 7002.
     * 
     * @return the unique id of the channel that joines or leaves the queue or
     *         <code>null</code> if not supported by your Asterisk server.
     * @since 0.3
     */
    public String getUniqueId()
    {
        return uniqueId;
    }

    /**
     * Sets the unique id of the channel that joines or leaves the queue.
     * 
     * @param uniqueId the unique id of the channel that joines or leaves the queue.
     * @since 0.3
     */
    public void setUniqueId(String uniqueId)
    {
        this.uniqueId = uniqueId;
    }

    /**
     * Returns the name of the channel that joines or leaves the queue.
     */
    public String getChannel()
    {
        return channel;
    }

    /**
     * Sets the name of the channel that joines or leaves the queue.
     */
    public void setChannel(String channel)
    {
        this.channel = channel;
    }

    /**
     * Returns the number of elements in the queue, i.e. the number of calls waiting to be answered
     * by an agent.
     */
    public Integer getCount()
    {
        return count;
    }

    /**
     * Sets the number of elements in the queue.
     */
    public void setCount(Integer count)
    {
        this.count = count;
    }

    /**
     * Returns the name of the queue.
     */
    public String getQueue()
    {
        return queue;
    }

    /**
     * Sets the name of the queue.
     */
    public void setQueue(String queue)
    {
        this.queue = queue;
    }
}

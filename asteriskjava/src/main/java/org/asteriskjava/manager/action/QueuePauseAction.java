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
 * The QueuePauseAction makes a queue member temporarily unavailabe (or
 * available again).<p>
 * It is implemented in <code>apps/app_queue.c</code><p>
 * Available since Asterisk 1.2.
 * 
 * @author srt
 * @version $Id: QueuePauseAction.java 938 2007-12-31 03:23:38Z srt $
 * @since 0.2
 */
public class QueuePauseAction extends AbstractManagerAction
{
    /**
     * Serializable version identifier
     */
    private static final long serialVersionUID = -4296471882045706821L;

    private String iface;
    private Boolean paused;
    private String queue;

    /**
     * Creates a new empty QueuePauseAction.
     */
    public QueuePauseAction()
    {

    }

    /**
     * Creates a new QueuePauseAction that makes the member on the given
     * interface unavailable on all queues.
     * 
     * @param iface the interface of the member to make unavailable
     */
    public QueuePauseAction(String iface)
    {
        this.iface = iface;
        this.paused = Boolean.TRUE;
    }

    /**
     * Creates a new QueuePauseAction that makes the member on the given
     * interface unavailable on the given queue.
     * 
     * @param iface the interface of the member to make unavailable
     * @param queue the queue the member is made unvailable on
     */
    public QueuePauseAction(String iface, String queue)
    {
        this.iface = iface;
        this.queue = queue;
        this.paused = Boolean.TRUE;
    }

    /**
     * Creates a new QueuePauseAction that makes the member on the given
     * interface available or unavailable on all queues.
     * 
     * @param iface the interface of the member to make unavailable
     * @param paused Boolean.TRUE to make the member unavailbale, Boolean.FALSE
     *            to make the member available
     */
    public QueuePauseAction(String iface, Boolean paused)
    {
        this.iface = iface;
        this.paused = paused;
    }

    /**
     * Creates a new QueuePauseAction that makes the member on the given
     * interface unavailable on the given queue.
     * 
     * @param iface the interface of the member to make unavailable
     * @param queue the queue the member is made unvailable on
     * @param paused Boolean.TRUE to make the member unavailbale, Boolean.FALSE
     *            to make the member available
     */
    public QueuePauseAction(String iface, String queue, Boolean paused)
    {
        this.iface = iface;
        this.queue = queue;
        this.paused = paused;
    }

    /**
     * Returns the name of this action, i.e. "QueuePause".
     * 
     * @return the name of this action.
     */
    @Override
   public String getAction()
    {
        return "QueuePause";
    }

    /**
     * Returns the interface of the member to make available or unavailable.
     * 
     * @return the interface of the member to make available or unavailable.
     */
    public String getInterface()
    {
        return iface;
    }

    /**
     * Sets the interface of the member to make available or unavailable.<p>
     * This property is mandatory.
     * 
     * @param iface the interface of the member to make available or
     *            unavailable.
     */
    public void setInterface(String iface)
    {
        this.iface = iface;
    }

    /**
     * Returns the name of the queue the member is made available or unavailable
     * on.
     * 
     * @return the name of the queue the member is made available or unavailable
     *         on or <code>null</code> for all queues.
     */
    public String getQueue()
    {
        return queue;
    }

    /**
     * Sets the name of the queue the member is made available or unavailable
     * on.
     * 
     * @param queue the name of the queue the member is made available or
     *            unavailable on or <code>null</code> for all queues.
     */
    public void setQueue(String queue)
    {
        this.queue = queue;
    }

    /**
     * Returns if the member is made available or unavailable.
     * 
     * @return Boolean.TRUE to make the member unavailbale, Boolean.FALSE to
     *         make the member available
     */
    public Boolean getPaused()
    {
        return paused;
    }

    /**
     * Sets if the member is made available or unavailable.<p>
     * This property is mandatory.
     * 
     * @param paused Boolean.TRUE to make the member unavailbale, Boolean.FALSE
     *            to make the member available
     */
    public void setPaused(Boolean paused)
    {
        this.paused = paused;
    }
}

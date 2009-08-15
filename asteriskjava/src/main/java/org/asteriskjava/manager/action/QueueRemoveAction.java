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
 * The QueueRemoveAction removes a member from a queue.<p>
 * It is implemented in <code>apps/app_queue.c</code>
 * 
 * @author srt
 * @version $Id: QueueRemoveAction.java 938 2007-12-31 03:23:38Z srt $
 */
public class QueueRemoveAction extends AbstractManagerAction
{
    /**
     * Serializable version identifier
     */
    private static final long serialVersionUID = -4296471882045706821L;

    /**
     * The name of the queue the member will be removed from.
     */
    private String queue;
    private String iface;

    /**
     * Creates a new empty QueueRemoveAction.
     */
    public QueueRemoveAction()
    {

    }

    /**
     * Creates a new QueueRemoveAction that removes the member on the given
     * interface from the given queue.
     * 
     * @param queue the name of the queue the member will be removed from
     * @param iface the interface of the member to remove
     * @since 0.2
     */
    public QueueRemoveAction(String queue, String iface)
    {
        this.queue = queue;
        this.iface = iface;
    }

    /**
     * Returns the name of this action, i.e. "QueueRemove".
     * 
     * @return the name of this action.
     */
    @Override
   public String getAction()
    {
        return "QueueRemove";
    }

    /**
     * Returns the name of the queue the member will be removed from.
     * 
     * @return the name of the queue the member will be removed from.
     */
    public String getQueue()
    {
        return queue;
    }

    /**
     * Sets the name of the queue the member will be removed from.<p>
     * This property is mandatory.
     * 
     * @param queue the name of the queue the member will be removed from.
     */
    public void setQueue(String queue)
    {
        this.queue = queue;
    }

    /**
     * Returns the interface to remove.
     */
    public String getInterface()
    {
        return iface;
    }

    /**
     * Sets the interface to remove.<p>
     * This property is mandatory.
     */
    public void setInterface(String iface)
    {
        this.iface = iface;
    }
}

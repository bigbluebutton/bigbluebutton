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
 * The QueueResetAction resets all statistical data of a given queue or all queues.<p>
 * It is implemented in <code>apps/app_queue.c</code><p>
 * Available since Asterisk 1.6.
 *
 * @author Sebastian
 * @since 1.0.0
 */
public class QueueResetAction extends AbstractManagerAction
{
    private static final long serialVersionUID = 1L;

    private String queue;

    /**
     * Creates a new QueueResetAction that resets statistical data of all queues.
     */
    public QueueResetAction()
    {
    }

    /**
     * Creates a new QueueResetAction that resets statistical data of the given queue.
     *
     * @param queue the name of the queue to reset.
     */
    public QueueResetAction(String queue)
    {
        this.queue = queue;
    }

    @Override
    public String getAction()
    {
        return "QueueReset";
    }

    /**
     * Returns the name of the queue to reset.
     *
     * @return the name of the queue to reset or <code>null</code> for all queues.
     */
    public String getQueue()
    {
        return queue;
    }

    /**
     * Sets the name of the queue to reset.
     *
     * @param queue the name of the queue to reset or <code>null</code> for all queues.
     */
    public void setQueue(String queue)
    {
        this.queue = queue;
    }
}
